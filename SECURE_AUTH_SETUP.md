# Secure Authentication Setup

This project uses Supabase Auth for the actual credential and session lifecycle, plus a small layer of custom security checks in the client to enforce:

- first-time email verification before access
- one active session per user at a time
- password reset flow separate from email verification
- session invalidation on logout and password change

## Resend email delivery

Supabase Auth remains responsible for creating users, verification links, reset links, and sessions. Resend is only the SMTP delivery provider. The browser must never call Resend directly or contain a Resend API key.

1. Verify your sending domain in Resend and publish the DNS records Resend provides (including SPF and DKIM).
2. In Supabase, open **Project Settings > Authentication > SMTP Settings**, enable custom SMTP, and enter:
	- Host: `smtp.resend.com`
	- Port: `465` (SSL) or `587` (STARTTLS)
	- Username: `resend`
	- Password: your Resend API key, entered only in the Supabase dashboard
	- Sender email: an address on the verified Resend domain, such as `noreply@yourdomain.com`
	- Sender name: `AxelleVault`
3. In **Authentication > URL Configuration**, set the production Site URL and allow the app's local and production redirect URLs. Signup redirects to `/login?verified=true`; password recovery redirects to `/reset-password`.
4. In **Authentication > Email Templates**, keep the confirmation and recovery templates using Supabase's generated confirmation URL (`{{ .ConfirmationURL }}`). Supabase will send both through the configured Resend SMTP server.
5. Send a test signup and password reset, then check delivery in both Supabase Auth logs and the Resend email logs.

Do not put the SMTP password/API key in `.env`, Vite variables, or any `VITE_*` variable. The app's `supabase.auth.signUp()`, `supabase.auth.resend()`, and `supabase.auth.resetPasswordForEmail()` calls already use Supabase Auth and will use the configured SMTP transport automatically.

The abandoned direct Resend API draft is not part of this flow. Do not re-import it into browser code; doing so would expose server credentials and create a second verification mechanism.

## Database migration

Apply the migration in `supabase/migrations/20260927000000_secure_auth_enforcement.sql` in Supabase SQL Editor.

This creates the required `users`, `sessions`, `email_verifications`, `password_resets`, and support indexes for secure one-device-at-a-time login.

## Important behavior enforced in the app

- `signUp()` creates the user through Supabase Auth and signs the user out until Supabase email confirmation is complete.
- `signIn()` blocks if `email_verified` is false.
- `signIn()` blocks if an active session already exists for that user.
- `signOut()` invalidates the active session.
- `changePassword()` invalidates all existing sessions for the account.
- `requestPasswordReset()` uses the separate reset-email flow and does not reuse the verification flow.

## Production hardening

- Use HTTPS only.
- Keep session cookies HttpOnly/SameSite=Lax or Strict when using server-side sessions.
- Never log plaintext passwords or raw tokens.
- Use Argon2id or bcrypt on a server side if you move beyond Supabase Auth.
- Add rate limiting at the edge or API layer for login, password reset, and verification requests.
- Keep verification and reset tokens single-use and hash them before storing.

## Notes

The app is a front-end + Supabase client project. Resend SMTP is configured in Supabase, so no Resend SDK or custom email API route is needed in the browser app.
