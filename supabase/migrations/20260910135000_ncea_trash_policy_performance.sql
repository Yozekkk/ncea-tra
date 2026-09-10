-- Keep trash attribution lookups indexed and avoid evaluating two permissive
-- category policies for each authenticated row.

create index if not exists marketplace_listings_deleted_by_idx
  on public.marketplace_listings (deleted_by)
  where deleted_by is not null;

create index if not exists forum_topics_deleted_by_idx
  on public.forum_topics (deleted_by)
  where deleted_by is not null;

create index if not exists forum_posts_deleted_by_idx
  on public.forum_posts (deleted_by)
  where deleted_by is not null;

drop policy if exists marketplace_categories_active_read on public.marketplace_categories;
drop policy if exists marketplace_categories_admin_read on public.marketplace_categories;

create policy marketplace_categories_public_read on public.marketplace_categories
  for select to anon
  using (is_active);

create policy marketplace_categories_authenticated_read on public.marketplace_categories
  for select to authenticated
  using (is_active or private.is_admin((select auth.uid())));

drop policy if exists forum_categories_active_read on public.forum_categories;
drop policy if exists forum_categories_staff_read on public.forum_categories;

create policy forum_categories_public_read on public.forum_categories
  for select to anon
  using (is_active);

create policy forum_categories_authenticated_read on public.forum_categories
  for select to authenticated
  using (is_active or private.is_staff((select auth.uid())));
