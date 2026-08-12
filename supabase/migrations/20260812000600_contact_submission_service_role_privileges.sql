revoke all on table public.contacts from service_role;
grant select, insert, update on table public.contacts to service_role;

revoke all on sequence public.contact_record_id_seq from service_role;
grant usage on sequence public.contact_record_id_seq to service_role;

grant execute on function public.recalculate_duplicate_status(text) to service_role;
