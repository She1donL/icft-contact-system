create table public.admin_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  is_approved boolean not null default false,
  approved_at timestamptz,
  approved_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_profiles_approval_timestamp
    check ((is_approved and approved_at is not null) or (not is_approved and approved_at is null))
);

create trigger admin_profiles_set_updated_at
before update on public.admin_profiles
for each row execute function public.set_updated_at();

create function public.is_approved_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.admin_profiles
    where id = auth.uid()
      and is_approved = true
  );
$$;

alter table public.contacts enable row level security;
alter table public.contacts force row level security;
alter table public.admin_profiles enable row level security;
alter table public.admin_profiles force row level security;

revoke all on table public.contacts from anon, authenticated;
revoke all on table public.admin_profiles from anon, authenticated;
revoke all on sequence public.contact_record_id_seq from anon, authenticated;
revoke all on function public.assign_contact_record_id() from public;
revoke all on function public.prevent_contact_record_id_change() from public;
revoke all on function public.set_updated_at() from public;
revoke all on function public.recalculate_duplicate_status(text) from public;
revoke all on function public.refresh_contact_duplicate_status() from public;
revoke all on function public.is_approved_admin() from public;

grant execute on function public.is_approved_admin() to authenticated;
grant select, update on table public.contacts to authenticated;
grant select, insert, update, delete on table public.contacts to service_role;
grant select, insert, update, delete on table public.admin_profiles to service_role;
grant usage, select on sequence public.contact_record_id_seq to service_role;

create policy "approved administrators can read contacts"
on public.contacts
for select
to authenticated
using ((select public.is_approved_admin()));

create policy "approved administrators can update contacts"
on public.contacts
for update
to authenticated
using ((select public.is_approved_admin()))
with check ((select public.is_approved_admin()));
