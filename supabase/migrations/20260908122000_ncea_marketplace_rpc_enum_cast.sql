-- Correct the explicit enum coercion in the Marketplace write RPCs. The
-- preceding migration remains safe for new databases and this migration fixes
-- the already-applied production function bodies.

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
