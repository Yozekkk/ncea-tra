begin;

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
)
values
  ('00000000-0000-0000-0000-000000000000', '12000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'ncea-strike-a@example.invalid', '', now(), '{}', '{"username":"strike_test_a"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '12000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'ncea-strike-b@example.invalid', '', now(), '{}', '{"username":"strike_test_b"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '12000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'ncea-strike-c@example.invalid', '', now(), '{}', '{"username":"strike_test_c"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '12000000-0000-4000-8000-000000000004', 'authenticated', 'authenticated', 'ncea-strike-moderator@example.invalid', '', now(), '{}', '{"username":"strike_test_moderator"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '12000000-0000-4000-8000-000000000005', 'authenticated', 'authenticated', 'ncea-strike-admin@example.invalid', '', now(), '{}', '{"username":"strike_test_admin"}', now(), now(), '', '', '', '');

update public.user_roles
set role = 'moderator'
where user_id = '12000000-0000-4000-8000-000000000004';

update public.user_roles
set role = 'admin'
where user_id = '12000000-0000-4000-8000-000000000005';

do $$
declare
  activity public.user_activity_streaks;
  expected integer := 0;
  offset_days integer;
  utc_today date := (statement_timestamp() at time zone 'UTC')::date;
begin
  for offset_days in reverse 5..0 loop
    expected := expected + 1;
    activity := private.advance_user_activity(
      '12000000-0000-4000-8000-000000000001',
      utc_today - offset_days,
      statement_timestamp()
    );
    if activity.current_streak <> expected then
      raise exception 'Expected streak %, received %', expected, activity.current_streak;
    end if;
  end loop;

  activity := private.advance_user_activity(
    '12000000-0000-4000-8000-000000000001', utc_today, statement_timestamp()
  );
  if activity.current_streak <> 6 then
    raise exception 'Repeated same-day renewal incremented the streak';
  end if;

  for offset_days in reverse 3..0 loop
    activity := private.advance_user_activity(
      '12000000-0000-4000-8000-000000000002',
      utc_today - offset_days,
      statement_timestamp()
    );
  end loop;
  if activity.current_streak <> 4 then
    raise exception 'Second user streak was not independent';
  end if;

  activity := private.advance_user_activity(
    '12000000-0000-4000-8000-000000000004', utc_today - 3, statement_timestamp()
  );
  activity := private.advance_user_activity(
    '12000000-0000-4000-8000-000000000004', utc_today - 1, statement_timestamp()
  );
  if activity.current_streak <> 1 then
    raise exception 'Missed day did not reset the streak';
  end if;
end;
$$;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"12000000-0000-4000-8000-000000000003","role":"authenticated"}',
  true
);

do $$
declare
  initial_status record;
  first_renewal record;
  repeated_renewal record;
begin
  select * into initial_status from public.get_strike_mode_status();
  if initial_status.current_streak <> 0 or initial_status.renewed_today then
    raise exception 'Reading strike status advanced a new user';
  end if;
  if exists (
    select 1 from public.user_activity_streaks
    where user_id = '12000000-0000-4000-8000-000000000003'
  ) then
    raise exception 'Read-only strike status created a streak row';
  end if;

  begin
    perform public.record_daily_activity();
    raise exception 'Legacy automatic activity RPC remained executable';
  exception when insufficient_privilege then null;
  end;

  select * into first_renewal from public.renew_strike_mode();
  if first_renewal.current_streak <> 1 or not first_renewal.renewed then
    raise exception 'First explicit renewal did not start at day 1';
  end if;

  select * into repeated_renewal from public.renew_strike_mode();
  if repeated_renewal.current_streak <> 1 or repeated_renewal.renewed then
    raise exception 'Public RPC is not idempotent within one UTC day';
  end if;

  begin
    update public.user_activity_streaks
    set current_streak = 999,
      last_streak_renewed_at = statement_timestamp() + interval '1 year'
    where user_id = '12000000-0000-4000-8000-000000000003';
    raise exception 'User changed their streak through the Data API';
  exception when insufficient_privilege then null;
  end;
end;
$$;

select set_config(
  'request.jwt.claims',
  '{"sub":"12000000-0000-4000-8000-000000000004","role":"authenticated"}',
  true
);

do $$
declare
  agency_id uuid;
  affected integer;
begin
  select id into agency_id
  from public.marketplace_listings
  where title = 'Сборка Funtime' and listing_source = 'agency';

  if agency_id is null then
    raise exception 'Official Funtime bundle was not seeded';
  end if;

  update public.marketplace_listings
  set title = 'Moderator forged title'
  where id = agency_id;
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Moderator edited an official bundle'; end if;

  delete from public.marketplace_listings where id = agency_id;
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Moderator deleted an official bundle'; end if;
end;
$$;

select set_config(
  'request.jwt.claims',
  '{"sub":"12000000-0000-4000-8000-000000000005","role":"authenticated"}',
  true
);

do $$
declare
  affected integer;
begin
  update public.marketplace_listings
  set sort_order = 91
  where title = 'Сборка Funtime' and listing_source = 'agency';
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'Admin could not manage an official bundle'; end if;
end;
$$;

reset role;

do $$
begin
  if (
    select count(*)
    from public.marketplace_listings as listing
    join public.marketplace_categories as category on category.id = listing.category_id
    where category.slug = 'plugin-bundles'
      and listing.listing_source = 'agency'
      and listing.title in (
        'Сборка Funtime',
        'Сборка ReallyWorld',
        'Сборка HolyWorld',
        'Сборка Bedwars',
        'Сборка мини-игр'
      )
      and listing.price_amount is null
  ) <> 5 then
    raise exception 'Expected five price-less official plugin bundles';
  end if;

  if exists (
    select 1
    from public.marketplace_listing_images as image
    join public.marketplace_listings as listing on listing.id = image.listing_id
    where listing.title in (
      'Сборка Funtime',
      'Сборка ReallyWorld',
      'Сборка HolyWorld',
      'Сборка Bedwars',
      'Сборка мини-игр'
    )
  ) then
    raise exception 'Official plugin bundles unexpectedly have images';
  end if;
end;
$$;

rollback;

select 'NCEA strike mode and plugin bundle RLS verification passed' as result;
