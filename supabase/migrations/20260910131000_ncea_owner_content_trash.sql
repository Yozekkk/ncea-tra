-- Owner hierarchy, URL-backed Marketplace artwork, and recoverable content
-- deletion. Apply only after 20260910130000_ncea_owner_role.sql.

create or replace function private.is_owner(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = 'owner'
  );
$$;

create or replace function private.is_admin(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role in ('admin', 'owner')
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
    select 1 from public.user_roles
    where user_id = _user_id and role in ('moderator', 'admin', 'owner')
  );
$$;

create or replace function private.user_is_admin(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_admin(_user_id);
$$;

revoke all on function private.is_owner(uuid) from public, anon, authenticated;
revoke all on function private.is_admin(uuid) from public, anon, authenticated;
revoke all on function private.is_staff(uuid) from public, anon, authenticated;
revoke all on function private.user_is_admin(uuid) from public, anon, authenticated;
grant execute on function private.is_owner(uuid) to authenticated;
grant execute on function private.is_admin(uuid) to authenticated;
grant execute on function private.is_staff(uuid) to authenticated;
grant execute on function private.user_is_admin(uuid) to authenticated;

-- The existing primary administrator becomes the initial owner. Future owner
-- assignment remains a backend migration/service-role operation only.
update public.user_roles
set role = 'owner'
where user_id = (
  select user_id from public.user_roles
  where role = 'admin'
  order by created_at, user_id
  limit 1
);

alter table public.marketplace_listings
  add column image_url text,
  add column price_text text,
  add column deleted_at timestamptz,
  add column deleted_by uuid references public.profiles(id) on delete set null,
  add column deletion_reason text;

alter table public.marketplace_listings
  add constraint marketplace_listings_image_url_check check (
    image_url is null or (
      char_length(image_url) between 8 and 2048
      and image_url ~ '^https?://[^[:space:]<>"''`]+$'
    )
  ),
  add constraint marketplace_listings_price_text_check check (
    price_text is null or char_length(price_text) between 1 and 120
  ),
  add constraint marketplace_listings_deletion_reason_check check (
    deletion_reason is null or char_length(deletion_reason) <= 500
  );

update public.marketplace_listings
set price_text = 'Цена скоро будет добавлена'
where price_amount is null and price_text is null;

alter table public.forum_topics
  add column deleted_at timestamptz,
  add column deleted_by uuid references public.profiles(id) on delete set null,
  add column deletion_reason text;

alter table public.forum_topics
  add constraint forum_topics_deletion_reason_check check (
    deletion_reason is null or char_length(deletion_reason) <= 500
  );

alter table public.forum_posts
  add column deleted_at timestamptz,
  add column deleted_by uuid references public.profiles(id) on delete set null,
  add column deletion_reason text;

alter table public.forum_posts
  add constraint forum_posts_deletion_reason_check check (
    deletion_reason is null or char_length(deletion_reason) <= 500
  );

create index marketplace_listings_trash_idx
  on public.marketplace_listings (deleted_at desc) where deleted_at is not null;
create index forum_topics_trash_idx
  on public.forum_topics (deleted_at desc) where deleted_at is not null;
create index forum_posts_trash_idx
  on public.forum_posts (deleted_at desc) where deleted_at is not null;

-- No browser client can insert/update/delete roles directly. The only exposed
-- role RPC deliberately excludes owner as both source and target.
revoke insert, update, delete on table public.user_roles from authenticated;

drop policy if exists user_roles_admin_insert on public.user_roles;
drop policy if exists user_roles_admin_update on public.user_roles;
drop policy if exists user_roles_admin_delete on public.user_roles;
drop policy if exists user_roles_self_or_admin_read on public.user_roles;

create policy user_roles_self_or_admin_read on public.user_roles
  for select to authenticated using (
    user_id = (select auth.uid()) or private.is_admin((select auth.uid()))
  );

create or replace function public.set_user_role(_user_id uuid, _role public.app_role)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  existing_role public.app_role;
begin
  if caller_id is null or not private.is_admin(caller_id) then
    raise exception 'administrator_required' using errcode = '42501';
  end if;
  if _role = 'owner' then
    raise exception 'owner_assignment_requires_backend_migration' using errcode = '42501';
  end if;
  select role into existing_role from public.user_roles where user_id = _user_id;
  if existing_role = 'owner' then
    raise exception 'owner_role_is_backend_managed' using errcode = '42501';
  end if;
  update public.user_roles set role = _role where user_id = _user_id;
  if not found then
    raise exception 'user_role_not_found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.set_user_role(uuid, public.app_role) from public, anon;
grant execute on function public.set_user_role(uuid, public.app_role) to authenticated;

create or replace function private.protect_marketplace_listing_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  actor_is_admin boolean := actor is not null and private.is_admin(actor);
  actor_is_moderator boolean := actor is not null
    and private.is_staff(actor) and not private.is_admin(actor);
begin
  if tg_op = 'INSERT' and actor is not null and not private.is_owner(actor)
    and (new.deleted_at is not null or new.deleted_by is not null or new.deletion_reason is not null)
  then
    raise exception 'protected_deletion_fields' using errcode = '42501';
  end if;
  if actor is not null and not actor_is_admin then
    if tg_op = 'INSERT' then
      if new.seller_id is distinct from actor
        or new.listing_source <> 'user'
        or new.sort_order is not null
        or new.status not in ('draft', 'pending_review')
        or new.submitted_at is not null
        or new.published_at is not null
        or new.archived_at is not null
        or new.deleted_at is not null
        or new.deleted_by is not null
        or new.deletion_reason is not null
      then
        raise exception 'protected_listing_fields' using errcode = '42501';
      end if;
    elsif actor_is_moderator then
      if old.listing_source = 'agency'
        or new.listing_source is distinct from old.listing_source
        or new.seller_id is distinct from old.seller_id
        or new.sort_order is distinct from old.sort_order
        or new.category_id is distinct from old.category_id
        or new.title is distinct from old.title
        or new.slug is distinct from old.slug
        or new.short_description is distinct from old.short_description
        or new.description is distinct from old.description
        or new.price_amount is distinct from old.price_amount
        or new.price_text is distinct from old.price_text
        or new.currency_code is distinct from old.currency_code
        or new.minecraft_version is distinct from old.minecraft_version
        or new.platform is distinct from old.platform
        or new.image_url is distinct from old.image_url
        or new.submitted_at is distinct from old.submitted_at
        or new.published_at is distinct from old.published_at
        or new.archived_at is distinct from old.archived_at
      then
        raise exception 'moderator_may_only_change_user_listing_status' using errcode = '42501';
      end if;
    elsif old.listing_source = 'agency'
      or new.seller_id is distinct from actor
      or new.seller_id is distinct from old.seller_id
      or new.listing_source is distinct from old.listing_source
      or new.sort_order is distinct from old.sort_order
      or new.status = 'published'
      or new.submitted_at is distinct from old.submitted_at
      or new.published_at is distinct from old.published_at
      or new.archived_at is distinct from old.archived_at
    then
      raise exception 'protected_listing_fields' using errcode = '42501';
    end if;
  end if;

  if tg_op = 'INSERT' or new.status is distinct from old.status then
    if new.status = 'draft' then
      new.submitted_at := null; new.published_at := null; new.archived_at := null;
    elsif new.status = 'pending_review' then
      new.submitted_at := statement_timestamp(); new.published_at := null; new.archived_at := null;
    elsif new.status = 'published' then
      new.published_at := statement_timestamp(); new.archived_at := null;
    elsif new.status = 'archived' then
      new.archived_at := statement_timestamp();
    end if;
  end if;
  return new;
end;
$$;

create or replace function private.protect_forum_topic_fields()
returns trigger language plpgsql set search_path = '' as $$
declare actor uuid := (select auth.uid());
begin
  if tg_op = 'INSERT' and actor is not null and not private.is_owner(actor)
    and (new.deleted_at is not null or new.deleted_by is not null or new.deletion_reason is not null)
  then raise exception 'protected_deletion_fields' using errcode = '42501'; end if;
  if actor is null or private.is_admin(actor) then return new; end if;
  if tg_op = 'INSERT' then
    if new.is_protected or new.deleted_at is not null or new.deleted_by is not null then
      raise exception 'protected_forum_topic_fields' using errcode = '42501';
    end if;
    return new;
  end if;
  if old.is_protected or private.user_is_admin(old.author_id)
    or new.author_id is distinct from old.author_id
    or new.is_protected is distinct from old.is_protected
    or (not private.is_staff(actor) and (
      new.is_pinned is distinct from old.is_pinned or new.is_locked is distinct from old.is_locked
    ))
  then raise exception 'protected_forum_topic_fields' using errcode = '42501'; end if;
  return new;
end;
$$;

create or replace function private.protect_forum_post_fields()
returns trigger language plpgsql set search_path = '' as $$
declare actor uuid := (select auth.uid());
begin
  if tg_op = 'INSERT' and actor is not null and not private.is_owner(actor)
    and (new.deleted_at is not null or new.deleted_by is not null or new.deletion_reason is not null)
  then raise exception 'protected_deletion_fields' using errcode = '42501'; end if;
  if actor is null or private.is_admin(actor) then return new; end if;
  if tg_op = 'INSERT' then
    if new.is_protected or new.deleted_at is not null or new.deleted_by is not null then
      raise exception 'protected_forum_post_fields' using errcode = '42501';
    end if;
    return new;
  end if;
  if old.is_protected or private.user_is_admin(old.author_id)
    or new.author_id is distinct from old.author_id
    or new.topic_id is distinct from old.topic_id
    or new.is_protected is distinct from old.is_protected
  then raise exception 'protected_forum_post_fields' using errcode = '42501'; end if;
  return new;
end;
$$;

-- Remove table-level UPDATE so deletion audit columns cannot be forged through
-- PostgREST. SECURITY DEFINER trash RPCs retain the required write capability.
revoke update on table public.marketplace_listings from authenticated;
grant update (
  category_id, title, slug, description, price_amount, currency_code, status,
  updated_at, short_description, minecraft_version, platform, submitted_at,
  published_at, archived_at, listing_source, sort_order, image_url, price_text
) on public.marketplace_listings to authenticated;

revoke update on table public.forum_topics from authenticated;
grant update (category_id, title, slug, is_pinned, is_locked, updated_at, is_protected)
  on public.forum_topics to authenticated;

revoke update on table public.forum_posts from authenticated;
grant update (topic_id, body, updated_at, is_protected)
  on public.forum_posts to authenticated;

-- Physical DELETE is owner-only, including direct Data API requests.
drop policy if exists marketplace_listings_role_delete on public.marketplace_listings;
create policy marketplace_listings_owner_delete on public.marketplace_listings
  for delete to authenticated using (private.is_owner((select auth.uid())));

drop policy if exists forum_topics_role_delete on public.forum_topics;
create policy forum_topics_owner_delete on public.forum_topics
  for delete to authenticated using (private.is_owner((select auth.uid())));

drop policy if exists forum_posts_role_delete on public.forum_posts;
create policy forum_posts_owner_delete on public.forum_posts
  for delete to authenticated using (private.is_owner((select auth.uid())));

drop policy if exists marketplace_listings_public_read on public.marketplace_listings;
create policy marketplace_listings_public_read on public.marketplace_listings
  for select to anon using (status = 'published' and deleted_at is null);

drop policy if exists marketplace_listings_role_read on public.marketplace_listings;
create policy marketplace_listings_role_read on public.marketplace_listings
  for select to authenticated using (
    private.is_owner((select auth.uid()))
    or (deleted_at is null and (
      status = 'published'
      or private.is_admin((select auth.uid()))
      or (listing_source = 'user' and (
        seller_id = (select auth.uid()) or private.is_staff((select auth.uid()))
      ))
    ))
  );

drop policy if exists marketplace_listings_owner_or_admin_insert on public.marketplace_listings;
create policy marketplace_listings_owner_or_admin_insert on public.marketplace_listings
  for insert to authenticated with check (
    private.is_admin((select auth.uid()))
    or (
      listing_source = 'user' and sort_order is null
      and seller_id = (select auth.uid())
      and status in ('draft', 'pending_review')
      and deleted_at is null and deleted_by is null
      and exists (
        select 1 from public.marketplace_categories category
        where category.id = category_id and category.is_active
      )
    )
  );

drop policy if exists marketplace_listings_role_update on public.marketplace_listings;
create policy marketplace_listings_role_update on public.marketplace_listings
  for update to authenticated
  using (
    private.is_owner((select auth.uid()))
    or (deleted_at is null and (
      private.is_admin((select auth.uid()))
      or (listing_source = 'user' and (
        seller_id = (select auth.uid()) or private.is_staff((select auth.uid()))
      ))
    ))
  )
  with check (
    private.is_owner((select auth.uid()))
    or (deleted_at is null and (
      private.is_admin((select auth.uid()))
      or (listing_source = 'user' and sort_order is null and (
        private.is_staff((select auth.uid()))
        or (seller_id = (select auth.uid()) and status in ('draft','pending_review','archived'))
      ))
    ))
  );

drop policy if exists forum_topics_public_read on public.forum_topics;
create policy forum_topics_public_read on public.forum_topics
  for select to anon using (
    deleted_at is null and exists (
      select 1 from public.forum_categories category
      where category.id = category_id and category.is_active
    )
  );

drop policy if exists forum_topics_authenticated_read on public.forum_topics;
create policy forum_topics_authenticated_read on public.forum_topics
  for select to authenticated using (
    private.is_owner((select auth.uid()))
    or (deleted_at is null and (
      author_id = (select auth.uid()) or private.is_staff((select auth.uid()))
      or exists (
        select 1 from public.forum_categories category
        where category.id = category_id and category.is_active
      )
    ))
  );

drop policy if exists forum_topics_role_insert on public.forum_topics;
create policy forum_topics_role_insert on public.forum_topics
  for insert to authenticated with check (
    author_id = (select auth.uid()) and deleted_at is null and deleted_by is null
    and (
      private.is_admin((select auth.uid()))
      or (not is_protected and (
        private.is_staff((select auth.uid()))
        or (not is_pinned and not is_locked and exists (
          select 1 from public.forum_categories category
          where category.id = category_id and category.is_active
        ))
      ))
    )
  );

drop policy if exists forum_topics_role_update on public.forum_topics;
create policy forum_topics_role_update on public.forum_topics
  for update to authenticated
  using (
    private.is_owner((select auth.uid()))
    or (deleted_at is null and (
      private.is_admin((select auth.uid()))
      or (not is_protected and not private.user_is_admin(author_id) and (
        private.is_staff((select auth.uid()))
        or (author_id = (select auth.uid()) and not is_locked)
      ))
    ))
  )
  with check (
    private.is_owner((select auth.uid()))
    or (deleted_at is null and (
      private.is_admin((select auth.uid()))
      or (not is_protected and not private.user_is_admin(author_id) and (
        private.is_staff((select auth.uid())) or author_id = (select auth.uid())
      ))
    ))
  );

drop policy if exists forum_posts_public_read on public.forum_posts;
create policy forum_posts_public_read on public.forum_posts
  for select to anon using (
    deleted_at is null and exists (
      select 1 from public.forum_topics topic
      join public.forum_categories category on category.id = topic.category_id
      where topic.id = topic_id and topic.deleted_at is null and category.is_active
    )
  );

drop policy if exists forum_posts_authenticated_read on public.forum_posts;
create policy forum_posts_authenticated_read on public.forum_posts
  for select to authenticated using (
    private.is_owner((select auth.uid()))
    or (deleted_at is null and exists (
      select 1 from public.forum_topics topic
      join public.forum_categories category on category.id = topic.category_id
      where topic.id = topic_id and topic.deleted_at is null
        and (category.is_active or private.is_staff((select auth.uid())))
    ))
  );

drop policy if exists forum_posts_role_insert on public.forum_posts;
create policy forum_posts_role_insert on public.forum_posts
  for insert to authenticated with check (
    author_id = (select auth.uid()) and deleted_at is null and deleted_by is null
    and (private.is_admin((select auth.uid())) or (
      not is_protected and exists (
        select 1 from public.forum_topics topic
        join public.forum_categories category on category.id = topic.category_id
        where topic.id = topic_id and topic.deleted_at is null
          and not topic.is_locked and category.is_active
      )
    ))
  );

drop policy if exists forum_posts_role_update on public.forum_posts;
create policy forum_posts_role_update on public.forum_posts
  for update to authenticated
  using (
    private.is_owner((select auth.uid()))
    or (deleted_at is null and (
      private.is_admin((select auth.uid()))
      or (not is_protected and not private.user_is_admin(author_id)
        and exists (select 1 from public.forum_topics topic where topic.id = topic_id and topic.deleted_at is null and not topic.is_protected)
        and (private.is_staff((select auth.uid())) or author_id = (select auth.uid()))
      )
    ))
  )
  with check (
    private.is_owner((select auth.uid()))
    or (deleted_at is null and (
      private.is_admin((select auth.uid()))
      or (not is_protected and not private.user_is_admin(author_id)
        and (private.is_staff((select auth.uid())) or author_id = (select auth.uid()))
      )
    ))
  );

-- Existing image metadata and Storage objects inherit the parent listing's
-- visibility. Only owner may physically delete protected/trashed assets.
drop policy if exists marketplace_images_public_read on public.marketplace_listing_images;
create policy marketplace_images_public_read on public.marketplace_listing_images
  for select to anon using (
    exists (select 1 from public.marketplace_listings listing
      where listing.id = listing_id and listing.status = 'published' and listing.deleted_at is null)
  );

drop policy if exists marketplace_images_authenticated_read on public.marketplace_listing_images;
drop policy if exists marketplace_images_role_read on public.marketplace_listing_images;
create policy marketplace_images_authenticated_read on public.marketplace_listing_images
  for select to authenticated using (
    private.is_owner((select auth.uid())) or exists (
      select 1 from public.marketplace_listings listing
      where listing.id = listing_id and listing.deleted_at is null and (
        listing.status = 'published' or private.is_admin((select auth.uid()))
        or (listing.listing_source = 'user' and (listing.seller_id = (select auth.uid()) or private.is_staff((select auth.uid()))))
      )
    )
  );

drop policy if exists marketplace_images_owner_or_admin_delete on public.marketplace_listing_images;
drop policy if exists marketplace_images_role_delete on public.marketplace_listing_images;
drop policy if exists marketplace_images_owner_delete on public.marketplace_listing_images;
create policy marketplace_images_owner_delete on public.marketplace_listing_images
  for delete to authenticated using (private.is_owner((select auth.uid())));

drop policy if exists marketplace_storage_owner_or_admin_delete on storage.objects;
drop policy if exists marketplace_storage_owner_delete on storage.objects;
drop policy if exists marketplace_storage_role_delete on storage.objects;
create policy marketplace_storage_owner_delete on storage.objects
  for delete to authenticated using (
    bucket_id = 'marketplace-listings' and private.is_owner((select auth.uid()))
  );

create or replace function public.soft_delete_marketplace_listing(
  _listing_id uuid, _reason text default null
)
returns void language plpgsql security definer set search_path = '' as $$
declare caller_id uuid := (select auth.uid()); target public.marketplace_listings;
begin
  if caller_id is null then raise exception 'authentication_required' using errcode='42501'; end if;
  select * into target from public.marketplace_listings where id = _listing_id for update;
  if not found then raise exception 'listing_not_found' using errcode='P0002'; end if;
  if target.deleted_at is not null then return; end if;
  if not private.is_owner(caller_id) and (
    target.listing_source = 'agency'
    or (not private.is_staff(caller_id) and target.seller_id <> caller_id)
  ) then raise exception 'listing_delete_forbidden' using errcode='42501'; end if;
  update public.marketplace_listings set
    deleted_at = statement_timestamp(), deleted_by = caller_id,
    deletion_reason = nullif(left(trim(coalesce(_reason,'')),500),'')
  where id = _listing_id;
end;
$$;

create or replace function public.soft_delete_forum_topic(
  _topic_id uuid, _reason text default null
)
returns void language plpgsql security definer set search_path = '' as $$
declare caller_id uuid := (select auth.uid()); target public.forum_topics;
begin
  if caller_id is null then raise exception 'authentication_required' using errcode='42501'; end if;
  select * into target from public.forum_topics where id = _topic_id for update;
  if not found then raise exception 'topic_not_found' using errcode='P0002'; end if;
  if target.deleted_at is not null then return; end if;
  if not private.is_owner(caller_id) and (
    target.is_protected or private.user_is_admin(target.author_id)
    or (not private.is_staff(caller_id) and target.author_id <> caller_id)
  ) then raise exception 'topic_delete_forbidden' using errcode='42501'; end if;
  update public.forum_topics set deleted_at=statement_timestamp(), deleted_by=caller_id,
    deletion_reason=nullif(left(trim(coalesce(_reason,'')),500),'') where id=_topic_id;
end;
$$;

create or replace function public.soft_delete_forum_post(
  _post_id uuid, _reason text default null
)
returns void language plpgsql security definer set search_path = '' as $$
declare caller_id uuid := (select auth.uid()); target public.forum_posts; parent public.forum_topics;
begin
  if caller_id is null then raise exception 'authentication_required' using errcode='42501'; end if;
  select * into target from public.forum_posts where id = _post_id for update;
  if not found then raise exception 'post_not_found' using errcode='P0002'; end if;
  if target.deleted_at is not null then return; end if;
  select * into parent from public.forum_topics where id = target.topic_id;
  if not private.is_owner(caller_id) and (
    target.is_protected or parent.is_protected or private.user_is_admin(target.author_id)
    or (not private.is_staff(caller_id) and target.author_id <> caller_id)
  ) then raise exception 'post_delete_forbidden' using errcode='42501'; end if;
  update public.forum_posts set deleted_at=statement_timestamp(), deleted_by=caller_id,
    deletion_reason=nullif(left(trim(coalesce(_reason,'')),500),'') where id=_post_id;
end;
$$;

revoke all on function public.soft_delete_marketplace_listing(uuid,text) from public, anon;
revoke all on function public.soft_delete_forum_topic(uuid,text) from public, anon;
revoke all on function public.soft_delete_forum_post(uuid,text) from public, anon;
grant execute on function public.soft_delete_marketplace_listing(uuid,text) to authenticated;
grant execute on function public.soft_delete_forum_topic(uuid,text) to authenticated;
grant execute on function public.soft_delete_forum_post(uuid,text) to authenticated;

create or replace function public.admin_save_marketplace_listing(
  _listing_id uuid, _category_id bigint, _title text, _short_description text,
  _description text, _listing_source public.marketplace_listing_source,
  _image_url text, _price_amount numeric, _price_text text, _currency_code text,
  _minecraft_version text, _platform text, _sort_order integer,
  _status public.marketplace_listing_status
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare caller_id uuid := (select auth.uid()); saved_id uuid := coalesce(_listing_id, gen_random_uuid());
begin
  if caller_id is null or not private.is_admin(caller_id) then
    raise exception 'administrator_required' using errcode='42501';
  end if;
  if _listing_id is not null and exists (
    select 1 from public.marketplace_listings where id=_listing_id and deleted_at is not null
  ) and not private.is_owner(caller_id) then
    raise exception 'deleted_listing_owner_only' using errcode='42501';
  end if;
  if nullif(trim(_title),'') is null or nullif(trim(_short_description),'') is null
    or nullif(trim(_description),'') is null then
    raise exception 'listing_required_fields' using errcode='22023';
  end if;
  insert into public.marketplace_listings (
    id, category_id, seller_id, title, slug, short_description, description,
    listing_source, image_url, price_amount, price_text, currency_code,
    minecraft_version, platform, sort_order, status
  ) values (
    saved_id, _category_id, caller_id, trim(_title),
    'listing-' || left(replace(saved_id::text,'-',''),16), trim(_short_description), trim(_description),
    _listing_source, nullif(trim(_image_url),''), _price_amount,
    coalesce(nullif(trim(_price_text),''), case when _price_amount is null then 'Цена скоро будет добавлена' end),
    upper(coalesce(nullif(trim(_currency_code),''),'RUB')),
    nullif(trim(_minecraft_version),''), nullif(trim(_platform),''),
    case when _listing_source='agency' then greatest(coalesce(_sort_order,0),0) else null end,
    _status
  )
  on conflict (id) do update set
    category_id=excluded.category_id, title=excluded.title,
    short_description=excluded.short_description, description=excluded.description,
    listing_source=excluded.listing_source, image_url=excluded.image_url,
    price_amount=excluded.price_amount, price_text=excluded.price_text,
    currency_code=excluded.currency_code, minecraft_version=excluded.minecraft_version,
    platform=excluded.platform, sort_order=excluded.sort_order, status=excluded.status;
  return saved_id;
end;
$$;

revoke all on function public.admin_save_marketplace_listing(uuid,bigint,text,text,text,public.marketplace_listing_source,text,numeric,text,text,text,text,integer,public.marketplace_listing_status) from public, anon;
grant execute on function public.admin_save_marketplace_listing(uuid,bigint,text,text,text,public.marketplace_listing_source,text,numeric,text,text,text,text,integer,public.marketplace_listing_status) to authenticated;

create or replace function public.owner_save_forum_topic(
  _topic_id uuid, _category_id bigint, _title text, _content text,
  _is_pinned boolean, _is_locked boolean, _is_protected boolean
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare caller_id uuid := (select auth.uid()); saved_id uuid := coalesce(_topic_id,gen_random_uuid()); first_post uuid;
begin
  if caller_id is null or not private.is_owner(caller_id) then
    raise exception 'owner_required' using errcode='42501';
  end if;
  if nullif(trim(_title),'') is null or nullif(trim(_content),'') is null then
    raise exception 'topic_required_fields' using errcode='22023';
  end if;
  insert into public.forum_topics (id,category_id,author_id,title,slug,is_pinned,is_locked,is_protected)
  values (saved_id,_category_id,caller_id,trim(_title),'topic-'||left(replace(saved_id::text,'-',''),16),
    coalesce(_is_pinned,false),coalesce(_is_locked,false),coalesce(_is_protected,false))
  on conflict (id) do update set category_id=excluded.category_id,title=excluded.title,
    is_pinned=excluded.is_pinned,is_locked=excluded.is_locked,is_protected=excluded.is_protected;
  select id into first_post from public.forum_posts where topic_id=saved_id
  order by created_at,id limit 1;
  if first_post is null then
    insert into public.forum_posts(topic_id,author_id,body,is_protected)
    values(saved_id,caller_id,trim(_content),coalesce(_is_protected,false));
  else
    update public.forum_posts set body=trim(_content),is_protected=coalesce(_is_protected,false)
    where id=first_post;
  end if;
  return saved_id;
end;
$$;

create or replace function public.owner_update_forum_post(_post_id uuid, _body text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if (select auth.uid()) is null or not private.is_owner((select auth.uid())) then
    raise exception 'owner_required' using errcode='42501';
  end if;
  if nullif(trim(_body),'') is null then raise exception 'post_body_required' using errcode='22023'; end if;
  update public.forum_posts set body=trim(_body) where id=_post_id and deleted_at is null;
  if not found then raise exception 'post_not_found' using errcode='P0002'; end if;
end;
$$;

revoke all on function public.owner_save_forum_topic(uuid,bigint,text,text,boolean,boolean,boolean) from public, anon;
revoke all on function public.owner_update_forum_post(uuid,text) from public, anon;
grant execute on function public.owner_save_forum_topic(uuid,bigint,text,text,boolean,boolean,boolean) to authenticated;
grant execute on function public.owner_update_forum_post(uuid,text) to authenticated;

create or replace function public.get_deleted_content(_kind text default 'all')
returns table (
  content_type text, id uuid, title text, author_username text,
  deleted_by_username text, deleted_at timestamptz, deletion_reason text,
  storage_paths text[]
)
language plpgsql stable security definer set search_path = '' as $$
begin
  if (select auth.uid()) is null or not private.is_owner((select auth.uid())) then
    raise exception 'owner_required' using errcode='42501';
  end if;
  if _kind not in ('all','marketplace','topics','posts') then
    raise exception 'invalid_trash_filter' using errcode='22023';
  end if;
  return query
  select * from (
    select 'marketplace'::text, l.id, l.title, a.username, d.username, l.deleted_at,
      l.deletion_reason,
      coalesce((select array_agg(i.storage_path order by i.sort_order,i.id)
        from public.marketplace_listing_images i where i.listing_id=l.id),'{}'::text[])
    from public.marketplace_listings l
    join public.profiles a on a.id=l.seller_id
    left join public.profiles d on d.id=l.deleted_by
    where l.deleted_at is not null and _kind in ('all','marketplace')
    union all
    select 'topics', t.id, t.title, a.username, d.username, t.deleted_at,
      t.deletion_reason, '{}'::text[]
    from public.forum_topics t
    join public.profiles a on a.id=t.author_id
    left join public.profiles d on d.id=t.deleted_by
    where t.deleted_at is not null and _kind in ('all','topics')
    union all
    select 'posts', p.id, left(p.body,120), a.username, d.username, p.deleted_at,
      p.deletion_reason, '{}'::text[]
    from public.forum_posts p
    join public.profiles a on a.id=p.author_id
    left join public.profiles d on d.id=p.deleted_by
    where p.deleted_at is not null and _kind in ('all','posts')
  ) deleted order by deleted_at desc, id;
end;
$$;

create or replace function public.restore_deleted_content(_kind text, _id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if (select auth.uid()) is null or not private.is_owner((select auth.uid())) then
    raise exception 'owner_required' using errcode='42501';
  end if;
  if _kind='marketplace' then
    update public.marketplace_listings set deleted_at=null,deleted_by=null,deletion_reason=null
    where id=_id and deleted_at is not null;
  elsif _kind='topics' then
    update public.forum_topics set deleted_at=null,deleted_by=null,deletion_reason=null
    where id=_id and deleted_at is not null;
  elsif _kind='posts' then
    if exists (select 1 from public.forum_posts p join public.forum_topics t on t.id=p.topic_id
      where p.id=_id and t.deleted_at is not null) then
      raise exception 'restore_parent_topic_first' using errcode='23514';
    end if;
    update public.forum_posts set deleted_at=null,deleted_by=null,deletion_reason=null
    where id=_id and deleted_at is not null;
  else raise exception 'invalid_content_type' using errcode='22023';
  end if;
  if not found then raise exception 'deleted_content_not_found' using errcode='P0002'; end if;
end;
$$;

create or replace function public.permanently_delete_content(_kind text, _id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if (select auth.uid()) is null or not private.is_owner((select auth.uid())) then
    raise exception 'owner_required' using errcode='42501';
  end if;
  if _kind='marketplace' then
    delete from public.marketplace_listings where id=_id and deleted_at is not null;
  elsif _kind='topics' then
    delete from public.forum_topics where id=_id and deleted_at is not null;
  elsif _kind='posts' then
    delete from public.forum_posts where id=_id and deleted_at is not null;
  else raise exception 'invalid_content_type' using errcode='22023';
  end if;
  if not found then raise exception 'deleted_content_not_found' using errcode='P0002'; end if;
end;
$$;

revoke all on function public.get_deleted_content(text) from public, anon;
revoke all on function public.restore_deleted_content(text,uuid) from public, anon;
revoke all on function public.permanently_delete_content(text,uuid) from public, anon;
grant execute on function public.get_deleted_content(text) to authenticated;
grant execute on function public.restore_deleted_content(text,uuid) to authenticated;
grant execute on function public.permanently_delete_content(text,uuid) to authenticated;

create or replace view public.marketplace_feed
with (security_invoker = true)
as
select
  listing.id, listing.category_id, listing.seller_id, listing.title, listing.slug,
  listing.short_description, listing.description, listing.price_amount,
  listing.currency_code, listing.minecraft_version, listing.platform,
  listing.status, listing.created_at, listing.updated_at,
  profile.username as seller_username, profile.avatar_url as seller_avatar_url,
  category.name as category_name, category.slug as category_slug,
  case when listing.listing_source='user' and streak.last_active_date >= (statement_timestamp() at time zone 'UTC')::date-1 then streak.current_streak else 0 end as effective_streak,
  case when listing.listing_source='user' and streak.last_active_date >= (statement_timestamp() at time zone 'UTC')::date-1 and streak.current_streak>=3 then true else false end as promotion_eligible,
  case when listing.listing_source='user' and streak.last_active_date >= (statement_timestamp() at time zone 'UTC')::date-1 and streak.current_streak>=3 then streak.last_streak_renewed_at end as last_bumped_at,
  listing.listing_source, listing.sort_order,
  case when listing.listing_source='agency' then 0 when streak.last_active_date >= (statement_timestamp() at time zone 'UTC')::date-1 and streak.current_streak>=3 then 1 else 2 end as feed_group,
  case when listing.listing_source='agency' then listing.sort_order end as agency_sort_order,
  case when listing.listing_source='agency' then listing.created_at end as agency_created_at,
  case when listing.listing_source='user' then listing.created_at end as user_created_at,
  case when listing.listing_source='user' and streak.last_active_date >= (statement_timestamp() at time zone 'UTC')::date-1 and streak.current_streak>=3 then streak.last_streak_renewed_at end as last_streak_renewed_at,
  case when listing.listing_source='user' and streak.last_active_date >= (statement_timestamp() at time zone 'UTC')::date-1 and streak.current_streak>=3 then listing.published_at end as promoted_published_at,
  listing.published_at, listing.image_url, listing.price_text
from public.marketplace_listings listing
join public.profiles profile on profile.id=listing.seller_id
join public.marketplace_categories category on category.id=listing.category_id
left join public.user_activity_streaks streak on streak.user_id=listing.seller_id
where listing.status='published' and listing.deleted_at is null and category.is_active;

revoke all on table public.marketplace_feed from public, anon, authenticated;
grant select on table public.marketplace_feed to anon, authenticated;
