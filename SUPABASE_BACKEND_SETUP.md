# Supabase Auth + Postgres + Storage setup

The project uses Supabase Auth for email/password and Facebook OAuth, Supabase Postgres for profile, job, application, residency-request, and payment-ledger data, plus a private Storage bucket for verification documents. Several legacy UI flows remain local/demo-only; do not use real personal or payment data until the complete integration and security/privacy review are finished.

## Configure the Supabase project

1. Create a Supabase project. Enable Email and Facebook in **Authentication → Providers**. Configure the Meta OAuth callback URL and allow your local/deployed redirect URLs in **Authentication → URL Configuration**.
2. Configure environment variables. `.env.example` contains placeholders, not real credentials:
   - Browser/Vite: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
   - Express/server: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
   - The anon/publishable key is public and must be paired with RLS. The service-role key bypasses RLS and must remain server-only.
3. Run `supabase/schema.sql` in the Supabase SQL Editor. It creates `profiles`, `jobs`, `applications`, `resident_verification_requests`, and `payment_transactions`, plus indexes, RLS policies, and a private `verification-documents` Storage bucket.
4. Assign `app_metadata.role` values such as `employer`, `verifier`, or `admin` only using a trusted admin process. Never set privileged roles from browser-editable metadata.
5. Set the server environment and run:

   ```bash
   bun install
   bun run build
   bun run start
   ```

## API

- `GET /health` checks process liveness only.
- `GET /api/bootstrap` requires a Supabase access token; returns published jobs, the caller's applications, and profile.
- `PUT /api/profile` derives identity from the verified token and ignores browser-supplied role/verification flags.
- `POST /api/applications` validates the job/contact fields and inserts application metadata for the authenticated user.
- `POST /api/jobs` requires trusted `app_metadata.role: employer` and creates a `pending_review` job.

The Express data layer verifies access tokens with Supabase Auth and uses the caller's access token for Postgres operations so RLS is applied. The service-role key is only used server-side for token verification. Rate limiting is currently in-process and not shared across instances; use a managed gateway/WAF or distributed limiter for production.

## Storage and production work

The private bucket and owner-scoped policies are provisioned, but the UI/API upload flow is not complete. Before handling resumes or identity documents, implement upload authorization, size/type checks, malware scanning, retention/deletion controls, and expiring signed downloads. Payments must use server-side checkout and signed, idempotent provider webhooks; never trust a client-side payment status. Complete automated tests, backups, observability, and security/privacy review before launch.

## Local environment

```bash
cp .env.example .env.local
# Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for Vite.
# Set SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in the server environment.
bun run dev
```
