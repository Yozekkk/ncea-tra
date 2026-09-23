-- A soft-deleted listing must no longer make its private bucket objects readable
-- to anonymous users, even when the listing retained the published status.
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
      and listing.deleted_at is null
  );
$$;

revoke all on function private.marketplace_object_is_published(text) from public;
grant execute on function private.marketplace_object_is_published(text) to anon, authenticated;
