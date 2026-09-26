-- Uses existing role holders only inside a rollback-only transaction.
-- No accounts or data survive this test.
begin;
select set_config('test.owner_id',(select user_id::text from public.user_roles where role='owner' limit 1),true);
select set_config('test.user_id',(select user_id::text from public.user_roles where role='user' limit 1),true);
select set_config('test.employee_id',gen_random_uuid()::text,true);
do $$ begin
  if nullif(current_setting('test.owner_id'),'') is null or nullif(current_setting('test.user_id'),'') is null then
    raise exception 'Requires existing owner and user role holders';
  end if;
end $$;

set local role authenticated;
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('test.owner_id'),'role','authenticated')::text,true);
insert into public.ncea_employees(id,name,role,level,username)
values(current_setting('test.employee_id')::uuid,'Audit fixture','QA','Junior','audit_fixture');
update public.ncea_employees set deleted_at=now(),is_active=true where id=current_setting('test.employee_id')::uuid;
do $$ begin
  if not exists(select 1 from public.ncea_admin_audit where entity_id=current_setting('test.employee_id') and action='delete') then raise exception 'missing employee delete audit'; end if;
end $$;

set local role anon;
select set_config('request.jwt.claims','{"role":"anon"}',true);
do $$ begin
  if exists(select 1 from public.ncea_employees where id=current_setting('test.employee_id')::uuid) then raise exception 'deleted employee exposed publicly'; end if;
  begin
    perform public.admin_reorder_employees(array[current_setting('test.employee_id')::uuid]);
    raise exception 'anonymous reorder allowed';
  exception when insufficient_privilege then null; end;
end $$;

set local role authenticated;
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('test.user_id'),'role','authenticated')::text,true);
do $$ declare affected integer; begin
  update public.ncea_site_settings set announcement='Unauthorized';
  get diagnostics affected=row_count;
  if affected<>0 then raise exception 'user changed settings'; end if;
  update public.ncea_employees set name='Unauthorized' where id=current_setting('test.employee_id')::uuid;
  get diagnostics affected=row_count;
  if affected<>0 then raise exception 'user edited employee'; end if;
  if exists(select 1 from public.ncea_admin_audit) then raise exception 'user read audit log'; end if;
  begin
    insert into public.ncea_admin_audit(action,entity,entity_id) values('fake','fake','fake');
    raise exception 'user forged audit log';
  exception when insufficient_privilege then null; end;
  begin
    perform public.admin_reorder_employees(array[current_setting('test.employee_id')::uuid]);
    raise exception 'user reordered employees';
  exception when insufficient_privilege then null; end;
  begin
    perform public.set_user_role(current_setting('test.user_id')::uuid,'admin');
    raise exception 'user escalated privileges';
  exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('test.owner_id'),'role','authenticated')::text,true);
update public.ncea_employees set deleted_at=null,is_active=false where id=current_setting('test.employee_id')::uuid;
select public.admin_reorder_employees(array[current_setting('test.employee_id')::uuid]);
do $$ begin
  if not exists(select 1 from public.ncea_employees where id=current_setting('test.employee_id')::uuid and sort_order=10 and deleted_at is null) then raise exception 'restore/reorder failed'; end if;
  begin
    perform public.admin_reorder_employees(array[current_setting('test.employee_id')::uuid,current_setting('test.employee_id')::uuid]);
    raise exception 'duplicate order accepted';
  exception when invalid_parameter_value then null; end;
  begin
    perform public.admin_reorder_employees(array[current_setting('test.employee_id')::uuid,gen_random_uuid()]);
    raise exception 'missing employee accepted';
  exception when no_data_found then null; end;
end $$;
update public.ncea_site_settings set announcement='Test announcement',announcement_enabled=true;
select public.set_user_role(current_setting('test.user_id')::uuid,'admin');
-- The role assignment above is transaction-local and never committed.
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('test.user_id'),'role','authenticated')::text,true);
do $$ begin
  begin
    perform public.set_user_role(current_setting('test.user_id')::uuid,'owner');
    raise exception 'admin promoted itself to owner';
  exception when insufficient_privilege then null; end;
  begin
    perform public.set_user_role(current_setting('test.owner_id')::uuid,'user');
    raise exception 'admin demoted owner';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
select 'NCEA admin operations RLS PASS; all writes rolled back' result;
