-- Avoid evaluating authenticated-only role helpers for anonymous category
-- reads. Separate public and privileged policies also make intent explicit.

drop policy if exists marketplace_categories_active_or_admin_read on public.marketplace_categories;
create policy marketplace_categories_active_read on public.marketplace_categories
  for select to anon, authenticated using (is_active);
create policy marketplace_categories_admin_read on public.marketplace_categories
  for select to authenticated using (private.is_admin((select auth.uid())));

drop policy if exists forum_categories_active_or_staff_read on public.forum_categories;
create policy forum_categories_active_read on public.forum_categories
  for select to anon, authenticated using (is_active);
create policy forum_categories_staff_read on public.forum_categories
  for select to authenticated using (private.is_staff((select auth.uid())));

