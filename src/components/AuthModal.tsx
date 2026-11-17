import React, { useState } from 'react';
import { X, Shield, UserCheck, Building2, Briefcase } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, switchDemoRole, loginWithEmail, registerAccount, currentUser } = useApp();
  const [mode, setMode] = useState<'personas' | 'login' | 'register'>('personas');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'jobseeker' | 'employer'>('jobseeker');
  const [barangay, setBarangay] = useState('Marabulig 1');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleDemoPick = async (pickedRole: UserRole) => {
    setBusy(true);
    setError('');
    try {
      await switchDemoRole(pickedRole);
      setIsAuthModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to switch role.');
    } finally {
      setBusy(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await loginWithEmail(email);
      setIsAuthModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await registerAccount({ name, email, password, role, barangay, companyName });
      setIsAuthModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative space-y-4">
        <button
          type="button"
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          aria-label="Close sign in dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-lg font-bold text-slate-900">Account & Role Access</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Signed-in role is enforced on both frontend routes and Express API endpoints.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setMode('personas'); setError(''); }}
            className={`py-2 rounded-lg transition min-h-[40px] ${
              mode === 'personas' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Quick Switch
          </button>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`py-2 rounded-lg transition min-h-[40px] ${
              mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Email Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`py-2 rounded-lg transition min-h-[40px] ${
              mode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
            {error}
          </div>
        )}

        {mode === 'personas' && (
          <div className="space-y-2.5">
            {[
              {
                role: 'jobseeker' as UserRole,
                title: 'Juan Dela Cruz · Job Seeker',
                sub: 'Public job search, 3-step apply, saved jobs & tracker',
                icon: Briefcase,
              },
              {
                role: 'employer' as UserRole,
                title: 'Engr. Maria Santos · Employer',
                sub: 'Create/edit/duplicate jobs, review applicants & hire',
                icon: Building2,
              },
              {
                role: 'reviewer' as UserRole,
                title: 'Elena Corpuz · PESO / LGU Reviewer',
                sub: 'Shortlist applicants, review notes & verify residency',
                icon: UserCheck,
              },
              {
                role: 'super_admin' as UserRole,
                title: 'Dir. Roberto Villanueva · Super Admin',
                sub: 'Full access + commute fare routes, RBAC & audit log',
                icon: Shield,
              },
            ].map((item) => {
              const Icon = item.icon;
              const active = currentUser.role === item.role;
              return (
                <button
                  key={item.role}
                  type="button"
                  disabled={busy}
                  onClick={() => handleDemoPick(item.role)}
                  className={`w-full p-3 rounded-xl border text-left transition flex items-start gap-3 min-h-[56px] ${
                    active
                      ? 'border-emerald-600 bg-emerald-50/70'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 flex items-center justify-between gap-2">
                      <span>{item.title}</span>
                      {active && <span className="text-[11px] font-semibold text-emerald-700">Active</span>}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.sub}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan.delacruz@gmail.com"
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 min-h-[44px]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 min-h-[44px]"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl transition min-h-[44px]"
            >
              {busy ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Maria Clara"
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 min-h-[44px]"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="maria@example.ph"
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 min-h-[44px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'jobseeker' | 'employer')}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 min-h-[44px]"
                >
                  <option value="jobseeker">Job Seeker</option>
                  <option value="employer">Employer</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Home Barangay</label>
                <input
                  type="text"
                  value={barangay}
                  onChange={(e) => setBarangay(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 min-h-[44px]"
                />
              </div>
            </div>
            {role === 'employer' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Cauayan Local Services, Inc."
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 min-h-[44px]"
                />
              </div>
            )}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password (8+ characters)</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 min-h-[44px]"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl transition min-h-[44px]"
            >
              {busy ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
