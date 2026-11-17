import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  MapPin,
  FileSpreadsheet,
  ShieldCheck,
  Menu,
  X,
  ArrowLeft,
  Lock,
  LogOut,
  UserCog,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

const STAFF_ROLES: UserRole[] = ['super_admin', 'employer', 'reviewer'];

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  employer: 'Employer / HR',
  reviewer: 'PESO / LGU Reviewer',
  jobseeker: 'Job Seeker',
  guest: 'Guest',
};

const ROUTE_TITLES: Record<string, string> = {
  '/admin': 'Executive Dashboard',
  '/admin/jobs': 'Job Posting Management',
  '/admin/applicants': 'Applicant Pipeline & Reviews',
  '/admin/commute': 'Commute Routes, Fares & Stops',
  '/admin/templates': 'Exports & Notification Templates',
  '/admin/access': 'Roles, Residency & Audit Log',
};

export const AdminLayout: React.FC = () => {
  const { currentUser, isAuthReady, setIsAuthModalOpen, switchDemoRole, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isStaff = STAFF_ROLES.includes(currentUser.role);
  const pageTitle = ROUTE_TITLES[location.pathname] || 'Admin & Employer Workspace';

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-xl p-8 max-w-md w-full text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-700 border-t-transparent animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-700">Verifying workspace session…</p>
        </div>
      </div>
    );
  }

  // Frontend RBAC Gate (mirrors server.ts requireRoles middleware)
  if (!isStaff) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Protected Workspace · RBAC Enforced
              </div>
              <h1 className="text-xl font-bold text-slate-900">
                Employer &amp; Admin Access Required
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed">
                You are currently signed in as{' '}
                <span className="font-semibold text-slate-900">
                  {currentUser.name} ({ROLE_LABELS[currentUser.role]})
                </span>
                . Sign in with an authorized staff account to manage jobs, applicants, commute data, or verification queues.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Quick Demo Staff Switch (Issues Signed Bearer Token)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => switchDemoRole('employer')}
                className="min-h-[44px] px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-200 hover:border-emerald-700 hover:text-emerald-800 text-slate-900 transition-colors"
              >
                Employer / HR
              </button>
              <button
                type="button"
                onClick={() => switchDemoRole('reviewer')}
                className="min-h-[44px] px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-200 hover:border-emerald-700 hover:text-emerald-800 text-slate-900 transition-colors"
              >
                PESO Reviewer
              </button>
              <button
                type="button"
                onClick={() => switchDemoRole('super_admin')}
                className="min-h-[44px] px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors"
              >
                Super Admin
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
            <Link
              to="/jobs"
              className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Public Jobs
            </Link>
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="min-h-[44px] px-4 py-2 text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors"
            >
              Open Account Modal
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/jobs', label: 'Job Postings', icon: Briefcase, end: false },
    { to: '/admin/applicants', label: 'Applicants', icon: Users, end: false },
    { to: '/admin/commute', label: 'Commute Routes', icon: MapPin, end: false },
    { to: '/admin/templates', label: 'Exports & Templates', icon: FileSpreadsheet, end: false },
    { to: '/admin/access', label: 'Roles & Audit Log', icon: ShieldCheck, end: false },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200">
      <div className="h-14 px-4 flex items-center justify-between border-b border-slate-800 shrink-0">
        <div>
          <div className="text-sm font-bold text-white tracking-tight">Cauayan Career Admin</div>
          <div className="text-[11px] text-slate-400">PESO &amp; Employer Console</div>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-md"
          aria-label="Close navigation drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Admin sidebar navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-700 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800 space-y-2 shrink-0">
        <div className="bg-slate-800/80 rounded-lg p-3 space-y-1">
          <div className="text-xs font-semibold text-white truncate">{currentUser.name}</div>
          <div className="text-[11px] text-emerald-400 font-medium">
            {ROLE_LABELS[currentUser.role]}
          </div>
          {currentUser.companyName && (
            <div className="text-[11px] text-slate-400 truncate">{currentUser.companyName}</div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-2.5 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <UserCog className="w-3.5 h-3.5" />
            <span>Switch</span>
          </button>
          <button
            type="button"
            onClick={logout}
            className="flex items-center justify-center gap-1.5 px-2.5 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </button>
        </div>

        <Link
          to="/jobs"
          className="flex items-center justify-center gap-1.5 w-full px-3 py-2 text-xs font-semibold text-slate-200 border border-slate-700 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Public Job Seeker Site</span>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Fixed 240px Desktop Sidebar */}
      <aside className="hidden lg:block w-60 shrink-0 border-r border-slate-800 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-64 max-w-[85vw] h-full z-10">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 h-14 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Open admin navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Admin Workspace / {ROLE_LABELS[currentUser.role]}
              </div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {pageTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/jobs"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap"
            >
              View Public Site
            </Link>
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
            >
              {currentUser.name.split(' ')[0]}
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 max-w-[1440px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
