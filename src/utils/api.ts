const TOKEN_KEY = 'cauayan_auth_token_v3';

export function getAuthToken(): string {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function setAuthToken(token: string): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(url, { ...options, headers });
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();

  if (!res.ok) {
    const msg =
      typeof data === 'object' && data && 'error' in data
        ? String((data as { error: unknown }).error)
        : `Request failed (${res.status})`;
    throw new ApiError(msg, res.status);
  }
  return data as T;
}

export async function uploadSecureFile(file: File): Promise<{
  fileId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  previewUrl: string;
}> {
  const formData = new FormData();
  formData.append('file', file);
  return apiRequest('/api/upload', {
    method: 'POST',
    body: formData,
  });
}
