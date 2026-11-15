import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export type AuthenticatedUser = {
  uid: string;
  email: string;
  displayName: string;
  appMetadata: Record<string, unknown>;
};
export type SupabaseRow = Record<string, unknown>;

function config() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !serviceRoleKey || !anonKey) {
    throw new Error('Supabase server config requires SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY.');
  }
  return { url, serviceRoleKey, anonKey };
}

function userClient(accessToken: string): SupabaseClient {
  const { url, anonKey } = config();
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

export async function verifySupabaseAccessToken(accessToken: string): Promise<AuthenticatedUser> {
  const { url, serviceRoleKey } = config();
  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await admin.auth.getUser(accessToken);
  if (error || !data.user) throw new Error('Invalid or expired sign-in session. Please sign in again.');
  return {
    uid: data.user.id,
    email: data.user.email || '',
    displayName: String(data.user.user_metadata?.full_name || data.user.user_metadata?.name || ''),
    appMetadata: data.user.app_metadata || {},
  };
}

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(`Supabase request failed: ${error.message}`);
}

function appRole(appMetadata: Record<string, unknown>) {
  return typeof appMetadata.role === 'string' && ['employer', 'verifier', 'admin'].includes(appMetadata.role)
    ? appMetadata.role
    : 'jobseeker';
}

export async function getProfile(accessToken: string, id: string): Promise<SupabaseRow | null> {
  const { data, error } = await userClient(accessToken).from('profiles').select('*').eq('id', id).maybeSingle();
  throwIfError(error);
  return data as SupabaseRow | null;
}

export async function upsertProfile(accessToken: string, row: SupabaseRow): Promise<SupabaseRow | null> {
  const { data, error } = await userClient(accessToken).from('profiles').upsert(row, { onConflict: 'id' }).select().single();
  throwIfError(error);
  return data as SupabaseRow;
}

export async function getJob(accessToken: string, id: string): Promise<SupabaseRow | null> {
  const { data, error } = await userClient(accessToken).from('jobs').select('*').eq('id', id).maybeSingle();
  throwIfError(error);
  return data as SupabaseRow | null;
}

export async function listPublishedJobs(accessToken: string): Promise<SupabaseRow[]> {
  const { data, error } = await userClient(accessToken).from('jobs').select('*')
    .eq('status', 'published').order('created_at', { ascending: false }).limit(100);
  throwIfError(error);
  return (data || []) as SupabaseRow[];
}

export async function listApplications(accessToken: string, userId: string): Promise<SupabaseRow[]> {
  const { data, error } = await userClient(accessToken).from('applications').select('*')
    .eq('user_id', userId).order('created_at', { ascending: false }).limit(100);
  throwIfError(error);
  return (data || []) as SupabaseRow[];
}

export async function createApplication(accessToken: string, row: SupabaseRow): Promise<SupabaseRow | null> {
  const { data, error } = await userClient(accessToken).from('applications').insert(row).select().single();
  throwIfError(error);
  return data as SupabaseRow;
}

export async function createJob(accessToken: string, row: SupabaseRow): Promise<SupabaseRow | null> {
  const { data, error } = await userClient(accessToken).from('jobs').insert(row).select().single();
  throwIfError(error);
  return data as SupabaseRow;
}

export async function uploadPrivateDocument(accessToken: string, userId: string, fileName: string, file: Buffer, contentType: string) {
  const safeName = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `${userId}/${Date.now()}-${safeName}`;
  const { url, anonKey } = config();
  const response = await fetch(`${url}/storage/v1/object/verification-documents/${storagePath}`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': contentType,
      'x-upsert': 'false',
    },
    body: new Uint8Array(file),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase Storage upload failed (${response.status}): ${detail.slice(0, 250)}`);
  }
  return storagePath;
}

export function maxDocumentBytes() {
  return Number(process.env.MAX_VERIFICATION_UPLOAD_BYTES || 5 * 1024 * 1024);
}

export function getRole(user: AuthenticatedUser) {
  return appRole(user.appMetadata);
}

export function loadEnvironmentFile() {
  // dotenv is loaded by the application entrypoint; this exists for type-safe config references only.
  return readFileSync;
}
