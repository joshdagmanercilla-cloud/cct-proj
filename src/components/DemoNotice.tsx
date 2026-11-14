import React from 'react';
import { ArrowDown, FlaskConical, ShieldAlert } from 'lucide-react';

export const DemoNotice: React.FC = () => (
  <aside
    aria-labelledby="demo-notice-title"
    className="relative z-40 border-b border-amber-300 bg-gradient-to-r from-amber-50 via-white to-emerald-50 px-4 py-3 text-slate-800 shadow-sm sm:px-6"
  >
    <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800 ring-1 ring-amber-200">
          <FlaskConical aria-hidden="true" className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="demo-notice-title" className="text-sm font-extrabold tracking-tight text-slate-950">
              Preview mode — sample data only
            </h2>
            <span className="rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-900">
              Not a live service
            </span>
          </div>
          <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-700 sm:text-sm">
            This prototype stores demo activity in this browser. Sign-in, job applications, residency checks, document uploads, and payments are not connected to live services. Please don’t enter real personal, identity, resume, or payment information.
          </p>
          <details className="mt-2 text-xs text-slate-600">
            <summary className="inline-flex min-h-8 cursor-pointer items-center gap-1 font-semibold text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">
              <ShieldAlert aria-hidden="true" className="h-3.5 w-3.5 text-amber-700" />
              What this preview does and doesn’t do
            </summary>
            <p className="mt-1 max-w-3xl leading-relaxed">
              You can explore sample job listings and the interface. A confirmation shown in this preview is not proof of a real account, application delivery, residency approval, or completed transaction.
            </p>
          </details>
        </div>
      </div>
      <a
        href="#jobs"
        className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 sm:self-center"
      >
        Explore sample jobs
        <ArrowDown aria-hidden="true" className="h-4 w-4" />
      </a>
    </div>
  </aside>
);
