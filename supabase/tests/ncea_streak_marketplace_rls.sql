begin;

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
)
values
  ('00000000-0000-0000-0000-000000000000', '11000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'ncea-streak-a@example.invalid', '', now(), '{}', '{"username":"streak_test_a"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '11000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'ncea-streak-b@example.invalid', '', now(), '{}', '{"username":"streak_test_b"}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '11000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'ncea-streak-admin@example.invalid', '', now(), '{}', '{"username":"streak_test_admin"}', now(), now(), '', '', '', '');

update public.user_roles
set role = 'admin'
where user_id = '11000000-0000-4000-8000-000000000003';

insert into public.marketplace_categories (id, slug, name, sort_order)
values (900002, 'streak-test', 'Streak test', 999);

insert into private.registration_rate_limits (key_hash, window_started_at, attempts, updated_at)
values (repeat('a', 64), statement_timestamp(), 1000, statement_timestamp());

do $$
begin
  if public.consume_registration_attempt(repeat('a', 64), 10) then
    raise exception 'Saturated registration rate limit was allowed';
  end if;
  if (
    select attempts from private.registration_rate_limits where key_hash = repeat('a', 64)
  ) <> 1000 then
    raise exception 'Registration rate limit exceeded its defensive ceiling';
  end if;
end;
$$;

do $$
declare
  activity public.user_activity_streaks;
  utc_today date := (statement_timestamp() at time zone 'UTC')::date;
begin
  activity := private.advance_user_activity(
    '11000000-0000-4000-8000-000000000001', utc_today - 5, statement_timestamp()
  );
  if activity.current_streak <> 1 then raise exception 'First day was not streak 1'; end if;

  activity := private.advance_user_activity(
    '11000000-0000-4000-8000-000000000001', utc_today - 5, statement_timestamp()
  );
  if activity.current_streak <> 1 then raise exception 'Same day incremented the streak'; end if;

  for offset_days in reverse 4..0 loop
    activity := private.advance_user_activity(
      '11000000-0000-4000-8000-000000000001',
      utc_today - offset_days,
      statement_timestamp()
    );
  end loop;
  if activity.current_streak <> 6 then raise exception 'Consecutive days did not reach streak 6'; end if;

  activity := private.advance_user_activity(
    '11000000-0000-4000-8000-000000000002', utc_today - 3, statement_timestamp()
  );
  activity := private.advance_user_activity(
    '11000000-0000-4000-8000-000000000002', utc_today - 2, statement_timestamp()
  );
  activity := private.advance_user_activity(
    '11000000-0000-4000-8000-000000000002', utc_today - 1, statement_timestamp()
  );
  activity := private.advance_user_activity(
    '11000000-0000-4000-8000-000000000002', utc_today, statement_timestamp()
  );
  if activity.current_streak <> 4 then raise exception 'User B streak is not independent'; end if;

  activity := private.advance_user_activity(
    '11000000-0000-4000-8000-000000000003', utc_today - 4, statement_timestamp()
  );
  activity := private.advance_user_activity(
    '11000000-0000-4000-8000-000000000003', utc_today - 2, statement_timestamp()
  );
  if activity.current_streak <> 1 then raise exception 'Missed day did not reset the streak'; end if;
end;
$$;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"11000000-0000-4000-8000-000000000001","role":"authenticated"}',
  true
);

do $$
declare
  activity record;
  listing_id uuid;
begin
  select * into activity from public.record_daily_activity();
  if activity.current_streak <> 6 then
    raise exception 'Repeated authenticated activity changed today streak';
  end if;

  begin
    update public.user_activity_streaks
    set current_streak = 999
    where user_id = '11000000-0000-4000-8000-000000000001';
    raise exception 'User changed their own streak';
  exception when insufficient_privilege then null;
  end;

  begin
    perform private.advance_user_activity(
      '11000000-0000-4000-8000-000000000001', current_date + 1, statement_timestamp()
    );
    raise exception 'Authenticated user executed the private streak helper';
  exception when insufficient_privilege then null;
  end;

  begin
    insert into public.marketplace_listings (
      category_id, seller_id, title, slug, short_description, description, currency_code
    ) values (
      900002,
      '11000000-0000-4000-8000-000000000002',
      'Forged seller',
      'forged-seller-1234abcd',
      'Attempted forged seller listing',
      'Attempted forged seller listing must be rejected by database ownership rules.',
      'EUR'
    );
    raise exception 'User A created a listing for User B';
  exception when insufficient_privilege then null;
  end;

  select public.create_marketplace_listing(
    900002,
    'User A promoted listing',
    'user-a-promoted-1234abcd',
    'User A listing summary',
    'User A complete listing description for marketplace verification.',
    10,
    'EUR',
    '1.21.4',
    'Paper',
    true
  ) into listing_id;

  if not exists (
    select 1 from public.marketplace_listings
    where id = listing_id
      and seller_id = '11000000-0000-4000-8000-000000000001'
      and status = 'pending_review'
  ) then
    raise exception 'Marketplace RPC did not derive seller or submit for review';
  end if;

  perform set_config('ncea.test_listing_a', listing_id::text, true);

  begin
    update public.marketplace_listings set status = 'published' where id = listing_id;
    raise exception 'Seller self-published a pending listing';
  exception when insufficient_privilege then null;
  end;
end;
$$;

select set_config(
  'request.jwt.claims',
  '{"sub":"11000000-0000-4000-8000-000000000002","role":"authenticated"}',
  true
);

do $$
declare
  affected integer;
  listing_id uuid;
begin
  update public.marketplace_listings
  set title = 'Unauthorized change'
  where id = current_setting('ncea.test_listing_a')::uuid;
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'User B updated User A listing'; end if;

  select public.create_marketplace_listing(
    900002,
    'User B promoted listing',
    'user-b-promoted-1234abcd',
    'User B listing summary',
    'User B complete listing description for marketplace verification.',
    20,
    'USD',
    '',
    'Fabric',
    true
  ) into listing_id;
  perform set_config('ncea.test_listing_b', listing_id::text, true);

  perform public.create_marketplace_listing(
    900002,
    'Draft must stay private',
    'draft-private-1234abcd',
    'Private draft summary',
    'Private draft description that must never enter the public feed.',
    null,
    'RUB',
    '',
    '',
    false
  );
end;
$$;

select set_config(
  'request.jwt.claims',
  '{"sub":"11000000-0000-4000-8000-000000000003","role":"authenticated"}',
  true
);

update public.marketplace_listings
set status = 'published'
where id in (
  current_setting('ncea.test_listing_a')::uuid,
  current_setting('ncea.test_listing_b')::uuid
);

reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

do $$
declare
  first_listing uuid;
begin
  select id into first_listing
  from public.marketplace_feed
  order by
    promotion_eligible desc,
    effective_streak desc,
    last_bumped_at desc nulls last,
    created_at desc,
    id
  limit 1;

  if first_listing <> current_setting('ncea.test_listing_a')::uuid then
    raise exception 'Higher live streak did not rank first';
  end if;
  if (select count(*) from public.marketplace_feed) <> 2 then
    raise exception 'Draft or review listing leaked into the public feed';
  end if;
end;
$$;

reset role;
rollback;

select 'NCEA streak and marketplace RLS verification passed' as result;
