-- NCEA community platform: account usernames, atomic forum topics, owner listing lifecycle,
-- and initial public taxonomy. Apply only to project bualqaeinwifoopzflbt in organization NCEA.

alter table public.profiles
  add constraint profiles_username_format_check
  check (username = btrim(username) and username ~ '^[A-Za-z0-9_.-]{3,32}$') not valid;

alter table public.profiles validate constraint profiles_username_format_check;

create unique index profiles_username_lower_key on public.profiles (lower(username));

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_username text := btrim(coalesce(new.raw_user_meta_data ->> 'username', ''));
begin
  if requested_username = '' then
    requested_username := 'user_' || left(replace(new.id::text, '-', ''), 27);
  end if;

  if requested_username !~ '^[A-Za-z0-9_.-]{3,32}$' then
    raise exception 'invalid_username' using errcode = '22023';
  end if;

  insert into public.profiles (id, username)
  values (new.id, requested_username)
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict (user_id) do nothing;

  return new;
exception
  when unique_violation then
    raise exception 'username_already_exists' using errcode = '23505';
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

create or replace function public.create_forum_topic(
  _category_id bigint,
  _title text,
  _slug text,
  _body text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  created_topic_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;
  if char_length(btrim(_title)) not between 3 and 180 then
    raise exception 'invalid_topic_title' using errcode = '22023';
  end if;
  if char_length(btrim(_body)) not between 1 and 20000 then
    raise exception 'invalid_topic_body' using errcode = '22023';
  end if;
  if _slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*-[0-9a-f]{8}$' then
    raise exception 'invalid_topic_slug' using errcode = '22023';
  end if;

  insert into public.forum_topics (category_id, author_id, title, slug)
  values (_category_id, (select auth.uid()), btrim(_title), _slug)
  returning id into created_topic_id;

  insert into public.forum_posts (topic_id, author_id, body)
  values (created_topic_id, (select auth.uid()), btrim(_body));

  return created_topic_id;
end;
$$;

revoke all on function public.create_forum_topic(bigint, text, text, text) from public, anon;
grant execute on function public.create_forum_topic(bigint, text, text, text) to authenticated;

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
      and status in ('draft', 'archived')
      and exists (
        select 1 from public.marketplace_categories as category
        where category.id = category_id and category.is_active
      )
    )
  );

insert into public.forum_categories (slug, name, description, sort_order)
values
  ('general', 'Общее обсуждение', 'Новости сообщества, вопросы и разговоры о проектах NCEA.', 10),
  ('project-showcase', 'Проекты участников', 'Показывайте серверы, сборки, карты и другие готовые работы.', 20),
  ('looking-for-team', 'Поиск команды', 'Ищите специалистов и участников для Minecraft-проектов.', 30),
  ('help', 'Помощь', 'Обсуждение разработки, дизайна и настройки серверов.', 40)
on conflict (slug) do nothing;

insert into public.marketplace_categories (slug, name, description, sort_order)
values
  ('development', 'Разработка', 'Плагины, сайты, боты и технические услуги.', 10),
  ('design', 'Дизайн', 'Айдентика, оформление, логотипы и интерфейсы.', 20),
  ('content', 'Контент', 'Карты, ресурспаки, модели, скины и тексты.', 30),
  ('server-services', 'Серверные услуги', 'Настройка, аудит, оптимизация и сопровождение серверов.', 40)
on conflict (slug) do nothing;
