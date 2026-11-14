import { createSign } from 'node:crypto';

export type AuthenticatedUser = { uid: string; email: string; displayName: string; customAttributes: Record<string, unknown> };
export type FirestoreDocument = Record<string, unknown>;

type ServiceAccount = { project_id: string; client_email: string; private_key: string };
let cachedAccessToken: { value: string; expiresAt: number } | null = null;

function base64Url(value: string | Buffer) {
  return Buffer.from(value).toString('base64url');
}

function serviceAccount(): ServiceAccount {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('Firestore is not configured: set FIREBASE_SERVICE_ACCOUNT_JSON on the server.');
  const account = JSON.parse(raw) as ServiceAccount;
  if (!account.project_id || !account.client_email || !account.private_key) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is missing project_id, client_email, or private_key.');
  }
  return account;
}

async function googleAccessToken() {
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60_000) return cachedAccessToken.value;
  const account = serviceAccount();
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${base64Url(JSON.stringify({
    iss: account.client_email,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }))}`;
  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  const assertion = `${unsigned}.${signer.sign(account.private_key).toString('base64url')}`;
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
  });
  const payload = await response.json() as { access_token?: string; expires_in?: number; error_description?: string };
  if (!response.ok || !payload.access_token) throw new Error(payload.error_description || 'Could not obtain Google Cloud access token.');
  cachedAccessToken = { value: payload.access_token, expiresAt: Date.now() + (payload.expires_in ?? 3600) * 1000 };
  return payload.access_token;
}

export async function verifyFirebaseIdToken(idToken: string): Promise<AuthenticatedUser> {
  const apiKey = process.env.FIREBASE_WEB_API_KEY;
  if (!apiKey) throw new Error('Authentication is not configured: set FIREBASE_WEB_API_KEY on the server.');
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  const payload = await response.json() as { users?: Array<{ localId: string; email?: string; displayName?: string; customAttributes?: string }> };
  const user = payload.users?.[0];
  if (!response.ok || !user?.localId) throw new Error('Invalid or expired sign-in session. Please sign in again.');
  let customAttributes: Record<string, unknown> = {};
  try { customAttributes = JSON.parse(user.customAttributes || '{}'); } catch { /* malformed custom claims are treated as no privileges */ }
  return { uid: user.localId, email: user.email || '', displayName: user.displayName || '', customAttributes };
}

function encodeValue(value: unknown): Record<string, unknown> {
  if (value === null) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encodeValue) } };
  if (typeof value === 'object') return { mapValue: { fields: encodeFields(value as Record<string, unknown>) } };
  return { nullValue: null };
}

function encodeFields(fields: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, encodeValue(value)]));
}

function decodeValue(value: Record<string, any>): unknown {
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if (value.arrayValue) return (value.arrayValue.values || []).map(decodeValue);
  if (value.mapValue) return decodeFields(value.mapValue.fields || {});
  return null;
}

function decodeFields(fields: Record<string, Record<string, any>>) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, decodeValue(value)]));
}

async function firestoreRequest(path: string, init: RequestInit = {}) {
  const projectId = serviceAccount().project_id;
  const response = await fetch(`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${await googleAccessToken()}`, 'Content-Type': 'application/json', ...init.headers },
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Firestore request failed (${response.status}): ${detail.slice(0, 300)}`);
  }
  if (response.status === 204) return null;
  return response.json() as Promise<any>;
}

export async function getDocument(collection: string, id: string): Promise<FirestoreDocument | null> {
  const result = await firestoreRequest(`${collection}/${encodeURIComponent(id)}`);
  return result ? { id: result.name.split('/').at(-1), ...decodeFields(result.fields || {}) } : null;
}

export async function putDocument(collection: string, id: string, fields: FirestoreDocument) {
  const result = await firestoreRequest(`${collection}/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ fields: encodeFields(fields) }),
  });
  return result ? { id: result.name.split('/').at(-1), ...decodeFields(result.fields || {}) } : null;
}

export async function listDocuments(collection: string): Promise<FirestoreDocument[]> {
  const result = await firestoreRequest(`${collection}?pageSize=100`);
  return (result?.documents || []).map((document: any) => ({
    id: document.name.split('/').at(-1),
    ...decodeFields(document.fields || {}),
  }));
}
