# Cauayan City Career Connect

A React + TypeScript preview app for local jobs and career services. The repository includes Supabase Auth integration, an Express API, a Supabase Postgres schema with row-level security, and a private Storage bucket setup.

> **Preview / safety notice:** several application, employer, payment, and residency screens still use demo or browser-local state and are not fully connected to the cloud API. Do not enter real identity, resume, payment, or other sensitive personal information until the full integration and a security/privacy review are complete.

## Requirements

- Bun (recommended; npm can also be used)
- A Supabase project for live authentication and cloud API use

## Local setup

1. Install dependencies:

   ```bash
   bun install
   ```

2. Copy `.env.example` to `.env.local` and set:
   - `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for browser-side Supabase Auth.
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in the server environment. Keep the service-role key secret; never use a `VITE_` prefix or commit its real value.
   - `GEMINI_API_KEY` only if using server-side Gemini functionality.

3. In the Supabase Dashboard:
   - Enable Email and Facebook in **Authentication → Providers**.
   - Set local and deployed callback/redirect URLs under **Authentication → URL Configuration**.
   - Configure Facebook OAuth credentials and the Supabase callback URL in Meta.
   - Run `supabase/schema.sql` in the SQL Editor to create the app tables, indexes, RLS policies, and private `verification-documents` bucket.
   - Assign privileged `app_metadata.role` values (such as `employer`, `verifier`, or `admin`) only using a trusted admin process, never from browser-editable metadata.

4. Build and run:

   ```bash
   bun run build
   bun run start
   ```

   `bun run dev` starts the Vite development server on port 3000. The Express server expects the production build in `dist`.

## Supabase data model

`supabase/schema.sql` defines:

- `profiles` — account profile, role, education, barangay, and verification state.
- `jobs` — employer-owned listings, review/publication status, and job/location details.
- `applications` — applicant/job linkage, contact details, status, and optional resume object path.
- `resident_verification_requests` — residency review metadata; sensitive files belong in private Storage.
- `payment_transactions` — payment ledger records; completion must be controlled by verified server webhooks.
- `verification-documents` private Storage bucket — owner-scoped object policies.

RLS is enabled in the SQL setup. The Express data layer verifies tokens with Supabase Auth and uses the caller's access token for table operations so user-scoped RLS is applied. The service-role key is used only server-side for token verification.

## Current API

- `GET /health` — process liveness.
- `GET /api/bootstrap` — signed-in user's profile, published jobs, and applications.
- `PUT /api/profile` — update the signed-in user's profile name.
- `POST /api/applications` — submit validated application metadata for a published job.
- `POST /api/jobs` — submit a job for review for users with trusted employer app metadata.

## Production work still required

The API does not yet connect every `HardenedApp` screen. Resume and verification uploads require authorization, size/type validation, scanning, retention/deletion controls, and expiring signed downloads. Payments require a provider integration with signed, idempotent webhooks; never trust a client-side payment status. Add automated tests, distributed rate limiting, backups, observability, and a security/privacy review before launch.

See [SUPABASE_BACKEND_SETUP.md](SUPABASE_BACKEND_SETUP.md) and [AUTH_SETUP.md](AUTH_SETUP.md) for additional setup notes.
