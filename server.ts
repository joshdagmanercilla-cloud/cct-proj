import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, 'dist');
const port = Number(process.env.PORT ?? 3000);

if (!fs.existsSync(distDir)) {
  throw new Error(
    `Build output not found at ${distDir}. Run \`bun run build\` before starting the app.`
  );
}

const app = express();

app.use(express.static(distDir));

app.get('/health', (_req, res) => {
  res.json({ ok: true, status: 'healthy' });
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
});
