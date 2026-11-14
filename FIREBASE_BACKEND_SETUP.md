# Full-stack Firebase setup

This branch adds an Express API backed by Firestore REST and Firebase Authentication. Email/password and Facebook sign-in use the Firebase Auth implementation in `src/services/cloudAuth.ts`; API routes validate each Firebase ID token with Firebase before accessing data. The server uses a service account only on the server. Never add its private key to Vite variables or commit it.

## Required project setup

1. Create a Firebase project and register a web app. Enable Email/Password in Authentication.
2. For Facebook, create a Meta app, enable Facebook Login, configure its OAuth redirect URI in Meta, and enable the Facebook provider in Firebase Authentication. Store the Meta App Secret only in Firebase Console.
3. Enable Firestore in Native mode. Deploy `firestore.rules`; these rules deny browser access because application data is accessed through the API.
4. Create a service account with the minimum Firestore permissions needed (start with Cloud Datastore User), download its JSON securely, and configure server environment variables:
   - `FIREBASE_WEB_API_KEY`: Firebase Web API key (also set as `VITE_FIREBASE_API_KEY` for the frontend auth screen).
   - `FIREBASE_SERVICE_ACCOUNT_JSON`: full service-account JSON. Keep this server-only secret in the hosting provider's secret manager.
   - `VITE_FACEBOOK_APP_ID` and `VITE_FACEBOOK_GRAPH_VERSION`: frontend Facebook app ID and supported Graph API version.
5. Add your production hostname to Firebase Authentication's authorized domains. Set the Meta app to Live only after its review and domain/security configuration are complete.
6. Deploy with `bun run build` followed by `bun run start`. The host must inject `PORT` and the server secrets at runtime.

## API currently implemented

- `GET /api/bootstrap` — authenticated user's profile, public job collection, and that user's application records.
- `PUT /api/profile` — upserts the signed-in user's profile; role and verification flags are derived server-side, not from submitted fields.
- `POST /api/applications` — validates and saves application metadata under the authenticated user's Firestore path. It does not accept resume files.
- `POST /api/jobs` — requires Firebase custom claim `role: employer`; creates a pending-review listing. Assign employer claims only through a trusted administrator process.
- `GET /health` — process health only; it does not verify Firestore availability.

The API uses a small per-process request throttle as a safety layer. It is not a distributed limiter; use a managed gateway/WAF for production traffic. Configure backups, alerting, monitoring, and a dependency-aware health check in the hosting platform.

## Explicitly not enabled yet

Do not treat this as a complete production launch. The existing React screens still contain demo role switching, client-side localStorage flows, simulated payments and verification, and the app has not yet been refactored to use these API routes for every operation. This patch lays down the secure server/data foundation, but wiring all UI state to the API is still required. Resume/residency uploads need private object storage, file size/type validation and scanning, and short-lived access URLs. Payments need a real provider integration and signed webhook verification; never mark a payment complete in the browser. Do not collect real resumes, identity documents, payments, or sensitive personal data until the remaining integration and privacy review are complete.

## Local development

Copy `.env.example` to `.env.local` for Vite's public Firebase configuration. Set `FIREBASE_WEB_API_KEY` and `FIREBASE_SERVICE_ACCOUNT_JSON` only in the server environment. A `.env.local` file is ignored by Git; do not put the service account JSON into any `VITE_` variable. The Facebook provider and all Firebase/Meta domain settings must be configured before those sign-in methods work.
