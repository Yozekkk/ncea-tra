-- Preserve the existing locked-topic rule for user-initiated soft deletion and
-- ensure owner topic edits never reuse a deleted first post.

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
    or (not private.is_staff(caller_id) and (target.author_id <> caller_id or target.is_locked))
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
    or (not private.is_staff(caller_id) and (target.author_id <> caller_id or parent.is_locked))
  ) then raise exception 'post_delete_forbidden' using errcode='42501'; end if;
  update public.forum_posts set deleted_at=statement_timestamp(), deleted_by=caller_id,
    deletion_reason=nullif(left(trim(coalesce(_reason,'')),500),'') where id=_post_id;
end;
$$;

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
  select id into first_post from public.forum_posts
  where topic_id=saved_id and deleted_at is null order by created_at,id limit 1;
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

revoke all on function public.soft_delete_forum_topic(uuid,text) from public, anon;
revoke all on function public.soft_delete_forum_post(uuid,text) from public, anon;
revoke all on function public.owner_save_forum_topic(uuid,bigint,text,text,boolean,boolean,boolean) from public, anon;
grant execute on function public.soft_delete_forum_topic(uuid,text) to authenticated;
grant execute on function public.soft_delete_forum_post(uuid,text) to authenticated;
grant execute on function public.owner_save_forum_topic(uuid,bigint,text,text,boolean,boolean,boolean) to authenticated;

