import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Bell, Trash2, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { computeJobCommute } from '../../utils/commute';
import { BARANGAY_ORIGINS } from '../../data/initialCommuteRoutes';
import { t } from '../../utils/i18n';

export const SavedAndAlertsPage: React.FC = () => {
  const {
    lang,
    jobs,
    savedJobIds,
    toggleSaveJob,
    homeBarangay,
    commuteRoutes,
    alerts,
    createAlert,
    deleteAlert,
    currentUser,
  } = useApp();

  const [tab, setTab] = useState<'saved' | 'alerts'>('saved');
  const [email, setEmail] = useState(currentUser.email || '');
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [barangay, setBarangay] = useState(homeBarangay);
  const [maxMinutes, setMaxMinutes] = useState(20);
  const [maxFarePhp, setMaxFarePhp] = useState(30);
  const [submitting, setSubmitting] = useState(false);

  const savedJobs = jobs.filter((j) => savedJobIds.includes(j.id));

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await createAlert({ email: email.trim(), keyword, category, barangay, maxMinutes, maxFarePhp });
      setKeyword('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{t(lang, 'savedTitle')}</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
          Compare bookmarked openings or set automatic alerts by commute time and fare.
        </p>
      </div>

      {/* Segmented Control */}
      <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 gap-1">
        <button
          type="button"
          onClick={() => setTab('saved')}
          className={`min-h-[40px] px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            tab === 'saved' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" /> Saved Jobs ({savedJobs.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('alerts')}
          className={`min-h-[40px] px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            tab === 'alerts' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          <Bell className="w-3.5 h-3.5" /> Job Alerts ({alerts.length})
        </button>
      </div>

      {tab === 'saved' ? (
        savedJobs.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-3">
            <Bookmark className="w-10 h-10 text-slate-400 mx-auto" />
            <h2 className="text-base font-bold text-slate-900">No saved jobs yet</h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Tap the bookmark button on any job listing to compare salaries and commute fares here.
            </p>
            <Link
              to="/jobs"
              className="inline-flex min-h-[44px] px-5 py-2.5 bg-emerald-800 text-white text-xs font-semibold rounded-xl items-center"
            >
              Explore Job Feed
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {savedJobs.map((job) => {
              const commute = computeJobCommute(job, homeBarangay, commuteRoutes);
              return (
                <div
                  key={job.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <Link
                      to={`/jobs/${job.id}`}
                      className="text-base font-bold text-slate-900 hover:text-emerald-800 hover:underline"
                    >
                      {job.title}
                    </Link>
                    <div className="text-xs text-slate-600">
                      {job.company} · {job.salary} ·{' '}
                      <span className="font-semibold text-emerald-800 tabular-nums">
                        {commute.distanceKm > 0
                          ? `~${commute.minutes} mins · ₱${commute.fare} fare`
                          : 'Remote · ₱0'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleSaveJob(job.id)}
                      className="min-h-[44px] px-3 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50"
                    >
                      Remove
                    </button>
                    <Link
                      to={`/apply/${job.id}`}
                      className="min-h-[44px] px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-xl flex items-center gap-1"
                    >
                      Apply <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <form
            onSubmit={handleCreateAlert}
            className="md:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 space-y-3 text-xs"
          >
            <h2 className="text-sm font-bold text-slate-900">Create Commute Job Alert</h2>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Notification Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan@example.ph"
                className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Keyword (Optional)</label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. IT, Admin, Nurse"
                className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl"
              >
                <option>All Categories</option>
                <option>Information Technology</option>
                <option>Agriculture</option>
                <option>Hospitality</option>
                <option>Manufacturing</option>
                <option>Administration</option>
                <option>Customer Service</option>
                <option>Marketing</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Origin Barangay</label>
              <select
                value={barangay}
                onChange={(e) => setBarangay(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl"
              >
                {BARANGAY_ORIGINS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Max Travel (mins)</label>
                <input
                  type="number"
                  min={5}
                  max={90}
                  value={maxMinutes}
                  onChange={(e) => setMaxMinutes(Number(e.target.value))}
                  className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl tabular-nums"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Max Fare (₱)</label>
                <input
                  type="number"
                  min={15}
                  max={200}
                  value={maxFarePhp}
                  onChange={(e) => setMaxFarePhp(Number(e.target.value))}
                  className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl tabular-nums"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[44px] py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-xl"
            >
              {submitting ? 'Creating Alert...' : 'Save Job Alert'}
            </button>
          </form>

          <div className="md:col-span-7 space-y-3">
            {alerts.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-6 text-center text-xs text-slate-600">
                No active alerts yet. Configure one on the left to get notified of nearby openings.
              </div>
            ) : (
              alerts.map((al) => (
                <div
                  key={al.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900">
                      {al.keyword ? `"${al.keyword}" · ` : ''}
                      {al.category}
                    </div>
                    <div className="text-slate-600 tabular-nums">
                      From {al.barangay.split(',')[0]} · Under {al.maxMinutes} mins · Under ₱{al.maxFarePhp}
                    </div>
                    <div className="text-slate-500">Sent to: {al.email}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteAlert(al.id)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-500 hover:text-red-700 rounded-xl hover:bg-red-50"
                    aria-label="Delete job alert"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
