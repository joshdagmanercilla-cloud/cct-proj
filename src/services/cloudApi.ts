import { getIdToken } from './cloudAuth';

export type CloudProfile = { id: string; email: string; name: string; role: string };
export type CloudJob = {
  id: string | number;
  title: string;
  company: string;
  location: string;
  description: string;
  category?: string;
  salary?: string;
  arrangement?: 'On-site' | 'Hybrid' | 'Remote';
  status?: string;
};
export type CloudApplication = {
  id: string;
  jobId: string | number;
  jobTitle: string;
  company: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  coverNote?: string;
  status: string;
  createdAt: string;
};
export type CloudBootstrap = { jobs: CloudJob[]; applications: CloudApplication[]; profile: CloudProfile };

async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const idToken = await getIdToken();
  const response = await fetch(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${idToken}`,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });
  const payload = await response.json().catch(() => ({})) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error || `Request failed (${response.status}).`);
  return payload;
}

export const loadCloudData = () => apiRequest<CloudBootstrap>('/api/bootstrap');
export const saveCloudProfile = (name: string) => apiRequest<{ profile: CloudProfile }>('/api/profile', {
  method: 'PUT', body: JSON.stringify({ name }),
});
export const submitCloudApplication = (application: {
  jobId: string | number;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  coverNote?: string;
}) => apiRequest<{ application: CloudApplication }>('/api/applications', {
  method: 'POST', body: JSON.stringify(application),
});
export const createCloudJob = (job: {
  title: string;
  company: string;
  location: string;
  description: string;
  category?: string;
  salary?: string;
  arrangement?: 'On-site' | 'Hybrid' | 'Remote';
}) => apiRequest<{ job: CloudJob }>('/api/jobs', {
  method: 'POST', body: JSON.stringify(job),
});
