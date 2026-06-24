-- IT team specialization role (separate from access role)
alter table public.profiles
  add column if not exists team_role text
  check (
    team_role is null
    or team_role in (
      'frontend',
      'backend',
      'fullstack',
      'qa',
      'ui_ux',
      'devops',
      'pm'
    )
  );

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, avatar_url, team_role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(coalesce(new.email, ''), '@', 1),
      'User'
    ),
    new.raw_user_meta_data ->> 'avatar_url',
    nullif(new.raw_user_meta_data ->> 'team_role', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;
