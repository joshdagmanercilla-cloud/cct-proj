type SupabaseUser = {
  id: string;
  email?: string;
  user_metadata?: { full_name?: string; name?: string };
  app_metadata?: Record<string, unknown>;
};

type AuthResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user?: SupabaseUser;
  error?: string;
  msg?: string;
  message?: string;
};

export type CloudUser = { id: string; email: string; name: string };

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const accessTokenKey = 'career_connect_supabase_access_token';
const refreshTokenKey = 'career_connect_supabase_refresh_token';
const tokenExpiryKey = 'career_connect_supabase_token_expiry';

function requireSupabaseConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase sign-in is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  return { url: supabaseUrl, anonKey: supabaseAnonKey };
}

async function authRequest<T extends AuthResponse>(path: string, body?: Record<string, unknown>): Promise<T> {
  const { url, anonKey } = requireSupabaseConfig();
  const response = await fetch(`${url}/auth/v1/${path}`, {
    method: body ? 'POST' : 'GET',
    headers: { apikey: anonKey, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const result = await response.json() as T;
  if (!response.ok) {
    const message = result.msg || result.message || result.error;
    throw new Error(message || 'Supabase sign-in failed. Please try again.');
  }
  return result;
}

function saveSession(accessToken: string, refreshToken: string, expiresIn = 3600) {
  sessionStorage.setItem(accessTokenKey, accessToken);
  sessionStorage.setItem(refreshTokenKey, refreshToken);
  sessionStorage.setItem(tokenExpiryKey, String(Date.now() + Number(expiresIn) * 1000));
}

function toCloudUser(user: SupabaseUser): CloudUser {
  const email = user.email || '';
  return {
    id: user.id,
    email,
    name: user.user_metadata?.full_name || user.user_metadata?.name || email.split('@')[0] || 'Career Connect member',
  };
}

function saveAuthResponse(response: AuthResponse) {
  if (response.access_token && response.refresh_token) {
    saveSession(response.access_token, response.refresh_token, response.expires_in);
  }
  return response.user ? toCloudUser(response.user) : null;
}

async function getCurrentUser(accessToken: string): Promise<CloudUser> {
  const { url, anonKey } = requireSupabaseConfig();
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error('Your sign-in session has expired. Please sign in again.');
  return toCloudUser(await response.json() as SupabaseUser);
}

function restoreOAuthCallback(): CloudUser | null {
  if (!window.location.hash) return null;
  const params = new URLSearchParams(window.location.hash.slice(1));
  const error = params.get('error_description') || params.get('error');
  if (error) {
    window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
    throw new Error(decodeURIComponent(error.replaceAll('+', ' ')));
  }
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  if (!accessToken || !refreshToken) return null;
  const expiresIn = Number(params.get('expires_in') || 3600);
  saveSession(accessToken, refreshToken, expiresIn);
  window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
  // The actual user is loaded asynchronously by restoreSession after this callback.
  return null;
}

export async function createAccount(name: string, email: string, password: string): Promise<CloudUser> {
  const result = await authRequest<AuthResponse>('signup', {
    email: email.trim(), password, data: { full_name: name.trim() },
  });
  const user = saveAuthResponse(result);
  if (user) return user;
  throw new Error('Check your email to confirm your Supabase account, then sign in.');
}

export async function signInWithEmail(email: string, password: string): Promise<CloudUser> {
  const result = await authRequest<AuthResponse>('token?grant_type=password', { email: email.trim(), password });
  const user = saveAuthResponse(result);
  if (!user) throw new Error('Sign-in did not return a user. Please try again.');
  return user;
}

export async function signInWithFacebook(): Promise<CloudUser> {
  const { url, anonKey } = requireSupabaseConfig();
  const redirectTo = `${window.location.origin}${window.location.pathname}`;
  const authorizeUrl = new URL(`${url}/auth/v1/authorize`);
  authorizeUrl.searchParams.set('provider', 'facebook');
  authorizeUrl.searchParams.set('redirect_to', redirectTo);
  // The redirect completes in the browser; this promise resolves only if navigation is blocked.
  window.location.assign(authorizeUrl.toString());
  void anonKey;
  return new Promise(() => undefined);
}

async function refreshSession(): Promise<CloudUser | null> {
  const refreshToken = sessionStorage.getItem(refreshTokenKey);
  if (!refreshToken) return null;
  const result = await authRequest<AuthResponse>('token?grant_type=refresh_token', { refresh_token: refreshToken });
  const user = saveAuthResponse(result);
  return user || null;
}

export async function restoreSession(): Promise<CloudUser | null> {
  restoreOAuthCallback();
  const accessToken = sessionStorage.getItem(accessTokenKey);
  const expiresAt = Number(sessionStorage.getItem(tokenExpiryKey) || 0);
  try {
    if (accessToken && expiresAt > Date.now() + 60_000) return await getCurrentUser(accessToken);
    return await refreshSession();
  } catch {
    signOut();
    return null;
  }
}

export async function getIdToken(): Promise<string> {
  const token = sessionStorage.getItem(accessTokenKey);
  const expiresAt = Number(sessionStorage.getItem(tokenExpiryKey) || 0);
  if (token && expiresAt > Date.now() + 60_000) return token;
  await refreshSession();
  const refreshedToken = sessionStorage.getItem(accessTokenKey);
  if (!refreshedToken) throw new Error('Your sign-in session has expired. Please sign in again.');
  return refreshedToken;
}

export function signOut() {
  sessionStorage.removeItem(accessTokenKey);
  sessionStorage.removeItem(refreshTokenKey);
  sessionStorage.removeItem(tokenExpiryKey);
  localStorage.removeItem('cauayan_user_v2');
}
