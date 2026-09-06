-- Consolidate permissive policies that target the same role and action.

-- These helpers remain in a non-exposed schema and are callable by anon only
-- so combined public/staff read policies can safely evaluate to false.
grant execute on function private.is_staff(uuid) to anon;
grant execute on function private.is_admin(uuid) to anon;

drop policy profiles_owner_update on public.profiles;
drop policy profiles_admin_update on public.profiles;
create policy profiles_owner_or_admin_update on public.profiles
  for update to authenticated
  using (
    (select auth.uid()) = id
    or private.is_admin((select auth.uid()))
  )
  with check (
    (select auth.uid()) = id
    or private.is_admin((select auth.uid()))
  );

drop policy forum_categories_active_read on public.forum_categories;
drop policy forum_categories_staff_read on public.forum_categories;
create policy forum_categories_active_or_staff_read on public.forum_categories
  for select to anon, authenticated using (
    is_active
    or private.is_staff((select auth.uid()))
  );

drop policy forum_topics_owner_insert on public.forum_topics;
drop policy forum_topics_staff_insert on public.forum_topics;
create policy forum_topics_owner_or_staff_insert on public.forum_topics
  for insert to authenticated with check (
    author_id = (select auth.uid())
    and (
      private.is_staff((select auth.uid()))
      or (
        not is_pinned
        and not is_locked
        and exists (
          select 1 from public.forum_categories as category
          where category.id = category_id and category.is_active
        )
      )
    )
  );

drop policy forum_topics_owner_update on public.forum_topics;
drop policy forum_topics_staff_update on public.forum_topics;
create policy forum_topics_owner_or_staff_update on public.forum_topics
  for update to authenticated
  using (
    private.is_staff((select auth.uid()))
    or (author_id = (select auth.uid()) and not is_locked)
  )
  with check (
    private.is_staff((select auth.uid()))
    or (
      author_id = (select auth.uid())
      and exists (
        select 1 from public.forum_categories as category
        where category.id = category_id and category.is_active
      )
    )
  );

drop policy forum_topics_owner_delete on public.forum_topics;
drop policy forum_topics_staff_delete on public.forum_topics;
create policy forum_topics_owner_or_staff_delete on public.forum_topics
  for delete to authenticated using (
    private.is_staff((select auth.uid()))
    or (author_id = (select auth.uid()) and not is_locked)
  );

drop policy forum_posts_owner_insert on public.forum_posts;
drop policy forum_posts_staff_insert on public.forum_posts;
create policy forum_posts_owner_or_staff_insert on public.forum_posts
  for insert to authenticated with check (
    author_id = (select auth.uid())
    and (
      private.is_staff((select auth.uid()))
      or exists (
        select 1
        from public.forum_topics as topic
        join public.forum_categories as category on category.id = topic.category_id
        where topic.id = topic_id and not topic.is_locked and category.is_active
      )
    )
  );

drop policy forum_posts_owner_update on public.forum_posts;
drop policy forum_posts_staff_update on public.forum_posts;
create policy forum_posts_owner_or_staff_update on public.forum_posts
  for update to authenticated
  using (
    private.is_staff((select auth.uid()))
    or (
      author_id = (select auth.uid())
      and exists (
        select 1 from public.forum_topics as topic
        where topic.id = topic_id and not topic.is_locked
      )
    )
  )
  with check (
    private.is_staff((select auth.uid()))
    or author_id = (select auth.uid())
  );

drop policy forum_posts_owner_delete on public.forum_posts;
drop policy forum_posts_staff_delete on public.forum_posts;
create policy forum_posts_owner_or_staff_delete on public.forum_posts
  for delete to authenticated using (
    private.is_staff((select auth.uid()))
    or (
      author_id = (select auth.uid())
      and exists (
        select 1 from public.forum_topics as topic
        where topic.id = topic_id and not topic.is_locked
      )
    )
  );

drop policy marketplace_categories_active_read on public.marketplace_categories;
drop policy marketplace_categories_admin_read on public.marketplace_categories;
create policy marketplace_categories_active_or_admin_read on public.marketplace_categories
  for select to anon, authenticated using (
    is_active
    or private.is_admin((select auth.uid()))
  );

drop policy marketplace_listings_owner_update on public.marketplace_listings;
drop policy marketplace_listings_admin_update on public.marketplace_listings;
create policy marketplace_listings_owner_or_admin_update on public.marketplace_listings
  for update to authenticated
  using (
    private.is_admin((select auth.uid()))
    or (seller_id = (select auth.uid()) and status <> 'published')
  )
  with check (
    private.is_admin((select auth.uid()))
    or (
      seller_id = (select auth.uid())
      and status in ('draft', 'archived')
      and exists (
        select 1 from public.marketplace_categories as category
        where category.id = category_id and category.is_active
      )
    )
  );

drop policy marketplace_listings_owner_delete on public.marketplace_listings;
drop policy marketplace_listings_admin_delete on public.marketplace_listings;
create policy marketplace_listings_owner_or_admin_delete on public.marketplace_listings
  for delete to authenticated using (
    private.is_admin((select auth.uid()))
    or (seller_id = (select auth.uid()) and status <> 'published')
  );

drop policy marketplace_images_owner_insert on public.marketplace_listing_images;
drop policy marketplace_images_admin_insert on public.marketplace_listing_images;
create policy marketplace_images_owner_or_admin_insert on public.marketplace_listing_images
  for insert to authenticated with check (
    private.is_admin((select auth.uid()))
    or (
      storage_path like (select auth.uid())::text || '/%'
      and exists (
        select 1 from public.marketplace_listings as listing
        where listing.id = listing_id
          and listing.seller_id = (select auth.uid())
          and listing.status <> 'published'
      )
    )
  );

drop policy marketplace_images_owner_update on public.marketplace_listing_images;
drop policy marketplace_images_admin_update on public.marketplace_listing_images;
create policy marketplace_images_owner_or_admin_update on public.marketplace_listing_images
  for update to authenticated
  using (
    private.is_admin((select auth.uid()))
    or exists (
      select 1 from public.marketplace_listings as listing
      where listing.id = listing_id
        and listing.seller_id = (select auth.uid())
        and listing.status <> 'published'
    )
  )
  with check (
    private.is_admin((select auth.uid()))
    or (
      storage_path like (select auth.uid())::text || '/%'
      and exists (
        select 1 from public.marketplace_listings as listing
        where listing.id = listing_id
          and listing.seller_id = (select auth.uid())
          and listing.status <> 'published'
      )
    )
  );

drop policy marketplace_images_owner_delete on public.marketplace_listing_images;
drop policy marketplace_images_admin_delete on public.marketplace_listing_images;
create policy marketplace_images_owner_or_admin_delete on public.marketplace_listing_images
  for delete to authenticated using (
    private.is_admin((select auth.uid()))
    or exists (
      select 1 from public.marketplace_listings as listing
      where listing.id = listing_id
        and listing.seller_id = (select auth.uid())
        and listing.status <> 'published'
    )
  );

drop policy marketplace_storage_owner_insert on storage.objects;
drop policy marketplace_storage_admin_insert on storage.objects;
create policy marketplace_storage_owner_or_admin_insert on storage.objects
  for insert to authenticated with check (
    bucket_id = 'marketplace-listings'
    and (
      private.marketplace_path_mutable(name, (select auth.uid()))
      or private.is_admin((select auth.uid()))
    )
  );

drop policy marketplace_storage_owner_update on storage.objects;
drop policy marketplace_storage_admin_update on storage.objects;
create policy marketplace_storage_owner_or_admin_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'marketplace-listings'
    and (
      private.marketplace_path_mutable(name, (select auth.uid()))
      or private.is_admin((select auth.uid()))
    )
  )
  with check (
    bucket_id = 'marketplace-listings'
    and (
      private.marketplace_path_mutable(name, (select auth.uid()))
      or private.is_admin((select auth.uid()))
    )
  );

drop policy marketplace_storage_owner_delete on storage.objects;
drop policy marketplace_storage_admin_delete on storage.objects;
create policy marketplace_storage_owner_or_admin_delete on storage.objects
  for delete to authenticated using (
    bucket_id = 'marketplace-listings'
    and (
      private.marketplace_path_mutable(name, (select auth.uid()))
      or private.is_admin((select auth.uid()))
    )
  );
