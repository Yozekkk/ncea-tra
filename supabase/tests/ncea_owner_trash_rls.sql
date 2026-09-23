begin;

insert into auth.users (
  instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,
  raw_app_meta_data,raw_user_meta_data,created_at,updated_at,
  confirmation_token,email_change,email_change_token_new,recovery_token
) values
('00000000-0000-0000-0000-000000000000','13000000-0000-4000-8000-000000000001','authenticated','authenticated','owner-test-user@example.invalid','',now(),'{}','{}',now(),now(),'','','',''),
('00000000-0000-0000-0000-000000000000','13000000-0000-4000-8000-000000000002','authenticated','authenticated','owner-test-moderator@example.invalid','',now(),'{}','{}',now(),now(),'','','',''),
('00000000-0000-0000-8000-000000000003','13000000-0000-4000-8000-000000000003','authenticated','authenticated','owner-test-admin@example.invalid','',now(),'{}','{}',now(),now(),'','','',''),
('00000000-0000-0000-0000-000000000000','13000000-0000-4000-8000-000000000004','authenticated','authenticated','owner-test-owner@example.invalid','',now(),'{}','{}',now(),now(),'','','','');

update public.user_roles set role='moderator' where user_id='13000000-0000-4000-8000-000000000002';
update public.user_roles set role='admin' where user_id='13000000-0000-4000-8000-000000000003';
update public.user_roles set role='owner' where user_id='13000000-0000-4000-8000-000000000004';

insert into public.marketplace_categories(id,slug,name,sort_order,is_active)
values(930001,'owner-trash-rls','Owner trash RLS',930001,true);
insert into public.forum_categories(id,slug,name,sort_order,is_active)
values(930001,'owner-trash-rls','Owner trash RLS',930001,true);

insert into public.marketplace_listings(
  id,category_id,seller_id,title,slug,short_description,description,status,listing_source,sort_order
) values
('43000000-0000-4000-8000-000000000001',930001,'13000000-0000-4000-8000-000000000001','User listing','owner-test-user-listing-a1000001','User listing subtitle','User listing description','published','user',null),
('43000000-0000-4000-8000-000000000002',930001,'13000000-0000-4000-8000-000000000003','Agency listing','owner-test-agency-listing-a1000002','Agency listing subtitle','Agency listing description','published','agency',1),
('43000000-0000-4000-8000-000000000003',930001,'13000000-0000-4000-8000-000000000001','Permanent listing','owner-test-permanent-listing-a1000003','Permanent listing subtitle','Permanent listing description','draft','user',null);

insert into storage.objects (bucket_id, name, metadata)
values ('marketplace-listings',
  '13000000-0000-4000-8000-000000000001/43000000-0000-4000-8000-000000000001/soft-delete.webp',
  '{"mimetype":"image/webp","size":128}'::jsonb);
insert into public.marketplace_listing_images (listing_id, storage_path)
values ('43000000-0000-4000-8000-000000000001',
  '13000000-0000-4000-8000-000000000001/43000000-0000-4000-8000-000000000001/soft-delete.webp');

insert into public.forum_topics(id,category_id,author_id,title,slug,is_protected)
values
('23000000-0000-4000-8000-000000000001',930001,'13000000-0000-4000-8000-000000000001','User topic','owner-test-user-topic',false),
('23000000-0000-4000-8000-000000000002',930001,'13000000-0000-4000-8000-000000000003','Protected topic','owner-test-protected-topic',true);
insert into public.forum_posts(id,topic_id,author_id,body,is_protected)
values
('33000000-0000-4000-8000-000000000001','23000000-0000-4000-8000-000000000001','13000000-0000-4000-8000-000000000001','User forum post',false),
('33000000-0000-4000-8000-000000000002','23000000-0000-4000-8000-000000000002','13000000-0000-4000-8000-000000000003','Protected forum post',true);

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"13000000-0000-4000-8000-000000000001","role":"authenticated"}',true);

do $$
begin
  begin
    update public.user_roles set role='owner' where user_id='13000000-0000-4000-8000-000000000001';
    raise exception 'user self-assigned owner';
  exception when insufficient_privilege then null; end;
  begin
    perform public.set_user_role('13000000-0000-4000-8000-000000000001','owner');
    raise exception 'user assigned owner via RPC';
  exception when insufficient_privilege then null; end;
  begin
    perform public.admin_save_marketplace_listing(null,930001,'XSS listing','XSS subtitle','XSS description','agency','javascript:alert(1)',null,'Цена скоро будет добавлена','RUB',null,null,2,'draft');
    raise exception 'user called admin listing RPC';
  exception when insufficient_privilege then null; end;
end;
$$;

select set_config('request.jwt.claims','{"sub":"13000000-0000-4000-8000-000000000002","role":"authenticated"}',true);

do $$
declare affected integer;
begin
  perform public.soft_delete_marketplace_listing('43000000-0000-4000-8000-000000000001','moderated user item');
  if exists(select 1 from public.marketplace_listings where id='43000000-0000-4000-8000-000000000001') then
    raise exception 'moderator still sees soft-deleted listing';
  end if;
  begin
    perform public.soft_delete_marketplace_listing('43000000-0000-4000-8000-000000000002','forbidden agency deletion');
    raise exception 'moderator soft-deleted agency listing';
  exception when insufficient_privilege then null; end;
  begin
    delete from public.marketplace_listings where id='43000000-0000-4000-8000-000000000003';
    get diagnostics affected=row_count;
    if affected<>0 then raise exception 'moderator permanently deleted listing'; end if;
  exception when insufficient_privilege then null; end;
  begin
    perform public.permanently_delete_content('marketplace','43000000-0000-4000-8000-000000000001');
    raise exception 'moderator used permanent delete RPC';
  exception when insufficient_privilege then null; end;
  begin
    perform public.get_deleted_content('all');
    raise exception 'moderator accessed owner trash';
  exception when insufficient_privilege then null; end;
  perform public.soft_delete_forum_post('33000000-0000-4000-8000-000000000001','moderated user post');
  begin
    perform public.soft_delete_forum_post('33000000-0000-4000-8000-000000000002','forbidden protected post');
    raise exception 'moderator deleted protected forum content';
  exception when insufficient_privilege then null; end;
end;
$$;

set local role anon;
select set_config('request.jwt.claims','{"role":"anon"}',true);
do $$ begin
  if exists (
    select 1 from storage.objects
    where bucket_id = 'marketplace-listings'
      and name = '13000000-0000-4000-8000-000000000001/43000000-0000-4000-8000-000000000001/soft-delete.webp'
  ) then raise exception 'soft-deleted listing image remains publicly readable'; end if;
end $$;

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"13000000-0000-4000-8000-000000000003","role":"authenticated"}',true);

do $$
begin
  begin
    perform public.set_user_role('13000000-0000-4000-8000-000000000001','owner');
    raise exception 'admin assigned owner';
  exception when insufficient_privilege then null; end;
  begin
    perform public.get_deleted_content('all');
    raise exception 'admin accessed owner trash';
  exception when insufficient_privilege then null; end;
  begin
    perform public.soft_delete_marketplace_listing('43000000-0000-4000-8000-000000000002','protected official');
    raise exception 'admin soft-deleted official listing';
  exception when insufficient_privilege then null; end;
  begin
    perform public.admin_save_marketplace_listing(null,930001,'Unsafe URL','Unsafe URL subtitle','Unsafe URL description','agency','javascript:alert(1)',null,'Цена скоро будет добавлена','RUB',null,null,3,'draft');
    raise exception 'javascript image URL accepted';
  exception when check_violation then null; end;
  begin
    perform public.admin_save_marketplace_listing(null,930001,'Markup URL','Markup URL subtitle','Markup URL description','agency','https://example.com/<svg onload=alert(1)>',null,'Цена скоро будет добавлена','RUB',null,null,3,'draft');
    raise exception 'markup image URL accepted';
  exception when check_violation then null; end;
end;
$$;

select set_config('request.jwt.claims','{"sub":"13000000-0000-4000-8000-000000000004","role":"authenticated"}',true);

do $$
declare saved_listing uuid; saved_topic uuid; saved_post uuid; trash_count integer;
begin
  saved_listing := public.admin_save_marketplace_listing(null,930001,'Owner agency listing','Owner agency subtitle','Owner agency description','agency','https://example.com/image.webp',null,'Цена скоро будет добавлена','RUB','1.21.4','Paper',4,'published');
  perform public.admin_save_marketplace_listing(saved_listing,930001,'Owner edited listing','Owner agency subtitle','Owner agency description','agency','https://example.com/image.webp',null,'Цена скоро будет добавлена','RUB','1.21.4','Paper',4,'published');
  if not exists(select 1 from public.marketplace_listings where id=saved_listing and title='Owner edited listing') then
    raise exception 'owner did not manage marketplace listing'; end if;

  saved_topic := public.owner_save_forum_topic(null,930001,'Owner topic','Owner topic content',true,true,true);
  select id into saved_post from public.forum_posts where topic_id=saved_topic order by created_at,id limit 1;
  perform public.owner_update_forum_post(saved_post,'Owner edited topic content');
  if not exists(select 1 from public.forum_posts where id=saved_post and body='Owner edited topic content') then
    raise exception 'owner did not manage forum content'; end if;

  select count(*) into trash_count from public.get_deleted_content('all');
  if trash_count < 2 then raise exception 'owner could not access trash'; end if;

  perform public.restore_deleted_content('marketplace','43000000-0000-4000-8000-000000000001');
  if not exists(select 1 from public.marketplace_listings where id='43000000-0000-4000-8000-000000000001' and deleted_at is null) then
    raise exception 'owner could not restore listing'; end if;

  perform public.soft_delete_marketplace_listing('43000000-0000-4000-8000-000000000003','permanent deletion test');
  perform public.permanently_delete_content('marketplace','43000000-0000-4000-8000-000000000003');
  if exists(select 1 from public.marketplace_listings where id='43000000-0000-4000-8000-000000000003') then
    raise exception 'owner could not permanently delete listing'; end if;

  perform public.soft_delete_forum_topic('23000000-0000-4000-8000-000000000002','owner protected topic delete');
  perform public.restore_deleted_content('topics','23000000-0000-4000-8000-000000000002');
end;
$$;

set local role anon;
select set_config('request.jwt.claims','{"role":"anon"}',true);
do $$ begin
  if exists(select 1 from public.marketplace_listings where id='43000000-0000-4000-8000-000000000001' and deleted_at is not null) then
    raise exception 'deleted listing visible publicly'; end if;
  if not exists(select 1 from public.marketplace_feed where id='43000000-0000-4000-8000-000000000001') then
    raise exception 'restored published listing did not return publicly'; end if;
end $$;

reset role;
rollback;

select 'NCEA owner role, trash, restore, permanent delete, URL and Forum RLS verification passed' as result;
