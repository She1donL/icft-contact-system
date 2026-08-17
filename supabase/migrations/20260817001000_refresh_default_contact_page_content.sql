-- Refresh only the original untouched defaults. Administrator-edited content remains unchanged.
update public.site_settings
set
  contact_title = 'Connect with ICFT',
  contact_intro = E'Please complete the form below to share your contact details and professional interests with ICFT.\n\nThe information you provide will help us stay connected with our international community and support future communications, networking opportunities and related ICFT activities.',
  contact_privacy_top = 'Your information will be kept private and will only be accessible to authorized ICFT organizers.',
  contact_privacy_submit = 'Your information will be kept private and will only be accessible to authorized ICFT organizers.'
where id = true
  and contact_title = 'ICFT Contact and Professional Interest Form'
  and contact_intro = 'Please provide your contact and professional information to stay connected with ICFT conferences and related activities. Your information will be kept private and will only be accessible to authorized organizers.'
  and contact_privacy_top = 'Your information is collected for ICFT communications and professional-interest purposes and is accessible only to authorized organizers.'
  and contact_privacy_submit = 'Your information is collected for ICFT communications and professional-interest purposes and is accessible only to authorized organizers.';
