-- NCEA-only content management: employees and Forum topic covers.
-- This migration is additive and intentionally does not touch ncreate_* objects.

create table if not exists public.ncea_employees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  level text not null,
  timezone text,
  telegram text,
  discord text,
  github_url text,
  image_url text,
  bio text,
  sort_order integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ncea_employees_name_check
    check (name = btrim(name) and char_length(name) between 1 and 80),
  constraint ncea_employees_role_check
    check (role = btrim(role) and char_length(role) between 1 and 120),
  constraint ncea_employees_level_check
    check (level in ('Стажёр', 'Junior', 'Middle', 'Lead')),
  constraint ncea_employees_timezone_check
    check (timezone is null or (timezone = btrim(timezone) and char_length(timezone) between 1 and 40)),
  constraint ncea_employees_telegram_check
    check (
      telegram is null or (
        char_length(telegram) <= 2048
        and (
          telegram ~ '^@[A-Za-z0-9_]{5,32}$'
          or telegram ~ '^https://t[.]me/[A-Za-z0-9_]{5,32}/?$'
        )
      )
    ),
  constraint ncea_employees_discord_check
    check (discord is null or (discord = btrim(discord) and char_length(discord) between 1 and 80)),
  constraint ncea_employees_github_url_check
    check (
      github_url is null or (
        char_length(github_url) between 8 and 2048
        and github_url ~ '^https?://[^[:space:]<>"''`]+$'
      )
    ),
  constraint ncea_employees_image_url_check
    check (
      image_url is null or (
        char_length(image_url) between 8 and 2048
        and image_url ~ '^https?://[^[:space:]<>"''`]+$'
      )
    ),
  constraint ncea_employees_bio_check
    check (bio is null or char_length(bio) <= 2000),
  constraint ncea_employees_sort_order_check
    check (sort_order between -100000 and 100000)
);

comment on table public.ncea_employees is
  'NCEA studio employee cards. Public clients can read active rows; admin and owner manage all rows.';
comment on column public.ncea_employees.image_url is
  'Optional direct HTTP(S) image URL. Clients render it directly and never fetch it server-side.';

create index if not exists ncea_employees_public_sort_idx
  on public.ncea_employees (sort_order, name, id)
  where is_active;

drop trigger if exists ncea_employees_set_updated_at on public.ncea_employees;
create trigger ncea_employees_set_updated_at
  before update on public.ncea_employees
  for each row execute function private.set_updated_at();

alter table public.ncea_employees enable row level security;

revoke all on table public.ncea_employees from public, anon, authenticated;
grant select on table public.ncea_employees to anon, authenticated;
grant insert, update on table public.ncea_employees to authenticated;

drop policy if exists ncea_employees_public_read on public.ncea_employees;
create policy ncea_employees_public_read on public.ncea_employees
  for select to anon using (is_active);

drop policy if exists ncea_employees_authenticated_read on public.ncea_employees;
create policy ncea_employees_authenticated_read on public.ncea_employees
  for select to authenticated
  using (is_active or private.is_admin((select auth.uid())));

drop policy if exists ncea_employees_admin_insert on public.ncea_employees;
create policy ncea_employees_admin_insert on public.ncea_employees
  for insert to authenticated
  with check (private.is_admin((select auth.uid())));

drop policy if exists ncea_employees_admin_update on public.ncea_employees;
create policy ncea_employees_admin_update on public.ncea_employees
  for update to authenticated
  using (private.is_admin((select auth.uid())))
  with check (private.is_admin((select auth.uid())));

insert into public.ncea_employees (
  id, name, role, level, timezone, telegram, discord, github_url, image_url, bio,
  sort_order, is_active
)
values
  ('6e434541-0001-4cea-8000-000000000001', 'Степан', 'Контент-мейкер', 'Middle', 'МСК', '@bblsmile', 'joykin0065', null, null, null, 10, true),
  ('6e434541-0002-4cea-8000-000000000002', 'Максим', 'Веб-разработчик', 'Стажёр', 'EEST', '@circusoff', 'qw3nn', null, null, null, 20, true),
  ('6e434541-0003-4cea-8000-000000000003', 'Егор', 'Веб-разработка / разработка модов', 'Junior', 'GMT +2', '@m1ndyp', '.163.', null, null, null, 30, true),
  ('6e434541-0004-4cea-8000-000000000004', 'Антон', 'Fullstack-разработка', 'Lead', 'CET (-1 от МСК)', '@YOURDEPRESSEDVAMPIRE', '@nevskydev', null, null, null, 40, true),
  ('6e434541-0005-4cea-8000-000000000005', 'Стас', 'Менеджер', 'Стажёр', 'МСК', '@Stacyhomk', 'stacygomk', null, null, null, 50, true),
  ('6e434541-0006-4cea-8000-000000000006', 'Максим', 'Веб-программист', 'Стажёр', 'UTC+3 / Киев', '@LOGICSPARK', '_STALKER_2', null, null, null, 60, true)
on conflict (id) do update set id = excluded.id;

alter table public.forum_topics
  add column if not exists image_url text;

alter table public.forum_topics
  drop constraint if exists forum_topics_image_url_check;
alter table public.forum_topics
  add constraint forum_topics_image_url_check
  check (
    image_url is null or (
      char_length(image_url) between 8 and 2048
      and image_url ~ '^https?://[^[:space:]<>"''`]+$'
    )
  ) not valid;
alter table public.forum_topics validate constraint forum_topics_image_url_check;

drop function if exists public.owner_save_forum_topic(uuid,bigint,text,text,boolean,boolean,boolean);

create function public.owner_save_forum_topic(
  _topic_id uuid, _category_id bigint, _title text, _content text,
  _is_pinned boolean, _is_locked boolean, _is_protected boolean,
  _image_url text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  saved_id uuid := coalesce(_topic_id, gen_random_uuid());
  first_post uuid;
  normalized_image_url text := nullif(btrim(_image_url), '');
begin
  if caller_id is null or not private.is_admin(caller_id) then
    raise exception 'administrator_required' using errcode = '42501';
  end if;
  if nullif(btrim(_title), '') is null or nullif(btrim(_content), '') is null then
    raise exception 'topic_required_fields' using errcode = '22023';
  end if;
  if normalized_image_url is not null and (
    char_length(normalized_image_url) > 2048
    or normalized_image_url !~ '^https?://[^[:space:]<>"''`]+'
  ) then
    raise exception 'invalid_topic_image_url' using errcode = '22023';
  end if;

  insert into public.forum_topics (
    id, category_id, author_id, title, slug, is_pinned, is_locked, is_protected, image_url
  )
  values (
    saved_id, _category_id, caller_id, btrim(_title),
    'topic-' || left(replace(saved_id::text, '-', ''), 16),
    coalesce(_is_pinned, false), coalesce(_is_locked, false),
    coalesce(_is_protected, false), normalized_image_url
  )
  on conflict (id) do update set
    category_id = excluded.category_id,
    title = excluded.title,
    is_pinned = excluded.is_pinned,
    is_locked = excluded.is_locked,
    is_protected = excluded.is_protected,
    image_url = excluded.image_url;

  select id into first_post
  from public.forum_posts
  where topic_id = saved_id
  order by created_at, id
  limit 1;

  if first_post is null then
    insert into public.forum_posts (topic_id, author_id, body, is_protected)
    values (saved_id, caller_id, btrim(_content), coalesce(_is_protected, false));
  else
    update public.forum_posts
    set body = btrim(_content), is_protected = coalesce(_is_protected, false)
    where id = first_post;
  end if;

  return saved_id;
end;
$$;

revoke all on function public.owner_save_forum_topic(
  uuid,bigint,text,text,boolean,boolean,boolean,text
) from public, anon;
grant execute on function public.owner_save_forum_topic(
  uuid,bigint,text,text,boolean,boolean,boolean,text
) to authenticated;
