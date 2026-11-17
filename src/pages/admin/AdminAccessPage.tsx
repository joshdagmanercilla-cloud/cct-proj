import React, { useEffect, useState, useCallback } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Lock, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  AuditLogEntry,
  ResidentVerificationRequest,
  UserProfile,
  UserRole,
} from '../../types';
import { apiRequest } from '../../utils/api';

export const AdminAccessPage: React.FC = () => {
  const { currentUser, notify } = useApp();
  const isSuperAdmin = currentUser.role === 'super_admin';
  const canReviewResidency = currentUser.role === 'super_admin' || currentUser.role === 'reviewer';

  const [verifications, setVerifications] = useState<ResidentVerificationRequest[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditFilter, setAuditFilter] = useState<'all' | AuditLogEntry['targetType']>('all');
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const verRes = await apiRequest<{ verifications: ResidentVerificationRequest[] }>(
        '/api/verifications'
      );
      setVerifications(verRes.verifications);

      if (isSuperAdmin) {
        const [userRes, logRes] = await Promise.all([
          apiRequest<{ users: UserProfile[] }>('/api/admin/users'),
          apiRequest<{ logs: AuditLogEntry[] }>('/api/admin/audit-logs'),
        ]);
        setUsers(userRes.users);
        setAuditLogs(logRes.logs);
      }
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Unable to load governance data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, notify]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleReviewVerification = async (
    id: string,
    status: 'Approved' | 'Rejected'
  ) => {
    if (!canReviewResidency) return;
    try {
      const res = await apiRequest<{ verification: ResidentVerificationRequest }>(
        `/api/admin/verifications/${id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            status,
            reviewerNotes: `${status} via PESO Residency Queue by ${currentUser.name}`,
          }),
        }
      );
      setVerifications((prev) => prev.map((v) => (v.id === id ? res.verification : v)));
      notify(`Residency verification ${status.toLowerCase()}.`, 'success');
      if (isSuperAdmin) loadAll();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Verification update failed.', 'error');
    }
  };

  const handleRoleChange = async (userId: string, role: UserRole) => {
    if (!isSuperAdmin) return;
    try {
      const res = await apiRequest<{ user: UserProfile }>(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
      setUsers((prev) => prev.map((u) => (u.id === userId ? res.user : u)));
      notify(`Updated ${res.user.name} role to ${role}.`, 'success');
      loadAll();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Role update failed.', 'error');
    }
  };

  const filteredLogs = auditLogs.filter(
    (log) => auditFilter === 'all' || log.targetType === auditFilter
  );

  return (
    <div className="space-y-6">
      {/* LGU Resident Verification Queue */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">LGU Resident Verification Queue</h2>
            <p className="text-xs text-slate-600">
              Approve or reject Barangay Residency IDs submitted by Cauayan City applicants.
            </p>
          </div>
          <button
            type="button"
            onClick={loadAll}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 inline-flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px]">
                <th className="py-3 px-4 font-semibold">Applicant</th>
                <th className="py-3 px-4 font-semibold">Barangay</th>
                <th className="py-3 px-4 font-semibold">ID Type &amp; Masked No.</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {verifications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No residency verification submissions found.
                  </td>
                </tr>
              ) : (
                verifications.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{item.applicantName}</div>
                      <div className="text-slate-500">{item.email}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{item.barangay}</td>
                    <td className="py-3 px-4">
                      <div className="text-slate-900">{item.validIdType}</div>
                      <div className="font-mono text-slate-500 text-[11px]">{item.idNumberMasked}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded font-semibold border ${
                          item.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : item.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {canReviewResidency ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleReviewVerification(item.id, 'Approved')}
                            className="px-2.5 py-1.5 font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg inline-flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReviewVerification(item.id, 'Rejected')}
                            className="px-2.5 py-1.5 font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg inline-flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400">Reviewer / Super Admin only</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Super Admin Governance: RBAC Users + Audit Trail */}
      {!isSuperAdmin ? (
        <div className="bg-slate-100 border border-slate-200 rounded-xl p-5 flex items-center gap-3 text-xs text-slate-700">
          <Lock className="w-4 h-4 text-slate-600 shrink-0" />
          <span>
            RBAC Role Assignment and Immutable Audit Logs are restricted to <strong>Super Admin</strong> accounts and protected by server-side middleware.
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-800" />
              <h2 className="text-sm font-bold text-slate-900">User Role Assignments (RBAC)</h2>
            </div>
            <div className="divide-y divide-slate-200 text-xs">
              {users.map((u) => (
                <div key={u.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 truncate">{u.name}</div>
                    <div className="text-slate-500 truncate">{u.email}</div>
                  </div>
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                    aria-label={`Assign role for ${u.name}`}
                    className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 font-medium text-slate-800"
                  >
                    <option value="jobseeker">Job Seeker</option>
                    <option value="employer">Employer / HR</option>
                    <option value="reviewer">PESO Reviewer</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col max-h-[480px]">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-slate-900">Immutable Audit Log</h2>
              <select
                value={auditFilter}
                onChange={(e) =>
                  setAuditFilter(e.target.value as 'all' | AuditLogEntry['targetType'])
                }
                aria-label="Filter audit logs by entity type"
                className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50"
              >
                <option value="all">All Events ({auditLogs.length})</option>
                <option value="job">Jobs</option>
                <option value="application">Applicants</option>
                <option value="commute">Commute</option>
                <option value="verification">Residency</option>
                <option value="payment">Payments</option>
                <option value="auth">Auth / Roles</option>
              </select>
            </div>

            <div className="divide-y divide-slate-200 overflow-y-auto text-xs">
              {filteredLogs.length === 0 ? (
                <div className="p-6 text-center text-slate-500">No audit entries match filter.</div>
              ) : (
                filteredLogs.map((log) => (
                  <div key={log.id} className="px-5 py-3 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900">
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[11px] text-slate-500 tabular-nums">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-slate-700">{log.details}</div>
                    <div className="text-[11px] text-slate-500">
                      Actor: {log.actorName} ({log.actorRole}) · Target: {log.targetId}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
