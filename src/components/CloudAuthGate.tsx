import React, { FormEvent, useEffect, useState } from 'react';
import { ArrowRight, BriefcaseBusiness, Facebook, LoaderCircle, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { CloudUser, createAccount, restoreSession, signInWithEmail, signInWithFacebook, signOut } from '../services/cloudAuth';

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10';

function saveDemoProfile(user: CloudUser) {
  localStorage.setItem('cauayan_user_v2', JSON.stringify({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: '',
    role: 'jobseeker',
    isResidentVerified: false,
    verificationStatus: 'none',
  }));
}

export const CloudAuthGate: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<CloudUser | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    let mounted = true;
    restoreSession().then((restoredUser) => {
      if (!mounted) return;
      if (restoredUser) {
        saveDemoProfile(restoredUser);
        setUser(restoredUser);
      }
    }).finally(() => {
      if (mounted) setIsRestoring(false);
    });
    return () => { mounted = false; };
  }, []);

  const completeSignIn = (signedInUser: CloudUser) => {
    saveDemoProfile(signedInUser);
    setUser(signedInUser);
    setError('');
  };

  const handleEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsWorking(true);
    try {
      const signedInUser = mode === 'signup'
        ? await createAccount(name, email, password)
        : await signInWithEmail(email, password);
      completeSignIn(signedInUser);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Something went wrong. Please try again.');
    } finally {
      setIsWorking(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setError('');
    setIsWorking(true);
    try {
      completeSignIn(await signInWithFacebook());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Facebook sign-in failed. Please try again.');
    } finally {
      setIsWorking(false);
    }
  };

  if (isRestoring) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white"><div className="flex items-center gap-3 text-sm text-slate-300"><LoaderCircle className="h-5 w-5 animate-spin text-emerald-400" />Restoring your sign-in…</div></main>;
  }

  if (user) {
    return <>{children}</>;
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 sm:px-6">
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.22),transparent_42%),radial-gradient(ellipse_at_bottom_left,rgba(14,116,144,0.18),transparent_45%)]" />
      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl shadow-black/30 md:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden flex-col justify-between bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-950 p-10 text-white md:flex lg:p-12">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400 text-emerald-950"><BriefcaseBusiness className="h-6 w-6" /></span>
            <div><p className="font-extrabold tracking-tight">Career Connect</p><p className="text-xs text-emerald-100/70">Cauayan City · Isabela</p></div>
          </div>
          <div className="max-w-md py-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Local talent. Local opportunity.</p>
            <h1 className="mt-4 text-4xl font-black leading-tight lg:text-5xl">Your next opportunity starts here.</h1>
            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-200">Sign in to continue exploring the Career Connect preview.</p>
          </div>
          <p className="text-xs leading-5 text-emerald-100/70">Preview only. Job applications, profiles, payments, and residency requests in this demo are not connected to live services.</p>
        </section>

        <section className="p-6 sm:p-10 lg:p-12">
          <div className="mb-8 md:hidden">
            <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800"><BriefcaseBusiness className="h-5 w-5" /></span><div><p className="font-extrabold text-slate-900">Career Connect</p><p className="text-xs text-slate-500">Cauayan City · Isabela</p></div></div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Welcome to Career Connect</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h2>
            <p className="mt-2 text-sm text-slate-600">{mode === 'signup' ? 'Use the same account to sign in on your other devices.' : 'Sign in with your email or Facebook account.'}</p>
          </div>

          {error && <div role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>}

          <button type="button" onClick={handleFacebookSignIn} disabled={isWorking} className="mt-7 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1877F2] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#1669d8] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
            {isWorking ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Facebook className="h-4 w-4 fill-current" />}
            Continue with Facebook
          </button>

          <div className="my-6 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" /><span>or use email</span><span className="h-px flex-1 bg-slate-200" /></div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {mode === 'signup' && <label className="relative block"><span className="sr-only">Full name</span><UserRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input className={inputClass} autoComplete="name" maxLength={100} value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" required /></label>}
            <label className="relative block"><span className="sr-only">Email address</span><Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input className={inputClass} type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" required /></label>
            <label className="relative block"><span className="sr-only">Password</span><LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input className={inputClass} type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password (at least 6 characters)" required /></label>
            <button type="submit" disabled={isWorking} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">
              {isWorking ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <>{mode === 'signup' ? 'Create account' : 'Sign in'}<ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">{mode === 'signup' ? 'Already have an account?' : 'New to Career Connect?'}{' '}<button type="button" onClick={() => { setError(''); setMode(mode === 'signup' ? 'login' : 'signup'); }} className="font-bold text-emerald-800 underline decoration-emerald-300 underline-offset-4 hover:text-emerald-950">{mode === 'signup' ? 'Sign in' : 'Create an account'}</button></p>
          <p className="mt-6 text-center text-[11px] leading-5 text-slate-500">By continuing, use sample information only. This preview does not store real applications, resumes, identity documents, or payments in a protected backend.</p>
        </section>
      </div>
    </main>
  );
};
