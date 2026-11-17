import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Search, Calendar, MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiRequest } from '../../utils/api';
import { ApplicationStatus, JobApplication } from '../../types';
import { t } from '../../utils/i18n';

const STEPS: ApplicationStatus[] = ['Submitted', 'Under Review', 'Interview', 'Hired'];

export const TrackerPage: React.FC = () => {
  const { lang, currentUser } = useApp();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lookupQuery, setLookupQuery] = useState('');

  const fetchApps = useCallback(async (query?: string) => {
    setLoading(true);
    setError('');
    try {
      let url = '/api/applications/track';
      if (query && query.trim()) {
        const q = query.trim();
        url += q.toUpperCase().startsWith('APP-')
          ? `?id=${encodeURIComponent(q)}`
          : `?email=${encodeURIComponent(q)}`;
      } else if (currentUser.email) {
        url += `?email=${encodeURIComponent(currentUser.email)}`;
      }
      const res = await apiRequest<{ applications: JobApplication[] }>(url);
      setApplications(res.applications);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load applications.');
    } finally {
      setLoading(false);
    }
  }, [currentUser.email]);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApps(lookupQuery);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{t(lang, 'trackerTitle')}</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Track real-time hiring progress, interview schedules, and employer remarks.
          </p>
        </div>

        <form onSubmit={handleLookup} className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 bg-white border border-slate-300 rounded-xl min-h-[44px]">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              placeholder="Tracking ID or email..."
              className="text-xs bg-transparent focus:outline-none w-44 sm:w-52"
            />
          </div>
          <button
            type="submit"
            className="min-h-[44px] px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl"
          >
            Track
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => fetchApps()} className="font-semibold underline flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-36 bg-white border border-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-3">
          <ClipboardList className="w-10 h-10 text-slate-400 mx-auto" />
          <h2 className="text-base font-bold text-slate-900">No applications found</h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Apply to a job listing or search with your APP-CAU tracking code above.
          </p>
          <Link
            to="/jobs"
            className="inline-flex min-h-[44px] px-5 py-2.5 bg-emerald-800 text-white text-xs font-semibold rounded-xl items-center"
          >
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const isRejected = app.status === 'Rejected';
            const stepIndex = isRejected ? -1 : STEPS.indexOf(app.status);

            return (
              <article key={app.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-mono font-semibold text-slate-500">{app.id}</div>
                    <h2 className="text-base font-bold text-slate-900 mt-0.5">{app.jobTitle}</h2>
                    <div className="text-xs text-slate-600">
                      {app.company} · Résumé: <span className="font-medium text-slate-800">{app.resumeFileName}</span>
                    </div>
                  </div>
                  <span
                    className={`self-start px-3 py-1 rounded-lg text-xs font-bold border ${
                      app.status === 'Hired'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : app.status === 'Interview'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : app.status === 'Rejected'
                        ? 'bg-red-50 text-red-800 border-red-200'
                        : 'bg-slate-100 text-slate-800 border-slate-200'
                    }`}
                  >
                    {app.status}
                  </span>
                </div>

                {/* Progress Pipeline */}
                {!isRejected ? (
                  <div className="grid grid-cols-4 gap-1.5 text-[11px] font-semibold">
                    {STEPS.map((s, idx) => {
                      const done = idx <= stepIndex;
                      return (
                        <div
                          key={s}
                          className={`py-2 px-2 rounded-lg text-center border ${
                            done
                              ? 'bg-emerald-800 text-white border-emerald-800'
                              : 'bg-slate-50 text-slate-400 border-slate-200'
                          }`}
                        >
                          {s}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900">
                    Application status: <strong>Rejected</strong>
                  </div>
                )}

                {app.interviewDate && (
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-950 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-700" /> Scheduled Interview: {app.interviewDate}
                    </div>
                    {app.interviewLocation && (
                      <div className="flex items-center gap-1.5 text-blue-900">
                        <MapPin className="w-3.5 h-3.5 text-blue-700" /> {app.interviewLocation}
                      </div>
                    )}
                  </div>
                )}

                {/* Status History Timeline */}
                {app.statusHistory && app.statusHistory.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="text-xs font-bold text-slate-800">Status History</div>
                    <div className="space-y-1.5 text-xs">
                      {app.statusHistory.map((h, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 text-slate-600">
                          <div>
                            <strong className="text-slate-900">{h.status}</strong> — {h.remarks}
                          </div>
                          <span className="text-[11px] font-mono text-slate-400 shrink-0 tabular-nums">
                            {new Date(h.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
