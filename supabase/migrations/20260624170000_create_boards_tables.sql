-- Boards and board members

create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  owner_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.board_members (
  board_id uuid not null references public.boards (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  board_role text not null default 'member' check (board_role in ('owner', 'admin', 'member')),
  joined_at timestamptz not null default now(),
  primary key (board_id, user_id)
);

create index if not exists boards_owner_id_idx on public.boards (owner_id);
create index if not exists board_members_board_id_idx on public.board_members (board_id);
create index if not exists board_members_user_id_idx on public.board_members (user_id);
create index if not exists profiles_email_lower_idx on public.profiles (lower(email));

create or replace function public.set_boards_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists boards_updated_at on public.boards;

create trigger boards_updated_at
  before update on public.boards
  for each row
  execute function public.set_boards_updated_at();

create or replace function public.is_board_member(
  p_board_id uuid,
  p_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.board_members
    where board_id = p_board_id
      and user_id = p_user_id
  );
$$;

alter table public.boards enable row level security;
alter table public.board_members enable row level security;

create policy "Members can view boards"
  on public.boards
  for select
  using (public.is_board_member(id));

create policy "Users can create boards they own"
  on public.boards
  for insert
  with check (auth.uid() = owner_id);

create policy "Owners can update boards"
  on public.boards
  for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Owners can delete boards"
  on public.boards
  for delete
  using (auth.uid() = owner_id);

create policy "Members can view board memberships"
  on public.board_members
  for select
  using (public.is_board_member(board_id));

create policy "Owners can add board members"
  on public.board_members
  for insert
  with check (
    exists (
      select 1
      from public.boards
      where id = board_id
        and owner_id = auth.uid()
    )
  );

create policy "Owners can remove board members"
  on public.board_members
  for delete
  using (
    exists (
      select 1
      from public.boards
      where id = board_id
        and owner_id = auth.uid()
    )
  );

create or replace function public.search_profiles_by_email(
  p_query text,
  p_limit int default 10
)
returns table (
  id uuid,
  email text,
  name text,
  avatar_url text,
  role text,
  team_role text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_query text := trim(p_query);
  v_limit int := least(greatest(coalesce(p_limit, 10), 1), 20);
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if length(v_query) < 2 then
    return;
  end if;

  return query
  select
    p.id,
    p.email,
    p.name,
    p.avatar_url,
    p.role,
    p.team_role,
    p.created_at
  from public.profiles p
  where p.id <> auth.uid()
    and lower(p.email) like lower(v_query) || '%'
  order by p.email
  limit v_limit;
end;
$$;

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
begin
  if v_owner_id is null then
    raise exception 'Not authenticated';
  end if;

  if v_title = '' then
    raise exception 'Title is required';
  end if;

  select array_agg(distinct uid)
  into v_all_members
  from (
    select v_owner_id as uid
    union
    select unnest(v_member_ids) as uid
  ) members;

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

grant execute on function public.search_profiles_by_email(text, int) to authenticated;
grant execute on function public.create_board_with_members(text, text, uuid[]) to authenticated;
