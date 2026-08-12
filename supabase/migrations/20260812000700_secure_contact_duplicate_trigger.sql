create or replace function public.refresh_contact_duplicate_status()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if tg_op = 'UPDATE' and old.email is distinct from new.email then
    perform public.recalculate_duplicate_status(old.email);
  end if;

  perform public.recalculate_duplicate_status(new.email);
  return null;
end;
$$;

revoke all on function public.refresh_contact_duplicate_status() from public, anon, authenticated, service_role;
