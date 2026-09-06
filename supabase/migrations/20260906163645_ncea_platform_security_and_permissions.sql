-- NCEA platform hardening. This migration is intentionally additive to the
-- existing foundation migration and must only be applied to the NCEA project.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

alter table public.user_roles
  add constraint user_roles_one_role_per_user_key unique (user_id);

create or replace function private.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

create or replace function private.is_staff(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id and role in ('moderator', 'admin')
  );
$$;

create or replace function private.is_admin(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_role(_user_id, 'admin');
$$;

create or replace function private.marketplace_path_owned(_name text, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when split_part(_name, '/', 1) = _user_id::text
      and split_part(_name, '/', 2) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    then exists (
      select 1
      from public.marketplace_listings
      where id = split_part(_name, '/', 2)::uuid
        and seller_id = _user_id
    )
    else false
  end;
$$;

create or replace function private.marketplace_path_mutable(_name text, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when split_part(_name, '/', 1) = _user_id::text
      and split_part(_name, '/', 2) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    then exists (
      select 1
      from public.marketplace_listings
      where id = split_part(_name, '/', 2)::uuid
        and seller_id = _user_id
        and status <> 'published'
    )
    else false
  end;
$$;

create or replace function private.marketplace_object_is_published(_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.marketplace_listing_images as image
    join public.marketplace_listings as listing on listing.id = image.listing_id
    where image.storage_path = _name
      and listing.status = 'published'
  );
$$;

revoke all on function private.has_role(uuid, public.app_role) from public;
revoke all on function private.is_staff(uuid) from public;
revoke all on function private.is_admin(uuid) from public;
revoke all on function private.marketplace_path_owned(text, uuid) from public;
revoke all on function private.marketplace_path_mutable(text, uuid) from public;
revoke all on function private.marketplace_object_is_published(text) from public;
grant execute on function private.has_role(uuid, public.app_role) to authenticated;
grant execute on function private.is_staff(uuid) to authenticated;
grant execute on function private.is_admin(uuid) to authenticated;
grant execute on function private.marketplace_path_owned(text, uuid) to authenticated;
grant execute on function private.marketplace_path_mutable(text, uuid) to authenticated;
grant execute on function private.marketplace_object_is_published(text) to anon, authenticated;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, 'user_' || left(replace(new.id::text, '-', ''), 12))
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

insert into public.profiles (id, username)
select id, 'user_' || left(replace(id::text, '-', ''), 12)
from auth.users
on conflict (id) do nothing;

insert into public.user_roles (user_id, role)
select id, 'user'::public.app_role
from auth.users
on conflict (user_id) do nothing;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function private.set_updated_at() from public, anon, authenticated;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function private.set_updated_at();
create trigger forum_topics_set_updated_at
  before update on public.forum_topics
  for each row execute function private.set_updated_at();
create trigger forum_posts_set_updated_at
  before update on public.forum_posts
  for each row execute function private.set_updated_at();
create trigger marketplace_listings_set_updated_at
  before update on public.marketplace_listings
  for each row execute function private.set_updated_at();

create or replace function private.protect_forum_topic_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null
    and not private.is_staff((select auth.uid()))
    and (
      new.author_id is distinct from old.author_id
      or new.is_pinned is distinct from old.is_pinned
      or new.is_locked is distinct from old.is_locked
    )
  then
    raise exception 'Only moderators can change topic ownership or moderation fields'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

create or replace function private.protect_forum_post_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null
    and not private.is_staff((select auth.uid()))
    and (
      new.author_id is distinct from old.author_id
      or new.topic_id is distinct from old.topic_id
    )
  then
    raise exception 'Only moderators can move posts or change ownership'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

create or replace function private.protect_marketplace_listing_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null
    and not private.is_admin((select auth.uid()))
    and (
      new.seller_id is distinct from old.seller_id
      or new.status = 'published'
    )
  then
    raise exception 'Only administrators can change seller ownership or publish listings'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

revoke all on function private.protect_forum_topic_fields() from public, anon, authenticated;
revoke all on function private.protect_forum_post_fields() from public, anon, authenticated;
revoke all on function private.protect_marketplace_listing_fields() from public, anon, authenticated;

create trigger forum_topics_protect_fields
  before update on public.forum_topics
  for each row execute function private.protect_forum_topic_fields();
create trigger forum_posts_protect_fields
  before update on public.forum_posts
  for each row execute function private.protect_forum_post_fields();
create trigger marketplace_listings_protect_fields
  before update on public.marketplace_listings
  for each row execute function private.protect_marketplace_listing_fields();

create index profiles_created_at_idx on public.profiles (created_at desc);
create index user_roles_role_idx on public.user_roles (role);
create index forum_categories_active_sort_idx on public.forum_categories (is_active, sort_order);
create index forum_topics_category_pinned_created_idx
  on public.forum_topics (category_id, is_pinned desc, created_at desc);
create index forum_topics_created_at_idx on public.forum_topics (created_at desc);
create index forum_posts_topic_created_idx on public.forum_posts (topic_id, created_at);
create index forum_posts_created_at_idx on public.forum_posts (created_at desc);
create index marketplace_categories_active_sort_idx
  on public.marketplace_categories (is_active, sort_order);
create index marketplace_listings_status_created_idx
  on public.marketplace_listings (status, created_at desc);
create index marketplace_listings_created_at_idx on public.marketplace_listings (created_at desc);
create index marketplace_listing_images_listing_sort_idx
  on public.marketplace_listing_images (listing_id, sort_order);

grant select on table public.profiles, public.forum_categories, public.forum_topics,
  public.forum_posts, public.marketplace_categories, public.marketplace_listings,
  public.marketplace_listing_images to anon;

grant select, insert, update, delete on table public.profiles, public.user_roles,
  public.forum_categories, public.forum_topics, public.forum_posts,
  public.marketplace_categories, public.marketplace_listings,
  public.marketplace_listing_images to authenticated;

grant usage, select on sequence public.forum_categories_id_seq,
  public.marketplace_categories_id_seq to authenticated;

drop policy if exists "Public profiles are readable" on public.profiles;
drop policy if exists "Active forum categories are readable" on public.forum_categories;
drop policy if exists "Active marketplace categories are readable" on public.marketplace_categories;
drop policy if exists "Published listings are readable" on public.marketplace_listings;
drop policy if exists "Published listing images are readable" on public.marketplace_listing_images;

create policy profiles_public_read on public.profiles
  for select to anon, authenticated using (true);
create policy profiles_owner_update on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
create policy profiles_admin_update on public.profiles
  for update to authenticated
  using (private.is_admin((select auth.uid())))
  with check (private.is_admin((select auth.uid())));

create policy user_roles_self_or_admin_read on public.user_roles
  for select to authenticated
  using (
    (select auth.uid()) = user_id
    or private.is_admin((select auth.uid()))
  );
create policy user_roles_admin_insert on public.user_roles
  for insert to authenticated
  with check (private.is_admin((select auth.uid())));
create policy user_roles_admin_update on public.user_roles
  for update to authenticated
  using (private.is_admin((select auth.uid())))
  with check (private.is_admin((select auth.uid())));

create policy forum_categories_active_read on public.forum_categories
  for select to anon, authenticated using (is_active);
create policy forum_categories_staff_read on public.forum_categories
  for select to authenticated using (private.is_staff((select auth.uid())));
create policy forum_categories_admin_insert on public.forum_categories
  for insert to authenticated with check (private.is_admin((select auth.uid())));
create policy forum_categories_admin_update on public.forum_categories
  for update to authenticated
  using (private.is_admin((select auth.uid())))
  with check (private.is_admin((select auth.uid())));
create policy forum_categories_admin_delete on public.forum_categories
  for delete to authenticated using (private.is_admin((select auth.uid())));

create policy forum_topics_public_read on public.forum_topics
  for select to anon using (
    exists (
      select 1 from public.forum_categories as category
      where category.id = category_id and category.is_active
    )
  );
create policy forum_topics_authenticated_read on public.forum_topics
  for select to authenticated using (
    author_id = (select auth.uid())
    or private.is_staff((select auth.uid()))
    or exists (
      select 1 from public.forum_categories as category
      where category.id = category_id and category.is_active
    )
  );
create policy forum_topics_owner_insert on public.forum_topics
  for insert to authenticated with check (
    author_id = (select auth.uid())
    and not is_pinned
    and not is_locked
    and exists (
      select 1 from public.forum_categories as category
      where category.id = category_id and category.is_active
    )
  );
create policy forum_topics_staff_insert on public.forum_topics
  for insert to authenticated with check (
    author_id = (select auth.uid()) and private.is_staff((select auth.uid()))
  );
create policy forum_topics_owner_update on public.forum_topics
  for update to authenticated
  using (author_id = (select auth.uid()) and not is_locked)
  with check (
    author_id = (select auth.uid())
    and exists (
      select 1 from public.forum_categories as category
      where category.id = category_id and category.is_active
    )
  );
create policy forum_topics_staff_update on public.forum_topics
  for update to authenticated
  using (private.is_staff((select auth.uid())))
  with check (private.is_staff((select auth.uid())));
create policy forum_topics_owner_delete on public.forum_topics
  for delete to authenticated
  using (author_id = (select auth.uid()) and not is_locked);
create policy forum_topics_staff_delete on public.forum_topics
  for delete to authenticated using (private.is_staff((select auth.uid())));

create policy forum_posts_public_read on public.forum_posts
  for select to anon using (
    exists (
      select 1
      from public.forum_topics as topic
      join public.forum_categories as category on category.id = topic.category_id
      where topic.id = topic_id and category.is_active
    )
  );
create policy forum_posts_authenticated_read on public.forum_posts
  for select to authenticated using (
    author_id = (select auth.uid())
    or private.is_staff((select auth.uid()))
    or exists (
      select 1
      from public.forum_topics as topic
      join public.forum_categories as category on category.id = topic.category_id
      where topic.id = topic_id and category.is_active
    )
  );
create policy forum_posts_owner_insert on public.forum_posts
  for insert to authenticated with check (
    author_id = (select auth.uid())
    and exists (
      select 1
      from public.forum_topics as topic
      join public.forum_categories as category on category.id = topic.category_id
      where topic.id = topic_id and not topic.is_locked and category.is_active
    )
  );
create policy forum_posts_staff_insert on public.forum_posts
  for insert to authenticated with check (
    author_id = (select auth.uid()) and private.is_staff((select auth.uid()))
  );
create policy forum_posts_owner_update on public.forum_posts
  for update to authenticated
  using (
    author_id = (select auth.uid())
    and exists (
      select 1 from public.forum_topics as topic
      where topic.id = topic_id and not topic.is_locked
    )
  )
  with check (author_id = (select auth.uid()));
create policy forum_posts_staff_update on public.forum_posts
  for update to authenticated
  using (private.is_staff((select auth.uid())))
  with check (private.is_staff((select auth.uid())));
create policy forum_posts_owner_delete on public.forum_posts
  for delete to authenticated using (
    author_id = (select auth.uid())
    and exists (
      select 1 from public.forum_topics as topic
      where topic.id = topic_id and not topic.is_locked
    )
  );
create policy forum_posts_staff_delete on public.forum_posts
  for delete to authenticated using (private.is_staff((select auth.uid())));

create policy marketplace_categories_active_read on public.marketplace_categories
  for select to anon, authenticated using (is_active);
create policy marketplace_categories_admin_read on public.marketplace_categories
  for select to authenticated using (private.is_admin((select auth.uid())));
create policy marketplace_categories_admin_insert on public.marketplace_categories
  for insert to authenticated with check (private.is_admin((select auth.uid())));
create policy marketplace_categories_admin_update on public.marketplace_categories
  for update to authenticated
  using (private.is_admin((select auth.uid())))
  with check (private.is_admin((select auth.uid())));
create policy marketplace_categories_admin_delete on public.marketplace_categories
  for delete to authenticated using (private.is_admin((select auth.uid())));

create policy marketplace_listings_public_read on public.marketplace_listings
  for select to anon using (status = 'published');
create policy marketplace_listings_authenticated_read on public.marketplace_listings
  for select to authenticated using (
    status = 'published'
    or seller_id = (select auth.uid())
    or private.is_admin((select auth.uid()))
  );
create policy marketplace_listings_owner_insert on public.marketplace_listings
  for insert to authenticated with check (
    seller_id = (select auth.uid())
    and status = 'draft'
    and exists (
      select 1 from public.marketplace_categories as category
      where category.id = category_id and category.is_active
    )
  );
create policy marketplace_listings_owner_update on public.marketplace_listings
  for update to authenticated
  using (seller_id = (select auth.uid()) and status <> 'published')
  with check (
    seller_id = (select auth.uid())
    and status in ('draft', 'archived')
    and exists (
      select 1 from public.marketplace_categories as category
      where category.id = category_id and category.is_active
    )
  );
create policy marketplace_listings_admin_update on public.marketplace_listings
  for update to authenticated
  using (private.is_admin((select auth.uid())))
  with check (private.is_admin((select auth.uid())));
create policy marketplace_listings_owner_delete on public.marketplace_listings
  for delete to authenticated
  using (seller_id = (select auth.uid()) and status <> 'published');
create policy marketplace_listings_admin_delete on public.marketplace_listings
  for delete to authenticated using (private.is_admin((select auth.uid())));

create policy marketplace_images_public_read on public.marketplace_listing_images
  for select to anon using (
    exists (
      select 1 from public.marketplace_listings as listing
      where listing.id = listing_id and listing.status = 'published'
    )
  );
create policy marketplace_images_authenticated_read on public.marketplace_listing_images
  for select to authenticated using (
    private.is_admin((select auth.uid()))
    or exists (
      select 1 from public.marketplace_listings as listing
      where listing.id = listing_id
        and (listing.status = 'published' or listing.seller_id = (select auth.uid()))
    )
  );
create policy marketplace_images_owner_insert on public.marketplace_listing_images
  for insert to authenticated with check (
    (storage_path like (select auth.uid())::text || '/%')
    and exists (
      select 1 from public.marketplace_listings as listing
      where listing.id = listing_id
        and listing.seller_id = (select auth.uid())
        and listing.status <> 'published'
    )
  );
create policy marketplace_images_admin_insert on public.marketplace_listing_images
  for insert to authenticated with check (private.is_admin((select auth.uid())));
create policy marketplace_images_owner_update on public.marketplace_listing_images
  for update to authenticated
  using (
    exists (
      select 1 from public.marketplace_listings as listing
      where listing.id = listing_id
        and listing.seller_id = (select auth.uid())
        and listing.status <> 'published'
    )
  )
  with check (
    (storage_path like (select auth.uid())::text || '/%')
    and exists (
      select 1 from public.marketplace_listings as listing
      where listing.id = listing_id
        and listing.seller_id = (select auth.uid())
        and listing.status <> 'published'
    )
  );
create policy marketplace_images_admin_update on public.marketplace_listing_images
  for update to authenticated
  using (private.is_admin((select auth.uid())))
  with check (private.is_admin((select auth.uid())));
create policy marketplace_images_owner_delete on public.marketplace_listing_images
  for delete to authenticated using (
    exists (
      select 1 from public.marketplace_listings as listing
      where listing.id = listing_id
        and listing.seller_id = (select auth.uid())
        and listing.status <> 'published'
    )
  );
create policy marketplace_images_admin_delete on public.marketplace_listing_images
  for delete to authenticated using (private.is_admin((select auth.uid())));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'marketplace-listings',
  'marketplace-listings',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy marketplace_storage_public_read on storage.objects
  for select to anon using (
    bucket_id = 'marketplace-listings'
    and private.marketplace_object_is_published(name)
  );
create policy marketplace_storage_authenticated_read on storage.objects
  for select to authenticated using (
    bucket_id = 'marketplace-listings'
    and (
      private.marketplace_object_is_published(name)
      or private.marketplace_path_owned(name, (select auth.uid()))
      or private.is_admin((select auth.uid()))
    )
  );
create policy marketplace_storage_owner_insert on storage.objects
  for insert to authenticated with check (
    bucket_id = 'marketplace-listings'
    and private.marketplace_path_mutable(name, (select auth.uid()))
  );
create policy marketplace_storage_admin_insert on storage.objects
  for insert to authenticated with check (
    bucket_id = 'marketplace-listings'
    and private.is_admin((select auth.uid()))
  );
create policy marketplace_storage_owner_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'marketplace-listings'
    and private.marketplace_path_mutable(name, (select auth.uid()))
  )
  with check (
    bucket_id = 'marketplace-listings'
    and private.marketplace_path_mutable(name, (select auth.uid()))
  );
create policy marketplace_storage_admin_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'marketplace-listings'
    and private.is_admin((select auth.uid()))
  )
  with check (
    bucket_id = 'marketplace-listings'
    and private.is_admin((select auth.uid()))
  );
create policy marketplace_storage_owner_delete on storage.objects
  for delete to authenticated using (
    bucket_id = 'marketplace-listings'
    and private.marketplace_path_mutable(name, (select auth.uid()))
  );
create policy marketplace_storage_admin_delete on storage.objects
  for delete to authenticated using (
    bucket_id = 'marketplace-listings'
    and private.is_admin((select auth.uid()))
  );
