import React, { useState } from 'react';
import { Code2, Copy, Check, ShieldCheck } from 'lucide-react';

export const RemediationGuide: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const rlsSql = `-- Supabase Postgres example. See supabase/schema.sql for the complete schema.
alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;

create policy "Read published jobs" on public.jobs
  for select using (status = 'published');

create policy "Employers create their own jobs" on public.jobs
  for insert to authenticated with check (
    owner_id = auth.uid()
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'employer'
  );

create policy "Applicants read their own applications" on public.applications
  for select to authenticated using (user_id = auth.uid());

create policy "Applicants submit their own applications" on public.applications
  for insert to authenticated with check (user_id = auth.uid());`;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(rlsSql);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white shadow-xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
          <Code2 className="h-3.5 w-3.5" /> SUPABASE DEPLOYMENT GUIDE
        </div>
        <h2 className="mt-2 text-2xl font-black tracking-tight">Database and launch safeguards</h2>
        <p className="mt-1 max-w-3xl text-sm text-slate-300">Use <code>supabase/schema.sql</code> as the source of truth for this app’s tables and row-level access policies.</p>
      </header>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-100 p-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-700" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Supabase Postgres RLS example</h3>
              <p className="text-xs text-slate-500">Policies complement, but do not replace, server-side validation.</p>
            </div>
          </div>
          <button type="button" onClick={copyToClipboard} className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy SQL'}
          </button>
        </div>
        <pre className="overflow-x-auto bg-slate-950 p-4 text-xs text-emerald-300">{rlsSql}</pre>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
        <h3 className="font-bold">Before production</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Keep the Supabase service-role key server-only; user-scoped database operations should use the caller’s access token and RLS.</li>
          <li>Keep identity documents in a private Storage bucket with upload limits, scanning, retention controls, and expiring signed downloads.</li>
          <li>Never mark payments complete in client code; verify signed, idempotent payment webhooks on the server.</li>
          <li>Run integration tests and complete a security/privacy review before handling real personal data.</li>
        </ul>
      </section>
    </div>
  );
};
