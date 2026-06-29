-- Enforce billing plan limits for boards, tasks, and team members

create or replace function public.billing_get_user_plan_id(p_user_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select bs.plan_id
      from public.billing_subscriptions bs
      where bs.user_id = p_user_id
    ),
    'free'
  );
$$;

create or replace function public.billing_plan_limit(p_plan_id text, p_resource text)
returns integer
language sql
immutable
as $$
  select case p_resource
    when 'boards' then case
      when p_plan_id = 'pro' then 999
      when p_plan_id = 'team' then 999
      else 3
    end
    when 'tasks' then case
      when p_plan_id = 'pro' then 500
      when p_plan_id = 'team' then 9999
      else 50
    end
    when 'team_members' then case
      when p_plan_id = 'pro' then 5
      when p_plan_id = 'team' then 999
      else 3
    end
    else 0
  end;
$$;

create or replace function public.enforce_board_plan_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan_id text;
  v_boards_used integer;
  v_limit integer;
begin
  v_plan_id := public.billing_get_user_plan_id(new.owner_id);
  v_limit := public.billing_plan_limit(v_plan_id, 'boards');

  select count(*)::integer
  into v_boards_used
  from public.boards
  where owner_id = new.owner_id;

  if v_boards_used >= v_limit then
    raise exception 'Board limit exceeded for your plan'
      using errcode = 'P0001', hint = 'PLAN_LIMIT_BOARDS';
  end if;

  return new;
end;
$$;

create or replace function public.enforce_task_plan_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_id uuid;
  v_plan_id text;
  v_tasks_used integer;
  v_limit integer;
begin
  select b.owner_id
  into v_owner_id
  from public.boards b
  where b.id = new.board_id;

  if v_owner_id is null then
    raise exception 'Board not found';
  end if;

  v_plan_id := public.billing_get_user_plan_id(v_owner_id);
  v_limit := public.billing_plan_limit(v_plan_id, 'tasks');

  select count(*)::integer
  into v_tasks_used
  from public.tasks t
  inner join public.boards b on b.id = t.board_id
  where b.owner_id = v_owner_id;

  if v_tasks_used >= v_limit then
    raise exception 'Task limit exceeded for your plan'
      using errcode = 'P0001', hint = 'PLAN_LIMIT_TASKS';
  end if;

  return new;
end;
$$;

create or replace function public.enforce_team_member_plan_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_id uuid;
  v_plan_id text;
  v_members_used integer;
  v_limit integer;
begin
  select b.owner_id
  into v_owner_id
  from public.boards b
  where b.id = new.board_id;

  if v_owner_id is null then
    raise exception 'Board not found';
  end if;

  if exists (
    select 1
    from public.board_members bm
    inner join public.boards b on b.id = bm.board_id
    where b.owner_id = v_owner_id
      and bm.user_id = new.user_id
  ) then
    return new;
  end if;

  v_plan_id := public.billing_get_user_plan_id(v_owner_id);
  v_limit := public.billing_plan_limit(v_plan_id, 'team_members');

  select count(distinct bm.user_id)::integer
  into v_members_used
  from public.board_members bm
  inner join public.boards b on b.id = bm.board_id
  where b.owner_id = v_owner_id;

  if v_members_used >= v_limit then
    raise exception 'Team member limit exceeded for your plan'
      using errcode = 'P0001', hint = 'PLAN_LIMIT_TEAM_MEMBERS';
  end if;

  return new;
end;
$$;

drop trigger if exists boards_enforce_plan_limit on public.boards;

create trigger boards_enforce_plan_limit
  before insert on public.boards
  for each row
  execute function public.enforce_board_plan_limit();

drop trigger if exists tasks_enforce_plan_limit on public.tasks;

create trigger tasks_enforce_plan_limit
  before insert on public.tasks
  for each row
  execute function public.enforce_task_plan_limit();

drop trigger if exists board_members_enforce_plan_limit on public.board_members;

create trigger board_members_enforce_plan_limit
  before insert on public.board_members
  for each row
  execute function public.enforce_team_member_plan_limit();

create or replace function public.create_board_with_members(
  p_title text,
  p_description text default '',
  p_member_ids uuid[] default array[]::uuid[]
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_id uuid := auth.uid();
  v_board_id uuid;
  v_title text := trim(p_title);
  v_description text := coalesce(trim(p_description), '');
  v_member_id uuid;
  v_all_members uuid[];
  v_member_ids uuid[] := coalesce(p_member_ids, array[]::uuid[]);
  v_plan_id text;
  v_boards_used integer;
  v_board_limit integer;
  v_members_used integer;
  v_member_limit integer;
  v_projected_members integer;
begin
  if v_owner_id is null then
    raise exception 'Not authenticated';
  end if;

  if v_title = '' then
    raise exception 'Title is required';
  end if;

  v_plan_id := public.billing_get_user_plan_id(v_owner_id);
  v_board_limit := public.billing_plan_limit(v_plan_id, 'boards');
  v_member_limit := public.billing_plan_limit(v_plan_id, 'team_members');

  select count(*)::integer
  into v_boards_used
  from public.boards
  where owner_id = v_owner_id;

  if v_boards_used >= v_board_limit then
    raise exception 'Board limit exceeded for your plan'
      using errcode = 'P0001', hint = 'PLAN_LIMIT_BOARDS';
  end if;

  select array_agg(distinct uid)
  into v_all_members
  from (
    select v_owner_id as uid
    union
    select unnest(v_member_ids) as uid
  ) members;

  select count(distinct uid)::integer
  into v_projected_members
  from (
    select bm.user_id as uid
    from public.board_members bm
    inner join public.boards b on b.id = bm.board_id
    where b.owner_id = v_owner_id
    union
    select unnest(v_all_members) as uid
  ) combined;

  if v_projected_members > v_member_limit then
    raise exception 'Team member limit exceeded for your plan'
      using errcode = 'P0001', hint = 'PLAN_LIMIT_TEAM_MEMBERS';
  end if;

  insert into public.boards (title, description, owner_id)
  values (v_title, v_description, v_owner_id)
  returning id into v_board_id;

  insert into public.board_members (board_id, user_id, board_role)
  values (v_board_id, v_owner_id, 'owner');

  foreach v_member_id in array v_all_members
  loop
    if v_member_id = v_owner_id then
      continue;
    end if;

    if not exists (select 1 from public.profiles where id = v_member_id) then
      raise exception 'User not found';
    end if;

    insert into public.board_members (board_id, user_id, board_role)
    values (v_board_id, v_member_id, 'member')
    on conflict (board_id, user_id) do nothing;
  end loop;

  return json_build_object(
    'id', v_board_id,
    'title', v_title,
    'description', v_description,
    'owner_id', v_owner_id,
    'member_ids', v_all_members,
    'created_at', (select created_at from public.boards where id = v_board_id),
    'updated_at', (select updated_at from public.boards where id = v_board_id)
  );
end;
$$;

grant execute on function public.billing_get_user_plan_id(uuid) to authenticated, service_role;
grant execute on function public.billing_plan_limit(text, text) to authenticated, service_role;
grant execute on function public.create_board_with_members(text, text, uuid[]) to authenticated;
