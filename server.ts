import express, { type Request, type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, 'dist');
const port = Number(process.env.PORT ?? 3000);
const jwtSecret = process.env.JWT_SECRET;
const databaseUrl = process.env.DATABASE_URL;

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error('Set JWT_SECRET to a random secret of at least 32 characters.');
}
if (!databaseUrl) {
  throw new Error('Set DATABASE_URL to your persistent PostgreSQL connection string.');
}
if (!fs.existsSync(distDir)) {
  throw new Error(`Build output not found at ${distDir}. Run \`bun run build\` before starting the app.`);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  max: 10
});
const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const cookieName = 'cct_session';
const sessionLifetimeSeconds = 60 * 60 * 24 * 7;

app.disable('x-powered-by');
app.use(express.json({ limit: '20kb' }));

const createToken = (userId: string): string => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ sub: userId, exp: Math.floor(Date.now() / 1000) + sessionLifetimeSeconds })).toString('base64url');
  const unsigned = `${header}.${payload}`;
  const signature = createHmac('sha256', jwtSecret).update(unsigned).digest('base64url');
  return `${unsigned}.${signature}`;
};

const verifyToken = (token: string): string | null => {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const unsigned = `${parts[0]}.${parts[1]}`;
  const expected = createHmac('sha256', jwtSecret).update(unsigned).digest();
  let received: Buffer;
  try {
    received = Buffer.from(parts[2], 'base64url');
  } catch {
    return null;
  }
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString()) as { sub?: unknown; exp?: unknown };
    if (typeof payload.sub !== 'string' || typeof payload.exp !== 'number' || payload.exp <= Date.now() / 1000) return null;
    return payload.sub;
  } catch {
    return null;
  }
};

const getSessionUserId = (req: Request): string | null => {
  const cookieHeader = req.headers.cookie ?? '';
  const tokenCookie = cookieHeader.split(';').map(value => value.trim()).find(value => value.startsWith(`${cookieName}=`));
  if (!tokenCookie) return null;
  try {
    return verifyToken(decodeURIComponent(tokenCookie.slice(cookieName.length + 1)));
  } catch {
    return null;
  }
};

const setSessionCookie = (res: Response, userId: string) => {
  res.cookie(cookieName, createToken(userId), {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: sessionLifetimeSeconds * 1000
  });
};

const clearSessionCookie = (res: Response) => {
  res.clearCookie(cookieName, { httpOnly: true, secure: isProduction, sameSite: 'lax', path: '/' });
};

const publicUserSelect = 'SELECT id, name, email, phone, role, company_name, created_at FROM users';
const authenticatedUserSelect = 'SELECT id, name, email, phone, role, company_name, password_hash, created_at FROM users';

const toPublicUser = (row: Record<string, unknown>) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone ?? '',
  role: row.role,
  companyName: row.company_name ?? undefined,
  isResidentVerified: false,
  verificationStatus: 'none'
});

const initializeDatabase = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(320) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      phone VARCHAR(32) NOT NULL DEFAULT '',
      role VARCHAR(16) NOT NULL CHECK (role IN ('jobseeker', 'employer')),
      company_name VARCHAR(160),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
};

app.post('/api/auth/signup', async (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const role = req.body?.role === 'employer' ? 'employer' : req.body?.role === 'jobseeker' ? 'jobseeker' : null;

  if (name.length < 2 || name.length > 100) return res.status(400).json({ error: 'Enter a name between 2 and 100 characters.' });
  if (email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
  if (password.length < 8 || password.length > 72) return res.status(400).json({ error: 'Password must be between 8 and 72 characters.' });
  if (!role) return res.status(400).json({ error: 'Choose a valid account type.' });

  try {
    const id = randomUUID();
    const passwordHash = await bcrypt.hash(password, 12);
    const companyName = role === 'employer' ? `${name} Enterprises` : null;
    const result = await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role, company_name)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, phone, role, company_name, created_at`,
      [id, name, email, passwordHash, role, companyName]
    );
    setSessionCookie(res, id);
    return res.status(201).json({ user: toPublicUser(result.rows[0]) });
  } catch (error) {
    if ((error as { code?: string }).code === '23505') return res.status(409).json({ error: 'An account with that email already exists. Please log in.' });
    console.error('Signup failed:', error);
    return res.status(500).json({ error: 'Could not create your account. Please try again.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!email || !password || password.length > 72) return res.status(400).json({ error: 'Enter your email and password.' });

  try {
    const result = await pool.query(`${authenticatedUserSelect} WHERE email = $1 LIMIT 1`, [email]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Email or password is incorrect.' });
    }
    setSessionCookie(res, String(user.id));
    return res.json({ user: toPublicUser(user) });
  } catch (error) {
    console.error('Login failed:', error);
    return res.status(500).json({ error: 'Could not sign in right now. Please try again.' });
  }
});

app.get('/api/auth/session', async (req, res) => {
  const userId = getSessionUserId(req);
  if (!userId) return res.status(401).json({ error: 'Not signed in.' });
  try {
    const result = await pool.query(`${publicUserSelect} WHERE id = $1 LIMIT 1`, [userId]);
    if (!result.rows[0]) {
      clearSessionCookie(res);
      return res.status(401).json({ error: 'Session is no longer valid.' });
    }
    return res.json({ user: toPublicUser(result.rows[0]) });
  } catch (error) {
    console.error('Session lookup failed:', error);
    return res.status(500).json({ error: 'Could not restore your session.' });
  }
});

app.post('/api/auth/logout', (_req, res) => {
  clearSessionCookie(res);
  return res.json({ ok: true });
});

app.get('/health', (_req, res) => res.json({ ok: true, status: 'healthy' }));
app.use(express.static(distDir));
app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')));

initializeDatabase().then(() => {
  app.listen(port, '0.0.0.0', () => console.log(`Server is running on http://0.0.0.0:${port}`));
}).catch(error => {
  console.error('Could not initialize authentication database:', error);
  process.exit(1);
});
