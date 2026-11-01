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

export type UserRole = 'guest' | 'jobseeker' | 'employer' | 'verifier';

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
  posted: string;
  description: string;
  qualifications: string;
  contactEmail: string;
  isVerifiedEmployer?: boolean;
  isFeatured?: boolean;
}

export interface JobApplication {
  id: string;
  jobId: number;
  jobTitle: string;
  company: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  resumeFileName: string;
  coverNote?: string;
  status: 'Submitted' | 'Under Review' | 'Interview' | 'Accepted' | 'Declined';
  appliedAt: string;
}

export interface ResidentVerificationRequest {
  id: string;
  applicantName: string;
  email: string;
  barangay: string;
  validIdType: string;
  idNumberMasked: string;
  documentFileName: string;
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
