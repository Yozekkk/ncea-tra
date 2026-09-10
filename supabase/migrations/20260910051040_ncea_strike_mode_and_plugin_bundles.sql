-- Explicit UTC strike-mode renewal, deterministic Marketplace ranking, and
-- five protected NCEA plugin bundles. Opening the site is intentionally read-only.

alter table public.user_activity_streaks
  add column if not exists last_streak_renewed_at timestamptz;

update public.user_activity_streaks
set last_streak_renewed_at = last_bumped_at
where last_streak_renewed_at is null;

alter table public.user_activity_streaks
  alter column last_streak_renewed_at set not null;

drop index if exists public.user_activity_streaks_feed_idx;
create index user_activity_streaks_feed_idx
  on public.user_activity_streaks (
    last_active_date desc,
    current_streak desc,
    last_streak_renewed_at desc
  );

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
    last_streak_renewed_at,
    updated_at
  )
  values (
    _user_id,
    1,
    _activity_date,
    _activity_date,
    _occurred_at,
    _occurred_at,
    _occurred_at
  )
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
    last_streak_renewed_at = case
      when excluded.last_active_date > user_activity_streaks.last_active_date
        then excluded.last_streak_renewed_at
      else user_activity_streaks.last_streak_renewed_at
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

create or replace function public.get_strike_mode_status()
returns table (
  current_streak integer,
  last_active_date date,
  streak_started_on date,
  last_streak_renewed_at timestamptz,
  renewed_today boolean
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    coalesce(
      case
        when streak.last_active_date >= (statement_timestamp() at time zone 'UTC')::date - 1
          then streak.current_streak
        else 0
      end,
      0
    ),
    streak.last_active_date,
    streak.streak_started_on,
    streak.last_streak_renewed_at,
    coalesce(
      streak.last_active_date = (statement_timestamp() at time zone 'UTC')::date,
      false
    )
  from (select (select auth.uid()) as user_id) as caller
  left join public.user_activity_streaks as streak on streak.user_id = caller.user_id
  where caller.user_id is not null;
$$;

revoke all on function public.get_strike_mode_status() from public, anon;
grant execute on function public.get_strike_mode_status() to authenticated;

create or replace function public.renew_strike_mode()
returns table (
  current_streak integer,
  last_active_date date,
  streak_started_on date,
  last_streak_renewed_at timestamptz,
  renewed_today boolean,
  renewed boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  utc_now timestamptz := statement_timestamp();
  utc_today date := (utc_now at time zone 'UTC')::date;
  previous_date date;
  activity public.user_activity_streaks;
begin
  if caller_id is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;

  -- Serialize renewals per account so simultaneous clicks remain idempotent,
  -- including the first renewal before the account has a streak row.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(caller_id::text, 0)
  );

  select streak.last_active_date into previous_date
  from public.user_activity_streaks as streak
  where streak.user_id = caller_id;

  activity := private.advance_user_activity(caller_id, utc_today, utc_now);

  return query select
    activity.current_streak,
    activity.last_active_date,
    activity.streak_started_on,
    activity.last_streak_renewed_at,
    true,
    previous_date is distinct from utc_today;
end;
$$;

revoke all on function public.renew_strike_mode() from public, anon;
grant execute on function public.renew_strike_mode() to authenticated;

-- The legacy RPC caused page hydration to mutate streak state. Keep the
-- function for migration compatibility, but remove every client execution path.
revoke all on function public.record_daily_activity() from public, anon, authenticated;

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
      then streak.last_streak_renewed_at
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
  case when listing.listing_source = 'user' then listing.created_at end as user_created_at,
  case
    when listing.listing_source = 'user'
      and streak.last_active_date >= (statement_timestamp() at time zone 'UTC')::date - 1
      and streak.current_streak >= 3
      then streak.last_streak_renewed_at
    else null
  end as last_streak_renewed_at,
  case
    when listing.listing_source = 'user'
      and streak.last_active_date >= (statement_timestamp() at time zone 'UTC')::date - 1
      and streak.current_streak >= 3
      then listing.published_at
    else null
  end as promoted_published_at,
  listing.published_at
from public.marketplace_listings as listing
join public.profiles as profile on profile.id = listing.seller_id
join public.marketplace_categories as category on category.id = listing.category_id
left join public.user_activity_streaks as streak on streak.user_id = listing.seller_id
where listing.status = 'published' and category.is_active;

revoke all on table public.marketplace_feed from public, anon, authenticated;
grant select on table public.marketplace_feed to anon, authenticated;

update public.marketplace_categories
set is_active = true
where slug = 'plugin-bundles';

do $$
declare
  agency_owner uuid;
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
    category_id,
    seller_id,
    title,
    slug,
    short_description,
    description,
    price_amount,
    currency_code,
    status,
    listing_source,
    sort_order
  )
  select
    category.id,
    agency_owner,
    seed.title,
    seed.slug,
    seed.short_description,
    seed.description,
    null,
    'RUB',
    'published',
    'agency',
    seed.sort_order
  from (values
    (
      'Сборка Funtime',
      'funtime-plugin-bundle-2b3c4d01',
      'Готовая основа сервера в стиле Funtime от команды NCEA.',
      'Официальная сборка NCEA с согласованным набором плагинов и базовой конфигурацией для запуска проекта в стиле Funtime.',
      90
    ),
    (
      'Сборка ReallyWorld',
      'reallyworld-plugin-bundle-2b3c4d02',
      'Сбалансированная серверная сборка в стиле ReallyWorld.',
      'Официальная сборка NCEA для запуска проекта в стиле ReallyWorld с подготовленной структурой плагинов и конфигураций.',
      100
    ),
    (
      'Сборка HolyWorld',
      'holyworld-plugin-bundle-2b3c4d03',
      'Подготовленная основа Minecraft-сервера в стиле HolyWorld.',
      'Официальная сборка NCEA с базовыми игровыми системами и настройками для проекта в стиле HolyWorld.',
      110
    ),
    (
      'Сборка Bedwars',
      'bedwars-plugin-bundle-2b3c4d04',
      'Основа для запуска современного режима Bedwars.',
      'Официальная сборка NCEA с необходимыми плагинами и стартовой конфигурацией игрового режима Bedwars.',
      120
    ),
    (
      'Сборка мини-игр',
      'minigames-plugin-bundle-2b3c4d05',
      'Гибкая основа сервера с набором популярных мини-игр.',
      'Официальная сборка NCEA для проекта с несколькими мини-играми, общей навигацией и подготовленной структурой режимов.',
      130
    )
  ) as seed(title, slug, short_description, description, sort_order)
  join public.marketplace_categories as category on category.slug = 'plugin-bundles'
  where not exists (
    select 1
    from public.marketplace_listings as existing
    where lower(existing.title) = lower(seed.title)
  );
end;
$$;

comment on column public.user_activity_streaks.last_streak_renewed_at is
  'Trusted PostgreSQL timestamp of the latest explicit UTC strike-mode renewal.';
comment on function public.get_strike_mode_status() is
  'Read-only strike-mode state for the authenticated user; never advances a streak.';
comment on function public.renew_strike_mode() is
  'Idempotently renews the authenticated user strike mode once per PostgreSQL UTC day.';
