import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Bookmark,
  ChevronRight,
  SlidersHorizontal,
  Bell,
  ShieldCheck,
  GraduationCap,
  Building2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BARANGAY_ORIGINS } from '../../data/initialCommuteRoutes';
import { computeJobCommute } from '../../utils/commute';
import { t } from '../../utils/i18n';

export const JobsFeedPage: React.FC = () => {
  const {
    lang,
    jobs,
    jobsLoading,
    jobsError,
    refreshJobs,
    commuteRoutes,
    homeBarangay,
    setHomeBarangay,
    savedJobIds,
    toggleSaveJob,
    currentUser,
    createAlert,
  } = useApp();

  const [keyword, setKeyword] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [arrangementFilter, setArrangementFilter] = useState<'all' | 'On-site' | 'Hybrid' | 'Remote'>('all');
  const [levelFilter, setLevelFilter] = useState<'all' | 'no_experience' | 'entry_level' | 'internship'>('all');
  const [minSalaryFilter, setMinSalaryFilter] = useState<number>(0);
  const [maxMinutesFilter, setMaxMinutesFilter] = useState<number>(0); // 0 = any
  const [maxFareFilter, setMaxFareFilter] = useState<number>(0); // 0 = any
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  // Quick alert form
  const [alertEmail, setAlertEmail] = useState(currentUser.email || '');
  const [alertSaving, setAlertSaving] = useState(false);

  const enrichedJobs = useMemo(() => {
    return jobs
      .filter((j) => (j.status || 'active') === 'active')
      .map((job) => ({
        job,
        commute: computeJobCommute(job, homeBarangay, commuteRoutes),
      }));
  }, [jobs, homeBarangay, commuteRoutes]);

  const filtered = useMemo(() => {
    const q = keyword.toLowerCase().trim();
    return enrichedJobs.filter(({ job, commute }) => {
      const matchesQuery =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.category.toLowerCase().includes(q) ||
        job.description.toLowerCase().includes(q) ||
        (job.exactAddress && job.exactAddress.toLowerCase().includes(q)) ||
        (job.landmark && job.landmark.toLowerCase().includes(q));

      const matchesLocation = !locationFilter || job.location === locationFilter;
      const matchesCategory = !categoryFilter || job.category === categoryFilter;
      const matchesArrangement = arrangementFilter === 'all' || job.arrangement === arrangementFilter;
      const matchesLevel = levelFilter === 'all' || job.level === levelFilter;
      const matchesSalary =
        minSalaryFilter === 0 || (job.salaryMax ?? job.salaryMin ?? 0) >= minSalaryFilter;
      const matchesMinutes =
        maxMinutesFilter === 0 || commute.minutes <= maxMinutesFilter;
      const matchesFare =
        maxFareFilter === 0 || commute.fare <= maxFareFilter;

      return (
        matchesQuery &&
        matchesLocation &&
        matchesCategory &&
        matchesArrangement &&
        matchesLevel &&
        matchesSalary &&
        matchesMinutes &&
        matchesFare
      );
    });
  }, [
    enrichedJobs,
    keyword,
    locationFilter,
    categoryFilter,
    arrangementFilter,
    levelFilter,
    minSalaryFilter,
    maxMinutesFilter,
    maxFareFilter,
  ]);

  const resetAllFilters = () => {
    setKeyword('');
    setLocationFilter('');
    setCategoryFilter('');
    setArrangementFilter('all');
    setLevelFilter('all');
    setMinSalaryFilter(0);
    setMaxMinutesFilter(0);
    setMaxFareFilter(0);
  };

  const handleQuickAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertEmail.trim()) return;
    setAlertSaving(true);
    try {
      await createAlert({
        email: alertEmail.trim(),
        keyword: keyword || '',
        category: categoryFilter || 'All Categories',
        barangay: homeBarangay,
        maxMinutes: maxMinutesFilter || 30,
        maxFarePhp: maxFareFilter || 50,
      });
    } finally {
      setAlertSaving(false);
    }
  };

  return (
    <div>
      {/* Hero & Search Band */}
      <section className="bg-slate-900 text-white py-8 sm:py-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-5">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-semibold text-emerald-400">{t(lang, 'heroKicker')}</p>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-balance">
              {t(lang, 'heroTitle')}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">{t(lang, 'heroSubtitle')}</p>
          </div>

          {/* Search & Primary Filters */}
          <div className="bg-white text-slate-900 p-2.5 rounded-2xl border border-slate-200 shadow-lg grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2">
            <label className="sm:col-span-2 lg:col-span-5 flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 min-h-[44px]">
              <Search className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="sr-only">Search keyword</span>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={t(lang, 'searchPlaceholder')}
                className="w-full text-sm bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-500"
              />
            </label>

            <label className="lg:col-span-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 min-h-[44px]">
              <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="sr-only">Location</span>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full text-sm bg-transparent focus:outline-none text-slate-800"
              >
                <option value="">{t(lang, 'allLocations')}</option>
                <option value="Cauayan City, Isabela">Cauayan City, Isabela</option>
                <option value="Alicia, Isabela">Alicia, Isabela</option>
                <option value="Naguilian, Isabela">Naguilian, Isabela</option>
                <option value="San Mateo, Isabela">San Mateo, Isabela</option>
                <option value="Remote">Remote</option>
              </select>
            </label>

            <label className="lg:col-span-2 flex items-center px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 min-h-[44px]">
              <span className="sr-only">Category</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full text-sm bg-transparent focus:outline-none text-slate-800"
              >
                <option value="">{t(lang, 'allCategories')}</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Hospitality">Hospitality</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Administration">Administration</option>
                <option value="Customer Service">Customer Service</option>
                <option value="Marketing">Marketing</option>
              </select>
            </label>

            <button
              type="button"
              onClick={() => setShowMoreFilters((v) => !v)}
              className="lg:col-span-2 min-h-[44px] px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Commute & Fare Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t(lang, 'myBarangay')}
              </label>
              <select
                value={homeBarangay}
                onChange={(e) => setHomeBarangay(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 text-sm font-medium bg-emerald-50/70 border border-emerald-300 rounded-xl text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              >
                {BARANGAY_ORIGINS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t(lang, 'maxTime')}
              </label>
              <select
                value={maxMinutesFilter}
                onChange={(e) => setMaxMinutesFilter(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              >
                <option value={0}>{t(lang, 'anyTime')}</option>
                <option value={10}>Under 10 mins</option>
                <option value={15}>Under 15 mins</option>
                <option value={25}>Under 25 mins</option>
                <option value={35}>Under 35 mins</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t(lang, 'maxFare')}
              </label>
              <select
                value={maxFareFilter}
                onChange={(e) => setMaxFareFilter(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              >
                <option value={0}>{t(lang, 'anyFare')}</option>
                <option value={20}>Under ₱20 fare</option>
                <option value={30}>Under ₱30 fare</option>
                <option value={50}>Under ₱50 fare</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t(lang, 'salaryMinLabel')}
              </label>
              <select
                value={minSalaryFilter}
                onChange={(e) => setMinSalaryFilter(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              >
                <option value={0}>{t(lang, 'anySalary')}</option>
                <option value={14000}>₱14,000+ / mo</option>
                <option value={16000}>₱16,000+ / mo</option>
                <option value={19000}>₱19,000+ / mo</option>
              </select>
            </div>
          </div>

          {showMoreFilters && (
            <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-slate-700 mb-1.5">{t(lang, 'jobTypeLabel')}</div>
                <div className="flex flex-wrap gap-1.5">
                  {(['all', 'On-site', 'Hybrid', 'Remote'] as const).map((arr) => (
                    <button
                      key={arr}
                      type="button"
                      onClick={() => setArrangementFilter(arr)}
                      className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                        arrangementFilter === arr
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {arr === 'all' ? t(lang, 'allTypes') : arr}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-700 mb-1.5">{t(lang, 'levelLabel')}</div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: t(lang, 'allLevels') },
                    { id: 'no_experience', label: t(lang, 'noExperience') },
                    { id: 'entry_level', label: t(lang, 'entryLevel') },
                    { id: 'internship', label: t(lang, 'internship') },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setLevelFilter(lvl.id as typeof levelFilter)}
                      className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                        levelFilter === lvl.id
                          ? 'bg-emerald-800 text-white border-emerald-800'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
            <div>
              {t(lang, 'showingJobs')}{' '}
              <strong className="text-slate-900 tabular-nums">{filtered.length}</strong>{' '}
              {t(lang, 'jobsMatching')} · <span className="font-medium text-emerald-800">{homeBarangay.split(',')[0]}</span>
            </div>
            {(keyword || locationFilter || categoryFilter || arrangementFilter !== 'all' || levelFilter !== 'all' || minSalaryFilter > 0 || maxMinutesFilter > 0 || maxFareFilter > 0) && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="font-semibold text-emerald-800 hover:underline min-h-[36px] px-2"
              >
                {t(lang, 'resetFilters')}
              </button>
            )}
          </div>
        </div>

        {/* 12-Col Feed + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-4">
            {jobsError && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-sm text-red-900">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <span>{jobsError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => refreshJobs(false)}
                  className="min-h-[40px] px-3 py-1.5 bg-white border border-red-300 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retry
                </button>
              </div>
            )}

            {jobsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 animate-pulse">
                    <div className="h-5 w-2/3 bg-slate-200 rounded" />
                    <div className="h-4 w-1/2 bg-slate-100 rounded" />
                    <div className="h-10 w-full bg-slate-100 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-3">
                <h2 className="text-base font-bold text-slate-900">No jobs match your current filters</h2>
                <p className="text-sm text-slate-600">
                  Try increasing the max commute time or fare budget, or reset your filters.
                </p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="min-h-[44px] px-5 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors"
                >
                  {t(lang, 'resetFilters')}
                </button>
              </div>
            ) : (
              filtered.map(({ job, commute }) => {
                const isSaved = savedJobIds.includes(job.id);
                return (
                  <article
                    key={job.id}
                    className="bg-white border border-slate-200 hover:border-emerald-400 rounded-2xl p-5 transition-colors space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0 ${job.logo}`}
                        >
                          {job.initial}
                        </div>
                        <div className="min-w-0 space-y-1">
                          <Link
                            to={`/jobs/${job.id}`}
                            className="text-base font-bold text-slate-900 hover:text-emerald-800 hover:underline leading-snug block"
                          >
                            {job.title}
                          </Link>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600">
                            <span className="font-semibold text-slate-800">{job.company}</span>
                            <span aria-hidden="true">·</span>
                            <span>{job.location}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-semibold text-emerald-800 tabular-nums">{job.salary}</span>
                            <span aria-hidden="true">·</span>
                            <span>{job.arrangement}</span>
                            {job.isFeatured && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="font-semibold text-amber-800">Featured</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleSaveJob(job.id)}
                        className={`min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 transition-colors ${
                          isSaved
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                        aria-label={isSaved ? 'Remove from saved jobs' : 'Save job'}
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-700 text-emerald-700' : ''}`} />
                        <span className="hidden sm:inline">{isSaved ? t(lang, 'savedJob') : t(lang, 'saveJob')}</span>
                      </button>
                    </div>

                    {/* Clean Unboxed Commute Summary Row */}
                    <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-slate-900 tabular-nums">
                          {commute.distanceKm > 0
                            ? `${commute.distanceKm} km · ~${commute.minutes} mins · ₱${commute.fare} fare (${commute.commuteMode})`
                            : 'Remote · Work from Home · ₱0 fare'}
                        </div>
                        <div className="text-slate-600">
                          {job.exactAddress || job.location}
                          {job.landmark ? ` — ${job.landmark}` : ''}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
                        <Link
                          to={`/jobs/${job.id}`}
                          className="min-h-[44px] px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold rounded-xl transition-colors flex items-center justify-center whitespace-nowrap"
                        >
                          {t(lang, 'viewDetails')}
                        </Link>
                        <Link
                          to={`/apply/${job.id}`}
                          className="min-h-[44px] px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-1 whitespace-nowrap"
                        >
                          <span>{t(lang, 'applyNow')}</span>
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {/* Right Sidebar */}
          <aside className="lg:col-span-4 space-y-4">
            {/* Job Alert Quick Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-700" />
                <h2 className="text-sm font-bold text-slate-900">Get Commute-Matched Job Alerts</h2>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Receive notifications when new jobs open near <strong>{homeBarangay.split(',')[0]}</strong> matching your travel budget.
              </p>
              <form onSubmit={handleQuickAlert} className="space-y-2">
                <input
                  type="email"
                  required
                  value={alertEmail}
                  onChange={(e) => setAlertEmail(e.target.value)}
                  placeholder="you@example.ph"
                  className="w-full min-h-[44px] px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
                <button
                  type="submit"
                  disabled={alertSaving}
                  className="w-full min-h-[44px] py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  {alertSaving ? 'Saving Alert...' : 'Create Alert for Current Filters'}
                </button>
              </form>
            </div>

            {/* Resident Verification Card */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-800" />
                <h2 className="text-sm font-bold text-emerald-950">Cauayan Resident Verification</h2>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Get verified by Barangay Marabulig 1 & Cauayan LGU officers for local priority consideration. Protected under RA 10173.
              </p>
              <Link
                to="/guides"
                className="w-full min-h-[44px] py-2 px-4 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center"
              >
                Verify Residency
              </Link>
            </div>

            {/* RA 11261 Guide Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2.5">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-slate-700" />
                <h2 className="text-sm font-bold text-slate-900">First-Time Jobseekers Act (RA 11261)</h2>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Fresh graduates get free Barangay Clearance, Police Clearance, NBI, and Medical Certificates in Cauayan City.
              </p>
              <Link
                to="/guides#ra11261"
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:underline min-h-[40px]"
              >
                Read step-by-step checklist <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Employer Portal Link */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2.5">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-slate-700" />
                <h2 className="text-sm font-bold text-slate-900">Hiring in Cauayan City?</h2>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Switch to the Employer & Admin workspace to post openings, manage applicants, and export reports.
              </p>
              <Link
                to="/admin"
                className="w-full min-h-[44px] py-2 px-4 border border-slate-300 hover:bg-slate-50 text-slate-900 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center"
              >
                Open Employer / Admin Console
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
