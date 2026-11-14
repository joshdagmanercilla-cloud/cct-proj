# Firebase + Firestore + Express setup

This branch contains a Firebase Authentication sign-in screen, an Express API, and a Firestore REST persistence layer. Configure the external Firebase and Meta projects before use. This is a staged integration, not a production launch: the legacy `HardenedApp` still has demo role switching and local-only flows, and its application/job/payment/verification UI has not yet been migrated to call all cloud endpoints. Do not enter real personal data or accept payments until that migration and a security/privacy review are complete.

## Configure services

1. Create a Firebase project and register a web app. Enable Email/Password in Firebase Authentication.
2. For Facebook sign-in, create a Meta app with Facebook Login, configure the Firebase OAuth redirect URI in Meta, and enable Facebook in Firebase Authentication. Keep the Meta App Secret in Firebase Console only.
3. Enable Firestore Native mode and deploy `firestore.rules` (browser reads/writes are denied; Express is the data access layer).
4. Create a service account with the minimum Firestore permissions needed and configure server secrets in the hosting provider:
   - `FIREBASE_SERVICE_ACCOUNT_JSON`: full service-account JSON; server-only, never a Vite variable.
   - `FIREBASE_WEB_API_KEY`: Firebase Web API key used by the server to validate Firebase ID tokens.
   - `VITE_FIREBASE_API_KEY`: same Firebase Web API key for browser sign-in. This is public client configuration, not an admin secret.
   - `VITE_FACEBOOK_APP_ID` and `VITE_FACEBOOK_GRAPH_VERSION`: Facebook app ID and enabled Graph API version for the web client.
5. Add local/deployed hosts to Firebase Auth authorized domains and the production domain/redirect URI to Meta configuration.
6. Run `bun install`, `bun run build`, then `bun run start`. The server needs `PORT` and the server-only secrets at runtime. For Vite, put public browser config in `.env.local`; never put service-account data there.

## API routes

- `GET /health` checks that the process is responding; it does not verify dependencies.
- `GET /api/bootstrap` requires a Firebase ID token and returns profile, published jobs, and the user's applications.
- `PUT /api/profile` requires sign-in; user ID/email are derived from the verified token and browser-supplied role/verification flags are ignored.
- `POST /api/applications` requires sign-in, validates the job and contact fields, and stores application metadata under the caller's user document.
- `POST /api/jobs` requires a server-assigned Firebase custom claim `role: employer`, validates fields, and creates a `pending_review` job. Claims must be assigned through a trusted admin process, never from the browser.

The API uses a basic in-process request throttle. It is not shared across instances; use a managed gateway/WAF or distributed limiter for a public production service. Firestore service-account access must remain server-only. Add managed backups, deployment secrets, monitoring, alerting, and a dependency-aware health check before launch.

## Remaining production work

- Migrate the current `HardenedApp` UI and state fully to the API. Its existing role switcher, applications, job posting, payment, and residency interactions remain demo/client-local and are not secured by the new API merely because the auth screen is connected.
- Seed reviewed public job records into Firestore and implement administrative moderation and employer claim provisioning.
- Add private object storage for resumes/verification documents, including upload authorization, size/type checks, scanning, retention/deletion controls, and expiring access URLs. The API intentionally does not accept file uploads.
- Integrate a real payment provider using server-side checkout and signed, idempotent webhooks. Never mark payments complete in client code.
- Add automated tests, distributed rate limiting, structured logs/error reporting, backups, alerts, and a security/privacy review.

## Local run

```bash
cp .env.example .env.local
# Set VITE_FIREBASE_API_KEY, VITE_FACEBOOK_APP_ID, and VITE_FACEBOOK_GRAPH_VERSION in .env.local
# Configure FIREBASE_WEB_API_KEY and FIREBASE_SERVICE_ACCOUNT_JSON in the server environment
bun install
bun run build
bun run start
```
