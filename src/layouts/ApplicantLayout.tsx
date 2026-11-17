import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Briefcase, Bookmark, ClipboardList, ShieldCheck, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { t } from '../utils/i18n';

export const ApplicantLayout: React.FC = () => {
  const { lang, setLang, currentUser, savedJobIds, setIsAuthModalOpen, logout } = useApp();
  const isStaff = ['super_admin', 'employer', 'reviewer'].includes(currentUser.role);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col pb-16 md:pb-0">
      {/* 3-Zone Top Bar (Single row, compact 56px-64px height) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4 sm:gap-8">
          <Link
            to="/jobs"
            className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-emerald-700 rounded"
          >
            {t(lang, 'brand')}
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <NavLink
              to="/jobs"
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 hover:text-slate-900 hover:underline underline-offset-4 transition-colors ${
                  isActive ? 'text-emerald-800 font-semibold underline' : ''
                }`
              }
            >
              {t(lang, 'navJobs')}
            </NavLink>
            <NavLink
              to="/tracker"
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 hover:text-slate-900 hover:underline underline-offset-4 transition-colors ${
                  isActive ? 'text-emerald-800 font-semibold underline' : ''
                }`
              }
            >
              {t(lang, 'navTracker')}
            </NavLink>
            <NavLink
              to="/saved"
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 hover:text-slate-900 hover:underline underline-offset-4 transition-colors ${
                  isActive ? 'text-emerald-800 font-semibold underline' : ''
                }`
              }
            >
              {t(lang, 'navSaved')} {savedJobIds.length > 0 ? `(${savedJobIds.length})` : ''}
            </NavLink>
            <NavLink
              to="/guides"
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 hover:text-slate-900 hover:underline underline-offset-4 transition-colors ${
                  isActive ? 'text-emerald-800 font-semibold underline' : ''
                }`
              }
            >
              {t(lang, 'navGuides')}
            </NavLink>
            <NavLink
              to="/admin"
              className="whitespace-nowrap shrink-0 text-slate-700 hover:text-emerald-800 hover:underline underline-offset-4 font-semibold transition-colors"
            >
              {t(lang, 'navAdmin')}
            </NavLink>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setLang(lang === 'en' ? 'fil' : 'en')}
              className="min-h-[40px] px-2.5 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
              aria-label="Toggle language between English and Filipino"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{lang === 'en' ? 'EN / FIL' : 'FIL / EN'}</span>
            </button>

            {currentUser.role === 'guest' ? (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="min-h-[40px] px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                {t(lang, 'signIn')}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                {isStaff && (
                  <Link
                    to="/admin"
                    className="md:hidden min-h-[40px] px-3 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg whitespace-nowrap shrink-0 flex items-center"
                  >
                    Admin
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="min-h-[40px] px-3 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 max-w-[130px] truncate"
                  title={`${currentUser.name} (${currentUser.role})`}
                >
                  {currentUser.name.split(' ')[0]}
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="hidden sm:inline-flex min-h-[40px] px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0"
                >
                  {t(lang, 'signOut')}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* Clean Footer */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-xs mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="font-bold text-white text-sm">Cauayan City Career Connect</div>
              <p className="text-slate-400 mt-0.5">Barangay Marabulig 1 & Cauayan City, Isabela Local Employment Portal</p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/guides" className="hover:text-white underline-offset-4 hover:underline min-h-[44px] flex items-center">
                Resident Verification & RA 11261
              </Link>
              <Link to="/guides#privacy" className="hover:text-white underline-offset-4 hover:underline min-h-[44px] flex items-center">
                Privacy Policy (RA 10173)
              </Link>
              <Link to="/admin" className="hover:text-white underline-offset-4 hover:underline min-h-[44px] flex items-center">
                Employer / Admin Console
              </Link>
              <a href="tel:0786522011" className="hover:text-white underline-offset-4 hover:underline min-h-[44px] flex items-center">
                PESO: (078) 652-2011
              </a>
            </div>
          </div>
          <div className="text-slate-400">
            © {new Date().getFullYear()} Cauayan City Career Connect. Accessible local jobs & commute fares.
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar (56px height, <=15% total sticky surface cap) */}
      <nav
        aria-label="Mobile primary navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 grid grid-cols-4 h-14 pb-[env(safe-area-inset-bottom)]"
      >
        <NavLink
          to="/jobs"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold min-h-[44px] ${
              isActive ? 'text-emerald-800' : 'text-slate-600'
            }`
          }
        >
          <Briefcase className="w-5 h-5" />
          <span>{t(lang, 'navJobs')}</span>
        </NavLink>
        <NavLink
          to="/saved"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold min-h-[44px] ${
              isActive ? 'text-emerald-800' : 'text-slate-600'
            }`
          }
        >
          <Bookmark className="w-5 h-5" />
          <span>{t(lang, 'navSaved').split(' ')[0]}</span>
        </NavLink>
        <NavLink
          to="/tracker"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold min-h-[44px] ${
              isActive ? 'text-emerald-800' : 'text-slate-600'
            }`
          }
        >
          <ClipboardList className="w-5 h-5" />
          <span>{t(lang, 'navTracker')}</span>
        </NavLink>
        <NavLink
          to="/guides"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold min-h-[44px] ${
              isActive ? 'text-emerald-800' : 'text-slate-600'
            }`
          }
        >
          <ShieldCheck className="w-5 h-5" />
          <span>{t(lang, 'navGuides').split(' ')[0]}</span>
        </NavLink>
      </nav>
    </div>
  );
};
