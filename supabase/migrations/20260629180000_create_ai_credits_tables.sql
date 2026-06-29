-- AI credits for top-up purchases and usage tracking

create table if not exists public.billing_ai_credits (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  credits_balance integer not null default 0 check (credits_balance >= 0),
  period_used integer not null default 0 check (period_used >= 0),
  purchased_used integer not null default 0 check (purchased_used >= 0),
  total_purchased integer not null default 0 check (total_purchased >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.billing_ai_credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  delta integer not null,
  reason text not null check (reason in ('purchase', 'consume')),
  stripe_event_id text unique,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists billing_ai_credit_ledger_user_id_idx
  on public.billing_ai_credit_ledger (user_id);

alter table public.billing_ai_credits enable row level security;
alter table public.billing_ai_credit_ledger enable row level security;

create policy "Users can view own ai credits"
  on public.billing_ai_credits
  for select
  using (auth.uid() = user_id);

create policy "Users can view own ai credit ledger"
  on public.billing_ai_credit_ledger
  for select
  using (auth.uid() = user_id);

create or replace function public.billing_plan_ai_limit(p_plan_id text)
returns integer
language sql
immutable
as $$
  select case
    when p_plan_id = 'pro' then 100
    when p_plan_id = 'team' then 500
    else 0
  end;
$$;

create or replace function public.billing_add_ai_credits(
  p_user_id uuid,
  p_credits integer,
  p_stripe_event_id text,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing uuid;
begin
  if p_user_id is null or p_credits is null or p_credits <= 0 then
    raise exception 'user_id and positive credits are required';
  end if;

  if p_stripe_event_id is not null and p_stripe_event_id <> '' then
    select id into v_existing
    from public.billing_ai_credit_ledger
    where stripe_event_id = p_stripe_event_id;

    if found then
      return jsonb_build_object('inserted', false, 'creditsAdded', 0);
    end if;
  end if;

  insert into public.billing_ai_credits (user_id, credits_balance, total_purchased)
  values (p_user_id, p_credits, p_credits)
  on conflict (user_id) do update
  set
    credits_balance = billing_ai_credits.credits_balance + excluded.credits_balance,
    total_purchased = billing_ai_credits.total_purchased + excluded.total_purchased,
    updated_at = now();

  insert into public.billing_ai_credit_ledger (
    user_id,
    delta,
    reason,
    stripe_event_id,
    metadata
  )
  values (
    p_user_id,
    p_credits,
    'purchase',
    nullif(p_stripe_event_id, ''),
    coalesce(p_metadata, '{}'::jsonb)
  );

  return jsonb_build_object('inserted', true, 'creditsAdded', p_credits);
end;
$$;

create or replace function public.billing_consume_ai_request(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan_id text := 'free';
  v_plan_limit integer := 0;
  v_credits public.billing_ai_credits%rowtype;
begin
  if p_user_id is null then
    raise exception 'user_id is required';
  end if;

  select coalesce(bs.plan_id, 'free')
  into v_plan_id
  from public.billing_subscriptions bs
  where bs.user_id = p_user_id;

  v_plan_limit := public.billing_plan_ai_limit(v_plan_id);

  insert into public.billing_ai_credits (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  select *
  into v_credits
  from public.billing_ai_credits
  where user_id = p_user_id
  for update;

  if v_credits.period_used < v_plan_limit then
    update public.billing_ai_credits
    set period_used = period_used + 1, updated_at = now()
    where user_id = p_user_id;

    insert into public.billing_ai_credit_ledger (user_id, delta, reason, metadata)
    values (p_user_id, -1, 'consume', jsonb_build_object('source', 'plan'));

    return jsonb_build_object('consumed', true, 'source', 'plan');
  end if;

  if v_credits.credits_balance > 0 then
    update public.billing_ai_credits
    set
      credits_balance = credits_balance - 1,
      purchased_used = purchased_used + 1,
      updated_at = now()
    where user_id = p_user_id;

    insert into public.billing_ai_credit_ledger (user_id, delta, reason, metadata)
    values (p_user_id, -1, 'consume', jsonb_build_object('source', 'purchased'));

    return jsonb_build_object('consumed', true, 'source', 'purchased');
  end if;

  raise exception 'AI quota exceeded' using errcode = 'P0001';
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
  v_plan_id text := 'free';
  v_plan_limit integer := 0;
  v_period_used integer := 0;
  v_purchased_used integer := 0;
  v_credits_balance integer := 0;
  v_ai_used integer := 0;
  v_effective_limit integer := 0;
  v_remaining integer := 0;
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

  select coalesce(bs.plan_id, 'free')
  into v_plan_id
  from public.billing_subscriptions bs
  where bs.user_id = p_user_id;

  v_plan_limit := public.billing_plan_ai_limit(v_plan_id);

  select
    coalesce(ac.period_used, 0),
    coalesce(ac.purchased_used, 0),
    coalesce(ac.credits_balance, 0)
  into v_period_used, v_purchased_used, v_credits_balance
  from public.billing_ai_credits ac
  where ac.user_id = p_user_id;

  v_ai_used := coalesce(v_period_used, 0) + coalesce(v_purchased_used, 0);
  v_effective_limit := coalesce(v_plan_limit, 0) + coalesce(v_credits_balance, 0) + coalesce(v_purchased_used, 0);
  v_remaining := greatest(coalesce(v_plan_limit, 0) - coalesce(v_period_used, 0), 0) + coalesce(v_credits_balance, 0);

  return jsonb_build_object(
    'boardsUsed', coalesce(v_boards_used, 0),
    'tasksUsed', coalesce(v_tasks_used, 0),
    'aiRequestsUsed', v_ai_used,
    'teamMembersUsed', coalesce(v_team_members_used, 0),
    'aiRequestsPlanLimit', coalesce(v_plan_limit, 0),
    'aiCreditsBalance', coalesce(v_credits_balance, 0),
    'aiRequestsEffectiveLimit', v_effective_limit,
    'aiRequestsRemaining', v_remaining
  );
end;
$$;

grant execute on function public.billing_add_ai_credits(uuid, integer, text, jsonb) to service_role;
grant execute on function public.billing_consume_ai_request(uuid) to service_role;
grant execute on function public.billing_get_usage(uuid) to service_role, authenticated;
