create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to authenticated;

create function private.is_approved_admin()
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
  );
$$;

revoke all on function private.is_approved_admin() from public;
grant execute on function private.is_approved_admin() to authenticated;

drop policy "approved administrators can read contacts" on public.contacts;
drop policy "approved administrators can update contacts" on public.contacts;

create policy "approved administrators can read contacts"
on public.contacts
for select
to authenticated
using ((select private.is_approved_admin()));

create policy "approved administrators can update contacts"
on public.contacts
for update
to authenticated
using ((select private.is_approved_admin()))
with check ((select private.is_approved_admin()));

drop function public.is_approved_admin();

do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke all on function public.rls_auto_enable() from public, anon, authenticated, service_role;
  end if;
end;
$$;
