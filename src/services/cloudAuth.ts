type FirebaseAuthResponse = {
  localId: string;
  email: string;
  displayName?: string;
  idToken: string;
  refreshToken: string;
  expiresIn: string;
  error?: { message?: string };
};

type FirebaseRefreshResponse = {
  user_id: string;
  email: string;
  id_token: string;
  refresh_token: string;
  expires_in: string;
};

export type CloudUser = { id: string; email: string; name: string };

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;
const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID as string | undefined;
const facebookGraphVersion = import.meta.env.VITE_FACEBOOK_GRAPH_VERSION as string | undefined;
const refreshTokenKey = 'career_connect_firebase_refresh_token';
const idTokenKey = 'career_connect_firebase_id_token';
const tokenExpiryKey = 'career_connect_firebase_token_expiry';

function requireFirebaseConfig() {
  if (!apiKey) throw new Error('Cloud sign-in is not configured. Add VITE_FIREBASE_API_KEY to the deployment environment.');
  return apiKey;
}

async function firebaseRequest<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
  const key = requireFirebaseConfig();
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/${endpoint}?key=${encodeURIComponent(key)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const result = await response.json() as T & { error?: { message?: string } };
  if (!response.ok) throw new Error(readableAuthError(result.error?.message));
  return result;
}

function readableAuthError(code?: string) {
  switch (code) {
    case 'EMAIL_EXISTS': return 'An account already uses this email. Try signing in instead.';
    case 'EMAIL_NOT_FOUND':
    case 'INVALID_PASSWORD':
    case 'INVALID_LOGIN_CREDENTIALS': return 'Email or password is incorrect.';
    case 'WEAK_PASSWORD': return 'Choose a stronger password (at least 6 characters).';
    case 'USER_DISABLED': return 'This account has been disabled. Contact support.';
    case 'TOO_MANY_ATTEMPTS_TRY_LATER': return 'Too many attempts. Please wait a while and try again.';
    case 'OPERATION_NOT_ALLOWED': return 'This sign-in method is not enabled in Firebase yet.';
    case 'INVALID_IDP_RESPONSE': return 'Facebook sign-in failed. Check the Facebook provider configuration and try again.';
    case 'INVALID_OAUTH_CLIENT_ID': return 'Facebook sign-in is not configured for this app.';
    default: return code ? `Sign-in failed (${code.replaceAll('_', ' ').toLowerCase()}).` : 'Sign-in failed. Please try again.';
  }
}

function saveSession(idToken: string, refreshToken: string, expiresIn = '3600') {
  sessionStorage.setItem(idTokenKey, idToken);
  sessionStorage.setItem(refreshTokenKey, refreshToken);
  sessionStorage.setItem(tokenExpiryKey, String(Date.now() + Number(expiresIn) * 1000));
}

function toCloudUser(response: FirebaseAuthResponse): CloudUser {
  return { id: response.localId, email: response.email, name: response.displayName || response.email.split('@')[0] || 'Career Connect member' };
}

export async function createAccount(name: string, email: string, password: string): Promise<CloudUser> {
  const result = await firebaseRequest<FirebaseAuthResponse>('accounts:signUp', { email: email.trim(), password, returnSecureToken: true });
  const profile = await firebaseRequest<FirebaseAuthResponse>('accounts:update', { idToken: result.idToken, displayName: name.trim(), returnSecureToken: true });
  saveSession(profile.idToken, profile.refreshToken, profile.expiresIn);
  return toCloudUser(profile);
}

export async function signInWithEmail(email: string, password: string): Promise<CloudUser> {
  const result = await firebaseRequest<FirebaseAuthResponse>('accounts:signInWithPassword', { email: email.trim(), password, returnSecureToken: true });
  saveSession(result.idToken, result.refreshToken, result.expiresIn);
  return toCloudUser(result);
}

function loadFacebookSdk(): Promise<NonNullable<Window['FB']>> {
  if (!facebookAppId || !facebookGraphVersion) return Promise.reject(new Error('Facebook sign-in needs VITE_FACEBOOK_APP_ID and VITE_FACEBOOK_GRAPH_VERSION configured.'));
  if (window.FB) {
    window.FB.init({ appId: facebookAppId, cookie: false, xfbml: false, version: facebookGraphVersion });
    return Promise.resolve(window.FB);
  }
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-career-connect-facebook]');
    const script = existing ?? document.createElement('script');
    const timeout = window.setTimeout(() => reject(new Error('Facebook sign-in took too long to load. Please try again.')), 10000);
    window.fbAsyncInit = () => {
      window.clearTimeout(timeout);
      if (!window.FB) { reject(new Error('Could not initialize Facebook sign-in.')); return; }
      window.FB.init({ appId: facebookAppId, cookie: false, xfbml: false, version: facebookGraphVersion });
      resolve(window.FB);
    };
    if (!existing) {
      script.src = 'https://connect.facebook.net/en_US/sdk.js'; script.async = true; script.defer = true; script.crossOrigin = 'anonymous';
      script.dataset.careerConnectFacebook = 'true';
      script.onerror = () => { window.clearTimeout(timeout); reject(new Error('Could not load Facebook sign-in. Check your connection and try again.')); };
      document.head.appendChild(script);
    }
  });
}

export async function signInWithFacebook(): Promise<CloudUser> {
  const facebook = await loadFacebookSdk();
  const accessToken = await new Promise<string>((resolve, reject) => {
    facebook.login((response) => {
      const token = response.authResponse?.accessToken;
      if (token) resolve(token); else reject(new Error('Facebook sign-in was cancelled or not authorized.'));
    }, { scope: 'public_profile,email' });
  });
  const postBody = new URLSearchParams({ providerId: 'facebook.com', access_token: accessToken }).toString();
  const result = await firebaseRequest<FirebaseAuthResponse>('accounts:signInWithIdp', {
    postBody, requestUri: window.location.origin, returnIdpCredential: true, returnSecureToken: true,
  });
  saveSession(result.idToken, result.refreshToken, result.expiresIn);
  return toCloudUser(result);
}

async function refreshSession(): Promise<CloudUser | null> {
  const refreshToken = sessionStorage.getItem(refreshTokenKey);
  if (!refreshToken) return null;
  const key = requireFirebaseConfig();
  const response = await fetch(`https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(key)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
  });
  if (!response.ok) throw new Error('Session expired');
  const result = await response.json() as FirebaseRefreshResponse;
  saveSession(result.id_token, result.refresh_token, result.expires_in);
  return { id: result.user_id, email: result.email, name: result.email.split('@')[0] || 'Career Connect member' };
}

export async function restoreSession(): Promise<CloudUser | null> {
  if (!sessionStorage.getItem(refreshTokenKey)) return null;
  try { return await refreshSession(); } catch { signOut(); return null; }
}

export async function getIdToken(): Promise<string> {
  const token = sessionStorage.getItem(idTokenKey);
  const expiresAt = Number(sessionStorage.getItem(tokenExpiryKey) || 0);
  if (token && expiresAt > Date.now() + 60_000) return token;
  const user = await refreshSession();
  if (!user) throw new Error('Your sign-in session has expired. Please sign in again.');
  return sessionStorage.getItem(idTokenKey)!;
}

export function signOut() {
  sessionStorage.removeItem(refreshTokenKey);
  sessionStorage.removeItem(idTokenKey);
  sessionStorage.removeItem(tokenExpiryKey);
  localStorage.removeItem('cauayan_user_v2');
}

declare global {
  interface Window {
    FB?: {
      init: (options: { appId: string; cookie: boolean; xfbml: boolean; version: string }) => void;
      login: (callback: (response: { authResponse?: { accessToken?: string } }) => void, options: { scope: string }) => void;
    };
    fbAsyncInit?: () => void;
  }
}
