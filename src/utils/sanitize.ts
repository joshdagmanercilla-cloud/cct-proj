export function sanitizeText(input: string, maxLength = 2000): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>?/gm, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
}

export function isValidPhPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s-]+/g, '');
  return /^(09|\+639)\d{9}$/.test(cleaned);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export const ALLOWED_RESUME_EXTENSIONS = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'];
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB

export function validateUploadFile(file: File): { ok: boolean; error?: string } {
  if (!file) return { ok: false, error: 'Please select a file to upload.' };
  const lower = file.name.toLowerCase();
  const hasValidExt = ALLOWED_RESUME_EXTENSIONS.some((ext) => lower.endsWith(ext));
  if (!hasValidExt) {
    return {
      ok: false,
      error: 'Unsupported file format. Please upload PDF, DOC, DOCX, PNG, or JPG.',
    };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      error: 'File exceeds the 5 MB upload limit. Please compress or choose a smaller file.',
    };
  }
  return { ok: true };
}
