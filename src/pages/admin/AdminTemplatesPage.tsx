import React, { useEffect, useState } from 'react';
import { Download, FileText, Mail, MessageSquare, Copy, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { JobApplication, NotificationTemplate } from '../../types';
import { apiRequest } from '../../utils/api';
import { exportApplicationsCsv, exportJobsCsv, exportSummaryPdf } from '../../utils/export';

export const AdminTemplatesPage: React.FC = () => {
  const { jobs, currentUser, notify } = useApp();
  const canEditTemplates = currentUser.role === 'super_admin' || currentUser.role === 'employer';

  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [selected, setSelected] = useState<NotificationTemplate | null>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [allApps, setAllApps] = useState<JobApplication[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [tplRes, appRes] = await Promise.all([
          apiRequest<{ templates: NotificationTemplate[] }>('/api/admin/templates'),
          apiRequest<{ applicants: JobApplication[] }>('/api/admin/applicants?limit=50'),
        ]);
        setTemplates(tplRes.templates);
        setAllApps(appRes.applicants);
        if (tplRes.templates.length > 0) {
          const first = tplRes.templates[0];
          setSelected(first);
          setSubject(first.subject || '');
          setBody(first.body);
        }
      } catch (err) {
        notify(err instanceof Error ? err.message : 'Unable to load templates.', 'error');
      }
    })();
  }, [notify]);

  const chooseTemplate = (tpl: NotificationTemplate) => {
    setSelected(tpl);
    setSubject(tpl.subject || '');
    setBody(tpl.body);
  };

  const renderPreview = (text: string) =>
    text
      .replace(/\{\{applicantName\}\}/g, 'Juan Dela Cruz')
      .replace(/\{\{jobTitle\}\}/g, 'Junior Accounting Staff')
      .replace(/\{\{company\}\}/g, 'Isabela Agro-Trading Corp')
      .replace(/\{\{interviewDate\}\}/g, 'Monday, 10:00 AM @ PESO Cauayan City')
      .replace(/\{\{remarks\}\}/g, 'Bring 2 valid IDs and copy of Barangay Clearance.');

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !canEditTemplates) return;
    setSaving(true);
    try {
      const res = await apiRequest<{ template: NotificationTemplate }>(
        `/api/admin/templates/${selected.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ subject, body }),
        }
      );
      setTemplates((prev) => prev.map((t) => (t.id === res.template.id ? res.template : t)));
      setSelected(res.template);
      notify('Notification template saved.', 'success');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to save template.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const copyPreview = async () => {
    try {
      await navigator.clipboard.writeText(renderPreview(body));
      notify('Rendered notification copied to clipboard.', 'success');
    } catch {
      notify('Clipboard access unavailable.', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Center */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Data Exports (CSV &amp; PDF Reports)</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            CSV exports apply formula-injection neutralization. PDF reports download directly via client-side generation.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <button
            type="button"
            onClick={() => exportApplicationsCsv(allApps)}
            className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center justify-between text-left"
          >
            <div>
              <div className="font-bold text-slate-900">Export Applicants CSV</div>
              <div className="text-slate-500 mt-0.5 tabular-nums">{allApps.length} records</div>
            </div>
            <Download className="w-4 h-4 text-emerald-800" />
          </button>

          <button
            type="button"
            onClick={() => exportJobsCsv(jobs)}
            className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center justify-between text-left"
          >
            <div>
              <div className="font-bold text-slate-900">Export Job Inventory CSV</div>
              <div className="text-slate-500 mt-0.5 tabular-nums">{jobs.length} listings</div>
            </div>
            <Download className="w-4 h-4 text-emerald-800" />
          </button>

          <button
            type="button"
            onClick={() =>
              exportSummaryPdf(
                'Cauayan City Career Connect — Hiring Report',
                'Official PESO & Employer Summary',
                allApps,
                jobs
              )
            }
            className="p-4 border border-slate-900 bg-slate-900 text-white rounded-xl hover:bg-slate-800 flex items-center justify-between text-left"
          >
            <div>
              <div className="font-bold">Download PDF Summary</div>
              <div className="text-slate-300 mt-0.5">KPIs &amp; Applicant Roster</div>
            </div>
            <FileText className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Email & SMS Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-600">
            Email &amp; SMS Templates
          </div>
          <div className="divide-y divide-slate-200">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => chooseTemplate(tpl)}
                className={`w-full text-left p-4 text-xs transition-colors flex items-start gap-3 ${
                  selected?.id === tpl.id ? 'bg-emerald-50/70' : 'hover:bg-slate-50'
                }`}
              >
                {tpl.channel === 'email' ? (
                  <Mail className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
                ) : (
                  <MessageSquare className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0">
                  <div className="font-bold text-slate-900">{tpl.name}</div>
                  <div className="text-slate-500 mt-0.5">
                    {tpl.channel.toUpperCase()} · Trigger: {tpl.triggerStatus}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 space-y-4 text-xs">
          {selected ? (
            <form onSubmit={handleSaveTemplate} className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{selected.name}</h3>
                  <p className="text-slate-500">
                    Placeholders: {'{{applicantName}}, {{jobTitle}}, {{company}}, {{interviewDate}}, {{remarks}}'}
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-slate-100 rounded font-semibold uppercase text-[11px]">
                  {selected.channel}
                </span>
              </div>

              {selected.channel === 'email' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Subject</label>
                  <input
                    type="text"
                    disabled={!canEditTemplates}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg disabled:bg-slate-50"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Message Body</label>
                <textarea
                  rows={5}
                  disabled={!canEditTemplates}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-[11px] disabled:bg-slate-50"
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Live Sample Preview</span>
                  <button
                    type="button"
                    onClick={copyPreview}
                    className="inline-flex items-center gap-1 text-emerald-800 font-semibold hover:underline"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Message
                  </button>
                </div>
                {selected.channel === 'email' && subject && (
                  <div className="font-semibold text-slate-900">Subject: {renderPreview(subject)}</div>
                )}
                <p className="text-slate-700 whitespace-pre-line">{renderPreview(body)}</p>
              </div>

              {canEditTemplates && (
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg inline-flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {saving ? 'Saving…' : 'Save Template'}
                  </button>
                </div>
              )}
            </form>
          ) : (
            <div className="py-10 text-center text-slate-500">Select a template to edit or preview.</div>
          )}
        </section>
      </div>
    </div>
  );
};
