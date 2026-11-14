import React from 'react';
import { LogOut } from 'lucide-react';
import { CloudAuthGate } from './components/CloudAuthGate';
import { DemoNotice } from './components/DemoNotice';
import { HardenedApp } from './components/HardenedApp';
import { signOut } from './services/cloudAuth';

function SignedInApp() {
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('cauayan_user_v2') || 'null') as { email?: string } | null; }
    catch { return null; }
  })();

  return (
    <>
      <div className="fixed right-3 top-3 z-[60] flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/90 py-1.5 pl-3 pr-1.5 text-[11px] text-white shadow-lg backdrop-blur sm:right-5 sm:top-5">
        <span className="max-w-[42vw] truncate text-slate-200">Signed in{user?.email ? ` · ${user.email}` : ''}</span>
        <button type="button" onClick={() => { signOut(); window.location.reload(); }} className="inline-flex min-h-8 items-center gap-1 rounded-full bg-white/10 px-2.5 font-bold transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400">
          <LogOut aria-hidden="true" className="h-3.5 w-3.5" /> Sign out
        </button>
      </div>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased selection:bg-emerald-500 selection:text-white">
        <DemoNotice />
        <HardenedApp />
      </div>
    </>
  );
}

export default function App() {
  return <CloudAuthGate><SignedInApp /></CloudAuthGate>;
}
