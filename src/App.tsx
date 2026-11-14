import React from 'react';
import { HardenedApp } from './components/HardenedApp';
import { CloudAuthGate } from './components/CloudAuthGate';
import { DemoNotice } from './components/DemoNotice';

export default function App() {
  return (
    <CloudAuthGate>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased selection:bg-emerald-500 selection:text-white">
        <DemoNotice />
        <HardenedApp />
      </div>
    </CloudAuthGate>
  );
}
