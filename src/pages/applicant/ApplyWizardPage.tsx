import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  Upload,
  FileText,
  AlertCircle,
  Save,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { computeJobCommute } from '../../utils/commute';
import { isValidEmail, isValidPhPhone, validateUploadFile } from '../../utils/sanitize';
import { apiRequest, uploadSecureFile } from '../../utils/api';
import { JobApplication } from '../../types';
import { t } from '../../utils/i18n';

interface DraftData {
  step: number;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  barangay: string;
  coverNote: string;
  screeningAnswers: Record<string, string>;
  resumeFileName: string;
  resumeFileId: string;
  resumeMimeType: string;
  resumeSizeBytes: number;
  resumePreviewUrl: string;
  savedAt: string;
}

export const ApplyWizardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lang, jobs, commuteRoutes, homeBarangay, currentUser, notify } = useApp();

  const job = jobs.find((j) => String(j.id) === String(id));
  const draftKey = `cauayan_apply_draft_v3_${id}`;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [applicantName, setApplicantName] = useState(currentUser.name !== 'Guest User' ? currentUser.name : '');
  const [applicantEmail, setApplicantEmail] = useState(currentUser.email || '');
  const [applicantPhone, setApplicantPhone] = useState(currentUser.phone || '');
  const [barangay, setBarangay] = useState(homeBarangay);
  const [coverNote, setCoverNote] = useState('');
  const [screeningAnswers, setScreeningAnswers] = useState<Record<string, string>>({});

  // Secure upload metadata
  const [resumeFileName, setResumeFileName] = useState('');
  const [resumeFileId, setResumeFileId] = useState('');
  const [resumeMimeType, setResumeMimeType] = useState('');
  const [resumeSizeBytes, setResumeSizeBytes] = useState(0);
  const [resumePreviewUrl, setResumePreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<JobApplication | null>(null);
  const [draftStatus, setDraftStatus] = useState('');

  // Restore saved draft if present
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const d = JSON.parse(raw) as DraftData;
        if (d.applicantName) setApplicantName(d.applicantName);
        if (d.applicantEmail) setApplicantEmail(d.applicantEmail);
        if (d.applicantPhone) setApplicantPhone(d.applicantPhone);
        if (d.barangay) setBarangay(d.barangay);
        if (d.coverNote) setCoverNote(d.coverNote);
        if (d.screeningAnswers) setScreeningAnswers(d.screeningAnswers);
        if (d.resumeFileName) setResumeFileName(d.resumeFileName);
        if (d.resumeFileId) setResumeFileId(d.resumeFileId);
        if (d.resumeMimeType) setResumeMimeType(d.resumeMimeType);
        if (d.resumeSizeBytes) setResumeSizeBytes(d.resumeSizeBytes);
        if (d.resumePreviewUrl) setResumePreviewUrl(d.resumePreviewUrl);
        setDraftStatus(`${t(lang, 'draftRestored')} (${d.savedAt})`);
      }
    } catch {
      // ignore corrupted draft
    }
  }, [draftKey, lang]);

  if (!job) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-4">
        <h1 className="text-xl font-bold text-slate-900">Job listing unavailable</h1>
        <Link to="/jobs" className="inline-flex min-h-[44px] px-5 py-2.5 bg-emerald-800 text-white text-xs font-semibold rounded-xl items-center">
          Back to Jobs
        </Link>
      </div>
    );
  }

  const commute = computeJobCommute(job, barangay, commuteRoutes);
  const questions = job.screeningQuestions || [
    'Are you able to commute reliably to this job location?',
  ];

  const saveDraft = () => {
    const payload: DraftData = {
      step,
      applicantName,
      applicantEmail,
      applicantPhone,
      barangay,
      coverNote,
      screeningAnswers,
      resumeFileName,
      resumeFileId,
      resumeMimeType,
      resumeSizeBytes,
      resumePreviewUrl,
      savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    localStorage.setItem(draftKey, JSON.stringify(payload));
    setDraftStatus(`Draft saved at ${payload.savedAt}`);
    notify('Application draft saved to your device.', 'success');
  };

  const validateStep1 = (): boolean => {
    const next: Record<string, string> = {};
    if (applicantName.trim().length < 2) next.name = 'Please enter your full name.';
    if (!isValidEmail(applicantEmail)) next.email = 'Please enter a valid email address.';
    if (!isValidPhPhone(applicantPhone)) {
      next.phone = 'Use a valid Philippine mobile number (e.g. 09171234567 or +639171234567).';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStep2 = (): boolean => {
    const next: Record<string, string> = {};
    if (!resumeFileName) {
      next.resume = 'Please upload your résumé (PDF, DOC, DOCX, PNG, or JPG).';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const check = validateUploadFile(file);
    if (!check.ok) {
      setErrors((prev) => ({ ...prev, resume: check.error || 'Invalid file.' }));
      return;
    }
    setErrors((prev) => ({ ...prev, resume: '' }));
    setUploading(true);
    try {
      const uploaded = await uploadSecureFile(file);
      setResumeFileName(uploaded.fileName);
      setResumeFileId(uploaded.fileId);
      setResumeMimeType(uploaded.mimeType);
      setResumeSizeBytes(uploaded.sizeBytes);
      setResumePreviewUrl(uploaded.previewUrl);
      notify('Résumé uploaded & scanned securely.', 'success');
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        resume: err instanceof Error ? err.message : 'File upload failed.',
      }));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!locationConfirmed) {
      setSubmitError('Please confirm that you reviewed the job location and commute fare.');
      return;
    }
    if (!privacyConsent) {
      setSubmitError('Please accept the Data Privacy Act (RA 10173) disclosure to submit.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiRequest<{ application: JobApplication }>('/api/applications', {
        method: 'POST',
        body: JSON.stringify({
          jobId: job.id,
          applicantName,
          applicantEmail,
          applicantPhone,
          barangay,
          resumeFileName,
          resumeFileId,
          resumeMimeType,
          resumeSizeBytes,
          coverNote,
          screeningAnswers,
        }),
      });
      localStorage.removeItem(draftKey);
      setSubmittedApp(res.application);
      notify('Application submitted! Tracking ID generated.', 'success');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedApp) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-extrabold text-slate-900">Application Submitted</h1>
            <p className="text-sm text-slate-600">
              Your application for <strong>{submittedApp.jobTitle}</strong> has been sent to{' '}
              <strong>{submittedApp.company}</strong>.
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-sm">
            Tracking Code: <strong className="text-emerald-800">{submittedApp.id}</strong>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
            <button
              type="button"
              onClick={() => navigate('/tracker')}
              className="min-h-[44px] px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-xl"
            >
              Track Application Status
            </button>
            <Link
              to="/jobs"
              className="min-h-[44px] px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl flex items-center justify-center"
            >
              Browse More Jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Link
          to={`/jobs/${job.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Job Details
        </Link>
        <button
          type="button"
          onClick={saveDraft}
          className="min-h-[40px] px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5"
        >
          <Save className="w-3.5 h-3.5" /> {t(lang, 'saveDraft')}
        </button>
      </div>

      {/* Header + Progress Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div>
          <div className="text-xs font-semibold text-emerald-800">{job.company}</div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">{job.title}</h1>
        </div>

        {/* 3-Step Indicator */}
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
            {[
              { n: 1, label: t(lang, 'stepInfo') },
              { n: 2, label: t(lang, 'stepResume') },
              { n: 3, label: t(lang, 'stepReview') },
            ].map((item) => (
              <div
                key={item.n}
                className={`py-2 px-2.5 rounded-lg border text-center truncate ${
                  step === item.n
                    ? 'bg-emerald-800 text-white border-emerald-800'
                    : step > item.n
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}
              >
                {item.label}
              </div>
            ))}
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-700 transition-all duration-200"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {draftStatus && (
          <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
            {draftStatus}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
        {step === 1 && (
          <div className="space-y-4 text-xs sm:text-sm">
            <h2 className="text-base font-bold text-slate-900">Applicant Contact Details</h2>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                placeholder="Juan Dela Cruz"
                className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={applicantEmail}
                  onChange={(e) => setApplicantEmail(e.target.value)}
                  placeholder="juan@example.ph"
                  className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Philippine Mobile Number *
                </label>
                <input
                  type="tel"
                  value={applicantPhone}
                  onChange={(e) => setApplicantPhone(e.target.value)}
                  placeholder="09171234567"
                  className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
                {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Barangay / Town</label>
              <input
                type="text"
                value={barangay}
                onChange={(e) => setBarangay(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (validateStep1()) setStep(2);
                }}
                className="min-h-[44px] px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-1.5"
              >
                <span>Next: Résumé & Answers</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 text-xs sm:text-sm">
            <h2 className="text-base font-bold text-slate-900">Résumé Upload & Screening Questions</h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Upload Résumé (PDF, DOC, DOCX, PNG, JPG · Max 5 MB) *
              </label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-emerald-600 rounded-2xl p-5 cursor-pointer bg-slate-50 transition-colors">
                <Upload className="w-6 h-6 text-slate-500 mb-1.5" />
                <span className="text-xs font-semibold text-slate-800">
                  {uploading ? 'Validating & uploading securely...' : 'Tap to choose file from device'}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5">
                  Magic-byte & MIME verified on server
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
              {errors.resume && <p className="text-xs text-red-600 mt-1.5">{errors.resume}</p>}

              {resumeFileName && (
                <div className="mt-3 p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span className="font-semibold text-slate-900 truncate">{resumeFileName}</span>
                    </div>
                    <span className="text-slate-600 tabular-nums shrink-0">
                      {Math.max(1, Math.round(resumeSizeBytes / 1024))} KB
                    </span>
                  </div>

                  {/* Inline File Preview */}
                  {resumePreviewUrl && resumeMimeType === 'application/pdf' && (
                    <iframe
                      title="Résumé PDF Preview"
                      src={resumePreviewUrl}
                      className="w-full h-52 rounded-lg border border-slate-200 bg-white"
                    />
                  )}
                  {resumePreviewUrl && resumeMimeType.startsWith('image/') && (
                    <img
                      src={resumePreviewUrl}
                      alt="Uploaded résumé preview"
                      className="max-h-52 rounded-lg border border-slate-200 mx-auto object-contain bg-white"
                    />
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-900">Employer Screening Questions</div>
              {questions.map((q, idx) => (
                <div key={idx}>
                  <label className="block text-xs font-medium text-slate-700 mb-1">{q}</label>
                  <input
                    type="text"
                    value={screeningAnswers[q] || ''}
                    onChange={(e) =>
                      setScreeningAnswers((prev) => ({ ...prev, [q]: e.target.value }))
                    }
                    placeholder="Your answer..."
                    className="w-full min-h-[44px] px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Short Cover Note (Optional)
              </label>
              <textarea
                rows={3}
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                placeholder="Briefly introduce your skills, graduation year, or barangay availability..."
                className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="min-h-[44px] px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (validateStep2()) setStep(3);
                }}
                className="min-h-[44px] px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-1.5"
              >
                <span>Next: Review & Submit</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 text-xs sm:text-sm">
            <h2 className="text-base font-bold text-slate-900">Review Commute & Submit</h2>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Applicant:</span>
                <span className="font-semibold text-slate-900">{applicantName} ({applicantPhone})</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Résumé File:</span>
                <span className="font-semibold text-slate-900">{resumeFileName}</span>
              </div>
              <div className="flex justify-between gap-2 pt-2 border-t border-slate-200">
                <span className="text-slate-500">Workplace:</span>
                <span className="font-semibold text-slate-900 text-right">{job.exactAddress || job.location}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Commute from {barangay.split(',')[0]}:</span>
                <span className="font-bold text-emerald-800 tabular-nums">
                  {commute.distanceKm > 0
                    ? `${commute.distanceKm} km · ~${commute.minutes} mins · ₱${commute.fare} fare`
                    : 'Remote (₱0 fare)'}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={locationConfirmed}
                  onChange={(e) => setLocationConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-emerald-700 rounded"
                />
                <span className="text-slate-700 leading-relaxed">
                  <strong>Location Confirmation:</strong> I reviewed the workplace address and estimated commute cost (~{commute.minutes} mins / ₱{commute.fare} one-way) from {barangay.split(',')[0]}.
                </span>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacyConsent}
                  onChange={(e) => setPrivacyConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-emerald-700 rounded"
                />
                <span className="text-slate-700 leading-relaxed">
                  <strong>Data Privacy Act (RA 10173):</strong> I consent to sharing my contact info and résumé exclusively with <strong>{job.company}</strong> for hiring review.
                </span>
              </label>
            </div>

            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="min-h-[44px] px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="min-h-[48px] px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {submitting ? 'Submitting...' : t(lang, 'submitApplication')}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
