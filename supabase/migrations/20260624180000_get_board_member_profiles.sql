-- RPC to fetch profiles of board members for authenticated board participants

create or replace function public.get_board_member_profiles(
  p_board_id uuid
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
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not public.is_board_member(p_board_id) then
    raise exception 'Not authorized';
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
  inner join public.board_members bm on bm.user_id = p.id
  where bm.board_id = p_board_id
  order by p.name;
end;
$$;

grant execute on function public.get_board_member_profiles(uuid) to authenticated;
