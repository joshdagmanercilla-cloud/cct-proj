import React, { Suspense, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bookmark,
  CheckCircle,
  MapPin,
  Clock,
  Navigation,
  ExternalLink,
  ChevronRight,
  Map as MapIcon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { computeJobCommute } from '../../utils/commute';
import { BARANGAY_ORIGINS } from '../../data/initialCommuteRoutes';
import { t } from '../../utils/i18n';

const LazyMiniJobMap = React.lazy(() =>
  import('../../components/MiniJobMap').then((mod) => ({ default: mod.MiniJobMap }))
);

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    lang,
    jobs,
    jobsLoading,
    commuteRoutes,
    homeBarangay,
    setHomeBarangay,
    savedJobIds,
    toggleSaveJob,
  } = useApp();

  const [showMap, setShowMap] = useState(false);

  const job = jobs.find((j) => String(j.id) === String(id));

  if (jobsLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="h-44 bg-white border border-slate-200 rounded-2xl animate-pulse" />
        <div className="h-56 bg-white border border-slate-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-center space-y-4">
        <h1 className="text-xl font-bold text-slate-900">Job opening not found</h1>
        <p className="text-sm text-slate-600">
          This listing may have been closed or removed by the employer.
        </p>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 bg-emerald-800 text-white text-xs font-semibold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Job Search
        </Link>
      </div>
    );
  }

  const commute = computeJobCommute(job, homeBarangay, commuteRoutes);
  const isSaved = savedJobIds.includes(job.id);
  const isClosed = job.status === 'closed';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 pb-24 sm:pb-10">
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 min-h-[44px] px-2 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Jobs
        </Link>

        <button
          type="button"
          onClick={() => toggleSaveJob(job.id)}
          className={`min-h-[44px] px-4 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            isSaved
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-700 text-emerald-700' : ''}`} />
          <span>{isSaved ? t(lang, 'savedJob') : t(lang, 'saveJob')}</span>
        </button>
      </div>

      {/* Employer & Role Header */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-2xl border flex items-center justify-center font-bold text-base shrink-0 ${job.logo}`}
            >
              {job.initial}
            </div>
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-emerald-800">{job.category}</div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{job.company}</span>
                {job.isVerifiedEmployer && (
                  <span className="inline-flex items-center gap-1 text-xs text-blue-700 font-semibold">
                    <CheckCircle className="w-3.5 h-3.5" /> Verified Employer
                  </span>
                )}
                <span aria-hidden="true">·</span>
                <span>{job.location}</span>
              </div>
            </div>
          </div>

          <div className="sm:text-right space-y-1 shrink-0">
            <div className="text-base sm:text-lg font-extrabold text-emerald-800 tabular-nums">
              {job.salary}
            </div>
            <div className="text-xs text-slate-500">
              {job.arrangement} · {job.type} · Posted {job.posted}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-600">
            Contact: <span className="font-medium text-slate-900">{job.contactEmail}</span>
          </div>
          {isClosed ? (
            <div className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold">
              This position is currently closed to new applications.
            </div>
          ) : (
            <Link
              to={`/apply/${job.id}`}
              className="hidden sm:inline-flex min-h-[44px] px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-semibold rounded-xl items-center justify-center gap-2 transition-colors"
            >
              <span>{t(lang, 'applyNow')}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </section>

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Requirements & Description */}
        <div className="lg:col-span-7 space-y-6">
          <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900">Role Description</h2>
            <p className="text-sm text-slate-700 leading-relaxed">{job.description}</p>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <h3 className="text-sm font-bold text-slate-900">Requirements & Qualifications</h3>
              <p className="text-sm text-slate-700 leading-relaxed">{job.qualifications}</p>
            </div>

            {job.screeningQuestions && job.screeningQuestions.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <h3 className="text-sm font-bold text-slate-900">Employer Screening Questions</h3>
                <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-600 space-y-1">
                  {job.screeningQuestions.map((q, idx) => (
                    <li key={idx}>{q}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>

        {/* Right: How to Get There Panel */}
        <aside className="lg:col-span-5 space-y-4">
          <section className="bg-white border border-emerald-300 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-800" />
                <h2 className="text-base font-bold text-slate-900">{t(lang, 'howToGetThere')}</h2>
              </div>
              <span className="text-xs font-semibold text-emerald-800">{commute.label}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t(lang, 'myBarangay')}
              </label>
              <select
                value={homeBarangay}
                onChange={(e) => setHomeBarangay(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 text-xs font-semibold bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              >
                {BARANGAY_ORIGINS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center border-y border-slate-100 py-3">
              <div>
                <div className="text-[11px] font-medium text-slate-500">{t(lang, 'distanceLabel')}</div>
                <div className="text-sm font-extrabold text-slate-900 tabular-nums mt-0.5">
                  {commute.distanceKm > 0 ? `${commute.distanceKm} km` : '0 km'}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-slate-500">{t(lang, 'travelTimeLabel')}</div>
                <div className="text-sm font-extrabold text-slate-900 tabular-nums mt-0.5 flex items-center justify-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {commute.distanceKm > 0 ? `~${commute.minutes}m` : 'WFH'}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-slate-500">{t(lang, 'oneWayFareLabel')}</div>
                <div className="text-sm font-extrabold text-emerald-800 tabular-nums mt-0.5">
                  ₱{commute.fare}
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <div className="font-semibold text-slate-900">{t(lang, 'transitModesLabel')}</div>
                <div className="text-slate-700 mt-0.5">{commute.modes.join(' · ')}</div>
              </div>

              <div>
                <div className="font-semibold text-slate-900">{t(lang, 'stopsAlongRoute')}</div>
                <ol className="list-decimal pl-4 text-slate-700 space-y-1 mt-1">
                  {commute.stops.map((stop, idx) => (
                    <li key={idx}>{stop}</li>
                  ))}
                </ol>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1">
                <div className="flex items-start gap-1.5 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>Address:</strong> {job.exactAddress || job.location}
                  </span>
                </div>
                {job.landmark && (
                  <p className="text-slate-600 pl-5">
                    <strong>Landmark:</strong> {job.landmark}
                  </p>
                )}
                <p className="text-slate-600 pl-5">{commute.tip}</p>
              </div>
            </div>

            {/* Lazy-loaded Map Toggle for low-end mobile phones / slow connections */}
            {!showMap ? (
              <button
                type="button"
                onClick={() => setShowMap(true)}
                className="w-full min-h-[44px] py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <MapIcon className="w-4 h-4 text-emerald-800" />
                <span>Load Interactive Map Preview (Low-Data Mode)</span>
              </button>
            ) : (
              <Suspense
                fallback={
                  <div className="h-56 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center text-xs text-slate-600">
                    Loading interactive map...
                  </div>
                }
              >
                <LazyMiniJobMap
                  job={job}
                  userHomeLocation={homeBarangay}
                  distanceKm={commute.distanceKm}
                  minutes={commute.minutes}
                  commuteMode={commute.commuteMode}
                  originCoords={commute.originCoordinates}
                  destinationCoords={commute.destinationCoordinates}
                  onHomeLocationChange={setHomeBarangay}
                />
              </Suspense>
            )}

            <a
              href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(homeBarangay + ', Isabela')}&destination=${encodeURIComponent((job.exactAddress || job.location) + ', Isabela')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:underline min-h-[36px]"
            >
              <span>Open turn-by-turn directions in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </section>
        </aside>
      </div>

      {/* Mobile Sticky Bottom Apply CTA */}
      {!isClosed && (
        <div className="sm:hidden fixed bottom-14 left-0 right-0 z-30 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200">
          <Link
            to={`/apply/${job.id}`}
            className="w-full min-h-[48px] bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg"
          >
            <span>{t(lang, 'applyNow')}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
};
