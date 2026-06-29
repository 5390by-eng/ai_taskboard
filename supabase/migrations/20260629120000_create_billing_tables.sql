-- Billing subscriptions and payments for Stripe integration

create table if not exists public.billing_subscriptions (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  plan_id text not null default 'free' check (plan_id in ('free', 'pro', 'team')),
  status text not null default 'active'
    check (status in ('active', 'trialing', 'canceled', 'past_due')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.billing_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  stripe_event_id text not null unique,
  stripe_invoice_id text,
  stripe_payment_intent_id text,
  amount bigint not null default 0,
  currency text not null default 'usd',
  status text not null,
  plan_id text check (plan_id in ('free', 'pro', 'team')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists billing_payments_user_id_idx on public.billing_payments (user_id);
create index if not exists billing_subscriptions_stripe_customer_id_idx
  on public.billing_subscriptions (stripe_customer_id);

create or replace function public.set_billing_subscriptions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists billing_subscriptions_updated_at on public.billing_subscriptions;

create trigger billing_subscriptions_updated_at
  before update on public.billing_subscriptions
  for each row
  execute function public.set_billing_subscriptions_updated_at();

alter table public.billing_subscriptions enable row level security;
alter table public.billing_payments enable row level security;

create policy "Users can view own billing subscription"
  on public.billing_subscriptions
  for select
  using (auth.uid() = user_id);

create policy "Users can view own billing payments"
  on public.billing_payments
  for select
  using (auth.uid() = user_id);

create or replace function public.billing_get_subscription(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.billing_subscriptions%rowtype;
begin
  if p_user_id is null then
    raise exception 'user_id is required';
  end if;

  select *
  into v_row
  from public.billing_subscriptions
  where user_id = p_user_id;

  if not found then
    return jsonb_build_object(
      'planId', 'free',
      'status', 'active',
      'currentPeriodEnd', (now() + interval '30 days')::timestamptz,
      'cancelAtPeriodEnd', false,
      'stripeCustomerId', null
    );
  end if;

  return jsonb_build_object(
    'planId', v_row.plan_id,
    'status', v_row.status,
    'currentPeriodEnd', coalesce(v_row.current_period_end, now() + interval '30 days'),
    'cancelAtPeriodEnd', v_row.cancel_at_period_end,
    'stripeCustomerId', v_row.stripe_customer_id
  );
end;
$$;

create or replace function public.billing_upsert_subscription(
  p_user_id uuid,
  p_plan_id text,
  p_status text,
  p_stripe_customer_id text default null,
  p_stripe_subscription_id text default null,
  p_current_period_end timestamptz default null,
  p_cancel_at_period_end boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.billing_subscriptions%rowtype;
begin
  if p_user_id is null then
    raise exception 'user_id is required';
  end if;

  insert into public.billing_subscriptions (
    user_id,
    plan_id,
    status,
    stripe_customer_id,
    stripe_subscription_id,
    current_period_end,
    cancel_at_period_end
  )
  values (
    p_user_id,
    coalesce(p_plan_id, 'free'),
    coalesce(p_status, 'active'),
    nullif(p_stripe_customer_id, ''),
    nullif(p_stripe_subscription_id, ''),
    p_current_period_end,
    coalesce(p_cancel_at_period_end, false)
  )
  on conflict (user_id) do update
  set
    plan_id = excluded.plan_id,
    status = excluded.status,
    stripe_customer_id = coalesce(excluded.stripe_customer_id, billing_subscriptions.stripe_customer_id),
    stripe_subscription_id = coalesce(excluded.stripe_subscription_id, billing_subscriptions.stripe_subscription_id),
    current_period_end = coalesce(excluded.current_period_end, billing_subscriptions.current_period_end),
    cancel_at_period_end = excluded.cancel_at_period_end,
    updated_at = now()
  returning * into v_row;

  return jsonb_build_object(
    'planId', v_row.plan_id,
    'status', v_row.status,
    'currentPeriodEnd', coalesce(v_row.current_period_end, now() + interval '30 days'),
    'cancelAtPeriodEnd', v_row.cancel_at_period_end,
    'stripeCustomerId', v_row.stripe_customer_id
  );
end;
$$;

create or replace function public.billing_record_payment(
  p_user_id uuid,
  p_stripe_event_id text,
  p_stripe_invoice_id text default null,
  p_stripe_payment_intent_id text default null,
  p_amount bigint default 0,
  p_currency text default 'usd',
  p_status text default 'paid',
  p_plan_id text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row_count integer := 0;
begin
  if p_user_id is null or p_stripe_event_id is null or p_stripe_event_id = '' then
    raise exception 'user_id and stripe_event_id are required';
  end if;

  insert into public.billing_payments (
    user_id,
    stripe_event_id,
    stripe_invoice_id,
    stripe_payment_intent_id,
    amount,
    currency,
    status,
    plan_id,
    metadata
  )
  values (
    p_user_id,
    p_stripe_event_id,
    nullif(p_stripe_invoice_id, ''),
    nullif(p_stripe_payment_intent_id, ''),
    coalesce(p_amount, 0),
    coalesce(nullif(p_currency, ''), 'usd'),
    coalesce(nullif(p_status, ''), 'paid'),
    nullif(p_plan_id, ''),
    coalesce(p_metadata, '{}'::jsonb)
  )
  on conflict (stripe_event_id) do nothing;

  get diagnostics v_row_count = row_count;

  return jsonb_build_object('inserted', v_row_count > 0);
end;
$$;

create or replace function public.billing_get_usage(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_boards_used integer := 0;
  v_tasks_used integer := 0;
  v_team_members_used integer := 0;
begin
  if p_user_id is null then
    raise exception 'user_id is required';
  end if;

  select count(*)::integer
  into v_boards_used
  from public.boards
  where owner_id = p_user_id;

  select count(*)::integer
  into v_tasks_used
  from public.tasks t
  inner join public.boards b on b.id = t.board_id
  where b.owner_id = p_user_id;

  select count(distinct bm.user_id)::integer
  into v_team_members_used
  from public.board_members bm
  inner join public.boards b on b.id = bm.board_id
  where b.owner_id = p_user_id;

  return jsonb_build_object(
    'boardsUsed', coalesce(v_boards_used, 0),
    'tasksUsed', coalesce(v_tasks_used, 0),
    'aiRequestsUsed', 0,
    'teamMembersUsed', coalesce(v_team_members_used, 0)
  );
end;
$$;

create or replace function public.billing_get_stripe_customer_id(p_user_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id text;
begin
  select stripe_customer_id
  into v_customer_id
  from public.billing_subscriptions
  where user_id = p_user_id;

  return v_customer_id;
end;
$$;

create or replace function public.billing_get_user_by_stripe_customer(p_stripe_customer_id text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  select user_id
  into v_user_id
  from public.billing_subscriptions
  where stripe_customer_id = p_stripe_customer_id;

  return v_user_id;
end;
$$;

grant execute on function public.billing_get_subscription(uuid) to service_role, authenticated;
grant execute on function public.billing_upsert_subscription(uuid, text, text, text, text, timestamptz, boolean) to service_role;
grant execute on function public.billing_record_payment(uuid, text, text, text, bigint, text, text, text, jsonb) to service_role;
grant execute on function public.billing_get_usage(uuid) to service_role, authenticated;
grant execute on function public.billing_get_stripe_customer_id(uuid) to service_role;
grant execute on function public.billing_get_user_by_stripe_customer(text) to service_role;
