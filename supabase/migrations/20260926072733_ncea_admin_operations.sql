-- Additive NCEA administration. No existing content is removed.
alter table public.ncea_employees
  add column if not exists username text,
  add column if not exists deleted_at timestamptz;
alter table public.ncea_employees add constraint ncea_employee_username_check
  check (username is null or (username = btrim(username) and char_length(username) between 1 and 80));

alter policy ncea_employees_public_read on public.ncea_employees
  using (is_active and deleted_at is null);
alter policy ncea_employees_authenticated_read on public.ncea_employees
  using ((is_active and deleted_at is null) or private.is_admin((select auth.uid())));
create index if not exists ncea_employees_live_sort_idx
  on public.ncea_employees (sort_order,name,id) where is_active and deleted_at is null;

create table if not exists public.ncea_site_settings (
  site_id text primary key default 'ncea' check (site_id = 'ncea'),
  announcement text not null default '' check (char_length(announcement) <= 500),
  announcement_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);
insert into public.ncea_site_settings (site_id) values ('ncea') on conflict do nothing;
alter table public.ncea_site_settings enable row level security;
revoke all on public.ncea_site_settings from public,anon,authenticated;
grant select on public.ncea_site_settings to anon,authenticated;
grant update on public.ncea_site_settings to authenticated;
create policy ncea_settings_read on public.ncea_site_settings for select to anon,authenticated using (true);
create policy ncea_settings_admin_update on public.ncea_site_settings for update to authenticated
  using (private.is_admin((select auth.uid()))) with check (private.is_admin((select auth.uid())));
create trigger ncea_settings_updated before update on public.ncea_site_settings
  for each row execute function private.set_updated_at();

create table if not exists public.ncea_admin_audit (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text not null,
  created_at timestamptz not null default now()
);
create index if not exists ncea_admin_audit_time_idx on public.ncea_admin_audit (created_at desc,id desc);
create index if not exists ncea_admin_audit_actor_idx on public.ncea_admin_audit (actor_id);
alter table public.ncea_admin_audit enable row level security;
revoke all on public.ncea_admin_audit from public,anon,authenticated;
grant select on public.ncea_admin_audit to authenticated;
create policy ncea_audit_admin_read on public.ncea_admin_audit for select to authenticated
  using (private.is_admin((select auth.uid())));

-- Trigger-only definer: clients cannot forge audit entries or call it directly.
-- Store identifiers and action names only; no content, credentials or tokens.
create or replace function private.ncea_capture_admin_action() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := (select auth.uid());
  before_row jsonb;
  after_row jsonb;
  operation text := lower(TG_OP);
begin
  if actor is null or not private.is_staff(actor) then return null; end if;
  if TG_OP <> 'INSERT' then before_row := to_jsonb(OLD); end if;
  if TG_OP <> 'DELETE' then after_row := to_jsonb(NEW); end if;
  if TG_OP = 'UPDATE' then
    if (before_row - 'updated_at') = (after_row - 'updated_at') then return null; end if;
    operation := case
      when before_row->>'deleted_at' is null and after_row->>'deleted_at' is not null then 'delete'
      when before_row->>'deleted_at' is not null and after_row->>'deleted_at' is null then 'restore'
      when before_row->>'status' is distinct from after_row->>'status' then coalesce(after_row->>'status','update')
      when before_row->>'role' is distinct from after_row->>'role' and TG_TABLE_NAME = 'user_roles' then 'role_change'
      else 'update' end;
  end if;
  insert into public.ncea_admin_audit (actor_id,action,entity,entity_id)
  values (actor,operation,TG_TABLE_NAME,coalesce(after_row->>'id',before_row->>'id',after_row->>'user_id',before_row->>'user_id',after_row->>'site_id',before_row->>'site_id'));
  return null;
end;
$$;
revoke all on function private.ncea_capture_admin_action() from public,anon,authenticated,service_role;
do $$
declare tbl text;
begin
  foreach tbl in array array['ncea_employees','user_roles','marketplace_listings','forum_topics','forum_posts','forum_categories','marketplace_categories','ncea_site_settings','ncreate_site_settings','ncreate_home_sections','ncreate_home_cards','ncreate_forum_categories','ncreate_forum_topics','ncreate_forum_posts'] loop
    execute format('create trigger ncea_admin_audit_trigger after insert or update or delete on public.%I for each row execute function private.ncea_capture_admin_action()',tbl);
  end loop;
end;
$$;

-- Atomic ordering, with the same database authorization as employee CRUD.
create or replace function public.admin_reorder_employees(_ids uuid[]) returns void
language plpgsql security invoker set search_path = '' as $$
declare affected integer;
begin
  if (select auth.uid()) is null or not private.is_admin((select auth.uid())) then
    raise exception 'administrator_required' using errcode='42501';
  end if;
  if coalesce(cardinality(_ids),0) = 0 or cardinality(_ids) > 10000
     or cardinality(_ids) <> (select count(distinct id) from unnest(_ids) id) then
    raise exception 'invalid_employee_order' using errcode='22023';
  end if;
  update public.ncea_employees e set sort_order = positions.ordinality * 10
  from unnest(_ids) with ordinality positions(id,ordinality)
  where e.id = positions.id and e.deleted_at is null;
  get diagnostics affected = row_count;
  if affected <> cardinality(_ids) then raise exception 'employee_not_found' using errcode='P0002'; end if;
end;
$$;
revoke all on function public.admin_reorder_employees(uuid[]) from public,anon;
grant execute on function public.admin_reorder_employees(uuid[]) to authenticated;
