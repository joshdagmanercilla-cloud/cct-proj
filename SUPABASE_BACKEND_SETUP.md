# Supabase Auth + Postgres + Storage setup

The app uses Supabase Auth for email/password and Facebook OAuth, Supabase Postgres for profiles, jobs, applications, residency-verification requests, and payment transaction records, plus a private Supabase Storage bucket for verification documents. The Express API uses the Supabase service-role key only to validate user access tokens; database reads and writes use the caller's access token so Postgres RLS policies are enforced.

## Configure Supabase

1. Create a Supabase project. In **Authentication → Providers**, enable Email and Facebook; configure Facebook's OAuth client credentials and the Supabase callback URL in Meta. Configure local and deployed redirect URLs in **Authentication → URL Configuration**.
2. Add the values below to `.env.local` for Vite and to the server environment as appropriate:
   - `VITE_SUPABASE_URL`: project URL (public client configuration).
   - `VITE_SUPABASE_ANON_KEY`: anon/publishable key (public; RLS must protect exposed tables).
   - `SUPABASE_URL`: project URL for the server.
   - `SUPABASE_ANON_KEY`: anon/publishable key for user-scoped server DB requests.
   - `SUPABASE_SERVICE_ROLE_KEY`: server-only key used to validate access tokens. Never use a `VITE_` prefix or expose this key to browsers.
3. Run `supabase/schema.sql` in the Supabase SQL Editor. It provisions `profiles`, `jobs`, `applications`, `resident_verification_requests`, and `payment_transactions`, plus indexes, RLS policies, and a private `verification-documents` Storage bucket.
4. Assign `app_metadata.role = employer` (or `verifier`/`admin`) only using a trusted Supabase admin process. Never put privileged roles in browser-editable user metadata.
5. Enable Facebook provider and configure OAuth redirect allowlists before using Facebook sign-in.
6. Run `bun install`, `bun run build`, then `bun run start`. Configure `PORT` and the server-only environment variables on the host.

## API routes

- `GET /health` checks that the process is responding; it does not verify dependencies.
- `GET /api/bootstrap` requires a Supabase access token and returns published jobs, the caller's applications, and their profile.
- `PUT /api/profile` derives identity from the verified token and ignores browser-supplied role/verification flags.
- `POST /api/applications` validates the job and contact fields and inserts application metadata for the authenticated user.
- `POST /api/jobs` requires trusted `app_metadata.role: employer` and creates a `pending_review` job.

The API uses a basic in-process request throttle, which is not shared across instances. Use a managed gateway/WAF or distributed limiter for production. The service-role key bypasses RLS, so it is used only for token verification; do not expose it. The current API/UI does not yet integrate payments or document uploads. Configure backups, monitoring, alerting, file scanning/retention, signed downloads, payment-provider webhooks, and complete security/privacy review before production use.

## Local run

```bash
cp .env.example .env.local
# Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local
# Set SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in the server environment
bun install
bun run build
bun run start
```
