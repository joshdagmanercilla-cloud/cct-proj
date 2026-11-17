import { jsPDF } from 'jspdf';
import { Job, JobApplication } from '../types';

function escapeCsvCell(val: unknown): string {
  const str = String(val ?? '');
  const safe = /^[=+\-@]/.test(str) ? `'${str}` : str; // Neutralize CSV formula injection
  if (/[",\n\r]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

export function downloadCsv(filename: string, headers: string[], rows: unknown[][]): void {
  const lines = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((r) => r.map(escapeCsvCell).join(',')),
  ];
  const bom = '\uFEFF';
  const blob = new Blob([bom + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportApplicationsCsv(applications: JobApplication[]): void {
  const headers = [
    'Tracking ID',
    'Applicant Name',
    'Email',
    'Phone',
    'Barangay',
    'Job Title',
    'Company',
    'Status',
    'Resume File',
    'Applied At',
    'Interview Date',
  ];
  const rows = applications.map((a) => [
    a.id,
    a.applicantName,
    a.applicantEmail,
    a.applicantPhone,
    a.barangay || 'Cauayan City',
    a.jobTitle,
    a.company,
    a.status,
    a.resumeFileName,
    a.appliedAt,
    a.interviewDate || '',
  ]);
  downloadCsv(`cauayan-applicants-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
}

export function exportJobsCsv(jobs: Job[]): void {
  const headers = [
    'ID',
    'Title',
    'Company',
    'Category',
    'Location',
    'Arrangement',
    'Level',
    'Salary',
    'Status',
    'Featured',
  ];
  const rows = jobs.map((j) => [
    j.id,
    j.title,
    j.company,
    j.category,
    j.location,
    j.arrangement,
    j.level,
    j.salary,
    j.status || 'active',
    j.isFeatured ? 'Yes' : 'No',
  ]);
  downloadCsv(`cauayan-jobs-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
}

export function exportSummaryPdf(
  title: string,
  subtitle: string,
  applications: JobApplication[],
  jobs: Job[]
): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  let y = 48;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(title, 40, y);
  y += 18;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`${subtitle} · Generated ${new Date().toLocaleString()}`, 40, y);
  y += 24;

  doc.setTextColor(20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Summary Metrics', 40, y);
  y += 16;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const activeJobs = jobs.filter((j) => (j.status || 'active') === 'active').length;
  const hiredCount = applications.filter((a) => a.status === 'Hired').length;
  const interviewCount = applications.filter((a) => a.status === 'Interview').length;
  doc.text(
    `Total Jobs: ${jobs.length} (${activeJobs} Active)  |  Total Applicants: ${applications.length}  |  Interviews: ${interviewCount}  |  Hires: ${hiredCount}`,
    40,
    y
  );
  y += 26;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Applicant Roster', 40, y);
  y += 16;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  applications.slice(0, 35).forEach((app, idx) => {
    if (y > 760) {
      doc.addPage();
      y = 48;
    }
    const line = `${idx + 1}. ${app.applicantName} (${app.id}) — ${app.jobTitle} @ ${app.company} [${app.status}]`;
    doc.text(line.slice(0, 95), 40, y);
    y += 15;
  });

  doc.save(`cauayan-career-connect-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}
