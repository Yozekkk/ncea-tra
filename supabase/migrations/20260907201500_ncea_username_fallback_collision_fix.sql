-- Preserve all UUID bits in fallback usernames used by trusted/bootstrap-created users.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_username text := btrim(coalesce(new.raw_user_meta_data ->> 'username', ''));
begin
  if requested_username = '' then
    requested_username := replace(new.id::text, '-', '');
  end if;

  if requested_username !~ '^[A-Za-z0-9_.-]{3,32}$' then
    raise exception 'invalid_username' using errcode = '22023';
  end if;

  insert into public.profiles (id, username)
  values (new.id, requested_username)
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict (user_id) do nothing;

  return new;
exception
  when unique_violation then
    raise exception 'username_already_exists' using errcode = '23505';
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;
