import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Clock,
  CheckCircle2,
  Calendar,
  ShieldAlert,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { ApplicationStatus, AuditLogEntry } from '../../types';

interface DashboardResponse {
  kpis: {
    activeJobs: number;
    closedJobs: number;
    totalApplicants: number;
    pendingReviews: number;
    interviews: number;
    hires: number;
    pendingVerifications: number;
  };
  statusCounts: Record<ApplicationStatus, number>;
  byCategory: Record<string, number>;
  recentAudit: AuditLogEntry[];
}

const STATUS_ORDER: ApplicationStatus[] = [
  'Submitted',
  'Under Review',
  'Interview',
  'Hired',
  'Rejected',
];

const STATUS_BAR_COLOR: Record<ApplicationStatus, string> = {
  Submitted: 'bg-slate-500',
  'Under Review': 'bg-sky-600',
  Interview: 'bg-amber-600',
  Hired: 'bg-emerald-700',
  Rejected: 'bg-rose-600',
};

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiRequest<DashboardResponse>('/api/admin/dashboard');
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 h-28 animate-pulse" />
          ))}
        </div>
        <div className="bg-white border border-slate-200 rounded-xl h-72 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-rose-200 rounded-xl p-6 space-y-3">
        <div className="text-sm font-semibold text-rose-800">{error}</div>
        <button
          type="button"
          onClick={loadDashboard}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg inline-flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { kpis, statusCounts, byCategory, recentAudit } = data;
  const maxStatusCount = Math.max(1, ...Object.values(statusCounts));
  const categoryEntries = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const maxCatCount = Math.max(1, ...categoryEntries.map((c) => c[1]));

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-600">
            Real-time hiring pipeline, local job inventory, and PESO verification queue for Cauayan City.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadDashboard}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg inline-flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            to="/admin/jobs"
            className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg inline-flex items-center gap-1.5"
          >
            Manage Job Postings
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 4-Column KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-start justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Job Listings
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
              {kpis.activeJobs}
            </div>
            <div className="text-xs text-slate-500 mt-1 tabular-nums">
              {kpis.closedJobs} closed / paused
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-start justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Applicants
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
              {kpis.totalApplicants}
            </div>
            <div className="text-xs text-slate-500 mt-1 tabular-nums">
              {kpis.interviews} scheduled interviews
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-sky-50 text-sky-800">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-start justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pending Reviews
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
              {kpis.pendingReviews}
            </div>
            <div className="text-xs text-amber-700 mt-1 tabular-nums">
              Submitted or under review
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-800">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-start justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Confirmed Hires
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
              {kpis.hires}
            </div>
            <div className="text-xs text-slate-500 mt-1 tabular-nums">
              {kpis.pendingVerifications} pending residency IDs
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Trends & Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Applicant Stage Funnel</h2>
            <Link
              to="/admin/applicants"
              className="text-xs font-semibold text-emerald-800 hover:underline"
            >
              Open Table →
            </Link>
          </div>
          <div className="space-y-3">
            {STATUS_ORDER.map((status) => {
              const count = statusCounts[status] || 0;
              const pct = Math.round((count / maxStatusCount) * 100);
              return (
                <div key={status} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{status}</span>
                    <span className="font-semibold text-slate-900 tabular-nums">{count}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${STATUS_BAR_COLOR[status]}`}
                      style={{ width: `${Math.max(count > 0 ? 8 : 0, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Job Openings by Sector</h2>
            <span className="text-xs text-slate-500 tabular-nums">
              {categoryEntries.length} active sectors
            </span>
          </div>
          {categoryEntries.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No jobs available.</p>
          ) : (
            <div className="space-y-3">
              {categoryEntries.map(([cat, count]) => {
                const pct = Math.round((count / maxCatCount) * 100);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 truncate pr-4">{cat}</span>
                      <span className="font-semibold text-slate-900 tabular-nums">{count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-slate-800"
                        style={{ width: `${Math.max(10, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Action Queues & Recent Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-bold text-slate-900">Operational Queues</h2>
          <div className="space-y-2">
            <Link
              to="/admin/applicants"
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2.5 text-xs font-medium text-slate-800">
                <Calendar className="w-4 h-4 text-amber-700" />
                <span>Pending Applicant Reviews</span>
              </div>
              <span className="text-xs font-bold text-slate-900 tabular-nums">
                {kpis.pendingReviews}
              </span>
            </Link>
            <Link
              to="/admin/access"
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2.5 text-xs font-medium text-slate-800">
                <ShieldAlert className="w-4 h-4 text-emerald-700" />
                <span>LGU Residency Verifications</span>
              </div>
              <span className="text-xs font-bold text-slate-900 tabular-nums">
                {kpis.pendingVerifications}
              </span>
            </Link>
          </div>
        </div>

        <section className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Recent Audit Activity</h2>
            <Link to="/admin/access" className="text-xs font-semibold text-emerald-800 hover:underline">
              Full Log →
            </Link>
          </div>
          {recentAudit.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">No recorded events yet.</div>
          ) : (
            <div className="divide-y divide-slate-200">
              {recentAudit.map((entry) => (
                <div key={entry.id} className="px-5 py-3 flex items-start justify-between gap-4 text-xs">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900">
                      {entry.action.replace(/_/g, ' ')}
                    </div>
                    <div className="text-slate-600 truncate mt-0.5">{entry.details}</div>
                  </div>
                  <div className="text-right shrink-0 text-slate-500">
                    <div className="font-medium text-slate-700">{entry.actorName}</div>
                    <div className="tabular-nums">
                      {new Date(entry.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
