export type Language = 'en' | 'fil';

export type Severity = 'critical' | 'high' | 'medium' | 'low';

export type Category =
  | 'auth'
  | 'database'
  | 'payments'
  | 'security'
  | 'forms'
  | 'mobile'
  | 'flows'
  | 'performance';

export interface AuditItem {
  id: string;
  title: string;
  tagalogSummary: string;
  category: Category;
  severity: Severity;
  location: string;
  issueDescription: string;
  impact: string;
  proofOfConcept: string;
  howToFix: string;
  status: 'fixed-in-v2' | 'verified';
  resolvedNote?: string;
}

export type UserRole = 'guest' | 'jobseeker' | 'employer' | 'reviewer' | 'super_admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  barangay?: string;
  course?: string;
  gradYear?: number;
  isResidentVerified?: boolean;
  verificationStatus?: 'none' | 'pending' | 'verified' | 'rejected';
  companyName?: string;
}

export type JobStatus = 'active' | 'closed' | 'draft';

export interface Job {
  id: number;
  initial: string;
  logo: string;
  company: string;
  title: string;
  category: string;
  location: string;
  exactAddress?: string;
  landmark?: string;
  distanceFromMarabulig1Km?: number;
  estimatedCommuteMinutes?: number;
  commuteMode?: string;
  estimatedFarePhp?: number;
  commuteTip?: string;
  proximityLevel?: 'very_near' | 'near' | 'moderate' | 'far' | 'remote';
  arrangement: 'On-site' | 'Hybrid' | 'Remote';
  type: string;
  level: 'no_experience' | 'entry_level' | 'internship';
  salary: string;
  salaryMin?: number;
  salaryMax?: number;
  posted: string;
  description: string;
  qualifications: string;
  contactEmail: string;
  isVerifiedEmployer?: boolean;
  isFeatured?: boolean;
  status?: JobStatus;
  employerId?: string;
  screeningQuestions?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type ApplicationStatus = 'Submitted' | 'Under Review' | 'Interview' | 'Hired' | 'Rejected';

export interface StatusHistoryEntry {
  status: ApplicationStatus;
  remarks: string;
  changedBy: string;
  changedByRole: string;
  timestamp: string;
}

export interface ApplicantNote {
  id: string;
  author: string;
  role: string;
  text: string;
  createdAt: string;
}

export interface JobApplication {
  id: string;
  jobId: number;
  jobTitle: string;
  company: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  barangay?: string;
  resumeFileName: string;
  resumeFileId?: string;
  resumeMimeType?: string;
  resumeSizeBytes?: number;
  coverNote?: string;
  screeningAnswers?: Record<string, string>;
  status: ApplicationStatus;
  interviewDate?: string;
  interviewLocation?: string;
  appliedAt: string;
  createdAtIso?: string;
  statusHistory?: StatusHistoryEntry[];
  notes?: ApplicantNote[];
}

export interface CommuteRoute {
  id: string;
  originBarangay: string;
  destinationArea: string;
  originCoordinates: [number, number];
  coordinates: [number, number];
  distanceKm: number;
  estimatedMinutes: number;
  farePhp: number;
  modes: string[];
  stops: string[];
  advisory: string;
  updatedAt: string;
  updatedBy: string;
}

export interface ResidentVerificationRequest {
  id: string;
  applicantName: string;
  email: string;
  barangay: string;
  validIdType: string;
  idNumberMasked: string;
  documentFileName: string;
  documentFileId?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedAt: string;
  reviewerNotes?: string;
}

export interface PaymentTransaction {
  id: string;
  jobId?: number;
  jobTitle?: string;
  payerName: string;
  payerEmail: string;
  amountPesos: number;
  method: 'GCash' | 'Maya' | 'Card';
  referenceNumber: string;
  status: 'Completed' | 'Pending' | 'Failed';
  timestamp: string;
}

export interface AuditLogEntry {
  id: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetType: 'job' | 'application' | 'commute' | 'verification' | 'auth' | 'template' | 'payment';
  targetId: string;
  details: string;
  timestamp: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  channel: 'email' | 'sms';
  triggerStatus: ApplicationStatus | 'Residency Approved';
  subject?: string;
  body: string;
  updatedAt: string;
}

export interface JobAlert {
  id: string;
  email: string;
  keyword: string;
  category: string;
  barangay: string;
  maxMinutes: number;
  maxFarePhp: number;
  active: boolean;
  createdAt: string;
}
