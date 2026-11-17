import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Copy,
  Edit3,
  Power,
  Download,
  Star,
  CreditCard,
  CheckCircle2,
  X,
  Search,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Job, JobStatus, PaymentTransaction } from '../../types';
import { apiRequest } from '../../utils/api';
import { exportJobsCsv } from '../../utils/export';
import { isValidPhPhone } from '../../utils/sanitize';

const CATEGORIES = [
  'Information Technology',
  'Sales & Marketing',
  'Healthcare',
  'Accounting & Finance',
  'BPO / Customer Service',
  'Logistics & Supply Chain',
  'Education & Training',
  'Hospitality & Tourism',
];

const LOCATIONS = [
  'Marabulig 1, Cauayan City',
  'District I, Cauayan City',
  'District II, Cauayan City',
  'District III, Cauayan City',
  'San Fermin, Cauayan City',
  'Sillawit, Cauayan City',
  'Cabisuculan, Cauayan City',
  'Tagaran, Cauayan City',
  'Alicia, Isabela',
  'Naguilian, Isabela',
  'Remote',
];

interface JobFormState {
  title: string;
  company: string;
  category: string;
  location: string;
  exactAddress: string;
  landmark: string;
  commuteTip: string;
  arrangement: 'On-site' | 'Hybrid' | 'Remote';
  level: 'no_experience' | 'entry_level' | 'internship';
  salary: string;
  salaryMin: string;
  salaryMax: string;
  description: string;
  qualifications: string;
  contactEmail: string;
  status: JobStatus;
  isFeatured: boolean;
  screeningQuestionsText: string;
}

const EMPTY_FORM: JobFormState = {
  title: '',
  company: '',
  category: 'Information Technology',
  location: 'District I, Cauayan City',
  exactAddress: '',
  landmark: '',
  commuteTip: '',
  arrangement: 'On-site',
  level: 'entry_level',
  salary: '₱18,000 - ₱22,000 / mo',
  salaryMin: '18000',
  salaryMax: '22000',
  description: '',
  qualifications: '',
  contactEmail: 'hr@cauayan.ph',
  status: 'active',
  isFeatured: false,
  screeningQuestionsText: 'Are you able to commute reliably to the job location?',
};

export const AdminJobsPage: React.FC = () => {
  const { jobs, jobsLoading, refreshJobs, currentUser, notify } = useApp();
  const canMutateJobs = currentUser.role === 'super_admin' || currentUser.role === 'employer';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | JobStatus>('all');

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<number | null>(null);
  const [form, setForm] = useState<JobFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Featured GCash/Maya Checkout & Receipt Modal State
  const [checkoutJob, setCheckoutJob] = useState<Job | null>(null);
  const [payMethod, setPayMethod] = useState<'GCash' | 'Maya' | 'Card'>('GCash');
  const [payPhone, setPayPhone] = useState('09171234567');
  const [paying, setPaying] = useState(false);
  const [receipt, setReceipt] = useState<PaymentTransaction | null>(null);

  const filteredJobs = useMemo(() => {
    const q = search.toLowerCase().trim();
    return jobs.filter((job) => {
      const st = job.status || 'active';
      if (statusFilter !== 'all' && st !== statusFilter) return false;
      if (
        q &&
        !job.title.toLowerCase().includes(q) &&
        !job.company.toLowerCase().includes(q) &&
        !job.location.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [jobs, search, statusFilter]);

  const openCreate = () => {
    setEditingJobId(null);
    setForm({
      ...EMPTY_FORM,
      company: currentUser.companyName || '',
      contactEmail: currentUser.email || 'hr@cauayan.ph',
    });
    setEditorOpen(true);
  };

  const openEdit = (job: Job) => {
    setEditingJobId(job.id);
    setForm({
      title: job.title,
      company: job.company,
      category: job.category,
      location: job.location,
      exactAddress: job.exactAddress || '',
      landmark: job.landmark || '',
      commuteTip: job.commuteTip || '',
      arrangement: job.arrangement,
      level: job.level,
      salary: job.salary,
      salaryMin: String(job.salaryMin || 15000),
      salaryMax: String(job.salaryMax || 22000),
      description: job.description,
      qualifications: job.qualifications,
      contactEmail: job.contactEmail,
      status: job.status || 'active',
      isFeatured: Boolean(job.isFeatured),
      screeningQuestionsText: (job.screeningQuestions || []).join('\n'),
    });
    setEditorOpen(true);
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canMutateJobs) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        salaryMin: Number(form.salaryMin) || 15000,
        salaryMax: Number(form.salaryMax) || 22000,
        screeningQuestions: form.screeningQuestionsText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
      };

      if (editingJobId) {
        await apiRequest(`/api/admin/jobs/${editingJobId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        notify('Job posting updated.', 'success');
      } else {
        await apiRequest('/api/admin/jobs', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        notify('New job posting published.', 'success');
      }
      setEditorOpen(false);
      await refreshJobs(true);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Unable to save job.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (job: Job) => {
    if (!canMutateJobs) return;
    const nextStatus: JobStatus = (job.status || 'active') === 'active' ? 'closed' : 'active';
    try {
      await apiRequest(`/api/admin/jobs/${job.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      notify(`Job marked ${nextStatus}.`, 'info');
      await refreshJobs(true);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to change status.', 'error');
    }
  };

  const handleDuplicate = async (job: Job) => {
    if (!canMutateJobs) return;
    try {
      await apiRequest(`/api/admin/jobs/${job.id}/duplicate`, { method: 'POST' });
      notify(`Duplicated "${job.title}" as a draft.`, 'success');
      await refreshJobs(true);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to duplicate listing.', 'error');
    }
  };

  const handlePayFeatured = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutJob) return;
    if (!isValidPhPhone(payPhone)) {
      notify('Enter a valid PH mobile number (e.g., 09171234567).', 'error');
      return;
    }
    setPaying(true);
    try {
      const res = await apiRequest<{ transaction: PaymentTransaction }>('/api/payments/checkout', {
        method: 'POST',
        body: JSON.stringify({
          jobId: checkoutJob.id,
          jobTitle: checkoutJob.title,
          method: payMethod,
          phone: payPhone,
        }),
      });
      await apiRequest(`/api/admin/jobs/${checkoutJob.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          isFeatured: true,
          logo: 'bg-amber-100 text-amber-800 border-amber-300',
        }),
      });
      setReceipt(res.transaction);
      setCheckoutJob(null);
      await refreshJobs(true);
      notify('Featured listing payment completed!', 'success');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Checkout failed.', 'error');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="space-y-5">
      {!canMutateJobs && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-900">
          Read-only view: PESO Reviewers can inspect job postings, while Employers and Super Admins can create, edit, duplicate, or feature listings.
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[260px]">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, company, or barangay..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-700"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | JobStatus)}
            aria-label="Filter jobs by status"
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-700"
          >
            <option value="all">All Statuses ({jobs.length})</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportJobsCsv(filteredJobs)}
            className="px-3 py-2 text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg inline-flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          {canMutateJobs && (
            <button
              type="button"
              onClick={openCreate}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Post New Job
            </button>
          )}
        </div>
      </div>

      {/* Data-Dense Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 font-semibold">Role &amp; Employer</th>
                <th className="py-3 px-4 font-semibold">Barangay / Mode</th>
                <th className="py-3 px-4 font-semibold">Salary</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {jobsLoading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">
                    Loading job inventory…
                  </td>
                </tr>
              ) : filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">
                    No job postings match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => {
                  const status = job.status || 'active';
                  return (
                    <tr key={job.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <span>{job.title}</span>
                          {job.isFeatured && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="text-slate-500 mt-0.5">
                          {job.company} · {job.category}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        <div>{job.location}</div>
                        <div className="text-slate-500">
                          {job.arrangement} · {job.type}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 tabular-nums whitespace-nowrap">
                        {job.salary}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded font-semibold capitalize ${
                            status === 'active'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : status === 'draft'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <Link
                            to={`/admin/applicants?jobId=${job.id}`}
                            className="p-1.5 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 rounded"
                            title="View applicants for this job"
                          >
                            <Users className="w-4 h-4" />
                          </Link>
                          {canMutateJobs && (
                            <>
                              {!job.isFeatured && (
                                <button
                                  type="button"
                                  onClick={() => setCheckoutJob(job)}
                                  className="p-1.5 text-amber-700 hover:bg-amber-50 rounded"
                                  title="Upgrade to Featured (₱499 GCash/Maya)"
                                >
                                  <Star className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => openEdit(job)}
                                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                                title="Edit job posting"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDuplicate(job)}
                                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                                title="Duplicate as draft"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(job)}
                                className={`p-1.5 rounded ${
                                  status === 'active'
                                    ? 'text-rose-600 hover:bg-rose-50'
                                    : 'text-emerald-700 hover:bg-emerald-50'
                                }`}
                                title={status === 'active' ? 'Close job listing' : 'Reopen job listing'}
                              >
                                <Power className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Job Modal */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                {editingJobId ? 'Edit Job Listing' : 'Create New Job Listing'}
              </h2>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Job Title *</label>
                  <input
                    required
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-700"
                    placeholder="e.g., Junior Accounting Staff"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company Name *</label>
                  <input
                    required
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-700"
                    placeholder="e.g., Isabela Agro-Trading Corp"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Barangay / Area</label>
                  <select
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    {LOCATIONS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Work Arrangement</label>
                  <select
                    value={form.arrangement}
                    onChange={(e) =>
                      setForm({ ...form, arrangement: e.target.value as 'On-site' | 'Hybrid' | 'Remote' })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="On-site">On-site</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Display Salary *</label>
                  <input
                    required
                    type="text"
                    value={form.salary}
                    onChange={(e) => setForm({ ...form, salary: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min ₱ / mo</label>
                  <input
                    type="number"
                    value={form.salaryMin}
                    onChange={(e) => setForm({ ...form, salaryMin: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max ₱ / mo</label>
                  <input
                    type="number"
                    value={form.salaryMax}
                    onChange={(e) => setForm({ ...form, salaryMax: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Exact Street Address</label>
                  <input
                    type="text"
                    value={form.exactAddress}
                    onChange={(e) => setForm({ ...form, exactAddress: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    placeholder="Street, Barangay, Cauayan City"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nearby Landmark</label>
                  <input
                    type="text"
                    value={form.landmark}
                    onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    placeholder="Across SM City Cauayan / Public Market"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Commute Tip</label>
                <input
                  type="text"
                  value={form.commuteTip}
                  onChange={(e) => setForm({ ...form, commuteTip: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  placeholder="Take Centro tricycle or SM Cauayan jeepney along Maharlika Hwy"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Requirements / Qualifications</label>
                <textarea
                  rows={2}
                  value={form.qualifications}
                  onChange={(e) => setForm({ ...form, qualifications: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Screening Questions (1 per line)
                </label>
                <textarea
                  rows={2}
                  value={form.screeningQuestionsText}
                  onChange={(e) => setForm({ ...form, screeningQuestionsText: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Experience Level</label>
                  <select
                    value={form.level}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        level: e.target.value as 'no_experience' | 'entry_level' | 'internship',
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="no_experience">No Experience</option>
                    <option value="entry_level">Entry Level</option>
                    <option value="internship">Trainee / Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Listing Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as JobStatus })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="active">Active (Public)</option>
                    <option value="draft">Draft (Hidden)</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">HR Contact Email</label>
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg disabled:opacity-50"
                >
                  {saving ? 'Saving…' : editingJobId ? 'Save Changes' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Featured Upgrade Checkout Modal */}
      {checkoutJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                  Featured 30-Day Placement
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{checkoutJob.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutJob(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between text-sm">
              <span className="text-slate-600">Featured Listing Fee</span>
              <span className="text-lg font-bold text-slate-900 tabular-nums">₱499.00</span>
            </div>

            <form onSubmit={handlePayFeatured} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['GCash', 'Maya', 'Card'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPayMethod(m)}
                      className={`py-2.5 px-3 rounded-lg font-semibold border transition-colors ${
                        payMethod === m
                          ? 'bg-emerald-800 text-white border-emerald-800'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Wallet / Verification Mobile Number
                </label>
                <input
                  required
                  type="tel"
                  value={payPhone}
                  onChange={(e) => setPayPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg tabular-nums"
                  placeholder="09171234567"
                />
              </div>

              <button
                type="submit"
                disabled={paying}
                className="w-full py-2.5 px-4 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg inline-flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CreditCard className="w-4 h-4" />
                {paying ? 'Processing Payment…' : `Pay ₱499 via ${payMethod}`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Electronic Receipt Modal */}
      {receipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Official Electronic Receipt</h3>
                <p className="text-xs text-slate-500">{receipt.timestamp}</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Reference Number</span>
                <span className="font-mono font-semibold text-slate-900">{receipt.referenceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Job Promoted</span>
                <span className="font-semibold text-slate-900">{receipt.jobTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Channel</span>
                <span className="font-semibold text-slate-900">{receipt.method}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="font-semibold text-slate-700">Total Paid</span>
                <span className="font-bold text-emerald-800 tabular-nums">₱{receipt.amountPesos}.00</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setReceipt(null)}
              className="w-full py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
