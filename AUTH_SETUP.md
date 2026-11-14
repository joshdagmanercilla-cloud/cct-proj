# Authentication setup (Firebase + Facebook)

The sign-in screen uses Firebase Authentication REST endpoints. Email/password accounts and Facebook identity can be used to sign into the same Firebase project from different devices. Each device signs in separately; this does **not** synchronize profile, jobs, applications, residency requests, or transactions. Those parts of this repository remain browser-local demo state and are not suitable for real user data.

## Configure Firebase

1. Create or choose a Firebase project and register a Web app.
2. In Firebase Authentication, enable **Email/Password**. Enable **Facebook** only after completing the Facebook setup below.
3. Add the deployed site hostname (and local development hostname) to Firebase Authentication's authorized domains.
4. Copy the Firebase Web API key into `VITE_FIREBASE_API_KEY`. The key is a client identifier, not a substitute for Firebase security rules. Do not put service-account credentials or Facebook app secrets in Vite environment variables.
5. For local development, copy `.env.example` to `.env.local` and set the variables. Restart Vite after editing environment settings.

## Configure Facebook sign-in

1. Create a Facebook app and add the Facebook Login product.
2. In Firebase Authentication, enable the Facebook provider and enter the Facebook App ID and **App Secret** in Firebase Console. Keep the App Secret only in Firebase's provider configuration; never put it in this repository or a `VITE_` variable.
3. Add the OAuth redirect URI shown by Firebase to the Facebook Login Valid OAuth Redirect URIs, and allow the website's domain in the Facebook app settings.
4. Set `VITE_FACEBOOK_APP_ID` and `VITE_FACEBOOK_GRAPH_VERSION` to your Facebook app ID and a Graph API version supported by your app. Restart/redeploy the site.
5. Test Facebook login on the exact deployed domain, including the Facebook app's live/development mode and permitted tester accounts.

## Important limits of this prototype

- Firebase authenticates the account, but the rest of the app still uses demo role switching and localStorage. Logging in on another device does not bring its browser-local records over.
- The in-app employer/verifier role controls are demo UI, not trustworthy access controls. Do not use this prototype to review real identity documents, handle payments, or receive real resumes.
- Before real launch, connect records to a secured backend/database, enforce authorization there, and configure appropriate privacy, retention, recovery, and monitoring processes.
