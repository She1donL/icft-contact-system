# Admin Management deployment runbook

Admin Management is deployed in two stages. Stage A adds the compatible role/status and invitation schema, but it deliberately assigns no owner and exposes no administrator-management UI or mutations.

Never select an owner by creation order, email pattern, or an arbitrary first row. Never commit a real administrator email or Auth UUID to this repository.

## 1. Apply Stage A

Apply migration `20260824000100_admin_management_stage_a.sql` through the normal migration deployment process.

The migration preserves every currently approved profile as an active `admin`. Because the legacy schema did not record revocation, an existing unapproved profile is preserved conservatively as a pending `admin`; it is not labelled revoked without evidence.

Do not release Stage B until the explicit owner bootstrap and verification below have succeeded.

## 2. Select the intended owner

Run this read-only preflight query in the trusted Supabase SQL editor or an administrative PostgreSQL connection:

```sql
select
  u.id as auth_user_uuid,
  u.email,
  ap.is_approved,
  ap.approved_at,
  ap.created_at
from public.admin_profiles ap
join auth.users u on u.id = ap.id
order by lower(u.email), u.id;
```

Confirm the exact UUID and email of the intended existing approved administrator outside the query. The selected row must have `is_approved = true`.

## 3. Bootstrap exactly one confirmed profile

Replace the placeholder below with the explicitly confirmed `auth.users.id` UUID. Do not save the substituted command in Git.

```sql
begin;

do $bootstrap$
declare
  selected_owner_id uuid := '<EXPLICITLY_CONFIRMED_AUTH_USER_UUID>'::uuid;
  changed_rows integer;
begin
  update public.admin_profiles
  set
    role = 'owner',
    role_changed_at = now(),
    role_changed_by = selected_owner_id
  where id = selected_owner_id
    and is_approved = true
    and status = 'active';

  get diagnostics changed_rows = row_count;

  if changed_rows <> 1 then
    raise exception 'Owner bootstrap failed: the confirmed UUID is not exactly one active approved administrator';
  end if;

  if not exists (
    select 1
    from public.admin_profiles
    where role = 'owner'
      and status = 'active'
      and is_approved = true
  ) then
    raise exception 'Owner bootstrap failed: no active owner exists';
  end if;
end;
$bootstrap$;

commit;
```

This is an explicit deployment operation, not a migration. Stage A itself must leave all migrated profiles as `admin`.

## 4. Verify the bootstrap

Run:

```sql
select
  u.id as auth_user_uuid,
  u.email,
  ap.role,
  ap.status,
  ap.is_approved,
  ap.role_changed_at
from public.admin_profiles ap
join auth.users u on u.id = ap.id
where ap.role = 'owner'
  and ap.status = 'active'
  and ap.is_approved = true
order by lower(u.email), u.id;
```

Verify that the intended account appears. Deployment remains incomplete if this query returns no rows.

## 5. Stage B deployment gate

The future Stage B migration must begin with this gate before installing owner mutations, owner-only RLS policies, the `/admin/admins` interface, or last-owner enforcement:

```sql
do $stage_b_gate$
begin
  if not exists (
    select 1
    from public.admin_profiles
    where role = 'owner'
      and status = 'active'
      and is_approved = true
  ) then
    raise exception 'Admin Management Stage B requires at least one active approved owner';
  end if;
end;
$stage_b_gate$;
```

Do not treat Stage B as deployed when this gate fails. Last-owner enforcement belongs to Stage B and is intentionally absent from Stage A.

## Local migration replay

The upgrade-path fixtures are deliberately stored with a `.psql` extension so the ordinary post-migration pgTAP discovery does not run a legacy-schema fixture against the current schema.

Run these commands against the local Supabase stack only:

```sh
pnpm dlx supabase@2.114.0 db reset --local --no-seed --version 20260818000100
docker exec -i supabase_db_ICFT_Contact_System psql -U postgres -d postgres < supabase/tests/migration/admin_management_stage_a_legacy_fixture.psql
pnpm dlx supabase@2.114.0 migration up --local
docker exec -i supabase_db_ICFT_Contact_System psql -U postgres -d postgres < supabase/tests/migration/admin_management_stage_a_upgrade_assertions.psql
pnpm dlx supabase@2.114.0 db reset --local --no-seed
pnpm dlx supabase@2.114.0 test db supabase/tests/database --local
```
