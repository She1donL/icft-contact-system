# Password recovery

The active password-recovery flow uses Supabase's default Reset Password email template and does not require custom SMTP or a hosted email-template change.

`resetPasswordForEmail()` sends the configured `redirectTo` value, `<APP_BASE_URL>/auth/callback?next=/auth/update-password`. With `@supabase/ssr`, Supabase uses PKCE for password recovery and redirects to that URL with a `code` query parameter. The callback exchanges the code for a cookie-backed session and redirects the user to `/auth/update-password`.

The production `NEXT_PUBLIC_APP_URL` value is `https://connect.icft.world`. Supabase Dashboard URL Configuration must retain that value as Site URL and allow `https://connect.icft.world/auth/callback` as a Redirect URL. Local development is configured for the equivalent localhost callback URLs in `supabase/config.toml`.

The application has no token-hash recovery confirmation endpoint. Such an endpoint is only needed for a deliberately customized email template, which is outside the active Free-tier flow. Invite confirmation remains separate from password recovery.
