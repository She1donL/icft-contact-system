begin;

select plan(38);

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'stage-a-admin@example.test', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'stage-a-owner@example.test', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'stage-a-pending@example.test', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'stage-a-revoked@example.test', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'stage-a-default@example.test', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000206', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'stage-a-ordinary@example.test', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now());

insert into public.admin_profiles (id, is_approved, approved_at, role, status, revoked_at)
values
  ('00000000-0000-0000-0000-000000000201', true, now(), 'admin', 'active', null),
  ('00000000-0000-0000-0000-000000000202', true, now(), 'owner', 'active', null),
  ('00000000-0000-0000-0000-000000000203', false, null, 'owner', 'pending', null),
  ('00000000-0000-0000-0000-000000000204', false, now(), 'owner', 'revoked', now());

insert into public.admin_profiles (id)
values ('00000000-0000-0000-0000-000000000205');

select is(enum_range(null::public.admin_role)::text, '{owner,admin}', 'admin_role contains only owner and admin');
select is(enum_range(null::public.admin_access_status)::text, '{pending,active,revoked}', 'admin_access_status contains only pending, active, and revoked');
select is((select role::text from public.admin_profiles where id = '00000000-0000-0000-0000-000000000205'), 'admin', 'new unapproved profiles default to the admin role');
select is((select status::text from public.admin_profiles where id = '00000000-0000-0000-0000-000000000205'), 'pending', 'new unapproved profiles default to pending');

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000201', true);
select ok((select private.is_approved_admin()), 'an active approved admin passes is_approved_admin');
select ok(not (select private.is_active_owner()), 'an active admin is not an active owner');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000202', true);
select ok((select private.is_approved_admin()), 'an active approved owner also passes is_approved_admin');
select ok((select private.is_active_owner()), 'an active approved owner passes is_active_owner');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000203', true);
select ok(not (select private.is_approved_admin()), 'a pending profile fails is_approved_admin');
select ok(not (select private.is_active_owner()), 'a pending profile fails is_active_owner');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000204', true);
select ok(not (select private.is_approved_admin()), 'a revoked profile fails is_approved_admin');
select ok(not (select private.is_active_owner()), 'a revoked profile fails is_active_owner');
reset role;

insert into public.contacts (first_name, last_name, email, roles, country_region, conference_updates_consent)
values ('Stage', 'Admin', 'stage-a-contact@example.test', array['Researcher'], 'CA', false);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000201', true);
select is((select count(*) from public.contacts where email = 'stage-a-contact@example.test'), 1::bigint, 'active admins retain Contacts read access');
update public.contacts set status = 'reviewed' where email = 'stage-a-contact@example.test';
reset role;
select is((select status::text from public.contacts where email = 'stage-a-contact@example.test'), 'reviewed', 'active admins retain Contacts update access');

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000201', true);
select lives_ok(
  $$insert into public.research_prospects (first_name, last_name, public_email, priority, review_status)
    values ('Stage', 'Prospect', 'stage-a-prospect@example.test', 'P1', 'pending')$$,
  'active admins retain Research Prospects write access'
);
select is((select count(*) from public.research_prospects where public_email = 'stage-a-prospect@example.test'), 1::bigint, 'active admins retain Research Prospects read access');
reset role;

insert into public.admin_invitations (email, invited_by)
values ('future-admin@example.test', '00000000-0000-0000-0000-000000000202');

select ok((select relrowsecurity from pg_class where oid = 'public.admin_invitations'::regclass), 'RLS is enabled for admin invitations');
select ok((select relforcerowsecurity from pg_class where oid = 'public.admin_invitations'::regclass), 'RLS is forced for admin invitations');
select policies_are('public', 'admin_invitations', array[]::text[], 'Stage A exposes no admin invitation policies');
select ok(not has_table_privilege('anon', 'public.admin_invitations', 'SELECT'), 'anonymous users have no invitation read privilege');
select ok(not has_table_privilege('authenticated', 'public.admin_invitations', 'SELECT'), 'authenticated users have no invitation read privilege');
select ok(not has_table_privilege('authenticated', 'public.admin_invitations', 'INSERT'), 'authenticated users have no invitation insert privilege');
select ok(not has_table_privilege('authenticated', 'public.admin_invitations', 'UPDATE'), 'authenticated users have no invitation update privilege');
select ok(not has_table_privilege('authenticated', 'public.admin_invitations', 'DELETE'), 'authenticated users have no invitation delete privilege');

set local role anon;
select throws_ok($$select * from public.admin_invitations$$, '42501', 'permission denied for table admin_invitations', 'anonymous users cannot read invitations');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000201', true);
select throws_ok($$select * from public.admin_invitations$$, '42501', 'permission denied for table admin_invitations', 'ordinary active admins cannot read invitations');
select throws_ok($$insert into public.admin_invitations (email, invited_by) values ('blocked@example.test', '00000000-0000-0000-0000-000000000201')$$, '42501', 'permission denied for table admin_invitations', 'ordinary active admins cannot create invitations');
reset role;

select throws_ok(
  $$insert into public.admin_profiles (id, is_approved, approved_at, role, status) values ('00000000-0000-0000-0000-000000000206', false, null, 'admin', 'active')$$,
  '23514',
  'new row for relation "admin_profiles" violates check constraint "admin_profiles_access_state"',
  'active profiles must be approved and have an approval timestamp'
);
select throws_ok(
  $$update public.admin_profiles set status = 'pending' where id = '00000000-0000-0000-0000-000000000201'$$,
  '23514',
  'new row for relation "admin_profiles" violates check constraint "admin_profiles_access_state"',
  'pending profiles cannot retain approved state'
);
select throws_ok(
  $$update public.admin_profiles set status = 'revoked', is_approved = false where id = '00000000-0000-0000-0000-000000000201'$$,
  '23514',
  'new row for relation "admin_profiles" violates check constraint "admin_profiles_access_state"',
  'revoked profiles require a revocation timestamp'
);
select throws_ok(
  $$insert into public.admin_invitations (email, requested_role, invited_by) values ('owner-invite@example.test', 'owner', '00000000-0000-0000-0000-000000000202')$$,
  '23514',
  'new row for relation "admin_invitations" violates check constraint "admin_invitations_admin_role_only"',
  'Stage A invitations cannot request the owner role'
);
select throws_ok(
  $$insert into public.admin_invitations (email, invited_by) values (' FUTURE-ADMIN@example.test ', '00000000-0000-0000-0000-000000000202')$$,
  '23505',
  'duplicate key value violates unique constraint "admin_invitations_open_email_key"',
  'open invitations are unique by normalized email'
);
select triggers_are(
  'public',
  'admin_profiles',
  array['admin_profiles_set_updated_at'],
  'Stage A does not install a last-owner enforcement trigger'
);
select is((select count(*) from public.admin_profiles where role = 'owner' and id not in ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000204')), 0::bigint, 'profiles do not become owners implicitly');
select ok(has_table_privilege('service_role', 'public.admin_invitations', 'SELECT'), 'the future server boundary can read invitations');
select ok(has_table_privilege('service_role', 'public.admin_invitations', 'INSERT'), 'the future server boundary can create invitations');
select ok(has_function_privilege('authenticated', 'private.is_active_owner()', 'execute'), 'authenticated sessions can evaluate is_active_owner for future RLS checks');
select ok(not has_function_privilege('anon', 'private.is_active_owner()', 'execute'), 'anonymous sessions cannot execute is_active_owner');

select * from finish();
rollback;
