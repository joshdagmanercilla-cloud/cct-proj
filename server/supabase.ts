import { createClient } from './supabase';

export type AuthenticatedUser = {
  uid: string;
  email: string;
  displayName: string;
  appMetadata: Record<string, unknown>;
};
export type SupabaseRow = Record<string, unknown>;

function requireServiceConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error('Supabase server is not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }
  return { url, serviceRoleKey };
}

async function restRequest(path: string, init: RequestInit = {}) {
  const { url, serviceRoleKey } = requireServiceConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${detail.slice(0, 300)}`);
  }
  if (response.status === 204) return null;
  return response.json() as Promise<any>;
}

export async function verifySupabaseAccessToken(accessToken: string): Promise<AuthenticatedUser> {
  const { url, serviceRoleKey } = requireServiceConfig();
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: serviceRoleKey, Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error('Invalid or expired sign-in session. Please sign in again.');
  const user = await response.json() as {
    id?: string;
    email?: string;
    user_metadata?: { full_name?: string; name?: string };
    app_metadata?: Record<string, unknown>;
  };
  if (!user.id) throw new Error('Invalid sign-in session. Please sign in again.');
  return {
    uid: user.id,
    email: user.email || '',
    displayName: user.user_metadata?.full_name || user.user_metadata?.name || '',
    appMetadata: user.app_metadata || {},
  };
}

export async function getProfile(id: string): Promise<SupabaseRow | null> {
  const rows = await restRequest(`profiles?select=*&id=eq.${encodeURIComponent(id)}&limit=1`);
  return rows?.[0] || null;
}

export async function upsertProfile(row: SupabaseRow): Promise<SupabaseRow | null> {
  const rows = await restRequest('profiles?on_conflict=id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify(row),
  });
  return rows?.[0] || null;
}

export async function getJob(id: string): Promise<SupabaseRow | null> {
  const rows = await restRequest(`jobs?select=*&id=eq.${encodeURIComponent(id)}&limit=1`);
  return rows?.[0] || null;
}

export async function listPublishedJobs(): Promise<SupabaseRow[]> {
  return await restRequest('jobs?select=*&status=eq.published&order=created_at.desc&limit=100') || [];
}

export async function listApplications(userId: string): Promise<SupabaseRow[]> {
  return await restRequest(`applications?select=*&user_id=eq.${encodeURIComponent(userId)}&order=created_at.desc&limit=100`) || [];
}

export async function createApplication(row: SupabaseRow): Promise<SupabaseRow | null> {
  const rows = await restRequest('applications', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(row),
  });
  return rows?.[0] || null;
}

export async function createJob(row: SupabaseRow): Promise<SupabaseRow | null> {
  const rows = await restRequest('jobs', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(row),
  });
  return rows?.[0] || null;
}
