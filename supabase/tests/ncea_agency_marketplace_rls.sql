begin;

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
)
values
  ('00000000-0000-0000-0000-000000000000', '12000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'agency-user-a@example.invalid', '', now(), '{}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '12000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'agency-user-b@example.invalid', '', now(), '{}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '12000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'agency-moderator@example.invalid', '', now(), '{}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '12000000-0000-4000-8000-000000000004', 'authenticated', 'authenticated', 'agency-admin@example.invalid', '', now(), '{}', '{}', now(), now(), '', '', '', '');

update public.user_roles set role = 'moderator'
where user_id = '12000000-0000-4000-8000-000000000003';
update public.user_roles set role = 'admin'
where user_id = '12000000-0000-4000-8000-000000000004';

insert into public.marketplace_categories (id, slug, name, sort_order, is_active)
values (920001, 'agency-rls-test', 'Agency RLS test', 920001, true);
insert into public.forum_categories (id, slug, name, sort_order, is_active)
values (920001, 'agency-rls-test', 'Agency RLS test', 920001, true);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"12000000-0000-4000-8000-000000000004","role":"authenticated"}',
  true
);

insert into public.marketplace_listings (
  id, category_id, seller_id, title, slug, short_description, description,
  price_amount, currency_code, status, listing_source, sort_order
)
values (
  '42000000-0000-4000-8000-000000000001', 920001,
  '12000000-0000-4000-8000-000000000004', 'Protected agency listing',
  'protected-agency-listing-a1b2c3d4', 'Protected agency summary',
  'Protected agency description for permission verification.', null, 'RUB',
  'published', 'agency', 10
);

insert into public.forum_topics (
  id, category_id, author_id, title, slug, is_protected
)
values (
  '22000000-0000-4000-8000-000000000001', 920001,
  '12000000-0000-4000-8000-000000000004', 'Protected admin topic',
  'protected-admin-topic-a1b2c3d4', true
);
insert into public.forum_posts (id, topic_id, author_id, body, is_protected)
values (
  '32000000-0000-4000-8000-000000000001',
  '22000000-0000-4000-8000-000000000001',
  '12000000-0000-4000-8000-000000000004', 'Protected admin post', true
);

select set_config(
  'request.jwt.claims',
  '{"sub":"12000000-0000-4000-8000-000000000001","role":"authenticated"}',
  true
);

do $$
declare
  created_listing uuid;
  affected integer;
begin
  begin
    insert into public.marketplace_listings (
      category_id, seller_id, title, slug, short_description, description,
      currency_code, listing_source, sort_order
    ) values (
      920001, '12000000-0000-4000-8000-000000000001', 'Forged agency listing',
      'forged-agency-listing-a1b2c3d4', 'Forged agency summary',
      'A regular user must never create this agency listing.', 'RUB', 'agency', 1
    );
    raise exception 'User created an agency listing';
  exception when insufficient_privilege then null;
  end;

  begin
    insert into public.marketplace_listings (
      category_id, seller_id, title, slug, short_description, description, currency_code
    ) values (
      920001, '12000000-0000-4000-8000-000000000002', 'Forged seller listing',
      'forged-seller-listing-a1b2c3d4', 'Forged seller summary',
      'A regular user must never choose another seller identity.', 'RUB'
    );
    raise exception 'User forged seller_id';
  exception when insufficient_privilege then null;
  end;

  select public.create_marketplace_listing(
    920001, 'User-owned listing', 'user-owned-listing-a1b2c3d4',
    'User-owned listing summary', 'User-owned description for permission verification.',
    null, 'RUB', '', '', true
  ) into created_listing;
  perform set_config('ncea.agency_test_user_listing', created_listing::text, true);

  if not exists (
    select 1 from public.marketplace_listings
    where id = created_listing
      and seller_id = '12000000-0000-4000-8000-000000000001'
      and listing_source = 'user'
      and sort_order is null
  ) then
    raise exception 'RPC did not force user ownership/source/order';
  end if;

  begin
    update public.marketplace_listings
    set listing_source = 'agency', sort_order = 999
    where id = created_listing;
    raise exception 'User converted own listing to agency';
  exception when insufficient_privilege then null;
  end;

  update public.marketplace_listings set title = 'User attacked agency'
  where id = '42000000-0000-4000-8000-000000000001';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'User updated agency listing'; end if;

  delete from public.marketplace_listings
  where id = '42000000-0000-4000-8000-000000000001';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'User deleted agency listing'; end if;
end;
$$;

select set_config(
  'request.jwt.claims',
  '{"sub":"12000000-0000-4000-8000-000000000002","role":"authenticated"}',
  true
);

do $$
declare affected integer;
begin
  update public.marketplace_listings set title = 'User B attack'
  where id = current_setting('ncea.agency_test_user_listing')::uuid;
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'User B updated User A listing'; end if;
end;
$$;

select set_config(
  'request.jwt.claims',
  '{"sub":"12000000-0000-4000-8000-000000000003","role":"authenticated"}',
  true
);

do $$
declare affected integer;
begin
  if not exists (
    select 1 from public.marketplace_listings
    where id = current_setting('ncea.agency_test_user_listing')::uuid
  ) then raise exception 'Moderator cannot read pending user listing'; end if;

  update public.marketplace_listings set status = 'published'
  where id = current_setting('ncea.agency_test_user_listing')::uuid;
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'Moderator cannot publish user listing'; end if;

  begin
    update public.marketplace_listings set title = 'Moderator content edit'
    where id = current_setting('ncea.agency_test_user_listing')::uuid;
    raise exception 'Moderator edited user listing content';
  exception when insufficient_privilege then null;
  end;

  update public.marketplace_listings set status = 'archived'
  where id = '42000000-0000-4000-8000-000000000001';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Moderator updated agency listing'; end if;

  delete from public.marketplace_listings
  where id = '42000000-0000-4000-8000-000000000001';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Moderator deleted agency listing'; end if;

  update public.forum_topics set is_locked = true
  where id = '22000000-0000-4000-8000-000000000001';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Moderator updated protected admin topic'; end if;

  delete from public.forum_posts
  where id = '32000000-0000-4000-8000-000000000001';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Moderator deleted protected admin post'; end if;
end;
$$;

reset role;
insert into public.user_activity_streaks (
  user_id, current_streak, last_active_date, streak_started_on,
  last_bumped_at, last_streak_renewed_at
) values (
  '12000000-0000-4000-8000-000000000001', 30,
  (statement_timestamp() at time zone 'UTC')::date,
  (statement_timestamp() at time zone 'UTC')::date - 29,
  statement_timestamp(),
  statement_timestamp()
);

set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

do $$
declare first_listing uuid;
begin
  select id into first_listing
  from public.marketplace_feed
  where id in (
    '42000000-0000-4000-8000-000000000001',
    current_setting('ncea.agency_test_user_listing')::uuid
  )
  order by
    feed_group,
    agency_sort_order asc nulls last,
    agency_created_at asc nulls last,
    effective_streak desc,
    last_streak_renewed_at desc nulls last,
    promoted_published_at desc nulls last,
    user_created_at desc nulls last,
    id
  limit 1;

  if first_listing <> '42000000-0000-4000-8000-000000000001' then
    raise exception 'Agency listing did not rank before promoted user listing';
  end if;
end;
$$;

reset role;
rollback;

select 'NCEA agency Marketplace and Forum permission verification passed' as result;
