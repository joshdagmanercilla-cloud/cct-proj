import { requireSupabase } from './supabase';

export type CloudUser = { id: string; email: string; name: string };

function toCloudUser(user: {
  id: string;
  email?: string;
  user_metadata?: { full_name?: string; name?: string };
}): CloudUser {
  const email = user.email || '';
  return {
    id: user.id,
    email,
    name: user.user_metadata?.full_name || user.user_metadata?.name || email.split('@')[0] || 'Career Connect member',
  };
}

export async function createAccount(name: string, email: string, password: string): Promise<CloudUser> {
  const { data, error } = await requireSupabase().auth.signUp({
    email: email.trim(), password, options: { data: { full_name: name.trim() } },
  });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Supabase did not return an account. Please try again.');
  if (!data.session) throw new Error('Check your email to confirm your Supabase account, then sign in.');
  return toCloudUser(data.user);
}

export async function signInWithEmail(email: string, password: string): Promise<CloudUser> {
  const { data, error } = await requireSupabase().auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Supabase did not return a user. Please try again.');
  return toCloudUser(data.user);
}

export async function signInWithFacebook(): Promise<CloudUser> {
  const { error } = await requireSupabase().auth.signInWithOAuth({
    provider: 'facebook',
    options: { redirectTo: `${window.location.origin}${window.location.pathname}` },
  });
  if (error) throw new Error(error.message);
  // OAuth redirects the browser; this keeps the form's working state until navigation.
  return new Promise(() => undefined);
}

export async function restoreSession(): Promise<CloudUser | null> {
  try {
    const client = requireSupabase();
    const { data, error } = await client.auth.getSession();
    if (error || !data.session) return null;
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData.user) {
      await client.auth.signOut();
      return null;
    }
    return toCloudUser(userData.user);
  } catch {
    // Missing public config should leave the gate usable and show configuration errors on submit.
    return null;
  }
}

export async function getIdToken(): Promise<string> {
  const { data, error } = await requireSupabase().auth.getSession();
  if (error || !data.session?.access_token) {
    throw new Error('Your sign-in session has expired. Please sign in again.');
  }
  return data.session.access_token;
}

export async function signOut(): Promise<void> {
  const { error } = await requireSupabase().auth.signOut();
  if (error) throw new Error(error.message);
  localStorage.removeItem('cauayan_user_v2');
}
