-- Tasks table for board kanban

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards (id) on delete cascade,
  title text not null,
  description text not null default '',
  status text not null default 'backlog'
    check (status in ('backlog', 'todo', 'in_progress', 'review', 'done')),
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high')),
  assignee_id uuid references public.profiles (id) on delete set null,
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_board_id_idx on public.tasks (board_id);
create index if not exists tasks_board_status_idx on public.tasks (board_id, status);
create index if not exists tasks_assignee_id_idx on public.tasks (assignee_id);

create or replace function public.set_tasks_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tasks_updated_at on public.tasks;

create trigger tasks_updated_at
  before update on public.tasks
  for each row
  execute function public.set_tasks_updated_at();

create or replace function public.validate_task_assignee_membership()
returns trigger
language plpgsql
as $$
begin
  if new.assignee_id is null then
    return new;
  end if;

  if not exists (
    select 1
    from public.board_members bm
    where bm.board_id = new.board_id
      and bm.user_id = new.assignee_id
  ) then
    raise exception 'Assignee must be a board member';
  end if;

  return new;
end;
$$;

drop trigger if exists tasks_validate_assignee on public.tasks;

create trigger tasks_validate_assignee
  before insert or update of board_id, assignee_id on public.tasks
  for each row
  execute function public.validate_task_assignee_membership();

create or replace function public.clear_task_assignee_on_member_removal()
returns trigger
language plpgsql
as $$
begin
  update public.tasks
  set assignee_id = null
  where board_id = old.board_id
    and assignee_id = old.user_id;

  return old;
end;
$$;

drop trigger if exists board_members_clear_task_assignee on public.board_members;

create trigger board_members_clear_task_assignee
  after delete on public.board_members
  for each row
  execute function public.clear_task_assignee_on_member_removal();

alter table public.tasks enable row level security;

create policy "Board members can view tasks"
  on public.tasks
  for select
  using (public.is_board_member(board_id));

create policy "Board members can create tasks"
  on public.tasks
  for insert
  with check (public.is_board_member(board_id));

create policy "Board members can update tasks"
  on public.tasks
  for update
  using (public.is_board_member(board_id))
  with check (public.is_board_member(board_id));

create policy "Board members can delete tasks"
  on public.tasks
  for delete
  using (public.is_board_member(board_id));
