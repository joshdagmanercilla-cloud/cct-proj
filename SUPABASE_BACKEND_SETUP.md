# Supabase Auth + Postgres + Storage setup

This application uses Supabase Auth for email/password and Facebook OAuth, Supabase Postgres for profiles, jobs, and applications, and Supabase Storage for private document storage. The Express API uses the Supabase service-role key only on the server and verifies every user access token with Supabase Auth. The legacy `HardenedApp` still has demo role switching and local-only flows; some application/job/payment/verification UI has not been migrated to the API. Do not enter real personal data or accept payments until that migration and a security/privacy review are complete.

## Configure Supabase

1. Create a Supabase project. In **Authentication → Providers**, enable Email and Facebook; configure Facebook's OAuth client credentials and the Supabase callback URL in Meta. Configure the app's local and deployed redirect URLs in **Authentication → URL Configuration**.
2. Set the following values in `.env.local` for Vite and in the server's secret environment as appropriate:
   - `VITE_SUPABASE_URL`: project URL (public client configuration).
   - `VITE_SUPABASE_ANON_KEY`: publishable/anon key (public client configuration; RLS must protect all exposed tables).
   - `SUPABASE_URL`: project URL for the server.
   - `SUPABASE_SERVICE_ROLE_KEY`: server-only service role key. Never prefix this with `VITE_` or expose it to browsers.
   - Keep `VITE_FACEBOOK_APP_ID` and `VITE_FACEBOOK_GRAPH_VERSION` removed; Facebook OAuth is managed by Supabase.
3. Run the SQL in `supabase/schema.sql` using the Supabase SQL Editor. It creates the tables and owner-scoped RLS rules used by this integration, plus a private `verification-documents` Storage bucket. Never make that bucket public.
4. Assign `app_metadata.role = employer` only through a trusted Supabase admin process. Never accept role or verification claims from browser metadata.
5. Run `bun install`, `bun run build`, then `bun run start`. Configure `PORT` and the server-only environment variables on the host. Supabase must be configured before using cloud sign-in or the API.

## API routes

- `GET /health` checks that the process is responding; it does not verify dependencies.
- `GET /api/bootstrap` requires a Supabase access token and returns published jobs, the caller's applications, and their profile.
- `PUT /api/profile` requires sign-in; user ID/email are derived from the verified Supabase token and browser-supplied role/verification flags are ignored.
- `POST /api/applications` requires sign-in, validates the job and contact fields, and stores application metadata for the caller.
- `POST /api/jobs` requires the trusted Supabase `app_metadata.role: employer` value and creates a `pending_review` job.

The API uses a basic in-process request throttle, which is not shared across instances. Use a managed gateway/WAF or distributed limiter for a public production service. The service-role key bypasses RLS and must remain server-only. Add managed backups, deployment secrets, monitoring, alerting, and a dependency-aware health check before launch.

## Storage and remaining production work

The SQL provisions a private bucket and owner-scoped object policies, but the current API intentionally does not accept uploads and the UI has not been migrated to upload documents. Before handling resumes or identity documents, implement a narrowly authorized upload flow, size/type validation, malware scanning, retention/deletion controls, and expiring signed downloads. Also migrate the remaining `HardenedApp` data flows, seed reviewed public jobs, implement moderation, integrate a real payment provider using server-side checkout and signed idempotent webhooks, and complete automated tests plus a security/privacy review.

## Local run

```bash
cp .env.example .env.local
# Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local
# Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the server environment
bun install
bun run build
bun run start
```
