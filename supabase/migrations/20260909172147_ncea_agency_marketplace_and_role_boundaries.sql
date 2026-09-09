-- NCEA official Marketplace inventory and role boundaries.
-- Apply only to project bualqaeinwifoopzflbt.

create type public.marketplace_listing_source as enum ('agency', 'user');

alter table public.marketplace_listings
  add column listing_source public.marketplace_listing_source not null default 'user',
  add column sort_order integer;

alter table public.marketplace_listings
  add constraint marketplace_listings_source_sort_check check (
    (listing_source = 'user' and sort_order is null)
    or (listing_source = 'agency' and sort_order is not null and sort_order >= 0)
  );

grant usage on type public.marketplace_listing_source to anon, authenticated;

alter table public.forum_topics
  add column is_protected boolean not null default false;
alter table public.forum_posts
  add column is_protected boolean not null default false;

create or replace function private.user_is_admin(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id and role = 'admin'
  );
$$;

revoke all on function private.user_is_admin(uuid) from public;
grant execute on function private.user_is_admin(uuid) to authenticated;

create or replace function private.protect_marketplace_listing_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  actor_is_admin boolean := actor is not null and private.is_admin(actor);
  actor_is_moderator boolean := actor is not null
    and private.is_staff(actor)
    and not private.is_admin(actor);
begin
  if actor is not null and not actor_is_admin then
    if tg_op = 'INSERT' then
      if new.seller_id is distinct from actor
        or new.listing_source <> 'user'
        or new.sort_order is not null
        or new.status not in ('draft', 'pending_review')
        or new.submitted_at is not null
        or new.published_at is not null
        or new.archived_at is not null
      then
        raise exception 'Protected listing fields cannot be changed'
          using errcode = '42501';
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
        or new.currency_code is distinct from old.currency_code
        or new.minecraft_version is distinct from old.minecraft_version
        or new.platform is distinct from old.platform
        or new.submitted_at is distinct from old.submitted_at
        or new.published_at is distinct from old.published_at
        or new.archived_at is distinct from old.archived_at
      then
        raise exception 'Moderators may only change user listing moderation status'
          using errcode = '42501';
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
      raise exception 'Protected listing fields cannot be changed'
        using errcode = '42501';
    end if;
  end if;

  if tg_op = 'INSERT' or new.status is distinct from old.status then
    if new.status = 'draft' then
      new.submitted_at := null;
      new.published_at := null;
      new.archived_at := null;
    elsif new.status = 'pending_review' then
      new.submitted_at := statement_timestamp();
      new.published_at := null;
      new.archived_at := null;
    elsif new.status = 'published' then
      new.published_at := statement_timestamp();
      new.archived_at := null;
    elsif new.status = 'archived' then
      new.archived_at := statement_timestamp();
    end if;
  end if;

  return new;
end;
$$;

revoke all on function private.protect_marketplace_listing_fields()
  from public, anon, authenticated;

create or replace function private.protect_forum_topic_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
begin
  if actor is null or private.is_admin(actor) then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.is_protected then
      raise exception 'Only administrators can protect forum topics'
        using errcode = '42501';
    end if;
    return new;
  end if;

  if old.is_protected
    or private.user_is_admin(old.author_id)
    or new.author_id is distinct from old.author_id
    or new.is_protected is distinct from old.is_protected
    or (
      not private.is_staff(actor)
      and (
        new.is_pinned is distinct from old.is_pinned
        or new.is_locked is distinct from old.is_locked
      )
    )
  then
    raise exception 'Protected forum topic fields cannot be changed'
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
declare
  actor uuid := (select auth.uid());
begin
  if actor is null or private.is_admin(actor) then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.is_protected then
      raise exception 'Only administrators can protect forum posts'
        using errcode = '42501';
    end if;
    return new;
  end if;

  if old.is_protected
    or private.user_is_admin(old.author_id)
    or new.author_id is distinct from old.author_id
    or new.topic_id is distinct from old.topic_id
    or new.is_protected is distinct from old.is_protected
  then
    raise exception 'Protected forum post fields cannot be changed'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function private.protect_forum_topic_fields() from public, anon, authenticated;
revoke all on function private.protect_forum_post_fields() from public, anon, authenticated;

drop trigger if exists forum_topics_protect_fields on public.forum_topics;
create trigger forum_topics_protect_fields
  before insert or update on public.forum_topics
  for each row execute function private.protect_forum_topic_fields();

drop trigger if exists forum_posts_protect_fields on public.forum_posts;
create trigger forum_posts_protect_fields
  before insert or update on public.forum_posts
  for each row execute function private.protect_forum_post_fields();

drop policy if exists marketplace_listings_public_read on public.marketplace_listings;
drop policy if exists marketplace_listings_authenticated_read on public.marketplace_listings;
drop policy if exists marketplace_listings_owner_insert on public.marketplace_listings;
drop policy if exists marketplace_listings_owner_update on public.marketplace_listings;
drop policy if exists marketplace_listings_admin_update on public.marketplace_listings;
drop policy if exists marketplace_listings_owner_or_admin_update on public.marketplace_listings;
drop policy if exists marketplace_listings_owner_delete on public.marketplace_listings;
drop policy if exists marketplace_listings_admin_delete on public.marketplace_listings;
drop policy if exists marketplace_listings_owner_or_admin_delete on public.marketplace_listings;

create policy marketplace_listings_public_read on public.marketplace_listings
  for select to anon using (status = 'published');

create policy marketplace_listings_role_read on public.marketplace_listings
  for select to authenticated using (
    status = 'published'
    or private.is_admin((select auth.uid()))
    or (
      listing_source = 'user'
      and (
        seller_id = (select auth.uid())
        or private.is_staff((select auth.uid()))
      )
    )
  );

create policy marketplace_listings_owner_or_admin_insert on public.marketplace_listings
  for insert to authenticated with check (
    private.is_admin((select auth.uid()))
    or (
      listing_source = 'user'
      and sort_order is null
      and seller_id = (select auth.uid())
      and status in ('draft', 'pending_review')
      and exists (
        select 1 from public.marketplace_categories as category
        where category.id = category_id and category.is_active
      )
    )
  );

create policy marketplace_listings_role_update on public.marketplace_listings
  for update to authenticated
  using (
    private.is_admin((select auth.uid()))
    or (
      listing_source = 'user'
      and (
        seller_id = (select auth.uid())
        or private.is_staff((select auth.uid()))
      )
    )
  )
  with check (
    private.is_admin((select auth.uid()))
    or (
      listing_source = 'user'
      and sort_order is null
      and (
        private.is_staff((select auth.uid()))
        or (
          seller_id = (select auth.uid())
          and status in ('draft', 'pending_review', 'archived')
          and exists (
            select 1 from public.marketplace_categories as category
            where category.id = category_id and category.is_active
          )
        )
      )
    )
  );

create policy marketplace_listings_role_delete on public.marketplace_listings
  for delete to authenticated using (
    private.is_admin((select auth.uid()))
    or (
      listing_source = 'user'
      and (
        private.is_staff((select auth.uid()))
        or (seller_id = (select auth.uid()) and status <> 'published')
      )
    )
  );

drop policy if exists marketplace_images_public_read on public.marketplace_listing_images;
drop policy if exists marketplace_images_authenticated_read on public.marketplace_listing_images;
drop policy if exists marketplace_images_owner_or_admin_insert on public.marketplace_listing_images;
drop policy if exists marketplace_images_owner_or_admin_update on public.marketplace_listing_images;
drop policy if exists marketplace_images_owner_or_admin_delete on public.marketplace_listing_images;

create policy marketplace_images_public_read on public.marketplace_listing_images
  for select to anon using (
    exists (
      select 1 from public.marketplace_listings as listing
      where listing.id = listing_id and listing.status = 'published'
    )
  );

create policy marketplace_images_role_read on public.marketplace_listing_images
  for select to authenticated using (
    exists (
      select 1 from public.marketplace_listings as listing
      where listing.id = listing_id
        and (
          listing.status = 'published'
          or private.is_admin((select auth.uid()))
          or (
            listing.listing_source = 'user'
            and (
              listing.seller_id = (select auth.uid())
              or private.is_staff((select auth.uid()))
            )
          )
        )
    )
  );

create policy marketplace_images_owner_or_admin_insert on public.marketplace_listing_images
  for insert to authenticated with check (
    private.is_admin((select auth.uid()))
    or (
      storage_path like (select auth.uid())::text || '/%'
      and exists (
        select 1 from public.marketplace_listings as listing
        where listing.id = listing_id
          and listing.listing_source = 'user'
          and listing.seller_id = (select auth.uid())
          and listing.status <> 'published'
      )
    )
  );

create policy marketplace_images_owner_or_admin_update on public.marketplace_listing_images
  for update to authenticated
  using (
    private.is_admin((select auth.uid()))
    or exists (
      select 1 from public.marketplace_listings as listing
      where listing.id = listing_id
        and listing.listing_source = 'user'
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
          and listing.listing_source = 'user'
          and listing.seller_id = (select auth.uid())
          and listing.status <> 'published'
      )
    )
  );

create policy marketplace_images_role_delete on public.marketplace_listing_images
  for delete to authenticated using (
    private.is_admin((select auth.uid()))
    or exists (
      select 1 from public.marketplace_listings as listing
      where listing.id = listing_id
        and listing.listing_source = 'user'
        and (
          private.is_staff((select auth.uid()))
          or (listing.seller_id = (select auth.uid()) and listing.status <> 'published')
        )
    )
  );

create or replace function private.marketplace_path_owned(_name text, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when array_length(string_to_array(_name, '/'), 1) = 3
      and split_part(_name, '/', 1) = _user_id::text
      and split_part(_name, '/', 2) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      and split_part(_name, '/', 3) <> ''
    then exists (
      select 1 from public.marketplace_listings
      where id = split_part(_name, '/', 2)::uuid
        and seller_id = _user_id
        and listing_source = 'user'
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
  select private.marketplace_path_owned(_name, _user_id)
    and exists (
      select 1 from public.marketplace_listings
      where id = split_part(_name, '/', 2)::uuid
        and seller_id = _user_id
        and listing_source = 'user'
        and status <> 'published'
    );
$$;

create or replace function private.marketplace_path_moderatable(_name text, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_staff(_user_id)
    and not private.is_admin(_user_id)
    and array_length(string_to_array(_name, '/'), 1) = 3
    and split_part(_name, '/', 2) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    and exists (
      select 1 from public.marketplace_listings
      where id = split_part(_name, '/', 2)::uuid
        and listing_source = 'user'
    );
$$;

revoke all on function private.marketplace_path_owned(text, uuid) from public;
revoke all on function private.marketplace_path_mutable(text, uuid) from public;
revoke all on function private.marketplace_path_moderatable(text, uuid) from public;
grant execute on function private.marketplace_path_owned(text, uuid) to authenticated;
grant execute on function private.marketplace_path_mutable(text, uuid) to authenticated;
grant execute on function private.marketplace_path_moderatable(text, uuid) to authenticated;

drop policy if exists marketplace_storage_authenticated_read on storage.objects;
drop policy if exists marketplace_storage_owner_or_admin_insert on storage.objects;
drop policy if exists marketplace_storage_owner_or_admin_update on storage.objects;
drop policy if exists marketplace_storage_owner_or_admin_delete on storage.objects;

create policy marketplace_storage_authenticated_read on storage.objects
  for select to authenticated using (
    bucket_id = 'marketplace-listings'
    and (
      private.marketplace_object_is_published(name)
      or private.marketplace_path_owned(name, (select auth.uid()))
      or private.marketplace_path_moderatable(name, (select auth.uid()))
      or private.is_admin((select auth.uid()))
    )
  );

create policy marketplace_storage_owner_or_admin_insert on storage.objects
  for insert to authenticated with check (
    bucket_id = 'marketplace-listings'
    and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp', 'avif')
    and (
      private.marketplace_path_mutable(name, (select auth.uid()))
      or private.is_admin((select auth.uid()))
    )
  );

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

create policy marketplace_storage_role_delete on storage.objects
  for delete to authenticated using (
    bucket_id = 'marketplace-listings'
    and (
      private.marketplace_path_mutable(name, (select auth.uid()))
      or private.marketplace_path_moderatable(name, (select auth.uid()))
      or private.is_admin((select auth.uid()))
    )
  );

drop policy if exists forum_topics_owner_or_staff_update on public.forum_topics;
drop policy if exists forum_topics_owner_or_staff_delete on public.forum_topics;
drop policy if exists forum_topics_owner_or_staff_insert on public.forum_topics;

create policy forum_topics_role_insert on public.forum_topics
  for insert to authenticated with check (
    author_id = (select auth.uid())
    and (
      private.is_admin((select auth.uid()))
      or (
        not is_protected
        and (
          private.is_staff((select auth.uid()))
          or (
            not is_pinned and not is_locked
            and exists (
              select 1 from public.forum_categories as category
              where category.id = category_id and category.is_active
            )
          )
        )
      )
    )
  );

create policy forum_topics_role_update on public.forum_topics
  for update to authenticated
  using (
    private.is_admin((select auth.uid()))
    or (
      not is_protected
      and not private.user_is_admin(author_id)
      and (
        private.is_staff((select auth.uid()))
        or (author_id = (select auth.uid()) and not is_locked)
      )
    )
  )
  with check (
    private.is_admin((select auth.uid()))
    or (
      not is_protected
      and not private.user_is_admin(author_id)
      and (
        private.is_staff((select auth.uid()))
        or (
          author_id = (select auth.uid())
          and exists (
            select 1 from public.forum_categories as category
            where category.id = category_id and category.is_active
          )
        )
      )
    )
  );

create policy forum_topics_role_delete on public.forum_topics
  for delete to authenticated using (
    private.is_admin((select auth.uid()))
    or (
      not is_protected
      and not private.user_is_admin(author_id)
      and (
        private.is_staff((select auth.uid()))
        or (author_id = (select auth.uid()) and not is_locked)
      )
    )
  );

drop policy if exists forum_posts_owner_or_staff_insert on public.forum_posts;
drop policy if exists forum_posts_owner_or_staff_update on public.forum_posts;
drop policy if exists forum_posts_owner_or_staff_delete on public.forum_posts;

create policy forum_posts_role_insert on public.forum_posts
  for insert to authenticated with check (
    author_id = (select auth.uid())
    and (
      private.is_admin((select auth.uid()))
      or (
        not is_protected
        and (
          private.is_staff((select auth.uid()))
          or exists (
            select 1
            from public.forum_topics as topic
            join public.forum_categories as category on category.id = topic.category_id
            where topic.id = topic_id and not topic.is_locked and category.is_active
          )
        )
      )
    )
  );

create policy forum_posts_role_update on public.forum_posts
  for update to authenticated
  using (
    private.is_admin((select auth.uid()))
    or (
      not is_protected
      and not private.user_is_admin(author_id)
      and exists (
        select 1 from public.forum_topics as topic
        where topic.id = topic_id and not topic.is_protected
      )
      and (
        private.is_staff((select auth.uid()))
        or (
          author_id = (select auth.uid())
          and exists (
            select 1 from public.forum_topics as topic
            where topic.id = topic_id and not topic.is_locked
          )
        )
      )
    )
  )
  with check (
    private.is_admin((select auth.uid()))
    or (
      not is_protected
      and not private.user_is_admin(author_id)
      and exists (
        select 1 from public.forum_topics as topic
        where topic.id = topic_id and not topic.is_protected
      )
      and (
        private.is_staff((select auth.uid()))
        or author_id = (select auth.uid())
      )
    )
  );

create policy forum_posts_role_delete on public.forum_posts
  for delete to authenticated using (
    private.is_admin((select auth.uid()))
    or (
      not is_protected
      and not private.user_is_admin(author_id)
      and exists (
        select 1 from public.forum_topics as topic
        where topic.id = topic_id and not topic.is_protected
      )
      and (
        private.is_staff((select auth.uid()))
        or (
          author_id = (select auth.uid())
          and exists (
            select 1 from public.forum_topics as topic
            where topic.id = topic_id and not topic.is_locked
          )
        )
      )
    )
  );

create or replace function public.create_marketplace_listing(
  _category_id bigint,
  _title text,
  _slug text,
  _short_description text,
  _description text,
  _price_amount numeric,
  _currency_code text,
  _minecraft_version text,
  _platform text,
  _submit boolean default false
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare created_listing_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;

  insert into public.marketplace_listings (
    category_id, seller_id, title, slug, short_description, description,
    price_amount, currency_code, minecraft_version, platform, status,
    listing_source, sort_order
  ) values (
    _category_id, (select auth.uid()), btrim(_title), _slug,
    btrim(_short_description), btrim(_description), _price_amount,
    upper(_currency_code), nullif(btrim(_minecraft_version), ''),
    nullif(btrim(_platform), ''),
    case when _submit then 'pending_review'::public.marketplace_listing_status
      else 'draft'::public.marketplace_listing_status end,
    'user', null
  )
  returning id into created_listing_id;

  return created_listing_id;
end;
$$;

create or replace function public.update_marketplace_listing(
  _listing_id uuid,
  _category_id bigint,
  _title text,
  _short_description text,
  _description text,
  _price_amount numeric,
  _currency_code text,
  _minecraft_version text,
  _platform text,
  _submit boolean default false
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare updated_listing_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;

  update public.marketplace_listings
  set category_id = _category_id,
    title = btrim(_title),
    short_description = btrim(_short_description),
    description = btrim(_description),
    price_amount = _price_amount,
    currency_code = upper(_currency_code),
    minecraft_version = nullif(btrim(_minecraft_version), ''),
    platform = nullif(btrim(_platform), ''),
    status = case when _submit then 'pending_review'::public.marketplace_listing_status
      else 'draft'::public.marketplace_listing_status end
  where id = _listing_id
    and seller_id = (select auth.uid())
    and listing_source = 'user'
  returning id into updated_listing_id;

  if updated_listing_id is null then
    raise exception 'listing_not_owned_or_missing' using errcode = '42501';
  end if;

  return updated_listing_id;
end;
$$;

revoke all on function public.create_marketplace_listing(
  bigint, text, text, text, text, numeric, text, text, text, boolean
) from public, anon;
grant execute on function public.create_marketplace_listing(
  bigint, text, text, text, text, numeric, text, text, text, boolean
) to authenticated;

revoke all on function public.update_marketplace_listing(
  uuid, bigint, text, text, text, numeric, text, text, text, boolean
) from public, anon;
grant execute on function public.update_marketplace_listing(
  uuid, bigint, text, text, text, numeric, text, text, text, boolean
) to authenticated;

create index marketplace_listings_agency_feed_idx
  on public.marketplace_listings (category_id, sort_order, created_at, id)
  where status = 'published' and listing_source = 'agency';

create or replace view public.marketplace_feed
with (security_invoker = true)
as
select
  listing.id,
  listing.category_id,
  listing.seller_id,
  listing.title,
  listing.slug,
  listing.short_description,
  listing.description,
  listing.price_amount,
  listing.currency_code,
  listing.minecraft_version,
  listing.platform,
  listing.status,
  listing.created_at,
  listing.updated_at,
  profile.username as seller_username,
  profile.avatar_url as seller_avatar_url,
  category.name as category_name,
  category.slug as category_slug,
  case
    when listing.listing_source = 'user'
      and streak.last_active_date >= (statement_timestamp() at time zone 'UTC')::date - 1
      then streak.current_streak
    else 0
  end as effective_streak,
  case
    when listing.listing_source = 'user'
      and streak.last_active_date >= (statement_timestamp() at time zone 'UTC')::date - 1
      and streak.current_streak >= 3
      then true
    else false
  end as promotion_eligible,
  case
    when listing.listing_source = 'user'
      and streak.last_active_date >= (statement_timestamp() at time zone 'UTC')::date - 1
      and streak.current_streak >= 3
      then streak.last_bumped_at
    else null
  end as last_bumped_at,
  listing.listing_source,
  listing.sort_order,
  case
    when listing.listing_source = 'agency' then 0
    when streak.last_active_date >= (statement_timestamp() at time zone 'UTC')::date - 1
      and streak.current_streak >= 3 then 1
    else 2
  end as feed_group,
  case when listing.listing_source = 'agency' then listing.sort_order end as agency_sort_order,
  case when listing.listing_source = 'agency' then listing.created_at end as agency_created_at,
  case when listing.listing_source = 'user' then listing.created_at end as user_created_at
from public.marketplace_listings as listing
join public.profiles as profile on profile.id = listing.seller_id
join public.marketplace_categories as category on category.id = listing.category_id
left join public.user_activity_streaks as streak on streak.user_id = listing.seller_id
where listing.status = 'published' and category.is_active;

revoke all on table public.marketplace_feed from public, anon, authenticated;
grant select on table public.marketplace_feed to anon, authenticated;

update public.marketplace_categories
set is_active = true
where slug in ('development', 'design', 'content', 'server-services');

do $$
declare agency_owner uuid;
begin
  select user_id into agency_owner
  from public.user_roles
  where role = 'admin'
  order by created_at, user_id
  limit 1;

  if agency_owner is null then
    raise exception 'An admin account is required for NCEA agency listings';
  end if;

  insert into public.marketplace_listings (
    category_id, seller_id, title, slug, short_description, description,
    price_amount, currency_code, status, listing_source, sort_order
  )
  select category.id, agency_owner, seed.title, seed.slug,
    seed.short_description, seed.description, null, 'RUB', 'published', 'agency', seed.sort_order
  from (values
    ('server-services', 'Создание сервера Minecraft', 'minecraft-server-creation-1a2b3c01',
      'Проектирование и запуск Minecraft-сервера под задачи вашего сообщества.',
      'NCEA подготовит архитектуру, сборку и базовую конфигурацию Minecraft-сервера с учётом концепции проекта.', 10),
    ('development', 'Создание проекта под копирку', 'project-recreation-1a2b3c02',
      'Воссоздание механик и структуры проекта по согласованному референсу.',
      'Команда NCEA разберёт референс, спроектирует эквивалентные механики и соберёт самостоятельную реализацию проекта.', 20),
    ('plugins', 'Разработка плагина', 'plugin-development-1a2b3c03',
      'Индивидуальная разработка Minecraft-плагина под требования сервера.',
      'Разработка, интеграция и проверка плагина для выбранной серверной платформы и версии Minecraft.', 30),
    ('design', 'Оформление группы', 'community-design-1a2b3c04',
      'Цельное визуальное оформление сообщества и его ключевых разделов.',
      'NCEA подготовит согласованный комплект визуальных материалов для группы и игровых коммуникаций проекта.', 40),
    ('content', 'Промо ролик для рекламы', 'promo-video-1a2b3c05',
      'Короткий рекламный ролик с понятной подачей преимуществ проекта.',
      'Сценарий, монтаж и графическое оформление промо-ролика для рекламного размещения Minecraft-проекта.', 50),
    ('content', 'Постройка спавна на заказ', 'custom-spawn-build-1a2b3c06',
      'Уникальная игровая локация спавна под стилистику вашего сервера.',
      'Проектирование и строительство оптимизированного спавна с навигацией и зонами под основные игровые функции.', 60),
    ('server-services', 'Обучение по настройке', 'configuration-training-1a2b3c07',
      'Практическое обучение настройке сервера, плагинов и рабочих процессов.',
      'Индивидуальные занятия с разбором конфигурации, безопасного обновления и диагностики Minecraft-сервера.', 70),
    ('server-services', 'Настройка автодоната', 'autodonation-setup-1a2b3c08',
      'Подключение и безопасная настройка автоматической выдачи покупок.',
      'NCEA настроит интеграцию магазина, команды выдачи, журналы операций и проверку сценариев оплаты.', 80)
  ) as seed(category_slug, title, slug, short_description, description, sort_order)
  join public.marketplace_categories as category on category.slug = seed.category_slug
  where not exists (
    select 1 from public.marketplace_listings as existing
    where lower(existing.title) = lower(seed.title)
  );
end;
$$;
