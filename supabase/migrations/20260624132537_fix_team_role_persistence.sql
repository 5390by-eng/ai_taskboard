-- Backfill team_role from auth metadata for profiles created before trigger/column existed
update public.profiles p
set team_role = nullif(u.raw_user_meta_data ->> 'team_role', '')
from auth.users u
where p.id = u.id
  and p.team_role is null
  and nullif(u.raw_user_meta_data ->> 'team_role', '') is not null;

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
  on conflict (id) do update set
    email = excluded.email,
    name = excluded.name,
    avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url),
    team_role = coalesce(excluded.team_role, profiles.team_role);

  return new;
end;
$$;
