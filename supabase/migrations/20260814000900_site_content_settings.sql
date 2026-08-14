create table public.site_settings (
  id boolean primary key default true check (id),
  organization_name text not null,
  footer_text text not null,
  home_title text not null,
  home_intro text not null,
  home_cta_label text not null,
  home_secondary_text text not null,
  contact_title text not null,
  contact_intro text not null,
  contact_privacy_top text not null,
  contact_privacy_submit text not null,
  contact_submit_label text not null,
  success_title text not null,
  success_message text not null,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (organization_name, footer_text, home_title, home_intro, home_cta_label, home_secondary_text, contact_title, contact_intro, contact_privacy_top, contact_privacy_submit, contact_submit_label, success_title, success_message)
values ('International Conference on Forestry and Tourism', 'International Conference on Forestry and Tourism', 'Stay connected with ICFT.', 'ICFT is preparing a simple way for members of our community to share their contact and professional information.', 'Submit Your Information', 'Share your information to stay connected with ICFT.', 'ICFT Contact and Professional Interest Form', 'Please provide your contact and professional information to stay connected with ICFT conferences and related activities. Your information will be kept private and will only be accessible to authorized organizers.', 'Your information is collected for ICFT communications and professional-interest purposes and is accessible only to authorized organizers.', 'Your information is collected for ICFT communications and professional-interest purposes and is accessible only to authorized organizers.', 'Submit Information', 'Thank you', 'Thank you. Your information has been submitted successfully.');

create trigger site_settings_set_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;
alter table public.site_settings force row level security;
revoke all on table public.site_settings from anon, authenticated;
grant select on table public.site_settings to anon, authenticated;
grant update on table public.site_settings to authenticated;

create policy "public users can read site content" on public.site_settings for select to anon, authenticated using (true);
create policy "approved administrators can update site content" on public.site_settings for update to authenticated using ((select private.is_approved_admin())) with check ((select private.is_approved_admin()));
