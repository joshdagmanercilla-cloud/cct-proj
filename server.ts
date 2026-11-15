import express, { NextFunction, Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import {
  createApplication, createJob, getJob, getProfile, listApplications, listPublishedJobs,
  SupabaseRow, upsertProfile, verifySupabaseAccessToken,
} from './server/supabase';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, 'dist');
const port = Number(process.env.PORT ?? 3000);
const app = express();

app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});
app.use(express.json({ limit: '1mb' }));

const rateCounts = new Map<string, { count: number; resetAt: number }>();
app.use('/api', (req, res, next) => {
  const now = Date.now();
  const key = req.ip || 'unknown';
  const current = rateCounts.get(key);
  if (!current || current.resetAt <= now) rateCounts.set(key, { count: 1, resetAt: now + 60_000 });
  else if (current.count >= 120) {
    res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
    return;
  } else current.count += 1;
  next();
});

type ApiRequest = Request & { user?: Awaited<ReturnType<typeof verifySupabaseAccessToken>>; accessToken?: string };
async function requireUser(req: ApiRequest, res: Response, next: NextFunction) {
  const authorization = req.header('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) {
    res.status(401).json({ error: 'Sign in is required.' });
    return;
  }
  try {
    req.user = await verifySupabaseAccessToken(token);
    req.accessToken = token;
    next();
  } catch (error) {
    res.status(401).json({ error: error instanceof Error ? error.message : 'Invalid sign-in session.' });
  }
}

function cleanString(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function apiProfile(row: SupabaseRow) {
  return { id: row.id, email: row.email, name: row.name, role: row.role };
}
function apiJob(row: SupabaseRow) {
  return {
    id: row.id, title: row.title, company: row.company, location: row.location, description: row.description,
    category: row.category, salary: row.salary, arrangement: row.arrangement, status: row.status,
  };
}
function apiApplication(row: SupabaseRow) {
  return {
    id: row.id, jobId: row.job_id, jobTitle: row.job_title, company: row.company,
    applicantName: row.applicant_name, applicantEmail: row.applicant_email,
    applicantPhone: row.applicant_phone, coverNote: row.cover_note, status: row.status,
    createdAt: row.created_at,
  };
}

app.get('/health', (_req, res) => res.json({ ok: true, status: 'healthy' }));

app.get('/api/bootstrap', requireUser, async (req: ApiRequest, res) => {
  try {
    const user = req.user!;
    const token = req.accessToken!;
    const [jobs, applications, profile] = await Promise.all([
      listPublishedJobs(token), listApplications(token, user.uid), getProfile(token, user.uid),
    ]);
    res.json({
      jobs: jobs.map(apiJob),
      applications: applications.map(apiApplication),
      profile: profile ? apiProfile(profile) : { id: user.uid, email: user.email, name: user.displayName, role: 'jobseeker' },
    });
  } catch (error) {
    console.error('bootstrap_failed', error);
    res.status(503).json({ error: 'Could not load cloud data. Please try again.' });
  }
});

app.put('/api/profile', requireUser, async (req: ApiRequest, res) => {
  const user = req.user!;
  const name = cleanString(req.body?.name, 100) || user.displayName || user.email.split('@')[0];
  try {
    const profile = await upsertProfile(req.accessToken!, {
      id: user.uid, email: user.email, name, updated_at: new Date().toISOString(),
    });
    res.json({ profile: profile ? apiProfile(profile) : null });
  } catch (error) {
    console.error('profile_save_failed', error);
    res.status(503).json({ error: 'Could not save your profile.' });
  }
});

app.post('/api/applications', requireUser, async (req: ApiRequest, res) => {
  const user = req.user!;
  const token = req.accessToken!;
  const jobId = cleanString(String(req.body?.jobId ?? ''), 100);
  const job = jobId ? await getJob(token, jobId) : null;
  if (!job || job.status !== 'published') {
    res.status(400).json({ error: 'Choose a valid job listing.' });
    return;
  }
  const applicantName = cleanString(req.body?.applicantName, 100);
  const applicantEmail = cleanString(req.body?.applicantEmail, 254).toLowerCase();
  const applicantPhone = cleanString(req.body?.applicantPhone, 20);
  const coverNote = cleanString(req.body?.coverNote, 2000);
  if (applicantName.length < 2 || !/^\S+@\S+\.\S+$/.test(applicantEmail) || !/^(09|\+639)\d{9}$/.test(applicantPhone.replace(/[\s-]/g, ''))) {
    res.status(400).json({ error: 'Check your name, email, and Philippine mobile number.' });
    return;
  }
  try {
    const row: SupabaseRow = {
      id: `APP-${randomUUID()}`, user_id: user.uid, job_id: jobId,
      job_title: cleanString(job.title, 160), company: cleanString(job.company, 160),
      applicant_name: applicantName, applicant_email: applicantEmail, applicant_phone: applicantPhone,
      cover_note: coverNote, status: 'Submitted',
    };
    const application = await createApplication(token, row);
    res.status(201).json({ application: application ? apiApplication(application) : null });
  } catch (error) {
    console.error('application_create_failed', error);
    res.status(503).json({ error: 'Could not submit your application. Please try again.' });
  }
});

app.post('/api/jobs', requireUser, async (req: ApiRequest, res) => {
  const user = req.user!;
  if (user.appMetadata.role !== 'employer') {
    res.status(403).json({ error: 'Employer access must be approved by an administrator.' });
    return;
  }
  const title = cleanString(req.body?.title, 160);
  const company = cleanString(req.body?.company, 160);
  const location = cleanString(req.body?.location, 160);
  const description = cleanString(req.body?.description, 5000);
  if (!title || !company || !location || !description) {
    res.status(400).json({ error: 'Job title, company, location, and description are required.' });
    return;
  }
  try {
    const row: SupabaseRow = {
      owner_id: user.uid, title, company, location, description,
      category: cleanString(req.body?.category, 100), salary: cleanString(req.body?.salary, 100),
      arrangement: ['On-site', 'Hybrid', 'Remote'].includes(req.body?.arrangement) ? req.body.arrangement : 'On-site',
      status: 'pending_review',
    };
    const job = await createJob(req.accessToken!, row);
    res.status(201).json({ job: job ? apiJob(job) : null });
  } catch (error) {
    console.error('job_create_failed', error);
    res.status(503).json({ error: 'Could not save this job listing.' });
  }
});

app.use('/api', (_req, res) => res.status(404).json({ error: 'API route not found.' }));

if (!fs.existsSync(distDir)) {
  throw new Error(`Build output not found at ${distDir}. Run \`bun run build\` before starting the app.`);
}
app.use(express.static(distDir));
app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
app.listen(port, '0.0.0.0', () => console.log(`Server is running on http://0.0.0.0:${port}`));
