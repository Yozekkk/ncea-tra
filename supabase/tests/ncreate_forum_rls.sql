-- Exercise existing NCreate RPCs and moderation policies; every write rolls back.
begin;
select set_config('test.owner_id',(select user_id::text from public.user_roles where role='owner' limit 1),true);
select set_config('test.user_id',(select user_id::text from public.user_roles where role='user' limit 1),true);
select set_config('test.category_id',(select id::text from public.ncreate_forum_categories where is_active order by sort_order limit 1),true);
set local role authenticated;
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('test.user_id'),'role','authenticated')::text,true);
do $$ begin
  begin
    perform public.create_ncreate_forum_topic(current_setting('test.category_id')::bigint,'Русская тема','русская-тема-12345678','Тест');
    raise exception 'Cyrillic slug unexpectedly accepted';
  exception when invalid_parameter_value then null; end;
end $$;
select set_config('test.topic_id',public.create_ncreate_forum_topic(current_setting('test.category_id')::bigint,'Русская тема','audit-topic-'||substr(md5(random()::text),1,8),'Тест')::text,true);
do $$ declare affected integer; begin
  begin
    update public.ncreate_forum_topics set is_pinned=true where id=current_setting('test.topic_id')::uuid;
    raise exception 'user pinned topic';
  exception when insufficient_privilege then null; end;
  update public.ncreate_site_settings set server_name='Unauthorized';
  get diagnostics affected=row_count;
  if affected<>0 then raise exception 'user changed NCreate settings'; end if;
end $$;
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('test.owner_id'),'role','authenticated')::text,true);
update public.ncreate_forum_topics set is_locked=true where id=current_setting('test.topic_id')::uuid;
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('test.user_id'),'role','authenticated')::text,true);
do $$ begin
  begin
    perform public.create_ncreate_forum_reply(current_setting('test.topic_id')::uuid,'Недопустимый ответ');
    raise exception 'reply accepted on locked topic';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('test.owner_id'),'role','authenticated')::text,true);
update public.ncreate_forum_topics set deleted_at=now(),deleted_by=auth.uid() where id=current_setting('test.topic_id')::uuid;
set local role anon;
select set_config('request.jwt.claims','{"role":"anon"}',true);
do $$ begin
  if exists(select 1 from public.ncreate_forum_topics where id=current_setting('test.topic_id')::uuid) then raise exception 'public read deleted NCreate topic'; end if;
  if exists(select 1 from public.ncreate_forum_posts where topic_id=current_setting('test.topic_id')::uuid) then raise exception 'public read replies of deleted topic'; end if;
end $$;
set local role authenticated;
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('test.owner_id'),'role','authenticated')::text,true);
update public.ncreate_forum_topics set deleted_at=null,deleted_by=null,deletion_reason=null,is_locked=false where id=current_setting('test.topic_id')::uuid;
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('test.user_id'),'role','authenticated')::text,true);
select public.create_ncreate_forum_reply(current_setting('test.topic_id')::uuid,'Ответ после восстановления');
reset role;
rollback;
select 'NCreate forum RLS PASS; all writes rolled back' result;
