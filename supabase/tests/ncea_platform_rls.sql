begin;

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
)
values
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'ncea-test-a@example.invalid', '', now(), '{}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'ncea-test-b@example.invalid', '', now(), '{}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '10000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'ncea-test-admin@example.invalid', '', now(), '{}', '{}', now(), now(), '', '', '', '');

update public.user_roles
set role = 'admin'
where user_id = '10000000-0000-4000-8000-000000000003';

insert into public.forum_categories (id, slug, name, sort_order)
values (900001, 'rls-test', 'RLS Test', 1);
insert into public.marketplace_categories (id, slug, name, sort_order)
values (900001, 'rls-test', 'RLS Test', 1);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}',
  true
);

insert into public.forum_topics (id, category_id, author_id, title, slug)
values (
  '20000000-0000-4000-8000-000000000001', 900001,
  '10000000-0000-4000-8000-000000000001', 'User A topic', 'user-a-topic'
);
insert into public.forum_posts (id, topic_id, author_id, body)
values (
  '30000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001', 'User A post'
);
insert into public.marketplace_listings (
  id, category_id, seller_id, title, slug, description, price_amount, currency_code
)
values (
  '40000000-0000-4000-8000-000000000001', 900001,
  '10000000-0000-4000-8000-000000000001', 'User A listing',
  'user-a-listing', 'Draft listing', 10, 'EUR'
);
insert into storage.objects (bucket_id, name)
values (
  'marketplace-listings',
  '10000000-0000-4000-8000-000000000001/40000000-0000-4000-8000-000000000001/a.webp'
);
insert into public.marketplace_listing_images (listing_id, storage_path)
values (
  '40000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001/40000000-0000-4000-8000-000000000001/a.webp'
);

do $$
declare affected integer;
begin
  update public.user_roles
  set role = 'admin'
  where user_id = '10000000-0000-4000-8000-000000000001';
  get diagnostics affected = row_count;
  if affected <> 0 then
    raise exception 'A user changed their own role';
  end if;

  begin
    update public.marketplace_listings
    set status = 'published'
    where id = '40000000-0000-4000-8000-000000000001';
    raise exception 'A seller self-published a listing';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;

select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000002","role":"authenticated"}',
  true
);

do $$
declare affected integer;
begin
  if (select count(*) from public.forum_topics where id = '20000000-0000-4000-8000-000000000001') <> 1 then
    raise exception 'User B cannot read User A public topic';
  end if;
  if (select count(*) from public.forum_posts where id = '30000000-0000-4000-8000-000000000001') <> 1 then
    raise exception 'User B cannot read User A public post';
  end if;
  if (select count(*) from public.marketplace_listings where id = '40000000-0000-4000-8000-000000000001') <> 0 then
    raise exception 'User B can read User A draft listing';
  end if;

  update public.forum_topics
  set title = 'Changed by B'
  where id = '20000000-0000-4000-8000-000000000001';
  get diagnostics affected = row_count;
  if affected <> 0 then
    raise exception 'User B updated User A topic';
  end if;

  update public.forum_posts
  set body = 'Changed by B'
  where id = '30000000-0000-4000-8000-000000000001';
  get diagnostics affected = row_count;
  if affected <> 0 then
    raise exception 'User B updated User A post';
  end if;

  update public.marketplace_listings
  set title = 'Changed by B'
  where id = '40000000-0000-4000-8000-000000000001';
  get diagnostics affected = row_count;
  if affected <> 0 then
    raise exception 'User B updated User A listing';
  end if;

  if (select count(*) from storage.objects where bucket_id = 'marketplace-listings') <> 0 then
    raise exception 'User B can read User A draft object';
  end if;
end;
$$;

select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000003","role":"authenticated"}',
  true
);

update public.forum_topics
set is_locked = true, is_pinned = true
where id = '20000000-0000-4000-8000-000000000001';
delete from public.forum_posts
where id = '30000000-0000-4000-8000-000000000001';
update public.marketplace_listings
set status = 'published'
where id = '40000000-0000-4000-8000-000000000001';

do $$
begin
  if not exists (
    select 1 from public.forum_topics
    where id = '20000000-0000-4000-8000-000000000001'
      and is_locked and is_pinned
  ) then
    raise exception 'Admin could not moderate topic';
  end if;
  if exists (
    select 1 from public.forum_posts
    where id = '30000000-0000-4000-8000-000000000001'
  ) then
    raise exception 'Admin could not delete post';
  end if;
  if not exists (
    select 1 from public.marketplace_listings
    where id = '40000000-0000-4000-8000-000000000001'
      and status = 'published'
  ) then
    raise exception 'Admin could not publish listing';
  end if;
end;
$$;

reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

do $$
begin
  if (select count(*) from public.marketplace_listings where id = '40000000-0000-4000-8000-000000000001') <> 1 then
    raise exception 'Anonymous cannot read a published listing';
  end if;
  if (select count(*) from storage.objects where bucket_id = 'marketplace-listings') <> 1 then
    raise exception 'Anonymous cannot read a published listing object';
  end if;
  if (select count(*) from public.forum_topics where id = '20000000-0000-4000-8000-000000000001') <> 1 then
    raise exception 'Anonymous cannot read a locked public topic';
  end if;
end;
$$;

reset role;
rollback;

select 'NCEA RLS verification passed' as result;
