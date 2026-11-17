import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, GraduationCap, Lock, CheckCircle, Upload } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiRequest, uploadSecureFile } from '../../utils/api';
import { validateUploadFile } from '../../utils/sanitize';
import { ResidentVerificationRequest } from '../../types';
import { t } from '../../utils/i18n';

export const GuidesPage: React.FC = () => {
  const { lang, currentUser, notify } = useApp();
  const [verifications, setVerifications] = useState<ResidentVerificationRequest[]>([]);

  const [resName, setResName] = useState(currentUser.name !== 'Guest User' ? currentUser.name : '');
  const [resBarangay, setResBarangay] = useState(currentUser.barangay || 'Marabulig 1');
  const [resIdType, setResIdType] = useState('Barangay Certificate');
  const [resIdNum, setResIdNum] = useState('');
  const [resDocName, setResDocName] = useState('');
  const [resDocId, setResDocId] = useState('');
  const [resConsent, setResConsent] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const q = currentUser.email ? `?email=${encodeURIComponent(currentUser.email)}` : '';
        const res = await apiRequest<{ verifications: ResidentVerificationRequest[] }>(
          `/api/verifications${q}`
        );
        setVerifications(res.verifications);
      } catch {
        // ignore if guest
      }
    })();
  }, [currentUser.email]);

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const check = validateUploadFile(file);
    if (!check.ok) {
      notify(check.error || 'Invalid file.', 'error');
      return;
    }
    setUploading(true);
    try {
      const uploaded = await uploadSecureFile(file);
      setResDocName(uploaded.fileName);
      setResDocId(uploaded.fileId);
      notify('Residency document attached securely.', 'success');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resConsent) {
      notify('Please accept the RA 10173 Data Privacy consent.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiRequest<{ verification: ResidentVerificationRequest }>('/api/verifications', {
        method: 'POST',
        body: JSON.stringify({
          applicantName: resName,
          email: currentUser.email || 'applicant@cauayan.ph',
          barangay: resBarangay,
          validIdType: resIdType,
          idNumber: resIdNum,
          documentFileName: resDocName || 'Barangay_Residency_Cert.pdf',
          documentFileId: resDocId,
        }),
      });
      setVerifications((prev) => [res.verification, ...prev]);
      setResIdNum('');
      setResDocName('');
      notify('Resident verification request submitted for LGU review.', 'success');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Submission failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{t(lang, 'guidesTitle')}</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
          Verify your Cauayan City residency, claim free first-time clearances, and review privacy safeguards.
        </p>
      </div>

      {/* Section 1: Resident Verification */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <form
          onSubmit={handleSubmit}
          className="md:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 text-xs"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <h2 className="text-base font-bold text-slate-900">Cauayan City Resident Verification</h2>
            </div>
            {(currentUser.role === 'reviewer' || currentUser.role === 'super_admin') && (
              <Link to="/admin/access" className="font-semibold text-emerald-800 hover:underline">
                Open LGU Review Queue →
              </Link>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Resident Full Name *</label>
            <input
              type="text"
              required
              value={resName}
              onChange={(e) => setResName(e.target.value)}
              placeholder="Juan Dela Cruz"
              className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Barangay in Cauayan City</label>
              <select
                value={resBarangay}
                onChange={(e) => setResBarangay(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl"
              >
                <option>Marabulig 1</option>
                <option>Marabulig 2</option>
                <option>San Fermin</option>
                <option>District 1 (Poblacion)</option>
                <option>District 2</option>
                <option>District 3</option>
                <option>Tagaran</option>
                <option>Cabaruan</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Proof of Residency Type</label>
              <select
                value={resIdType}
                onChange={(e) => setResIdType(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl"
              >
                <option>Barangay Certificate</option>
                <option>PhilID (National ID)</option>
                <option>Voter's Certificate (COMELEC)</option>
                <option>Postal ID</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">ID Number (Masked on Server) *</label>
            <input
              type="text"
              required
              value={resIdNum}
              onChange={(e) => setResIdNum(e.target.value)}
              placeholder="e.g. 1234-5678-9012"
              className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Document / ID Image or PDF</label>
            <label className="flex items-center gap-2 min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 cursor-pointer hover:bg-slate-100">
              <Upload className="w-4 h-4 text-slate-600" />
              <span className="font-medium text-slate-700 truncate">
                {uploading ? 'Uploading...' : resDocName || 'Choose PDF, PNG, or JPG (max 5 MB)'}
              </span>
              <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleDocUpload} className="sr-only" />
            </label>
          </div>

          <label className="flex items-start gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={resConsent}
              onChange={(e) => setResConsent(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-emerald-700 rounded"
            />
            <span className="text-[11px] text-slate-600 leading-relaxed">
              <strong>RA 10173 Consent:</strong> I authorize authorized Marabulig 1 / Cauayan LGU reviewers to verify this document solely for resident verification. Documents are never publicly displayed.
            </span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full min-h-[44px] py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-xl"
          >
            {submitting ? 'Submitting...' : 'Submit Verification Request'}
          </button>
        </form>

        <div className="md:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 space-y-3 text-xs">
          <h3 className="text-sm font-bold text-slate-900">Your Verification Status</h3>
          {verifications.length === 0 ? (
            <p className="text-slate-600">No verification requests submitted under your active email yet.</p>
          ) : (
            <div className="space-y-2.5">
              {verifications.map((v) => (
                <div key={v.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900">{v.barangay}</span>
                    <span
                      className={`font-bold ${
                        v.status === 'Approved'
                          ? 'text-emerald-700'
                          : v.status === 'Rejected'
                          ? 'text-red-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {v.status}
                    </span>
                  </div>
                  <div className="text-slate-600 font-mono text-[11px]">
                    {v.validIdType} · {v.idNumberMasked}
                  </div>
                  {v.reviewerNotes && <div className="text-slate-600">{v.reviewerNotes}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Section 2: First-Time Jobseekers Act (RA 11261) */}
      <section id="ra11261" className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-emerald-700" />
          <h2 className="text-base font-bold text-slate-900">
            First-Time Jobseekers Assistance Act (Republic Act No. 11261)
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          Under RA 11261, fresh graduates and first-time jobseekers in Cauayan City are entitled to waived fees for government pre-employment documents:
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700">
          {[
            'Barangay Certification (Marabulig 1 / Local Barangay Hall)',
            'Police Clearance (Cauayan City Police Station)',
            'NBI Clearance (1 Free First-Time Copy)',
            'Medical Certificate (Cauayan City Health Office)',
            'PSA Birth & Marriage Certificates (1 Free Copy)',
            'PESO Cauayan Endorsement Support',
          ].map((item) => (
            <li key={item} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Section 3: Data Privacy Act & Terms */}
      <section id="privacy" className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-3 text-xs text-slate-700 leading-relaxed">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-slate-700" />
          <h2 className="text-base font-bold text-slate-900">Data Privacy Policy (RA 10173) & Terms of Service</h2>
        </div>
        <p>
          <strong>Data Privacy (RA 10173):</strong> Personal information, résumés, and masked residency documents are collected solely for job matching with your chosen employer and LGU verification. Uploaded files undergo server-side validation and are never sold to third parties.
        </p>
        <p>
          <strong>Terms of Service:</strong> Employers must display transparent salary ranges compliant with DOLE Region II minimum wage standards and are strictly prohibited from charging recruitment or placement fees to applicants.
        </p>
      </section>
    </div>
  );
};
