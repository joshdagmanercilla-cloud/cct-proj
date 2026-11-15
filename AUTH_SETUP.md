# Supabase Auth setup

This version uses Supabase Auth for email/password and Facebook sign-in. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for the browser, and configure `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and the server-only `SUPABASE_SERVICE_ROLE_KEY` for the Express API.

Enable Email and Facebook providers in the Supabase dashboard and configure the redirect URLs there. Never expose the service-role key with a `VITE_` prefix.

Some role switching and local-only application, job, payment, and residency interactions are still demo behavior and are not all connected to the cloud API. Do not enter real personal, identity, resume, or payment information before the complete integration and security/privacy review.
