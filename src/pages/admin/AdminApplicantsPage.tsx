import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Download,
  FileText,
  X,
  CheckSquare,
  MessageSquarePlus,
  Calendar,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApplicationStatus, JobApplication } from '../../types';
import { apiRequest } from '../../utils/api';
import { exportApplicationsCsv, exportSummaryPdf } from '../../utils/export';

interface ApplicantsResponse {
  applicants: JobApplication[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const STATUS_BADGE: Record<ApplicationStatus, string> = {
  Submitted: 'bg-slate-100 text-slate-700 border-slate-200',
  'Under Review': 'bg-sky-50 text-sky-800 border-sky-200',
  Interview: 'bg-amber-50 text-amber-800 border-amber-200',
  Hired: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Rejected: 'bg-rose-50 text-rose-800 border-rose-200',
};

export const AdminApplicantsPage: React.FC = () => {
  const { jobs, notify } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ApplicationStatus>('all');
  const [jobIdFilter, setJobIdFilter] = useState<string>(searchParams.get('jobId') || 'all');
  const [sortBy, setSortBy] = useState<'newest' | 'name' | 'status'>('newest');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [applicants, setApplicants] = useState<JobApplication[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Bulk Selection & Action
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<ApplicationStatus>('Under Review');
  const [bulkRemarks, setBulkRemarks] = useState('');
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  // Applicant Detail Drawer
  const [activeApp, setActiveApp] = useState<JobApplication | null>(null);
  const [targetStatus, setTargetStatus] = useState<ApplicationStatus>('Under Review');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewLocation, setInterviewLocation] = useState(
    'PESO / HR Office, Cauayan City, Isabela'
  );
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Internal Note Form
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const loadApplicants = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const qs = new URLSearchParams({
        search,
        status: statusFilter,
        jobId: jobIdFilter,
        sortBy,
        page: String(page),
        limit: String(limit),
      });
      const res = await apiRequest<ApplicantsResponse>(`/api/admin/applicants?${qs.toString()}`);
      setApplicants(res.applicants);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load applicants.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, jobIdFilter, sortBy, page, limit]);

  useEffect(() => {
    loadApplicants();
  }, [loadApplicants]);

  useEffect(() => {
    const paramJobId = searchParams.get('jobId');
    if (paramJobId && paramJobId !== jobIdFilter) {
      setJobIdFilter(paramJobId);
      setPage(1);
    }
  }, [searchParams, jobIdFilter]);

  const toggleSelectAll = () => {
    if (selectedIds.length === applicants.length && applicants.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(applicants.map((a) => a.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const openDetail = (app: JobApplication) => {
    setActiveApp(app);
    setTargetStatus(app.status === 'Submitted' ? 'Under Review' : app.status);
    setStatusRemarks('');
    setInterviewDate(app.interviewDate || '');
    setInterviewLocation(app.interviewLocation || 'PESO / HR Office, Cauayan City, Isabela');
    setNoteText('');
  };

  const handleSingleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApp) return;
    if (statusRemarks.trim().length < 3) {
      notify('Remarks are required when updating applicant status (min 3 chars).', 'error');
      return;
    }
    setUpdatingStatus(true);
    try {
      const res = await apiRequest<{ application: JobApplication }>(
        `/api/admin/applicants/${activeApp.id}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            status: targetStatus,
            remarks: statusRemarks.trim(),
            interviewDate: targetStatus === 'Interview' ? interviewDate : undefined,
            interviewLocation: targetStatus === 'Interview' ? interviewLocation : undefined,
          }),
        }
      );
      setActiveApp(res.application);
      setStatusRemarks('');
      notify(`Updated ${res.application.applicantName} to ${targetStatus}.`, 'success');
      await loadApplicants();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Status update failed.', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApp || noteText.trim().length < 2) return;
    setAddingNote(true);
    try {
      const res = await apiRequest<{ application: JobApplication }>(
        `/api/admin/applicants/${activeApp.id}/notes`,
        {
          method: 'POST',
          body: JSON.stringify({ text: noteText.trim() }),
        }
      );
      setActiveApp(res.application);
      setNoteText('');
      notify('Internal note saved.', 'success');
      await loadApplicants();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Unable to save note.', 'error');
    } finally {
      setAddingNote(false);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkRemarks.trim().length < 3) {
      notify('Please enter remarks for this bulk update.', 'error');
      return;
    }
    setBulkSubmitting(true);
    try {
      const res = await apiRequest<{ updatedCount: number }>('/api/admin/applicants/bulk-status', {
        method: 'POST',
        body: JSON.stringify({
          ids: selectedIds,
          status: bulkStatus,
          remarks: bulkRemarks.trim(),
        }),
      });
      notify(`Updated ${res.updatedCount} applicants to ${bulkStatus}.`, 'success');
      setSelectedIds([]);
      setBulkRemarks('');
      setBulkModalOpen(false);
      await loadApplicants();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Bulk update failed.', 'error');
    } finally {
      setBulkSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter & Export Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="relative min-w-[210px] flex-1 max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search name, email, tracking ID, barangay..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-700"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as 'all' | ApplicationStatus);
                setPage(1);
              }}
              aria-label="Filter applicants by stage"
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
            >
              <option value="all">All Stages</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Interview">Interview</option>
              <option value="Hired">Hired</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={jobIdFilter}
              onChange={(e) => {
                const next = e.target.value;
                setJobIdFilter(next);
                setPage(1);
                if (next === 'all') {
                  searchParams.delete('jobId');
                } else {
                  searchParams.set('jobId', next);
                }
                setSearchParams(searchParams);
              }}
              aria-label="Filter applicants by job"
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg max-w-[200px]"
            >
              <option value="all">All Job Postings</option>
              {jobs.map((j) => (
                <option key={j.id} value={String(j.id)}>
                  {j.title} ({j.company})
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'name' | 'status')}
              aria-label="Sort applicants"
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
            >
              <option value="newest">Sort: Newest</option>
              <option value="name">Sort: Applicant Name</option>
              <option value="status">Sort: Stage</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => exportApplicationsCsv(applicants)}
              className="px-3 py-2 text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg inline-flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>
            <button
              type="button"
              onClick={() =>
                exportSummaryPdf(
                  'Cauayan City Career Connect — Applicant Roster',
                  `Filtered Pipeline (${total} matching applicants)`,
                  applicants,
                  jobs
                )
              }
              className="px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg inline-flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="font-semibold text-emerald-900 flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              <span className="tabular-nums">{selectedIds.length} applicants selected</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setBulkStatus('Under Review');
                  setBulkModalOpen(true);
                }}
                className="px-3 py-1.5 font-semibold bg-white border border-emerald-300 text-emerald-900 hover:bg-emerald-100 rounded-lg"
              >
                Bulk Shortlist
              </button>
              <button
                type="button"
                onClick={() => {
                  setBulkStatus('Rejected');
                  setBulkModalOpen(true);
                }}
                className="px-3 py-1.5 font-semibold bg-white border border-rose-300 text-rose-800 hover:bg-rose-50 rounded-lg"
              >
                Bulk Reject
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="px-2 py-1.5 text-slate-600 hover:text-slate-900"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Applicants Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {error ? (
          <div className="p-6 text-center text-xs text-rose-700">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={applicants.length > 0 && selectedIds.length === applicants.length}
                      onChange={toggleSelectAll}
                      aria-label="Select all visible applicants"
                      className="rounded border-slate-300 text-emerald-700"
                    />
                  </th>
                  <th className="py-3 px-4 font-semibold">Applicant &amp; Tracking ID</th>
                  <th className="py-3 px-4 font-semibold">Applied Role</th>
                  <th className="py-3 px-4 font-semibold">Barangay</th>
                  <th className="py-3 px-4 font-semibold">Stage</th>
                  <th className="py-3 px-4 font-semibold">Submitted</th>
                  <th className="py-3 px-4 font-semibold text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-500">
                      Loading applicant records…
                    </td>
                  </tr>
                ) : applicants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-500">
                      No applicants match your current search or filter.
                    </td>
                  </tr>
                ) : (
                  applicants.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => openDetail(app)}
                    >
                      <td
                        className="py-3 px-4"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(app.id)}
                          onChange={() => toggleSelectOne(app.id)}
                          aria-label={`Select ${app.applicantName}`}
                          className="rounded border-slate-300 text-emerald-700"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{app.applicantName}</div>
                        <div className="text-slate-500 font-mono text-[11px]">{app.id}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">{app.jobTitle}</div>
                        <div className="text-slate-500">{app.company}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{app.barangay || 'Cauayan City'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded font-semibold border ${STATUS_BADGE[app.status]}`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{app.appliedAt}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetail(app);
                          }}
                          className="px-3 py-1.5 font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="px-4 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2 tabular-nums">
            <span>
              Showing page {page} of {totalPages} ({total} total)
            </span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              aria-label="Rows per page"
              className="px-2 py-1 border border-slate-200 rounded bg-white"
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Applicant Detail Drawer */}
      {activeApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex justify-end">
          <div className="bg-white w-full max-w-2xl h-full flex flex-col border-l border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-mono text-slate-500">{activeApp.id}</div>
                <h2 className="text-lg font-bold text-slate-900">{activeApp.applicantName}</h2>
                <p className="text-xs text-slate-600">
                  {activeApp.jobTitle} · {activeApp.company}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveApp(null)}
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg"
                aria-label="Close applicant detail drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* Contact & Residency Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div>
                  <div className="text-slate-500">Status</div>
                  <div className="font-bold text-slate-900 mt-0.5">{activeApp.status}</div>
                </div>
                <div>
                  <div className="text-slate-500">Barangay</div>
                  <div className="font-semibold text-slate-900 mt-0.5">
                    {activeApp.barangay || 'Cauayan City'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Mobile</div>
                  <div className="font-semibold text-slate-900 mt-0.5 tabular-nums">
                    {activeApp.applicantPhone}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Email</div>
                  <div className="font-semibold text-slate-900 mt-0.5 truncate">
                    {activeApp.applicantEmail}
                  </div>
                </div>
              </div>

              {/* Action Panel (Shortlist, Schedule Interview, Hire, Reject with Required Remarks) */}
              <form
                onSubmit={handleSingleStatusUpdate}
                className="bg-white border border-slate-200 rounded-xl p-4 space-y-3"
              >
                <div className="font-bold text-slate-900 text-sm">
                  Update Hiring Stage (Remarks Required)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      { status: 'Under Review', label: 'Shortlist', icon: UserCheck },
                      { status: 'Interview', label: 'Interview', icon: Calendar },
                      { status: 'Hired', label: 'Hire', icon: UserCheck },
                      { status: 'Rejected', label: 'Reject', icon: UserX },
                    ] as const
                  ).map((btn) => {
                    const Icon = btn.icon;
                    const active = targetStatus === btn.status;
                    return (
                      <button
                        key={btn.status}
                        type="button"
                        onClick={() => setTargetStatus(btn.status)}
                        className={`py-2 px-3 rounded-lg font-semibold border flex items-center justify-center gap-1.5 transition-colors ${
                          active
                            ? btn.status === 'Rejected'
                              ? 'bg-rose-700 text-white border-rose-700'
                              : 'bg-emerald-800 text-white border-emerald-800'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{btn.label}</span>
                      </button>
                    );
                  })}
                </div>

                {targetStatus === 'Interview' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Interview Date &amp; Time
                      </label>
                      <input
                        type="datetime-local"
                        value={interviewDate}
                        onChange={(e) => setInterviewDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Interview Location / Link
                      </label>
                      <input
                        type="text"
                        value={interviewLocation}
                        onChange={(e) => setInterviewLocation(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Decision Remarks (Visible in tracker &amp; audit trail) *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={statusRemarks}
                    onChange={(e) => setStatusRemarks(e.target.value)}
                    placeholder="e.g., Shortlisted for technical interview based on local accounting experience."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-700"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={updatingStatus || statusRemarks.trim().length < 3}
                    className="px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-40"
                  >
                    {updatingStatus ? 'Updating…' : `Confirm Stage: ${targetStatus}`}
                  </button>
                </div>
              </form>

              {/* Résumé & Preview */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900">
                    Résumé Attachment: {activeApp.resumeFileName}
                  </div>
                  {activeApp.resumeFileId && (
                    <a
                      href={`/api/uploads/${activeApp.resumeFileId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-800 font-semibold inline-flex items-center gap-1 hover:underline"
                    >
                      Open File
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
                {activeApp.resumeFileId ? (
                  activeApp.resumeMimeType?.startsWith('image/') ? (
                    <img
                      src={`/api/uploads/${activeApp.resumeFileId}`}
                      alt="Applicant resume preview"
                      className="max-h-72 rounded-lg border border-slate-200 object-contain bg-slate-50 w-full"
                    />
                  ) : activeApp.resumeMimeType === 'application/pdf' ? (
                    <iframe
                      title="Resume PDF preview"
                      src={`/api/uploads/${activeApp.resumeFileId}`}
                      className="w-full h-64 rounded-lg border border-slate-200 bg-slate-50"
                    />
                  ) : (
                    <p className="text-slate-600">
                      Document stored securely ({Math.round((activeApp.resumeSizeBytes || 0) / 1024)} KB). Use Open File to download.
                    </p>
                  )
                ) : (
                  <p className="text-slate-500">
                    Seeded sample application — file metadata recorded ({activeApp.resumeFileName}).
                  </p>
                )}
              </div>

              {/* Cover Note & Screening Answers */}
              {(activeApp.coverNote ||
                (activeApp.screeningAnswers && Object.keys(activeApp.screeningAnswers).length > 0)) && (
                <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="font-bold text-slate-900">Screening Answers &amp; Cover Note</div>
                  {activeApp.coverNote && (
                    <p className="text-slate-700 bg-slate-50 p-3 rounded-lg">{activeApp.coverNote}</p>
                  )}
                  {activeApp.screeningAnswers &&
                    Object.entries(activeApp.screeningAnswers).map(([q, ans]) => (
                      <div key={q} className="space-y-0.5">
                        <div className="font-semibold text-slate-700">{q}</div>
                        <div className="text-slate-900">{ans}</div>
                      </div>
                    ))}
                </div>
              )}

              {/* Internal Notes */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="font-bold text-slate-900">Internal Reviewer Notes</div>
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add private evaluation note for HR / PESO staff..."
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg"
                  />
                  <button
                    type="submit"
                    disabled={addingNote || noteText.trim().length < 2}
                    className="px-3 py-2 font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg inline-flex items-center gap-1 disabled:opacity-40"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </form>

                {(activeApp.notes || []).length === 0 ? (
                  <p className="text-slate-500">No internal notes recorded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {activeApp.notes!.map((n) => (
                      <div key={n.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                        <div className="flex justify-between text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-700">
                            {n.author} ({n.role})
                          </span>
                          <span>{new Date(n.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="text-slate-900 mt-1">{n.text}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status History */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="font-bold text-slate-900">Status History Timeline</div>
                <div className="space-y-2">
                  {(activeApp.statusHistory || []).map((entry, idx) => (
                    <div
                      key={`${entry.timestamp}-${idx}`}
                      className="flex items-start justify-between gap-3 py-2 border-b last:border-b-0 border-slate-100"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{entry.status}</span>
                        <p className="text-slate-600 mt-0.5">{entry.remarks}</p>
                      </div>
                      <div className="text-right text-[11px] text-slate-500 shrink-0">
                        <div>{entry.changedBy}</div>
                        <div>{new Date(entry.timestamp).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Remarks Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Bulk Set {selectedIds.length} Applicants to {bulkStatus}
              </h3>
              <button
                type="button"
                onClick={() => setBulkModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleBulkSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Required Batch Remarks *
                </label>
                <textarea
                  required
                  rows={3}
                  value={bulkRemarks}
                  onChange={(e) => setBulkRemarks(e.target.value)}
                  placeholder="Provide reason for batch update..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBulkModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-700 border border-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bulkSubmitting || bulkRemarks.trim().length < 3}
                  className="px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-40"
                >
                  {bulkSubmitting ? 'Applying…' : 'Confirm Batch Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
