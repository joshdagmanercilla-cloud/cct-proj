# Supabase Auth setup

This version uses Supabase Auth for email/password and Facebook sign-in. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for the browser. The Express API needs `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in its server environment. Keep the service-role key secret; never expose it with a `VITE_` prefix.

Enable Email and Facebook providers in the Supabase dashboard, then allow your local and deployed redirect URLs in **Authentication → URL Configuration**. For the database and Storage setup, run `supabase/schema.sql` as documented in [SUPABASE_BACKEND_SETUP.md](SUPABASE_BACKEND_SETUP.md).

Some role switching and local-only application, job, payment, and residency interactions are still demo behavior and are not all connected to the cloud API. Do not enter real personal, identity, resume, or payment information before the complete integration and security/privacy review.
