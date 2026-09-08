-- NCEA Marketplace review flow, UTC activity streaks, hardened ownership RPCs,
-- and registration throttling. Apply only to project bualqaeinwifoopzflbt.

alter table public.marketplace_listings
  add column if not exists short_description text,
  add column if not exists minecraft_version text,
  add column if not exists platform text,
  add column if not exists submitted_at timestamptz,
  add column if not exists published_at timestamptz,
  add column if not exists archived_at timestamptz;

update public.marketplace_listings
set short_description = case
  when char_length(btrim(description)) >= 10 then left(btrim(description), 280)
  else rpad(btrim(description), 10, '.')
end
where short_description is null;

alter table public.marketplace_listings
  alter column short_description set not null,
  drop constraint if exists marketplace_listings_title_check,
  drop constraint if exists marketplace_listings_description_check,
  drop constraint if exists marketplace_listings_currency_code_check,
  drop constraint if exists marketplace_listings_price_amount_check,
  add constraint marketplace_listings_title_check
    check (title = btrim(title) and char_length(title) between 3 and 180),
  add constraint marketplace_listings_short_description_check
    check (
      short_description = btrim(short_description)
      and char_length(short_description) between 10 and 280
    ),
  add constraint marketplace_listings_description_check
    check (description = btrim(description) and char_length(description) between 20 and 20000),
  add constraint marketplace_listings_price_amount_check
    check (price_amount is null or price_amount >= 0),
  add constraint marketplace_listings_currency_code_check
    check (currency_code in ('EUR', 'USD', 'RUB')),
  add constraint marketplace_listings_minecraft_version_check
    check (
      minecraft_version is null
      or (
        minecraft_version = btrim(minecraft_version)
        and char_length(minecraft_version) between 1 and 40
      )
    ),
  add constraint marketplace_listings_platform_check
    check (
      platform is null
      or (platform = btrim(platform) and char_length(platform) between 1 and 40)
    ),
  add constraint marketplace_listings_slug_format_check
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*-[0-9a-f]{8}$');

alter table public.forum_topics
  drop constraint if exists forum_topics_title_check,
  add constraint forum_topics_title_check
    check (title = btrim(title) and char_length(title) between 3 and 180);

alter table public.forum_posts
  drop constraint if exists forum_posts_body_check,
  add constraint forum_posts_body_check
    check (body = btrim(body) and char_length(body) between 1 and 20000);

create table public.user_activity_streaks (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  current_streak integer not null,
  last_active_date date not null,
  streak_started_on date not null,
  last_bumped_at timestamptz not null,
  updated_at timestamptz not null default now(),
  constraint user_activity_streaks_current_check check (current_streak between 1 and 36500),
  constraint user_activity_streaks_dates_check check (streak_started_on <= last_active_date)
);

alter table public.user_activity_streaks enable row level security;
revoke all on table public.user_activity_streaks from public, anon, authenticated;
grant select on table public.user_activity_streaks to anon, authenticated;

create policy user_activity_streaks_public_read on public.user_activity_streaks
  for select to anon, authenticated using (true);

create index user_activity_streaks_feed_idx
  on public.user_activity_streaks (last_active_date desc, current_streak desc, last_bumped_at desc);

create table private.registration_rate_limits (
  key_hash text primary key,
  window_started_at timestamptz not null,
  attempts integer not null,
  updated_at timestamptz not null default now(),
  constraint registration_rate_limits_hash_check check (key_hash ~ '^[0-9a-f]{64}$'),
  constraint registration_rate_limits_attempts_check check (attempts between 1 and 1000)
);

revoke all on table private.registration_rate_limits from public, anon, authenticated;
create index registration_rate_limits_window_idx
  on private.registration_rate_limits (window_started_at);

create or replace function private.advance_user_activity(
  _user_id uuid,
  _activity_date date,
  _occurred_at timestamptz
)
returns public.user_activity_streaks
language plpgsql
security definer
set search_path = ''
as $$
declare
  activity public.user_activity_streaks;
begin
  if _user_id is null or _activity_date is null or _occurred_at is null then
    raise exception 'invalid_activity_input' using errcode = '22023';
  end if;

  insert into public.user_activity_streaks (
    user_id,
    current_streak,
    last_active_date,
    streak_started_on,
    last_bumped_at,
    updated_at
  )
  values (_user_id, 1, _activity_date, _activity_date, _occurred_at, _occurred_at)
  on conflict (user_id) do update set
    current_streak = case
      when excluded.last_active_date <= user_activity_streaks.last_active_date
        then user_activity_streaks.current_streak
      when excluded.last_active_date = user_activity_streaks.last_active_date + 1
        then user_activity_streaks.current_streak + 1
      else 1
    end,
    streak_started_on = case
      when excluded.last_active_date <= user_activity_streaks.last_active_date
        then user_activity_streaks.streak_started_on
      when excluded.last_active_date = user_activity_streaks.last_active_date + 1
        then user_activity_streaks.streak_started_on
      else excluded.last_active_date
    end,
    last_active_date = greatest(
      user_activity_streaks.last_active_date,
      excluded.last_active_date
    ),
    last_bumped_at = case
      when excluded.last_active_date > user_activity_streaks.last_active_date
        then excluded.last_bumped_at
      else user_activity_streaks.last_bumped_at
    end,
    updated_at = case
      when excluded.last_active_date > user_activity_streaks.last_active_date
        then excluded.updated_at
      else user_activity_streaks.updated_at
    end
  returning * into activity;

  return activity;
end;
$$;

revoke all on function private.advance_user_activity(uuid, date, timestamptz)
  from public, anon, authenticated;

create or replace function public.record_daily_activity()
returns table (
  current_streak integer,
  last_active_date date,
  streak_started_on date,
  last_bumped_at timestamptz
)
language sql
security definer
set search_path = ''
as $$
  select
    activity.current_streak,
    activity.last_active_date,
    activity.streak_started_on,
    activity.last_bumped_at
  from private.advance_user_activity(
    (select auth.uid()),
    (statement_timestamp() at time zone 'UTC')::date,
    statement_timestamp()
  ) as activity
  where (select auth.uid()) is not null;
$$;

revoke all on function public.record_daily_activity() from public, anon;
grant execute on function public.record_daily_activity() to authenticated;

create or replace function public.consume_registration_attempt(_key_hash text, _limit integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  allowed boolean;
begin
  if _key_hash !~ '^[0-9a-f]{64}$' or _limit not between 1 and 20 then
    return false;
  end if;

  delete from private.registration_rate_limits
  where window_started_at < statement_timestamp() - interval '24 hours';

  insert into private.registration_rate_limits (key_hash, window_started_at, attempts, updated_at)
  values (_key_hash, statement_timestamp(), 1, statement_timestamp())
  on conflict (key_hash) do update set
    attempts = case
      when private.registration_rate_limits.window_started_at
        <= statement_timestamp() - interval '1 hour' then 1
      else least(private.registration_rate_limits.attempts + 1, 1000)
    end,
    window_started_at = case
      when private.registration_rate_limits.window_started_at
        <= statement_timestamp() - interval '1 hour' then statement_timestamp()
      else private.registration_rate_limits.window_started_at
    end,
    updated_at = statement_timestamp()
  returning attempts <= _limit into allowed;

  return allowed;
end;
$$;

revoke all on function public.consume_registration_attempt(text, integer)
  from public, anon, authenticated;
grant execute on function public.consume_registration_attempt(text, integer) to service_role;

create or replace function public.create_forum_reply(_topic_id uuid, _body text)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  created_post_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;
  if char_length(btrim(_body)) not between 1 and 20000 then
    raise exception 'invalid_post_body' using errcode = '22023';
  end if;

  insert into public.forum_posts (topic_id, author_id, body)
  values (_topic_id, (select auth.uid()), btrim(_body))
  returning id into created_post_id;

  return created_post_id;
end;
$$;

revoke all on function public.create_forum_reply(uuid, text) from public, anon;
grant execute on function public.create_forum_reply(uuid, text) to authenticated;

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
declare
  created_listing_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;

  insert into public.marketplace_listings (
    category_id,
    seller_id,
    title,
    slug,
    short_description,
    description,
    price_amount,
    currency_code,
    minecraft_version,
    platform,
    status
  )
  values (
    _category_id,
    (select auth.uid()),
    btrim(_title),
    _slug,
    btrim(_short_description),
    btrim(_description),
    _price_amount,
    upper(_currency_code),
    nullif(btrim(_minecraft_version), ''),
    nullif(btrim(_platform), ''),
    case
      when _submit then 'pending_review'::public.marketplace_listing_status
      else 'draft'::public.marketplace_listing_status
    end
  )
  returning id into created_listing_id;

  return created_listing_id;
end;
$$;

revoke all on function public.create_marketplace_listing(
  bigint, text, text, text, text, numeric, text, text, text, boolean
) from public, anon;
grant execute on function public.create_marketplace_listing(
  bigint, text, text, text, text, numeric, text, text, text, boolean
) to authenticated;

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
declare
  updated_listing_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;

  update public.marketplace_listings
  set
    category_id = _category_id,
    title = btrim(_title),
    short_description = btrim(_short_description),
    description = btrim(_description),
    price_amount = _price_amount,
    currency_code = upper(_currency_code),
    minecraft_version = nullif(btrim(_minecraft_version), ''),
    platform = nullif(btrim(_platform), ''),
    status = case
      when _submit then 'pending_review'::public.marketplace_listing_status
      else 'draft'::public.marketplace_listing_status
    end
  where id = _listing_id and seller_id = (select auth.uid())
  returning id into updated_listing_id;

  if updated_listing_id is null then
    raise exception 'listing_not_owned_or_missing' using errcode = '42501';
  end if;

  return updated_listing_id;
end;
$$;

revoke all on function public.update_marketplace_listing(
  uuid, bigint, text, text, text, numeric, text, text, text, boolean
) from public, anon;
grant execute on function public.update_marketplace_listing(
  uuid, bigint, text, text, text, numeric, text, text, text, boolean
) to authenticated;

create or replace function private.protect_marketplace_listing_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  actor_is_admin boolean := case when actor is null then false else private.is_admin(actor) end;
begin
  if actor is not null and not actor_is_admin then
    if new.seller_id is distinct from actor
      or new.status = 'published'
      or (tg_op = 'UPDATE' and new.seller_id is distinct from old.seller_id)
      or (tg_op = 'UPDATE' and new.submitted_at is distinct from old.submitted_at)
      or (tg_op = 'UPDATE' and new.published_at is distinct from old.published_at)
      or (tg_op = 'UPDATE' and new.archived_at is distinct from old.archived_at)
      or (tg_op = 'INSERT' and (
        new.submitted_at is not null
        or new.published_at is not null
        or new.archived_at is not null
      ))
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

drop trigger if exists marketplace_listings_protect_fields on public.marketplace_listings;
create trigger marketplace_listings_protect_fields
  before insert or update on public.marketplace_listings
  for each row execute function private.protect_marketplace_listing_fields();

create or replace function private.enforce_marketplace_image_invariants()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(new.listing_id::text, 0));

  if array_length(string_to_array(new.storage_path, '/'), 1) <> 3
    or split_part(new.storage_path, '/', 2) <> new.listing_id::text
    or split_part(new.storage_path, '/', 3) = ''
  then
    raise exception 'invalid_listing_image_path' using errcode = '22023';
  end if;

  if tg_op = 'INSERT' and (
    select count(*)
    from public.marketplace_listing_images
    where listing_id = new.listing_id
  ) >= 6 then
    raise exception 'listing_image_limit_exceeded' using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_marketplace_image_invariants()
  from public, anon, authenticated;

create trigger marketplace_listing_images_enforce_invariants
  before insert or update on public.marketplace_listing_images
  for each row execute function private.enforce_marketplace_image_invariants();

drop policy if exists marketplace_listings_owner_insert on public.marketplace_listings;
create policy marketplace_listings_owner_insert on public.marketplace_listings
  for insert to authenticated with check (
    seller_id = (select auth.uid())
    and status in ('draft', 'pending_review')
    and exists (
      select 1 from public.marketplace_categories as category
      where category.id = category_id and category.is_active
    )
  );

drop policy if exists marketplace_listings_owner_or_admin_update on public.marketplace_listings;
create policy marketplace_listings_owner_or_admin_update on public.marketplace_listings
  for update to authenticated
  using (
    private.is_admin((select auth.uid()))
    or seller_id = (select auth.uid())
  )
  with check (
    private.is_admin((select auth.uid()))
    or (
      seller_id = (select auth.uid())
      and status in ('draft', 'pending_review', 'archived')
      and exists (
        select 1 from public.marketplace_categories as category
        where category.id = category_id and category.is_active
      )
    )
  );

create index marketplace_listings_published_feed_idx
  on public.marketplace_listings (category_id, created_at desc, id)
  where status = 'published';

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
    when streak.last_active_date >= (statement_timestamp() at time zone 'UTC')::date - 1
      then streak.current_streak
    else 0
  end as effective_streak,
  case
    when streak.last_active_date >= (statement_timestamp() at time zone 'UTC')::date - 1
      then streak.current_streak >= 3
    else false
  end as promotion_eligible,
  streak.last_bumped_at
from public.marketplace_listings as listing
join public.profiles as profile on profile.id = listing.seller_id
join public.marketplace_categories as category on category.id = listing.category_id
left join public.user_activity_streaks as streak on streak.user_id = listing.seller_id
where listing.status = 'published' and category.is_active;

revoke all on table public.marketplace_feed from public, anon, authenticated;
grant select on table public.marketplace_feed to anon, authenticated;

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
  select private.marketplace_path_owned(_name, _user_id)
    and exists (
      select 1
      from public.marketplace_listings
      where id = split_part(_name, '/', 2)::uuid
        and seller_id = _user_id
        and status <> 'published'
    );
$$;

revoke all on function private.marketplace_path_owned(text, uuid) from public;
revoke all on function private.marketplace_path_mutable(text, uuid) from public;
grant execute on function private.marketplace_path_owned(text, uuid) to authenticated;
grant execute on function private.marketplace_path_mutable(text, uuid) to authenticated;

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

update public.marketplace_categories
set is_active = false
where slug not in ('plugin-bundles', 'mod-bundles', 'plugins');

insert into public.marketplace_categories (slug, name, description, sort_order, is_active)
values
  (
    'plugin-bundles',
    'Сборки плагинов',
    'Готовые наборы совместимых плагинов для Minecraft-серверов.',
    10,
    true
  ),
  (
    'mod-bundles',
    'Сборки модов',
    'Готовые клиентские и серверные сборки модов.',
    20,
    true
  ),
  (
    'plugins',
    'Плагины',
    'Отдельные плагины и дополнения для серверных платформ.',
    30,
    true
  )
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = true;

comment on table public.user_activity_streaks is
  'Server-computed UTC daily activity streaks. Client roles have no write privileges.';
comment on view public.marketplace_feed is
  'Published community listings ranked by an effective non-expired activity streak.';
