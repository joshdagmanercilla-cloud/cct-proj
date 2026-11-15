# Cauayan City Career Connect

React + TypeScript preview app for local jobs and career services. This repository includes Supabase Auth, an Express API, Supabase Postgres schema/RLS policies, and private Storage configuration.

> **Preview notice:** Some role switching and application, employer, payment, and residency flows remain local/demo-only and are not fully connected to the cloud API. Do not enter real personal, identity, resume, or payment information until the full integration and a security/privacy review are complete.

## Setup

1. Install dependencies with `bun install`.
2. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for the browser.
3. Set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in the server environment. The service-role key is secret and must never be exposed to Vite or the browser.
4. In Supabase, enable Email and Facebook Auth providers and configure redirect URLs. Run `supabase/schema.sql` in the SQL Editor.
5. Build and run the Express server with `bun run build && bun run start`. Use `bun run dev` for Vite development.

See [SUPABASE_BACKEND_SETUP.md](SUPABASE_BACKEND_SETUP.md) for the schema, RLS, API details, and production limitations. Privileged `app_metadata.role` values must only be provisioned through a trusted admin process.
