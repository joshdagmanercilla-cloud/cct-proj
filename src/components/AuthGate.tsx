import React, { useEffect, useState } from 'react';
import type { UserProfile, UserRole } from '../types';

interface AuthGateProps {
  children: React.ReactNode;
}

const emptyForm = { name: '', email: '', password: '', role: 'jobseeker' as UserRole };

export const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const acceptUser = (profile: UserProfile) => {
    // The existing app reads its current profile during startup; this mirrors the
    // authenticated profile for UI compatibility, not as an auth credential.
    localStorage.setItem('cauayan_user_v2', JSON.stringify(profile));
    setUser(profile);
  };

  useEffect(() => {
    let active = true;
    fetch('/api/auth/session')
      .then(async response => {
        if (!response.ok) return null;
        const data = await response.json();
        return data.user as UserProfile;
      })
      .then(profile => {
        if (active && profile) acceptUser(profile);
      })
      .catch(() => {
        if (active) setError('Could not reach the sign-in service. Check the server configuration and try again.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, []);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const response = await fetch(isSignUp ? '/api/auth/signup' : '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(isSignUp ? { name: form.name, role: form.role } : {}),
          email: form.email,
          password: form.password
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Authentication failed.');
      acceptUser(data.user as UserProfile);
      setForm(emptyForm);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('cauayan_user_v2');
      setUser(null);
      setForm(emptyForm);
    }
  };

  if (isLoading) {
    return <main className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">Loading your secure session…</main>;
  }

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-950 p-4">
        <section className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl">
          <div className="mb-6">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Cauayan City Career Connect</div>
            <h1 className="mt-2 text-2xl font-black text-slate-900">{isSignUp ? 'Create your account' : 'Welcome back'}</h1>
            <p className="mt-1 text-sm text-slate-500">{isSignUp ? 'Your account will work on any device.' : 'Sign in with the email and password you registered with.'}</p>
          </div>
          {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
          <form onSubmit={submit} className="space-y-4">
            {isSignUp && <>
              <label className="block text-sm font-semibold text-slate-700">Full name
                <input required minLength={2} maxLength={100} autoComplete="name" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 p-3 font-normal focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">Account type
                <select value={form.role} onChange={event => setForm({ ...form, role: event.target.value as UserRole })} className="mt-1 w-full rounded-xl border border-slate-300 p-3 font-normal focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="jobseeker">Fresh graduate / Jobseeker</option>
                  <option value="employer">Local employer / Business</option>
                </select>
              </label>
            </>}
            <label className="block text-sm font-semibold text-slate-700">Email address
              <input required type="email" autoComplete="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 p-3 font-normal focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </label>
            <label className="block text-sm font-semibold text-slate-700">Password
              <input required type="password" minLength={isSignUp ? 8 : undefined} maxLength={72} autoComplete={isSignUp ? 'new-password' : 'current-password'} value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 p-3 font-normal focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              {isSignUp && <span className="mt-1 block text-xs font-normal text-slate-500">Use 8–72 characters.</span>}
            </label>
            <button disabled={isSubmitting} className="w-full rounded-xl bg-emerald-700 p-3 font-bold text-white hover:bg-emerald-600 disabled:opacity-60">
              {isSubmitting ? 'Please wait…' : isSignUp ? 'Create Account' : 'Log In'}
            </button>
          </form>
          <p className="mt-5 text-center text-sm text-slate-600">
            {isSignUp ? 'Already have an account? ' : 'New to Career Connect? '}
            <button type="button" onClick={() => { setError(''); setIsSignUp(!isSignUp); }} className="font-bold text-emerald-700 hover:underline">
              {isSignUp ? 'Log in' : 'Create account'}
            </button>
          </p>
        </section>
      </main>
    );
  }

  return <>
    <div className="flex items-center justify-between gap-3 bg-emerald-950 px-4 py-2 text-white">
      <span className="truncate text-xs sm:text-sm">Signed in as <strong>{user.email}</strong></span>
      <button onClick={logout} className="shrink-0 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold hover:bg-white/20">Sign out</button>
    </div>
    {children}
  </>;
};
