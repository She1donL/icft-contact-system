create type public.admin_role as enum ('owner', 'admin');
create type public.admin_access_status as enum ('pending', 'active', 'revoked');
create type public.admin_invitation_status as enum ('creating', 'pending', 'accepted', 'cancelled', 'failed');

alter table public.admin_profiles
  add column role public.admin_role,
  add column status public.admin_access_status,
  add column revoked_at timestamptz,
  add column revoked_by uuid references auth.users (id) on delete set null,
  add column role_changed_at timestamptz,
  add column role_changed_by uuid references auth.users (id) on delete set null;

update public.admin_profiles
set
  role = 'admin',
  status = case
    when is_approved then 'active'::public.admin_access_status
    else 'pending'::public.admin_access_status
  end;

do $validation$
begin
  if exists (
    select 1
    from public.admin_profiles
    where role is distinct from 'admin'::public.admin_role
      or status is null
      or (is_approved and status is distinct from 'active'::public.admin_access_status)
      or (not is_approved and status is distinct from 'pending'::public.admin_access_status)
  ) then
    raise exception 'Admin profile role/status backfill did not preserve the existing approval state';
  end if;
end;
$validation$;

alter table public.admin_profiles
  alter column role set default 'admin',
  alter column role set not null,
  alter column status set default 'pending',
  alter column status set not null;

alter table public.admin_profiles
  drop constraint admin_profiles_approval_timestamp,
  add constraint admin_profiles_access_state
    check (
      (
        status = 'active'
        and is_approved = true
        and approved_at is not null
        and revoked_at is null
        and revoked_by is null
      )
      or
      (
        status = 'pending'
        and is_approved = false
        and approved_at is null
        and revoked_at is null
        and revoked_by is null
      )
      or
      (
        status = 'revoked'
        and is_approved = false
        and revoked_at is not null
      )
    ) not valid;

alter table public.admin_profiles
  validate constraint admin_profiles_access_state;

create table public.admin_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  normalized_email text generated always as (lower(btrim(email))) stored,
  requested_role public.admin_role not null default 'admin',
  status public.admin_invitation_status not null default 'creating',
  auth_user_id uuid references auth.users (id) on delete set null,
  invited_by uuid not null references auth.users (id),
  invite_sent_at timestamptz,
  accepted_at timestamptz,
  cancelled_at timestamptz,
  failure_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_invitations_email_not_blank check (btrim(email) <> ''),
  constraint admin_invitations_admin_role_only check (requested_role = 'admin'),
  constraint admin_invitations_lifecycle check (
    (
      status = 'creating'
      and auth_user_id is null
      and invite_sent_at is null
      and accepted_at is null
      and cancelled_at is null
      and failure_code is null
    )
    or
    (
      status = 'pending'
      and auth_user_id is not null
      and invite_sent_at is not null
      and accepted_at is null
      and cancelled_at is null
      and failure_code is null
    )
    or
    (
      status = 'accepted'
      and auth_user_id is not null
      and invite_sent_at is not null
      and accepted_at is not null
      and cancelled_at is null
      and failure_code is null
    )
    or
    (
      status = 'cancelled'
      and accepted_at is null
      and cancelled_at is not null
      and failure_code is null
    )
    or
    (
      status = 'failed'
      and accepted_at is null
      and cancelled_at is null
      and failure_code is not null
    )
  )
);

create unique index admin_invitations_open_email_key
on public.admin_invitations (normalized_email)
where status in ('creating', 'pending');

create index admin_invitations_auth_user_id_idx
on public.admin_invitations (auth_user_id)
where auth_user_id is not null;

create trigger admin_invitations_set_updated_at
before update on public.admin_invitations
for each row execute function public.set_updated_at();

alter table public.admin_invitations enable row level security;
alter table public.admin_invitations force row level security;

revoke all on table public.admin_invitations from public, anon, authenticated;
grant select, insert, update, delete on table public.admin_invitations to service_role;

create or replace function private.is_approved_admin()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, auth
as $$
  select exists (
    select 1
    from public.admin_profiles
    where id = auth.uid()
      and is_approved = true
      and status = 'active'
  );
$$;

create function private.is_active_owner()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, auth
as $$
  select exists (
    select 1
    from public.admin_profiles
    where id = auth.uid()
      and is_approved = true
      and status = 'active'
      and role = 'owner'
  );
$$;

revoke all on function private.is_approved_admin() from public;
revoke all on function private.is_active_owner() from public;
grant execute on function private.is_approved_admin() to authenticated;
grant execute on function private.is_active_owner() to authenticated;
