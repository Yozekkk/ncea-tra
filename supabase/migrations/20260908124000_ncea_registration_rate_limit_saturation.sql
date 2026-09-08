-- Keep abusive registration counters inside the table constraint so repeated
-- blocked requests continue returning a controlled 429 instead of surfacing a
-- database error once the counter reaches its defensive ceiling.

create or replace function public.consume_registration_attempt(_key_hash text, _limit integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  allowed boolean;
begin
  if _key_hash !~ '^[0-9a-f]{64}$' or _limit not between 1 and 20 then
    return false;
  end if;

  delete from private.registration_rate_limits
  where window_started_at < statement_timestamp() - interval '24 hours';

  insert into private.registration_rate_limits (key_hash, window_started_at, attempts, updated_at)
  values (_key_hash, statement_timestamp(), 1, statement_timestamp())
  on conflict (key_hash) do update set
    attempts = case
      when private.registration_rate_limits.window_started_at
        <= statement_timestamp() - interval '1 hour' then 1
      else least(private.registration_rate_limits.attempts + 1, 1000)
    end,
    window_started_at = case
      when private.registration_rate_limits.window_started_at
        <= statement_timestamp() - interval '1 hour' then statement_timestamp()
      else private.registration_rate_limits.window_started_at
    end,
    updated_at = statement_timestamp()
  returning attempts <= _limit into allowed;

  return allowed;
end;
$$;

revoke all on function public.consume_registration_attempt(text, integer)
  from public, anon, authenticated;
grant execute on function public.consume_registration_attempt(text, integer) to service_role;
