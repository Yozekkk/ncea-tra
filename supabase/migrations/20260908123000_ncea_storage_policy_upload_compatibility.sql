-- Storage creates object rows before final metadata is available to RLS. MIME
-- and size are enforced by the private bucket; RLS enforces extension, path,
-- listing ownership, and mutability.

drop policy if exists marketplace_storage_owner_or_admin_insert on storage.objects;
create policy marketplace_storage_owner_or_admin_insert on storage.objects
  for insert to authenticated with check (
    bucket_id = 'marketplace-listings'
    and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp', 'avif')
    and (
      private.marketplace_path_mutable(name, (select auth.uid()))
      or private.is_admin((select auth.uid()))
    )
  );

drop policy if exists marketplace_storage_owner_or_admin_update on storage.objects;
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
    and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp', 'avif')
    and (
      private.marketplace_path_mutable(name, (select auth.uid()))
      or private.is_admin((select auth.uid()))
    )
  );
