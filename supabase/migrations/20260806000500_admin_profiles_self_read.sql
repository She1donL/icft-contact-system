grant select on table public.admin_profiles to authenticated;

create policy "users can read their own admin profile"
on public.admin_profiles
for select
to authenticated
using (id = auth.uid());
