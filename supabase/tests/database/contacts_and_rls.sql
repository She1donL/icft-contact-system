begin;

select plan(49);

insert into public.contacts (first_name, last_name, email, roles, country_region, conference_updates_consent)
values ('Ada', 'Lovelace', 'ada@example.test', array['Researcher'], 'Canada', true);

select matches((select record_id from public.contacts where email = 'ada@example.test'), '^ICFT-C-000001$', 'the first record ID uses the ICFT-C-000001 format');
select throws_ok($$update public.contacts set record_id = 'ICFT-C-999999' where email = 'ada@example.test'$$, 'record_id is immutable', 'record IDs cannot be changed');
select ok((select updated_at from public.contacts where email = 'ada@example.test') <= clock_timestamp(), 'contacts receive an updated_at timestamp');

update public.contacts set first_name = 'Augusta' where email = 'ada@example.test';
select ok((select updated_at > created_at from public.contacts where email = 'ada@example.test'), 'updated_at advances after an update');

insert into public.contacts (first_name, last_name, email, roles, country_region, conference_updates_consent)
values ('Grace', 'Hopper', 'ada@example.test', array['Professor / Faculty Member'], 'Canada', false);
select is((select duplicate_status::text from public.contacts where first_name = 'Augusta'), 'possible_duplicate', 'an existing matching email is marked possible_duplicate');
select is((select duplicate_status::text from public.contacts where first_name = 'Grace'), 'possible_duplicate', 'a retained duplicate submission is marked possible_duplicate');

update public.contacts set archived_at = clock_timestamp() where first_name = 'Augusta';
insert into public.contacts (first_name, last_name, email, roles, country_region, conference_updates_consent)
values ('Katherine', 'Johnson', 'ada@example.test', array['Researcher'], 'Canada', true);
select is((select duplicate_status::text from public.contacts where first_name = 'Katherine'), 'possible_duplicate', 'archived records remain part of duplicate detection');

update public.contacts set email = 'grace@example.test' where first_name = 'Grace';
select is((select duplicate_status::text from public.contacts where first_name = 'Augusta'), 'possible_duplicate', 'changing an email recalculates the old duplicate group');
select is((select duplicate_status::text from public.contacts where first_name = 'Grace'), 'no_duplicate_detected', 'changing an email recalculates the new duplicate group');

set local role anon;
select throws_ok($$select * from public.contacts$$, '42501', 'permission denied for table contacts', 'anonymous users cannot select contacts');
select throws_ok($$insert into public.contacts (first_name, last_name, email, roles, country_region, conference_updates_consent) values ('Anonymous', 'User', 'anonymous@example.test', array['Researcher'], 'Canada', true)$$, '42501', 'permission denied for table contacts', 'anonymous users cannot insert contacts');
select throws_ok($$update public.contacts set status = 'reviewed'$$, '42501', 'permission denied for table contacts', 'anonymous users cannot update contacts');
select throws_ok($$delete from public.contacts$$, '42501', 'permission denied for table contacts', 'anonymous users cannot delete contacts');
reset role;

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'non-admin@example.test', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'approved-admin@example.test', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now());
insert into public.admin_profiles (id, is_approved, approved_at)
values
  ('00000000-0000-0000-0000-000000000101', false, null),
  ('00000000-0000-0000-0000-000000000102', true, now());

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000101', true);
select is((select count(*) from public.contacts), 0::bigint, 'an authenticated non-admin cannot read contacts');
update public.contacts set status = 'reviewed' where email = 'ada@example.test';
reset role;
select is((select status::text from public.contacts where first_name = 'Augusta'), 'new', 'an authenticated non-admin cannot update contacts');

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000101', true);
select is((select count(*) from public.admin_profiles), 1::bigint, 'an authenticated user can read only their own admin profile');
select is((select is_approved from public.admin_profiles), false, 'an authenticated user cannot read another approval state');
select throws_ok($$update public.admin_profiles set is_approved = true$$, '42501', 'permission denied for table admin_profiles', 'an authenticated user cannot self-approve');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000102', true);
select is((select count(*) from public.contacts), 3::bigint, 'an approved administrator can read contacts');
update public.contacts set status = 'reviewed' where first_name = 'Grace';
select is((select status::text from public.contacts where first_name = 'Grace'), 'reviewed', 'an approved administrator can update contacts');
update public.contacts set email = 'approved-admin-edit@example.test' where first_name = 'Grace';
select is((select email from public.contacts where first_name = 'Grace'), 'approved-admin-edit@example.test', 'an approved administrator can edit an email through the duplicate trigger');
update public.contacts set duplicate_status = 'reviewed' where first_name = 'Augusta';
select is((select duplicate_status::text from public.contacts where first_name = 'Augusta'), 'reviewed', 'an approved administrator can mark a duplicate reviewed');
update public.contacts set duplicate_status = 'keep_separate' where first_name = 'Katherine';
select is((select duplicate_status::text from public.contacts where first_name = 'Katherine'), 'keep_separate', 'an approved administrator can keep a duplicate separate');
reset role;

select policies_are('public', 'contacts', array['approved administrators can read contacts', 'approved administrators can update contacts'], 'contacts expose only approved-administrator RLS policies');
select ok((select relrowsecurity from pg_class where oid = 'public.contacts'::regclass), 'RLS is enabled for contacts');
select ok((select relrowsecurity from pg_class where oid = 'public.admin_profiles'::regclass), 'RLS is enabled for admin_profiles');
select ok(not exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = 'is_approved_admin'), 'public.is_approved_admin no longer exists');
select ok(exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'private' and p.proname = 'is_approved_admin' and p.prosecdef), 'private.is_approved_admin is SECURITY DEFINER');
select ok(not has_schema_privilege('anon', 'private', 'usage'), 'anon cannot use the private schema');
select ok(has_schema_privilege('authenticated', 'private', 'usage'), 'authenticated has only required private schema usage');
select ok(not has_function_privilege('anon', 'private.is_approved_admin()', 'execute'), 'anon cannot execute private.is_approved_admin');
select ok(has_function_privilege('authenticated', 'private.is_approved_admin()', 'execute'), 'authenticated can execute private.is_approved_admin for RLS evaluation');
select ok(exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = 'refresh_contact_duplicate_status' and p.prosecdef), 'duplicate trigger function runs with controlled definer privileges');
select ok(not has_function_privilege('authenticated', 'public.recalculate_duplicate_status(text)', 'execute'), 'authenticated cannot directly invoke duplicate recalculation');
select ok(not has_function_privilege('service_role', 'public.recalculate_duplicate_status(text)', 'execute'), 'service_role cannot directly invoke duplicate recalculation');

select ok(has_table_privilege('service_role', 'public.contacts', 'INSERT'), 'service_role can insert contacts for the server-side submission boundary');
select ok(has_table_privilege('service_role', 'public.contacts', 'UPDATE'), 'service_role can run duplicate-status updates triggered by a submission');
select ok(has_table_privilege('service_role', 'public.contacts', 'SELECT'), 'service_role can query duplicate groups triggered by a submission');
select ok(not has_table_privilege('service_role', 'public.contacts', 'DELETE'), 'service_role has no unnecessary contacts delete privilege');
select ok(has_sequence_privilege('service_role', 'public.contact_record_id_seq', 'USAGE'), 'service_role can generate a contact record ID through the insert trigger');

set local role service_role;
select lives_ok(
  $$insert into public.contacts (first_name, last_name, email, roles, country_region, conference_updates_consent)
    values ('Backend', 'Submission', 'backend-submission@example.test', array['Researcher'], 'CA', true)$$,
  'service_role can insert a contact through the trigger-backed backend path'
);
reset role;

select ok((select relforcerowsecurity from pg_class where oid = 'public.contacts'::regclass), 'RLS remains forced for contacts');

set local role anon;
select is((select home_title from public.site_settings where id = true), 'Stay connected with ICFT.', 'anonymous users can read public site content');
select throws_ok($$update public.site_settings set home_title = 'Anonymous change' where id = true$$, '42501', 'permission denied for table site_settings', 'anonymous users cannot update site content');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000101', true);
update public.site_settings set home_title = 'Unapproved change' where id = true;
select is((select home_title from public.site_settings where id = true), 'Stay connected with ICFT.', 'an unapproved user cannot update site content');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000102', true);
update public.site_settings set home_title = 'Approved change' where id = true;
select is((select home_title from public.site_settings where id = true), 'Approved change', 'an approved administrator can update site content');
reset role;

select ok((select relrowsecurity from pg_class where oid = 'public.site_settings'::regclass), 'RLS is enabled for site settings');
select ok((select relforcerowsecurity from pg_class where oid = 'public.site_settings'::regclass), 'RLS is forced for site settings');
select policies_are('public', 'site_settings', array['approved administrators can update site content', 'public users can read site content'], 'site settings expose only public-read and approved-admin-update policies');

select * from finish();
rollback;
