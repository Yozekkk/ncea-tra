-- Consolidate permissive policies without changing NCreate authorization semantics.

drop policy ncreate_home_sections_public_read on public.ncreate_home_sections;
drop policy ncreate_home_sections_staff_read on public.ncreate_home_sections;
create policy ncreate_home_sections_anon_read on public.ncreate_home_sections
  for select to anon using (is_published);
create policy ncreate_home_sections_authenticated_read on public.ncreate_home_sections
  for select to authenticated using (
    is_published or private.is_staff((select auth.uid()))
  );

drop policy ncreate_home_cards_public_read on public.ncreate_home_cards;
drop policy ncreate_home_cards_staff_read on public.ncreate_home_cards;
create policy ncreate_home_cards_anon_read on public.ncreate_home_cards
  for select to anon using (
    is_published and exists (
      select 1 from public.ncreate_home_sections as section
      where section.id = section_id and section.is_published
    )
  );
create policy ncreate_home_cards_authenticated_read on public.ncreate_home_cards
  for select to authenticated using (
    private.is_staff((select auth.uid()))
    or (
      is_published and exists (
        select 1 from public.ncreate_home_sections as section
        where section.id = section_id and section.is_published
      )
    )
  );

drop policy ncreate_forum_categories_public_read on public.ncreate_forum_categories;
drop policy ncreate_forum_categories_staff_read on public.ncreate_forum_categories;
create policy ncreate_forum_categories_anon_read on public.ncreate_forum_categories
  for select to anon using (is_active);
create policy ncreate_forum_categories_authenticated_read on public.ncreate_forum_categories
  for select to authenticated using (
    is_active or private.is_staff((select auth.uid()))
  );

drop policy ncreate_forum_topics_owner_update on public.ncreate_forum_topics;
drop policy ncreate_forum_topics_staff_update on public.ncreate_forum_topics;
create policy ncreate_forum_topics_authenticated_update on public.ncreate_forum_topics
  for update to authenticated
  using (
    private.is_staff((select auth.uid()))
    or (author_id = (select auth.uid()) and not is_locked and deleted_at is null)
  )
  with check (
    private.is_staff((select auth.uid()))
    or (
      author_id = (select auth.uid())
      and not is_locked
      and not is_pinned
      and deleted_at is null
      and deleted_by is null
      and exists (
        select 1 from public.ncreate_forum_categories as category
        where category.id = category_id and category.is_active
      )
    )
  );

drop policy ncreate_forum_posts_owner_update on public.ncreate_forum_posts;
drop policy ncreate_forum_posts_staff_update on public.ncreate_forum_posts;
create policy ncreate_forum_posts_authenticated_update on public.ncreate_forum_posts
  for update to authenticated
  using (
    private.is_staff((select auth.uid()))
    or (
      author_id = (select auth.uid())
      and deleted_at is null
      and exists (
        select 1 from public.ncreate_forum_topics as topic
        where topic.id = topic_id and topic.deleted_at is null and not topic.is_locked
      )
    )
  )
  with check (
    private.is_staff((select auth.uid()))
    or (
      author_id = (select auth.uid())
      and deleted_at is null
      and deleted_by is null
    )
  );
