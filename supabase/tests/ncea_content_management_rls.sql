begin;

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
)
values
  ('00000000-0000-0000-0000-000000000000', '14000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'content-user@example.invalid', '', now(), '{}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '14000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'content-moderator@example.invalid', '', now(), '{}', '{}', now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '14000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'content-admin@example.invalid', '', now(), '{}', '{}', now(), now(), '', '', '', '');

update public.user_roles set role = 'moderator'
where user_id = '14000000-0000-4000-8000-000000000002';
update public.user_roles set role = 'admin'
where user_id = '14000000-0000-4000-8000-000000000003';

insert into public.ncea_employees (
  id, name, role, level, sort_order, is_active
) values
  ('64000000-0000-4000-8000-000000000001', 'Visible Employee', 'QA', 'Middle', 1, true),
  ('64000000-0000-4000-8000-000000000002', 'Hidden Employee', 'QA', 'Junior', 2, false);

set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

do $$
declare affected integer;
begin
  if (select count(*) from public.ncea_employees where id in (
    '64000000-0000-4000-8000-000000000001',
    '64000000-0000-4000-8000-000000000002'
  )) <> 1 then
    raise exception 'anon employee visibility is not active-only';
  end if;
  begin
    insert into public.ncea_employees (name, role, level) values ('Anon', 'Attack', 'Junior');
    raise exception 'anon inserted an employee';
  exception when insufficient_privilege then null;
  end;
end;
$$;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"14000000-0000-4000-8000-000000000001","role":"authenticated"}',
  true
);

do $$
begin
  if (select count(*) from public.ncea_employees where id in (
    '64000000-0000-4000-8000-000000000001',
    '64000000-0000-4000-8000-000000000002'
  )) <> 1 then
    raise exception 'authenticated employee visibility is not active-only';
  end if;
  update public.ncea_employees set role = 'Attack'
  where id = '64000000-0000-4000-8000-000000000001';
  get diagnostics affected = row_count;
  if affected <> 0 then
    raise exception 'ordinary user updated an employee';
  end if;
end;
$$;

select set_config(
  'request.jwt.claims',
  '{"sub":"14000000-0000-4000-8000-000000000002","role":"authenticated"}',
  true
);

do $$
begin
  if (select count(*) from public.ncea_employees where id in (
    '64000000-0000-4000-8000-000000000001',
    '64000000-0000-4000-8000-000000000002'
  )) <> 1 then
    raise exception 'moderator can read hidden employee';
  end if;
  begin
    insert into public.ncea_employees (name, role, level) values ('Moderator', 'Attack', 'Lead');
    raise exception 'moderator inserted an employee';
  exception when insufficient_privilege then null;
  end;
end;
$$;

select set_config(
  'request.jwt.claims',
  '{"sub":"14000000-0000-4000-8000-000000000003","role":"authenticated"}',
  true
);

do $$
declare saved_topic uuid;
begin
  if (select count(*) from public.ncea_employees where id in (
    '64000000-0000-4000-8000-000000000001',
    '64000000-0000-4000-8000-000000000002'
  )) <> 2 then
    raise exception 'admin cannot read hidden employees';
  end if;
  update public.ncea_employees set is_active = false
  where id = '64000000-0000-4000-8000-000000000001';
  insert into public.ncea_employees (name, role, level, is_active)
  values ('Admin Employee', 'QA', 'Lead', true);

  select public.owner_save_forum_topic(
    null,
    (select id from public.forum_categories where is_active order by id limit 1),
    'Admin official topic',
    'Official topic content',
    true, false, true,
    'https://example.com/forum-cover.webp'
  ) into saved_topic;
  if not exists (
    select 1 from public.forum_topics
    where id = saved_topic and image_url = 'https://example.com/forum-cover.webp'
  ) then
    raise exception 'admin official Forum cover was not saved';
  end if;
end;
$$;

reset role;
rollback;

select 'NCEA content management RLS verification passed' as result;
