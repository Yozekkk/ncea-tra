-- Keep owner-created listing slugs compatible with the Marketplace route
-- invariant: a readable prefix followed by one eight-character hex suffix.

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
    'listing-' || left(replace(saved_id::text,'-',''),8), trim(_short_description), trim(_description),
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

