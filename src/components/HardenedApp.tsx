import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Building2, 
  Search, 
  CheckCircle, 
  ShieldCheck, 
  GraduationCap, 
  UserCheck, 
  PlusCircle, 
  X, 
  FileText, 
  Phone, 
  Mail, 
  Upload, 
  Clock, 
  Lock, 
  Menu, 
  AlertCircle,
  HelpCircle,
  Sparkles,
  ChevronRight,
  Filter,
  CreditCard,
  QrCode,
  Check,
  Receipt,
  Download,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import { INITIAL_JOBS } from '../data/initialJobs';
import { Job, JobApplication, ResidentVerificationRequest, UserProfile, UserRole, PaymentTransaction } from '../types';
import { MiniJobMap } from './MiniJobMap';

export const HardenedApp: React.FC = () => {
  // --- Persistent Storage State ---
  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem('cauayan_jobs_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_JOBS;
  });

  const [applications, setApplications] = useState<JobApplication[]>(() => {
    const saved = localStorage.getItem('cauayan_apps_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return [
      {
        id: 'APP-CAU-2026-001',
        jobId: 2,
        jobTitle: 'Junior IT Helpdesk & Support Specialist',
        company: 'Isabela Tech Solutions, Inc.',
        applicantName: 'Juan Dela Cruz',
        applicantEmail: 'juan.delacruz@gmail.com',
        applicantPhone: '09171234567',
        resumeFileName: 'Juan_Dela_Cruz_Resume.pdf',
        coverNote: 'Fresh IT graduate from ISU Cauayan, ready to support the tech infrastructure of Isabela businesses.',
        status: 'Interview',
        appliedAt: '2 days ago'
      }
    ];
  });

  const [verifications, setVerifications] = useState<ResidentVerificationRequest[]>(() => {
    const saved = localStorage.getItem('cauayan_verif_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return [
      {
        id: 'RES-CAU-902',
        applicantName: 'Juan Dela Cruz',
        email: 'juan.delacruz@gmail.com',
        barangay: 'Marabulig 1',
        validIdType: "Barangay Certificate / Voter's ID",
        idNumberMasked: 'ISAB-2026-****-8812',
        documentFileName: 'Barangay_Clearance_Marabulig1.pdf',
        status: 'Approved',
        submittedAt: '3 days ago',
        reviewerNotes: 'Verified resident of Purok 3, Marabulig 1 by LGU Admin.'
      }
    ];
  });

  const [transactions, setTransactions] = useState<PaymentTransaction[]>(() => {
    const saved = localStorage.getItem('cauayan_tx_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return [];
  });

  // Current User Role Simulation
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('cauayan_user_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return {
      id: 'user-001',
      name: 'Juan Dela Cruz',
      email: 'juan.delacruz@gmail.com',
      phone: '09171234567',
      role: 'jobseeker',
      barangay: 'Marabulig 1',
      course: 'BS Information Technology',
      gradYear: 2026,
      isResidentVerified: true,
      verificationStatus: 'verified'
    };
  });

  // Sync to LocalStorage on updates
  useEffect(() => {
    localStorage.setItem('cauayan_jobs_v2', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('cauayan_apps_v2', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('cauayan_verif_v2', JSON.stringify(verifications));
  }, [verifications]);

  useEffect(() => {
    localStorage.setItem('cauayan_tx_v2', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('cauayan_user_v2', JSON.stringify(currentUser));
  }, [currentUser]);

  // Proximity & Commute Awareness State
  const [userHomeLocation, setUserHomeLocation] = useState<string>(() => {
    return currentUser.barangay ? `${currentUser.barangay}, Cauayan City` : 'Marabulig 1, Cauayan City';
  });
  const [distanceFilter, setDistanceFilter] = useState<'all' | 'near' | 'mid' | 'far' | 'remote'>('all');

  // Search & Filter State
  const [keyword, setKeyword] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | 'no_experience' | 'entry_level' | 'internship'>('all');

  // Modals State
  const [selectedJobForDetail, setSelectedJobForDetail] = useState<Job | null>(null);
  const [isApplyingModalOpen, setIsApplyingModalOpen] = useState(false);
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isGuidanceModalOpen, setIsGuidanceModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isApplicationsDrawerOpen, setIsApplicationsDrawerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<PaymentTransaction | null>(null);

  // Application Form Inputs
  const [applicantName, setApplicantName] = useState(currentUser.name);
  const [applicantEmail, setApplicantEmail] = useState(currentUser.email);
  const [applicantPhone, setApplicantPhone] = useState(currentUser.phone);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverNote, setCoverNote] = useState('');
  const [formError, setFormError] = useState('');
  const [locationAcknowledged, setLocationAcknowledged] = useState(true);
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);
  const [applicationSuccessId, setApplicationSuccessId] = useState<string | null>(null);

  // Post Job Form Inputs
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobCompany, setNewJobCompany] = useState(currentUser.role === 'employer' ? 'Isabela Tech Solutions, Inc.' : '');
  const [newJobCategory, setNewJobCategory] = useState('Information Technology');
  const [newJobLocation, setNewJobLocation] = useState('Cauayan City, Isabela');
  const [newJobExactAddress, setNewJobExactAddress] = useState('');
  const [newJobLandmark, setNewJobLandmark] = useState('');
  const [newJobCommuteTip, setNewJobCommuteTip] = useState('');
  const [newJobArrangement, setNewJobArrangement] = useState<'On-site' | 'Hybrid' | 'Remote'>('On-site');
  const [newJobLevel, setNewJobLevel] = useState<'no_experience' | 'entry_level' | 'internship'>('entry_level');
  const [newJobSalary, setNewJobSalary] = useState('₱16,000 - ₱20,000 / month');
  const [newJobDesc, setNewJobDesc] = useState('');
  const [newJobQuals, setNewJobQuals] = useState('');
  const [newJobEmail, setNewJobEmail] = useState('careers@example.ph');
  const [isFeaturedTier, setIsFeaturedTier] = useState(false);
  const [pendingJobForPayment, setPendingJobForPayment] = useState<Job | null>(null);
  // Payment Form Inputs
  const [paymentMethod, setPaymentMethod] = useState<'GCash' | 'Maya' | 'Card'>('GCash');
  const [paymentPhone, setPaymentPhone] = useState('0917-888-9999');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Auth Inputs
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authRole, setAuthRole] = useState<UserRole>('jobseeker');
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Resident Verification Form Inputs
  const [resName, setResName] = useState(currentUser.name);
  const [resBarangay, setResBarangay] = useState('Marabulig 1');
  const [resIdType, setResIdType] = useState('Barangay Certificate');
  const [resIdNum, setResIdNum] = useState('');
  const [resConsent, setResConsent] = useState(false);
  const [resDocName, setResDocName] = useState('');
  const [resSuccess, setResSuccess] = useState(false);

  // Helper: Dynamic Commute & Proximity Calculator
  const getJobProximity = (job: Job, originBarangay: string) => {
    if (job.arrangement === 'Remote' || job.location === 'Remote') {
      return {
        distanceKm: 0,
        minutes: 0,
        fare: 0,
        commuteMode: 'Work from Home (Remote)',
        level: 'remote' as const,
        label: '🔵 Remote (No Commute)',
        badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
        tip: '100% online setup; high-speed internet connection required.'
      };
    }

    // Base distances from Marabulig 1
    const baseKm = job.distanceFromMarabulig1Km ?? 4.0;
    
    // Proximity adjustment based on selected origin
    let adjustedKm = baseKm;
    if (originBarangay.includes('Alicia')) {
      adjustedKm = job.location.includes('Alicia') ? 1.5 : Math.abs(18.5 - baseKm) + 2.0;
    } else if (originBarangay.includes('Naguilian')) {
      adjustedKm = job.location.includes('Naguilian') ? 1.8 : Math.abs(12.0 - baseKm) + 2.0;
    } else if (originBarangay.includes('San Fermin')) {
      adjustedKm = job.exactAddress?.includes('San Fermin') ? 0.6 : Math.max(0.5, Math.abs(baseKm - 2.4));
    } else if (originBarangay.includes('Tagaran')) {
      adjustedKm = job.exactAddress?.includes('Tagaran') ? 0.8 : Math.max(0.6, Math.abs(baseKm - 3.8));
    } else if (originBarangay.includes('District 1') || originBarangay.includes('Poblacion')) {
      adjustedKm = job.exactAddress?.includes('District 1') ? 0.5 : Math.max(0.5, Math.abs(baseKm - 4.1));
    }

    adjustedKm = Math.round(adjustedKm * 10) / 10;

    // Calculate duration & fare
    let minutes = Math.max(3, Math.round(adjustedKm * 2.2));
    let fare = 15;
    let commuteMode = 'Tricycle';
    let level: 'very_near' | 'near' | 'moderate' | 'far' = 'very_near';
    let label = '🟢 Very Near';
    let badgeColor = 'bg-emerald-100 text-emerald-900 border-emerald-300';

    if (adjustedKm <= 1.0) {
      minutes = 5;
      fare = 15;
      commuteMode = 'Walking or Short Tricycle';
      level = 'very_near';
      label = '🟢 Very Near (Walk / Trike)';
      badgeColor = 'bg-emerald-100 text-emerald-900 border-emerald-300';
    } else if (adjustedKm <= 4.5) {
      minutes = Math.max(7, Math.round(adjustedKm * 2.5));
      fare = 20;
      commuteMode = 'Tricycle / Jeepney';
      level = 'very_near';
      label = '🟢 Near (Within Cauayan)';
      badgeColor = 'bg-emerald-100 text-emerald-900 border-emerald-300';
    } else if (adjustedKm <= 9.0) {
      minutes = Math.max(12, Math.round(adjustedKm * 2.2));
      fare = 30;
      commuteMode = 'Regular Jeepney / Trike';
      level = 'near';
      label = '🟡 Moderate (Cauayan Metro)';
      badgeColor = 'bg-teal-100 text-teal-900 border-teal-300';
    } else if (adjustedKm <= 16.0) {
      minutes = Math.max(20, Math.round(adjustedKm * 1.8));
      fare = 45;
      commuteMode = 'Provincial Jeepney / Bus';
      level = 'moderate';
      label = '🟠 Farther (Neighboring Town)';
      badgeColor = 'bg-amber-100 text-amber-900 border-amber-300';
    } else {
      minutes = Math.max(30, Math.round(adjustedKm * 1.7));
      fare = 60;
      commuteMode = 'Bus / Van from Terminal';
      level = 'far';
      label = '🔴 Far (Outer Isabela)';
      badgeColor = 'bg-rose-100 text-rose-900 border-rose-300';
    }

    return {
      distanceKm: adjustedKm,
      minutes,
      fare,
      commuteMode,
      level,
      label,
      badgeColor,
      tip: job.commuteTip || `Direct ride from your current location heading to ${job.location}.`
    };
  };

  // Filter Jobs Logic
  const filteredJobs = jobs.filter(j => {
    const query = keyword.toLowerCase().trim();
    const matchesKeyword = !query || 
      j.title.toLowerCase().includes(query) ||
      j.company.toLowerCase().includes(query) ||
      j.category.toLowerCase().includes(query) ||
      j.description.toLowerCase().includes(query) ||
      (j.exactAddress && j.exactAddress.toLowerCase().includes(query)) ||
      (j.landmark && j.landmark.toLowerCase().includes(query));

    const matchesLocation = !locationFilter || j.location === locationFilter;
    const matchesCategory = !categoryFilter || j.category === categoryFilter;
    const matchesLevel = levelFilter === 'all' || j.level === levelFilter;

    // Distance Filter
    const prox = getJobProximity(j, userHomeLocation);
    let matchesDistance = true;
    if (distanceFilter === 'near') {
      matchesDistance = prox.distanceKm > 0 && prox.distanceKm <= 5.0;
    } else if (distanceFilter === 'mid') {
      matchesDistance = prox.distanceKm > 5.0 && prox.distanceKm <= 15.0;
    } else if (distanceFilter === 'far') {
      matchesDistance = prox.distanceKm > 15.0;
    } else if (distanceFilter === 'remote') {
      matchesDistance = j.arrangement === 'Remote';
    }

    return matchesKeyword && matchesLocation && matchesCategory && matchesLevel && matchesDistance;
  });

  // Switch User Persona Helper
  const handleRoleChange = (role: UserRole) => {
    if (role === 'guest') {
      setCurrentUser({
        id: 'user-guest',
        name: 'Guest User',
        email: '',
        phone: '',
        role: 'guest',
        isResidentVerified: false
      });
    } else if (role === 'jobseeker') {
      setCurrentUser({
        id: 'user-001',
        name: 'Juan Dela Cruz',
        email: 'juan.delacruz@gmail.com',
        phone: '09171234567',
        role: 'jobseeker',
        barangay: 'Marabulig 1',
        course: 'BS Information Technology',
        gradYear: 2026,
        isResidentVerified: true,
        verificationStatus: 'verified'
      });
      setApplicantName('Juan Dela Cruz');
      setApplicantEmail('juan.delacruz@gmail.com');
      setApplicantPhone('09171234567');
    } else if (role === 'employer') {
      setCurrentUser({
        id: 'user-emp',
        name: 'Engr. Maria Santos',
        email: 'hr@isabelatechsolutions.com',
        phone: '09189876543',
        role: 'employer',
        companyName: 'Isabela Tech Solutions, Inc.',
        isResidentVerified: false
      });
      setNewJobCompany('Isabela Tech Solutions, Inc.');
    } else if (role === 'verifier') {
      setCurrentUser({
        id: 'user-lgu',
        name: 'Hon. LGU Barangay Admin',
        email: 'lgu.marabulig1@cauayancity.gov.ph',
        phone: '09195551234',
        role: 'verifier',
        barangay: 'Marabulig 1',
        isResidentVerified: true
      });
    }
  };

  // Submit Job Application Handler
  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Strict Philippine Phone Validation
    const phPhoneRegex = /^(09|\+639)\d{9}$/;
    if (!phPhoneRegex.test(applicantPhone.replace(/[\s-]+/g, ''))) {
      setFormError('Please enter a valid Philippine mobile number (e.g., 09171234567 or +639171234567).');
      return;
    }

    if (!selectedJobForDetail) return;

    setIsSubmittingApp(true);
    setTimeout(() => {
      const generatedId = `APP-CAU-${Date.now().toString().slice(-4)}`;
      const newApp: JobApplication = {
        id: generatedId,
        jobId: selectedJobForDetail.id,
        jobTitle: selectedJobForDetail.title,
        company: selectedJobForDetail.company,
        applicantName,
        applicantEmail,
        applicantPhone,
        resumeFileName: resumeFile ? resumeFile.name : 'Juan_Dela_Cruz_Resume.pdf',
        coverNote,
        status: 'Submitted',
        appliedAt: 'Just now'
      };

      setApplications([newApp, ...applications]);
      setIsSubmittingApp(false);
      setApplicationSuccessId(generatedId);
    }, 600);
  };

  // Submit New Job Opening Handler
  const handlePostJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isAlicia = newJobLocation.includes('Alicia');
    const isNaguilian = newJobLocation.includes('Naguilian');
    const isSanMateo = newJobLocation.includes('San Mateo');
    const isRemote = newJobLocation === 'Remote' || newJobArrangement === 'Remote';

    const calcDistance = isRemote ? 0 : isAlicia ? 18.5 : isNaguilian ? 12.0 : isSanMateo ? 24.0 : 3.2;

    const newJobObj: Job = {
      id: Date.now(),
      initial: newJobCompany.slice(0, 2).toUpperCase() || 'CC',
      logo: isFeaturedTier ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-emerald-100 text-emerald-800 border-emerald-200',
      company: newJobCompany,
      title: newJobTitle,
      category: newJobCategory,
      location: newJobLocation,
      exactAddress: newJobExactAddress || `${newJobLocation}, Isabela`,
      landmark: newJobLandmark || 'Near Maharlika Highway / Centro',
      distanceFromMarabulig1Km: calcDistance,
      estimatedCommuteMinutes: isRemote ? 0 : Math.round(calcDistance * 2.2),
      commuteMode: isRemote ? 'Work from Home' : calcDistance <= 5 ? 'Tricycle / Regular Jeepney' : 'Jeepney / Bus from Terminal',
      estimatedFarePhp: isRemote ? 0 : calcDistance <= 4 ? 20 : calcDistance <= 10 ? 30 : 50,
      commuteTip: newJobCommuteTip || (isRemote ? '100% online setup.' : 'Easily accessible from Cauayan Central Terminal or Marabulig 1.'),
      proximityLevel: isRemote ? 'remote' : calcDistance <= 4 ? 'very_near' : calcDistance <= 10 ? 'near' : 'moderate',
      arrangement: newJobArrangement,
      type: newJobLevel === 'no_experience' ? 'No Experience' : newJobLevel === 'internship' ? 'Trainee' : 'Entry Level',
      level: newJobLevel,
      salary: newJobSalary,
      posted: 'Just posted',
      description: newJobDesc,
      qualifications: newJobQuals,
      contactEmail: newJobEmail,
      isVerifiedEmployer: true,
      isFeatured: isFeaturedTier
    };

    if (isFeaturedTier) {
      setPendingJobForPayment(newJobObj);
      setIsPostJobModalOpen(false);
      setIsPaymentModalOpen(true);
    } else {
      setJobs([newJobObj, ...jobs]);
      setIsPostJobModalOpen(false);
      setNewJobTitle('');
      setNewJobExactAddress('');
      setNewJobLandmark('');
      setNewJobCommuteTip('');
      setNewJobDesc('');
      setNewJobQuals('');
    }
  };

  // Complete Payment Handler
  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);

    setTimeout(() => {
      const refCode = `${paymentMethod.toUpperCase()}-CAU-${Math.floor(100000 + Math.random() * 900000)}`;
      const newTx: PaymentTransaction = {
        id: `TX-${Date.now()}`,
        jobId: pendingJobForPayment?.id,
        jobTitle: pendingJobForPayment?.title,
        payerName: currentUser.name,
        payerEmail: currentUser.email,
        amountPesos: 499,
        method: paymentMethod,
        referenceNumber: refCode,
        status: 'Completed',
        timestamp: new Date().toLocaleString()
      };

      if (pendingJobForPayment) {
        setJobs([pendingJobForPayment, ...jobs]);
      }

      setTransactions([newTx, ...transactions]);
      setActiveReceipt(newTx);
      setIsProcessingPayment(false);
      setIsPaymentModalOpen(false);
      setIsReceiptModalOpen(true);
      setPendingJobForPayment(null);
    }, 1000);
  };

  // Submit Residency Verification Handler
  const handleResidencySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resConsent) {
      alert('You must accept the Data Privacy Act (RA 10173) consent before submitting.');
      return;
    }

    const newReq: ResidentVerificationRequest = {
      id: `RES-CAU-${Math.floor(100 + Math.random() * 900)}`,
      applicantName: resName,
      email: currentUser.email || 'applicant@cauayan.ph',
      barangay: resBarangay,
      validIdType: resIdType,
      idNumberMasked: resIdNum ? `${resIdNum.slice(0, 4)}-****-${resIdNum.slice(-4)}` : 'CAU-2026-****-9102',
      documentFileName: resDocName || 'Barangay_Residency_Cert.pdf',
      status: 'Pending',
      submittedAt: 'Just now'
    };

    setVerifications([newReq, ...verifications]);
    setResSuccess(true);
  };

  // Handle Custom User Sign Up
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (authPassword.length < 8) {
      setAuthError('Password must be at least 8 characters long.');
      return;
    }

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: authName,
      email: authEmail,
      phone: '09171234567',
      role: authRole,
      barangay: 'Marabulig 1',
      isResidentVerified: false,
      verificationStatus: 'none',
      companyName: authRole === 'employer' ? `${authName} Enterprises` : undefined
    };

    setCurrentUser(newUser);
    setIsSignUpModalOpen(false);
    alert(`Welcome, ${authName}! Your account has been created successfully.`);
  };

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail) {
      setAuthError('Please enter your email address.');
      return;
    }
    handleRoleChange('jobseeker');
    setIsLoginModalOpen(false);
  };

  // LGU Verifier Action
  const handleReviewVerification = (id: string, action: 'Approved' | 'Rejected') => {
    setVerifications(verifications.map(v => v.id === id ? { ...v, status: action } : v));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans pb-24 md:pb-8">
      {/* Main Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center font-black text-lg sm:text-xl shadow-md shadow-emerald-900/10 flex-shrink-0">
              🌱
            </div>
            <div>
              <div className="font-extrabold text-sm sm:text-base lg:text-lg text-slate-900 leading-tight flex items-center gap-1">
                Marabulig 1 <span className="text-emerald-700 font-black">Career Connect</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">Cauayan City & Isabela Local Job Portal</p>
            </div>
          </div>

          {/* Desktop Nav Links (Visible on Large Tablet / Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <a href="#jobs" className="hover:text-emerald-700 transition">Jobs</a>
            <button onClick={() => setIsGuidanceModalOpen(true)} className="hover:text-emerald-700 transition text-left">
              For Graduates (RA 11261)
            </button>
            <button 
              onClick={() => {
                if (currentUser.role !== 'employer') handleRoleChange('employer');
                setIsPostJobModalOpen(true);
              }} 
              className="hover:text-emerald-700 transition flex items-center gap-1 text-emerald-700 font-bold"
            >
              <Building2 className="w-4 h-4" /> For Employers
            </button>
            <button onClick={() => setIsVerificationModalOpen(true)} className="hover:text-emerald-700 transition flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Resident Verification
            </button>
          </nav>

          {/* Persona Switcher & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Quick Role Switcher (Hidden on narrow mobile, visible on tablet & desktop) */}
            <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-400 font-bold px-1.5 text-[11px]">Role:</span>
              <button
                onClick={() => handleRoleChange('jobseeker')}
                className={`px-2.5 py-1 rounded-lg font-bold transition text-xs ${
                  currentUser.role === 'jobseeker' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Graduate
              </button>
              <button
                onClick={() => handleRoleChange('employer')}
                className={`px-2.5 py-1 rounded-lg font-bold transition text-xs ${
                  currentUser.role === 'employer' ? 'bg-white text-blue-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Employer
              </button>
              <button
                onClick={() => handleRoleChange('verifier')}
                className={`px-2.5 py-1 rounded-lg font-bold transition text-xs ${
                  currentUser.role === 'verifier' ? 'bg-white text-purple-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                LGU Admin
              </button>
            </div>

            {/* Applications Drawer Trigger */}
            <button
              onClick={() => setIsApplicationsDrawerOpen(true)}
              className="relative p-2 sm:p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition text-xs font-bold flex items-center gap-1.5 min-h-[40px]"
              aria-label="View my applications"
            >
              <Briefcase className="w-4 h-4 text-emerald-700" />
              <span className="hidden sm:inline">Applications</span>
              <span className="bg-emerald-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {applications.length}
              </span>
            </button>

            {/* User Profile Badge or Login */}
            {currentUser.role !== 'guest' ? (
              <div className="flex items-center gap-1.5 sm:gap-2 pl-1 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">{currentUser.name}</div>
                  <div className="text-[10px] text-emerald-700 font-semibold capitalize flex items-center justify-end gap-1">
                    {currentUser.isResidentVerified && <CheckCircle className="w-3 h-3 text-emerald-600" />}
                    {currentUser.role}
                  </div>
                </div>
                <button
                  onClick={() => handleRoleChange('guest')}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold min-h-[36px]"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-2.5 sm:px-3 py-1.5 text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-bold transition min-h-[36px]"
                >
                  Log In
                </button>
                <button
                  onClick={() => setIsSignUpModalOpen(true)}
                  className="px-3 sm:px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition shadow-sm min-h-[36px]"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile / Tablet Hamburger Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Open menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile & Tablet Dropdown Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 p-4 space-y-3 shadow-xl animate-in slide-in-from-top-2">
            <div className="text-xs font-bold text-slate-500 mb-1">Select Role / Portal:</div>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-center mb-3">
              <button
                onClick={() => { handleRoleChange('jobseeker'); setIsMobileMenuOpen(false); }}
                className={`py-2 rounded-lg transition ${currentUser.role === 'jobseeker' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600'}`}
              >
                Graduate
              </button>
              <button
                onClick={() => { handleRoleChange('employer'); setIsMobileMenuOpen(false); }}
                className={`py-2 rounded-lg transition ${currentUser.role === 'employer' ? 'bg-white text-blue-800 shadow-sm' : 'text-slate-600'}`}
              >
                Employer
              </button>
              <button
                onClick={() => { handleRoleChange('verifier'); setIsMobileMenuOpen(false); }}
                className={`py-2 rounded-lg transition ${currentUser.role === 'verifier' ? 'bg-white text-purple-800 shadow-sm' : 'text-slate-600'}`}
              >
                LGU Admin
              </button>
            </div>

            <div className="space-y-1 divide-y divide-slate-100">
              <a 
                href="#jobs" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5 py-2.5 px-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 rounded-xl min-h-[44px]"
              >
                <Briefcase className="w-4 h-4 text-emerald-700" />
                <span>Available Job Openings</span>
              </a>
              <button 
                onClick={() => { setIsGuidanceModalOpen(true); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 text-left py-2.5 px-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 rounded-xl min-h-[44px]"
              >
                <GraduationCap className="w-4 h-4 text-emerald-700" />
                <span>For Graduates (RA 11261 Free Documents)</span>
              </button>
              <button 
                onClick={() => { 
                  if (currentUser.role !== 'employer') handleRoleChange('employer');
                  setIsPostJobModalOpen(true); 
                  setIsMobileMenuOpen(false); 
                }}
                className="w-full flex items-center gap-2.5 text-left py-2.5 px-2 text-sm font-bold text-emerald-700 hover:bg-emerald-50 rounded-xl min-h-[44px]"
              >
                <Building2 className="w-4 h-4 text-emerald-700" />
                <span>Post a Job (Employer Portal)</span>
              </button>
              <button 
                onClick={() => { setIsVerificationModalOpen(true); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 text-left py-2.5 px-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 rounded-xl min-h-[44px]"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Cauayan Resident Verification</span>
              </button>
            </div>

            {currentUser.role === 'guest' && (
              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => { setIsLoginModalOpen(true); setIsMobileMenuOpen(false); }}
                  className="flex-1 py-2.5 text-center text-xs font-bold text-slate-700 bg-slate-100 rounded-xl min-h-[44px]"
                >
                  Log In
                </button>
                <button
                  onClick={() => { setIsSignUpModalOpen(true); setIsMobileMenuOpen(false); }}
                  className="flex-1 py-2.5 text-center text-xs font-bold text-white bg-emerald-700 rounded-xl min-h-[44px]"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-950 text-white relative overflow-hidden py-10 sm:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.15),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Cauayan City, Isabela & Region II
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              The First Step in Your Career, <br />
              <span className="text-emerald-400">Starts Right Here.</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl">
              Job portal dedicated to fresh graduates, first-time job seekers, and residents of Barangay Marabulig 1 and neighboring Isabela communities.
            </p>
          </div>

          {/* Search Box - Fully Responsive for Mobile (<640px), Tablet (640px-1024px), Desktop */}
          <div className="mt-6 sm:mt-8 bg-white text-slate-800 p-2 sm:p-2.5 rounded-2xl shadow-xl sm:shadow-2xl border border-slate-200 max-w-4xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-2">
            <div className="sm:col-span-2 md:col-span-4 flex items-center gap-2 px-3 py-2.5 sm:py-2 border border-slate-200 md:border-0 rounded-xl bg-slate-50 md:bg-transparent">
              <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Job title, skill, or company..."
                className="w-full text-base sm:text-sm bg-transparent focus:outline-none"
              />
            </div>

            <div className="sm:col-span-1 md:col-span-3 flex items-center gap-2 px-3 py-2.5 sm:py-2 border border-slate-200 md:border-0 rounded-xl bg-slate-50 md:bg-transparent md:border-l md:border-slate-200">
              <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full text-base sm:text-sm bg-transparent focus:outline-none text-slate-700"
              >
                <option value="">All Locations</option>
                <option value="Cauayan City, Isabela">Cauayan City, Isabela</option>
                <option value="Alicia, Isabela">Alicia, Isabela</option>
                <option value="Naguilian, Isabela">Naguilian, Isabela</option>
                <option value="San Mateo, Isabela">San Mateo, Isabela</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <div className="sm:col-span-1 md:col-span-3 flex items-center gap-2 px-3 py-2.5 sm:py-2 border border-slate-200 md:border-0 rounded-xl bg-slate-50 md:bg-transparent md:border-l md:border-slate-200">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full text-base sm:text-sm bg-transparent focus:outline-none text-slate-700"
              >
                <option value="">All Categories</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Information Technology">IT / Tech</option>
                <option value="Hospitality">Hospitality</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Administration">Admin & Office</option>
                <option value="Customer Service">Customer Service</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>

            <div className="sm:col-span-2 md:col-span-2">
              <button 
                onClick={() => {}}
                className="w-full h-full min-h-[46px] sm:min-h-[44px] bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/20 active:scale-[0.98]"
              >
                <Search className="w-4 h-4 md:hidden" />
                <span>Search</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full" id="jobs">
        {/* Interactive Location & Commute Awareness Bar */}
        <div className="bg-gradient-to-r from-emerald-900/10 via-teal-900/5 to-slate-100 border border-emerald-300 rounded-2xl sm:rounded-3xl p-4 sm:p-5 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-base sm:text-lg flex-shrink-0 shadow-md shadow-emerald-900/20">
                📍
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-black text-slate-900">Find Distance & Commute Fares to Work</h3>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
                    Live Commute Calculator
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Set your home location to calculate exact commute distance, duration, and fare for each job before applying:
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto bg-white p-2 sm:p-1.5 rounded-2xl border border-emerald-200 shadow-sm">
              <span className="text-xs font-bold text-slate-700 sm:pl-2 whitespace-nowrap">I live in:</span>
              <select
                value={userHomeLocation}
                onChange={(e) => setUserHomeLocation(e.target.value)}
                className="bg-emerald-50 border border-emerald-400 text-emerald-950 font-bold text-xs py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer w-full sm:w-auto"
              >
                <option value="Marabulig 1, Cauayan City">Marabulig 1, Cauayan City (Home)</option>
                <option value="Marabulig 2, Cauayan City">Marabulig 2, Cauayan City</option>
                <option value="San Fermin, Cauayan City">San Fermin (SM Area), Cauayan City</option>
                <option value="District 1 (Poblacion), Cauayan City">District 1 (Centro), Cauayan City</option>
                <option value="Tagaran, Cauayan City">Tagaran, Cauayan City</option>
                <option value="Cabaruan, Cauayan City">Cabaruan (Airport), Cauayan City</option>
                <option value="Alicia, Isabela">Alicia, Isabela</option>
                <option value="Naguilian, Isabela">Naguilian, Isabela</option>
                <option value="San Mateo, Isabela">San Mateo, Isabela</option>
              </select>
            </div>
          </div>

          {/* Quick Distance Filter Buttons (Horizontal touch scrollable on phone & tablet) */}
          <div className="flex items-center gap-2 overflow-x-auto pt-3 mt-3 border-t border-emerald-200/60 pb-1 scrollbar-thin">
            <span className="text-xs font-bold text-slate-600 whitespace-nowrap flex items-center gap-1 flex-shrink-0">
              <Filter className="w-3.5 h-3.5 text-emerald-700" /> Distance Filter:
            </span>
            {[
              { id: 'all', label: 'All Distances' },
              { id: 'near', label: '🟢 Near (< 5 km • Trike / Walking)' },
              { id: 'mid', label: '🟡 Moderate (5-15 km • Regular Jeepney)' },
              { id: 'far', label: '🔴 Far (> 15 km • Provincial Transit)' },
              { id: 'remote', label: '🔵 Remote (Work from Home)' },
            ].map(d => (
              <button
                key={d.id}
                onClick={() => setDistanceFilter(d.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex-shrink-0 ${
                  distanceFilter === d.id
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Level Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 flex-shrink-0">Level:</span>
            {[
              { id: 'all', label: 'All Positions' },
              { id: 'no_experience', label: 'No Experience Required (Fresh Grads)' },
              { id: 'entry_level', label: 'Entry Level (0-1 Year)' },
              { id: 'internship', label: 'Trainee & Internship' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setLevelFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap flex-shrink-0 ${
                  levelFilter === f.id
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing: <strong>{filteredJobs.length}</strong> jobs near <strong>{userHomeLocation.split(',')[0]}</strong>
          </div>
        </div>

        {/* 2-Column Responsive Grid: Job Listings & Sidebar (Mobile: 1-col, Tablet md: 7+5 cols, Desktop lg: 8+4 cols) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Job Listings Column */}
          <div className="md:col-span-7 lg:col-span-8 space-y-4">
            {filteredJobs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 sm:p-12 text-center space-y-3">
                <Briefcase className="w-12 h-12 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No matching jobs found for the selected distance</h3>
                <p className="text-xs sm:text-sm text-slate-500">Try setting the Distance Filter to "All Distances" or choose a different starting location.</p>
                <button
                  onClick={() => { setKeyword(''); setLocationFilter(''); setCategoryFilter(''); setLevelFilter('all'); setDistanceFilter('all'); }}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-200 transition min-h-[40px]"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              filteredJobs.map(job => {
                const prox = getJobProximity(job, userHomeLocation);
                return (
                  <div
                    key={job.id}
                    className={`bg-white rounded-2xl border p-4 sm:p-5 transition duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      job.isFeatured ? 'border-amber-300 bg-gradient-to-r from-amber-50/40 via-white to-white shadow-md' : 'border-slate-200 hover:border-emerald-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center font-black text-xs sm:text-sm flex-shrink-0 ${job.logo}`}>
                        {job.initial}
                      </div>
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">{job.title}</h3>
                          {job.isFeatured && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                              ⭐ FEATURED
                            </span>
                          )}
                          {job.isVerifiedEmployer && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                              <CheckCircle className="w-3 h-3 text-blue-600" /> Verified
                            </span>
                          )}
                        </div>
                        <div className="text-xs sm:text-sm font-semibold text-slate-600 truncate">{job.company}</div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500 pt-0.5">
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> {job.location}
                          </span>
                          <span className="hidden sm:inline">•</span>
                          <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                            {job.salary}
                          </span>
                          <span className="hidden sm:inline">•</span>
                          <span className="text-slate-500">{job.arrangement}</span>
                        </div>

                        {/* Location, Commute & Distance Awareness Banner */}
                        <div className="pt-2 flex flex-col gap-1.5 border-t border-slate-100 mt-2">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-extrabold text-[10px] sm:text-[11px] border ${prox.badgeColor}`}>
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              {prox.label}: {prox.distanceKm > 0 ? `${prox.distanceKm} km` : '0 km'}
                              {prox.distanceKm > 0 && ` • ~${prox.minutes} mins travel`}
                            </span>
                            
                            {prox.distanceKm > 0 && (
                              <span className="text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded text-[10px] sm:text-[11px]">
                                One-way Fare: <strong className="text-slate-900">₱{prox.fare}</strong> ({prox.commuteMode})
                              </span>
                            )}

                            {job.landmark && (
                              <span className="text-slate-500 text-[10px] sm:text-[11px] flex items-center gap-1">
                                📍 <span className="font-medium text-slate-700">{job.landmark}</span>
                              </span>
                            )}
                          </div>

                          {job.exactAddress && (
                            <div className="text-[10px] sm:text-[11px] text-slate-500 font-mono truncate">
                              🏢 {job.exactAddress}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                  <div className="flex sm:flex-col items-stretch sm:items-end justify-between sm:justify-center gap-2.5 sm:gap-3 border-t sm:border-0 pt-3 sm:pt-0 flex-shrink-0">
                    <span className="text-[11px] text-slate-400 font-medium self-center sm:self-end">{job.posted}</span>
                    <button
                      onClick={() => {
                        setSelectedJobForDetail(job);
                        setIsApplyingModalOpen(true);
                        setApplicationSuccessId(null);
                        setFormError('');
                      }}
                      className="w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 min-h-[44px] active:scale-[0.98]"
                    >
                      Apply Now <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

          {/* Sidebar Column (Tablet md: 5-col, Desktop lg: 4-col) */}
          <div className="md:col-span-5 lg:col-span-4 space-y-4 sm:space-y-5">
            {/* Resident Verification Spotlight Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">Are you a Cauayan City Resident?</h4>
                  <p className="text-xs text-emerald-700">Barangay Marabulig 1 & City Priority</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Get an official Resident Verification badge for priority consideration in local job hiring. Your data is protected under RA 10173.
              </p>
              <button
                onClick={() => setIsVerificationModalOpen(true)}
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition shadow-sm min-h-[44px]"
              >
                Verify Residency →
              </button>
            </div>

            {/* First-Time Jobseekers Act (RA 11261) Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-700" />
                <h4 className="text-sm font-bold text-slate-900">First Time Jobseekers Act (RA 11261)</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Learn how to obtain <strong>FREE Barangay Clearance, NBI Clearance, Police Clearance, and Medical Certificate</strong> for your first job application.
              </p>
              <button
                onClick={() => setIsGuidanceModalOpen(true)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 min-h-[44px]"
              >
                Read Full Guide →
              </button>
            </div>

            {/* Employer Callout Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3 shadow-md">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                <h4 className="text-sm font-bold text-white">Looking for Local Talent?</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Post job openings for fresh graduates in Cauayan City. Includes option for ₱499 Featured Listing via GCash / Maya.
              </p>
              <button
                onClick={() => {
                  if (currentUser.role !== 'employer') handleRoleChange('employer');
                  setIsPostJobModalOpen(true);
                }}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition min-h-[44px]"
              >
                Post a Job (Employer Portal)
              </button>
            </div>

            {/* PESO Cauayan City Contact Info */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 text-xs text-slate-600 shadow-sm">
              <h4 className="font-bold text-slate-900 text-sm">PESO Cauayan City</h4>
              <p>📍 Ground Floor, Cauayan City Hall, Isabela</p>
              <p>☎ Hotline: (078) 652-2011 / 0917-555-PESO</p>
              <p>⏰ Monday - Friday: 8:00 AM - 5:00 PM</p>
            </div>
          </div>
        </div>
      </main>

      {/* --- MODAL 1: Real Job Application Modal --- */}
      {isApplyingModalOpen && selectedJobForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5">
            <button
              onClick={() => setIsApplyingModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {applicationSuccessId ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-9 h-9" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Application Submitted Successfully!</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Your resume and cover note have been forwarded to the hiring team at <strong>{selectedJobForDetail.company}</strong>.
                </p>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-mono text-slate-800">
                  Application Tracking Code: <strong className="text-emerald-700">{applicationSuccessId}</strong>
                </div>
                <div className="flex gap-2 justify-center pt-2">
                  <button
                    onClick={() => {
                      setIsApplyingModalOpen(false);
                      setIsApplicationsDrawerOpen(true);
                    }}
                    className="px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition"
                  >
                    View in My Applications
                  </button>
                  <button
                    onClick={() => setIsApplyingModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="border-b border-slate-100 pb-4">
                  <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">{selectedJobForDetail.category}</div>
                  <h3 className="text-xl font-black text-slate-900 mt-1">{selectedJobForDetail.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedJobForDetail.company} • {selectedJobForDetail.location}</p>
                </div>

                {/* Location, Distance & Commute Awareness Section */}
                {(() => {
                  const prox = getJobProximity(selectedJobForDetail, userHomeLocation);
                  return (
                    <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-50 border-2 border-emerald-300 rounded-2xl p-4 space-y-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-emerald-700" />
                          <h4 className="font-black text-xs sm:text-sm text-emerald-950">
                            Location & Commute Guide
                          </h4>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${prox.badgeColor}`}>
                          {prox.label}
                        </span>
                      </div>

                      {/* Route Summary Cards */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                          <span className="text-slate-500 block text-[10px] font-bold uppercase">Distance to You:</span>
                          <span className="text-sm sm:text-base font-black text-emerald-950">
                            {prox.distanceKm > 0 ? `${prox.distanceKm} km` : '0 km (WFH)'}
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate">from {userHomeLocation.split(',')[0]}</span>
                        </div>

                        <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                          <span className="text-slate-500 block text-[10px] font-bold uppercase">Estimated Travel:</span>
                          <span className="text-sm sm:text-base font-black text-slate-900">
                            {prox.distanceKm > 0 ? `~${prox.minutes} mins` : 'No Commute'}
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate">{prox.commuteMode}</span>
                        </div>

                        <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                          <span className="text-slate-500 block text-[10px] font-bold uppercase">One-way Fare:</span>
                          <span className="text-sm sm:text-base font-black text-emerald-800">
                            {prox.distanceKm > 0 ? `₱${prox.fare}.00` : '₱0'}
                          </span>
                          <span className="text-[10px] text-slate-500 block">Regular Fare</span>
                        </div>
                      </div>

                      {/* Exact Address & Landmark Details */}
                      <div className="bg-white p-3 rounded-xl border border-emerald-100 text-xs space-y-1.5">
                        <div className="flex items-start gap-1.5 text-slate-800">
                          <span className="font-bold text-slate-500 whitespace-nowrap">Exact Address:</span>
                          <strong className="text-slate-900 font-mono text-[11px]">{selectedJobForDetail.exactAddress || selectedJobForDetail.location}</strong>
                        </div>
                        {selectedJobForDetail.landmark && (
                          <div className="flex items-start gap-1.5 text-slate-700">
                            <span className="font-bold text-slate-500 whitespace-nowrap">Landmark / Vicinity:</span>
                            <span>{selectedJobForDetail.landmark}</span>
                          </div>
                        )}
                        <div className="flex items-start gap-1.5 text-slate-600 pt-1 border-t border-slate-100">
                          <span className="font-bold text-slate-500 whitespace-nowrap">Commute Advice:</span>
                          <span>{prox.tip}</span>
                        </div>
                      </div>

                      {/* Mini Interactive Leaflet Map Preview */}
                      <MiniJobMap
                        job={selectedJobForDetail}
                        userHomeLocation={userHomeLocation}
                        distanceKm={prox.distanceKm}
                        minutes={prox.minutes}
                        commuteMode={prox.commuteMode}
                        onHomeLocationChange={setUserHomeLocation}
                      />

                      {/* Google Maps Directions Link */}
                      <div className="flex items-center justify-between pt-1">
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(userHomeLocation + ', Isabela')}&destination=${encodeURIComponent((selectedJobForDetail.exactAddress || selectedJobForDetail.location) + ', Isabela')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 underline"
                        >
                          <span>🗺️ Open Turn-by-Turn Directions in Google Maps ↗</span>
                        </a>
                        <span className="text-[11px] text-slate-400">
                          {prox.distanceKm > 15 ? '⚠️ Further from Centro' : '✓ Easily accessible'}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="font-bold text-slate-800">About the Job:</div>
                  <p className="text-slate-600 leading-relaxed">{selectedJobForDetail.description}</p>
                  <div className="font-bold text-slate-800 pt-2">Qualifications:</div>
                  <p className="text-slate-600 leading-relaxed">{selectedJobForDetail.qualifications}</p>
                </div>

                {formError && (
                  <div className="bg-red-50 text-red-900 p-3 rounded-xl border border-red-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleApplySubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={applicantName}
                        onChange={(e) => setApplicantName(e.target.value)}
                        placeholder="Juan Dela Cruz"
                        className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={applicantEmail}
                        onChange={(e) => setApplicantEmail(e.target.value)}
                        placeholder="juan@example.com"
                        className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Philippine Mobile Number</label>
                      <input
                        type="tel"
                        required
                        value={applicantPhone}
                        onChange={(e) => setApplicantPhone(e.target.value)}
                        placeholder="09171234567"
                        className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Resume Attachment (PDF/DOCX)</label>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setResumeFile(e.target.files ? e.target.files[0] : null)}
                        className="w-full text-xs text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                      />
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="font-bold text-slate-700 block mb-1">Message or Cover Note to HR (Optional)</label>
                    <textarea
                      rows={2}
                      value={coverNote}
                      onChange={(e) => setCoverNote(e.target.value)}
                      placeholder="Let the employer know why you are interested in this position..."
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Location & Commute Awareness Confirmation Checkbox */}
                  <div className="p-3 bg-amber-50/80 border border-amber-300 rounded-xl space-y-1">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={locationAcknowledged}
                        onChange={(e) => setLocationAcknowledged(e.target.checked)}
                        className="mt-0.5 rounded text-emerald-700 focus:ring-emerald-500"
                        required
                      />
                      <span className="text-[11px] text-amber-950 font-medium leading-tight">
                        <strong>Job Location Confirmation:</strong> I have reviewed and acknowledge that this job is located in <u>{selectedJobForDetail.location}</u> ({selectedJobForDetail.exactAddress || selectedJobForDetail.landmark}), and I am ready to report for duty under an {selectedJobForDetail.arrangement} arrangement.
                      </span>
                    </label>
                  </div>

                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-[11px] text-emerald-950 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                    <span>Your resume is protected under Republic Act No. 10173 (Data Privacy Act of 2012). Only authorized recruitment personnel of {selectedJobForDetail.company} will have access to your submission.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingApp || !locationAcknowledged}
                    className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition shadow-md shadow-emerald-950/20 min-h-[44px]"
                  >
                    {isSubmittingApp ? 'Submitting Application...' : 'Submit Application'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL 2: Employer Job Posting & Payment Modal --- */}
      {isPostJobModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            <button
              onClick={() => setIsPostJobModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 pb-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                <Building2 className="w-3.5 h-3.5" /> Employer Portal
              </div>
              <h3 className="text-xl font-black text-slate-900 mt-2">Post a New Job Opening</h3>
              <p className="text-xs text-slate-500">Connect your company with verified talent across Cauayan City and Isabela.</p>
            </div>

            <form onSubmit={handlePostJobSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={newJobCompany}
                  onChange={(e) => setNewJobCompany(e.target.value)}
                  placeholder="Isabela Tech Solutions, Inc."
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  placeholder="e.g. Junior Web Developer"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newJobCategory}
                    onChange={(e) => setNewJobCategory(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option>Information Technology</option>
                    <option>Agriculture</option>
                    <option>Hospitality</option>
                    <option>Manufacturing</option>
                    <option>Administration</option>
                    <option>Customer Service</option>
                    <option>Marketing</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Location / Municipality in Isabela</label>
                  <select
                    value={newJobLocation}
                    onChange={(e) => setNewJobLocation(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option>Cauayan City, Isabela</option>
                    <option>Alicia, Isabela</option>
                    <option>Naguilian, Isabela</option>
                    <option>San Mateo, Isabela</option>
                    <option>Remote</option>
                  </select>
                </div>
              </div>

              {/* Exact Address & Landmark for Proximity Awareness */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Exact Address / Street</label>
                  <input
                    type="text"
                    value={newJobExactAddress}
                    onChange={(e) => setNewJobExactAddress(e.target.value)}
                    placeholder="e.g. Maharlika Highway, Brgy. San Fermin"
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nearby Landmark</label>
                  <input
                    type="text"
                    value={newJobLandmark}
                    onChange={(e) => setNewJobLandmark(e.target.value)}
                    placeholder="e.g. In front of SM City Cauayan"
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
                  />
                </div>

                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Commute Tip / Transit Advice</label>
                  <input
                    type="text"
                    value={newJobCommuteTip}
                    onChange={(e) => setNewJobCommuteTip(e.target.value)}
                    placeholder="e.g. 1 tricycle ride from Marabulig 1 or regular jeepney route"
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Experience Level</label>
                  <select
                    value={newJobLevel}
                    onChange={(e) => setNewJobLevel(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="no_experience">No Experience (Fresh Grads)</option>
                    <option value="entry_level">Entry Level</option>
                    <option value="internship">Trainee / Internship</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Salary Range (Salary Transparency)</label>
                  <input
                    type="text"
                    required
                    value={newJobSalary}
                    onChange={(e) => setNewJobSalary(e.target.value)}
                    placeholder="₱16,000 - ₱20,000 / month"
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Job Description</label>
                <textarea
                  rows={2}
                  required
                  value={newJobDesc}
                  onChange={(e) => setNewJobDesc(e.target.value)}
                  placeholder="Describe primary responsibilities and qualifications..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Tier Selection (Free vs Featured with GCash/Maya) */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="font-bold text-slate-900">Select Listing Tier:</div>
                <div className="grid grid-cols-2 gap-2">
                  <label className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                    !isFeaturedTier ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200 bg-white'
                  }`}>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <input 
                        type="radio" 
                        name="listingTier" 
                        checked={!isFeaturedTier} 
                        onChange={() => setIsFeaturedTier(false)} 
                      />
                      <span>Standard Post</span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1">Free (Basic feed listing)</span>
                  </label>

                  <label className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                    isFeaturedTier ? 'border-amber-500 bg-amber-50/50' : 'border-slate-200 bg-white'
                  }`}>
                    <div className="flex items-center gap-1.5 font-bold text-amber-950">
                      <input 
                        type="radio" 
                        name="listingTier" 
                        checked={isFeaturedTier} 
                        onChange={() => setIsFeaturedTier(true)} 
                      />
                      <span>⭐ Featured Post</span>
                    </div>
                    <span className="text-[11px] text-amber-800 font-bold mt-1">₱499 (GCash / Maya)</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition shadow-md shadow-blue-950/20 min-h-[44px]"
              >
                {isFeaturedTier ? 'Proceed to GCash / Maya Checkout (₱499) →' : 'Publish Free Job Opening'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: Philippine Payment Gateway Modal (GCash / Maya) --- */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsPaymentModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 pb-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                <CreditCard className="w-3.5 h-3.5" /> PayMongo / Philippine Payment Gateway
              </div>
              <h3 className="text-xl font-black text-slate-900 mt-2">Pay for Featured Job Listing</h3>
              <p className="text-xs text-slate-500">Amount Due: <strong className="text-emerald-700 text-sm">₱499.00 PHP</strong></p>
            </div>

            <form onSubmit={handleProcessPayment} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'GCash', label: 'GCash', color: 'border-blue-500 bg-blue-50 text-blue-900' },
                  { id: 'Maya', label: 'Maya', color: 'border-emerald-500 bg-emerald-50 text-emerald-900' },
                  { id: 'Card', label: 'Credit Card', color: 'border-slate-500 bg-slate-50 text-slate-900' },
                ].map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`py-2.5 px-2 rounded-xl border text-center font-bold transition ${
                      paymentMethod === m.id ? m.color : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Account / Mobile Number:</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">Verified Merchant</span>
                </div>
                <input
                  type="text"
                  required
                  value={paymentPhone}
                  onChange={(e) => setPaymentPhone(e.target.value)}
                  placeholder="0917-XXX-XXXX"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-500">
                  A simulated one-time authorization code will be sent to your {paymentMethod} account.
                </p>
              </div>

              <button
                type="submit"
                disabled={isProcessingPayment}
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 min-h-[44px]"
              >
                {isProcessingPayment ? 'Processing Payment...' : `Pay ₱499.00 via ${paymentMethod} →`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 4: Official Receipt Modal --- */}
      {isReceiptModalOpen && activeReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <Receipt className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-700">Official Electronic Receipt</span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">Payment Successful!</h3>
              <p className="text-xs text-slate-500 font-mono mt-1">Ref: {activeReceipt.referenceNumber}</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-left space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Item:</span>
                <span className="font-bold text-slate-800">Featured 30-Day Job Post</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Employer:</span>
                <span className="font-bold text-slate-800">{activeReceipt.payerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Method:</span>
                <span className="font-bold text-emerald-800">{activeReceipt.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date / Time:</span>
                <span className="text-slate-800">{activeReceipt.timestamp}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-sans text-sm">
                <span className="font-bold text-slate-700">Total Amount:</span>
                <span className="font-black text-emerald-800">₱{activeReceipt.amountPesos}.00 PHP</span>
              </div>
            </div>

            <button
              onClick={() => setIsReceiptModalOpen(false)}
              className="w-full py-3 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition"
            >
              Close and View Job in Feed
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL 5: Resident Verification Portal --- */}
      {isVerificationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            <button
              onClick={() => { setIsVerificationModalOpen(false); setResSuccess(false); }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 pb-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" /> Cauayan City Resident Verification
              </div>
              <h3 className="text-xl font-black text-slate-900 mt-2">Official Residency Verification</h3>
              <p className="text-xs text-slate-500">For residents of Marabulig 1 and all Cauayan City barangays.</p>
            </div>

            {/* If logged in as LGU Verifier: Show Admin Queue */}
            {currentUser.role === 'verifier' ? (
              <div className="space-y-4 text-xs">
                <div className="bg-purple-50 border border-purple-200 p-3 rounded-xl text-purple-950 font-bold flex items-center justify-between">
                  <span>LGU VERIFIER QUEUE (Marabulig 1 Admin)</span>
                  <span className="bg-purple-200 px-2 py-0.5 rounded">{verifications.length} Requests</span>
                </div>

                <div className="space-y-3">
                  {verifications.map(req => (
                    <div key={req.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{req.applicantName}</span>
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          req.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                          req.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <div className="text-slate-500">
                        Barangay: <strong>{req.barangay}</strong> • ID Type: {req.validIdType}
                      </div>
                      <div className="font-mono text-[11px] text-slate-600">
                        ID: {req.idNumberMasked} • File: {req.documentFileName}
                      </div>
                      {req.status === 'Pending' && (
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleReviewVerification(req.id, 'Approved')}
                            className="px-3 py-1 bg-emerald-700 text-white font-bold rounded-lg hover:bg-emerald-600 transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReviewVerification(req.id, 'Rejected')}
                            className="px-3 py-1 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500 transition"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : resSuccess ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-lg font-bold text-slate-900">Verification Request Submitted!</h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  An authorized LGU officer will review your documents. Your verified resident badge will appear on your profile within 24 hours.
                </p>
                <button
                  onClick={() => { setIsVerificationModalOpen(false); setResSuccess(false); }}
                  className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleResidencySubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Resident Full Name</label>
                  <input
                    type="text"
                    required
                    value={resName}
                    onChange={(e) => setResName(e.target.value)}
                    placeholder="Juan Dela Cruz"
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Barangay in Cauayan City</label>
                    <select
                      value={resBarangay}
                      onChange={(e) => setResBarangay(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option>Marabulig 1</option>
                      <option>Marabulig 2</option>
                      <option>San Fermin</option>
                      <option>District 1 (Poblacion)</option>
                      <option>District 2</option>
                      <option>District 3</option>
                      <option>Tagaran</option>
                      <option>Other Cauayan Barangay</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Type of Residency Proof</label>
                    <select
                      value={resIdType}
                      onChange={(e) => setResIdType(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option>Barangay Certificate</option>
                      <option>PhilID (National ID)</option>
                      <option>Voter's Certificate (COMELEC)</option>
                      <option>Postal ID</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">ID Number (Masked for privacy)</label>
                  <input
                    type="text"
                    required
                    value={resIdNum}
                    onChange={(e) => setResIdNum(e.target.value)}
                    placeholder="e.g. 1234-5678-9012"
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Document / ID Photo Upload</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setResDocName(e.target.files ? e.target.files[0].name : '')}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700"
                  />
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={resConsent}
                      onChange={(e) => setResConsent(e.target.checked)}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-[11px] text-slate-600 leading-tight">
                      <strong>Data Privacy Act (RA 10173) Consent:</strong> I authorize the designated LGU Barangay Administrator to inspect this document solely for residency verification. My information will not be published or shared.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl transition shadow-md shadow-emerald-950/20"
                >
                  Submit Verification Request
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL 6: First Time Jobseekers Act (RA 11261) Guide --- */}
      {isGuidanceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            <button
              onClick={() => setIsGuidanceModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 pb-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                <GraduationCap className="w-3.5 h-3.5" /> Guide for Fresh Graduates
              </div>
              <h3 className="text-xl font-black text-slate-900 mt-2">Republic Act No. 11261</h3>
              <p className="text-xs text-slate-500">First Time Jobseekers Assistance Act in Cauayan City</p>
            </div>

            <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950">
                <strong>Did you know?</strong> Under Philippine law, the following pre-employment requirements are FREE for first-time jobseekers:
              </div>

              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Barangay Certification:</strong> Official proof that you are a first-time jobseeker (obtain from your local Barangay Hall).</li>
                <li><strong>Police Clearance:</strong> Free at the Cauayan City Police Station.</li>
                <li><strong>NBI Clearance:</strong> 1 free copy issued by the NBI Regional Office.</li>
                <li><strong>Medical Certificate:</strong> Issued free of charge by the Cauayan City Health Office.</li>
                <li><strong>Birth & Marriage Certificates:</strong> 1 free first-time copy from the Philippine Statistics Authority (PSA).</li>
              </ul>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">Steps to Claim Benefits in Cauayan City:</div>
                <p>1. Visit the Marabulig 1 Barangay Hall (or your local barangay) and request a <em>First Time Jobseeker Barangay Certification</em>.</p>
                <p>2. Present this certification to the Cauayan City Public Employment Service Office (PESO) or the issuing government agency.</p>
                <p>3. All mandatory government processing fees will be completely waived.</p>
              </div>
            </div>

            <button
              onClick={() => setIsGuidanceModalOpen(false)}
              className="w-full py-2.5 bg-emerald-700 text-white font-bold text-xs rounded-xl"
            >
              Got It, Thank You!
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL 7: Privacy Policy Modal (RA 10173 Compliant) --- */}
      {isPrivacyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            <button
              onClick={() => setIsPrivacyModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xl font-black text-slate-900">Data Privacy Policy</h3>
              <p className="text-xs text-slate-500">Compliant with the Philippine Data Privacy Act of 2012 (RA 10173)</p>
            </div>

            <div className="space-y-3 text-xs text-slate-700 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              <p>
                <strong>Cauayan City Career Connect</strong> respects your fundamental right to privacy. Our data collection and processing activities are strictly limited to the following:
              </p>
              <h4 className="font-bold text-slate-900">1. Information We Collect:</h4>
              <p>Full name, email address, Philippine mobile number, educational background, resume file, and residency verification documents for registered applicants.</p>
              
              <h4 className="font-bold text-slate-900">2. How We Use Your Data:</h4>
              <p>Your information is used strictly to endorse your applications to prospective employers you choose and to validate your local residency in Cauayan City with authorized LGU staff.</p>

              <h4 className="font-bold text-slate-900">3. Third-Party Sharing:</h4>
              <p>We NEVER sell, lease, or share your personal data with advertisers or unverified third parties. Only the employer receiving your job application has access to your submission.</p>

              <h4 className="font-bold text-slate-900">4. Data Subject Rights:</h4>
              <p>You retain the right to request access, correction, or permanent deletion of your personal data at any time by contacting our designated Data Protection Officer.</p>
            </div>

            <button
              onClick={() => setIsPrivacyModalOpen(false)}
              className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl"
            >
              Close Privacy Policy
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL 8: Terms of Service Modal --- */}
      {isTermsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            <button
              onClick={() => setIsTermsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xl font-black text-slate-900">Terms of Service</h3>
              <p className="text-xs text-slate-500">Rules and guidelines for Applicants and Employers in Cauayan City</p>
            </div>

            <div className="space-y-3 text-xs text-slate-700 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              <h4 className="font-bold text-slate-900">1. For Job Applicants:</h4>
              <p>All information provided in applications and resumes must be accurate, truthful, and up-to-date. Submitting fraudulent credentials or identity documents is strictly prohibited.</p>

              <h4 className="font-bold text-slate-900">2. For Employers:</h4>
              <p>Charging placement or recruitment fees to jobseekers is prohibited by law (RA 11261). All job postings must display transparent salary ranges compliant with DOLE Region II minimum wage regulations.</p>

              <h4 className="font-bold text-slate-900">3. Limitation of Liability:</h4>
              <p>Career Connect serves as a community employment bridge. Hiring decisions, contracts, and employment terms are established directly between employers and candidates.</p>
            </div>

            <button
              onClick={() => setIsTermsModalOpen(false)}
              className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl"
            >
              Close Terms
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL 9: Sign Up Modal --- */}
      {isSignUpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsSignUpModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-black text-slate-900">Create a New Account</h3>
              <p className="text-xs text-slate-500 mt-0.5">Join the Cauayan City Career Connect community.</p>
            </div>

            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs">
                {authError}
              </div>
            )}

            <form onSubmit={handleSignUpSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  placeholder="Maria Santos"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="maria@example.com"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Account Type</label>
                <select
                  value={authRole}
                  onChange={(e) => setAuthRole(e.target.value as any)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="jobseeker">Fresh Graduate / Jobseeker</option>
                  <option value="employer">Local Employer / Business</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Password (Min. 8 characters)</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl transition min-h-[44px]"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 10: Real Stateful Login Modal --- */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-sm w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-black text-slate-900">Sign In to Career Portal</h3>
              <p className="text-xs text-slate-500 mt-1">Select an active persona or sign in:</p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => { handleRoleChange('jobseeker'); setIsLoginModalOpen(false); }}
                className="w-full p-3 rounded-xl border border-emerald-300 bg-emerald-50 text-left hover:bg-emerald-100 transition"
              >
                <div className="font-bold text-xs text-emerald-950">🎓 Juan Dela Cruz (Graduate)</div>
                <div className="text-[11px] text-emerald-700">BSIT Graduate • Marabulig 1 Resident</div>
              </button>

              <button
                onClick={() => { handleRoleChange('employer'); setIsLoginModalOpen(false); }}
                className="w-full p-3 rounded-xl border border-blue-300 bg-blue-50 text-left hover:bg-blue-100 transition"
              >
                <div className="font-bold text-xs text-blue-950">🏢 Engr. Maria Santos (Employer)</div>
                <div className="text-[11px] text-blue-700">HR Manager • Isabela Tech Solutions</div>
              </button>

              <button
                onClick={() => { handleRoleChange('verifier'); setIsLoginModalOpen(false); }}
                className="w-full p-3 rounded-xl border border-purple-300 bg-purple-50 text-left hover:bg-purple-100 transition"
              >
                <div className="font-bold text-xs text-purple-950">🏛️ LGU Barangay Verifier</div>
                <div className="text-[11px] text-purple-700">Marabulig 1 LGU Admin</div>
              </button>
            </div>

            <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
              Don't have an account yet?{' '}
              <button
                onClick={() => { setIsLoginModalOpen(false); setIsSignUpModalOpen(true); }}
                className="font-bold text-emerald-700 hover:underline"
              >
                Sign Up Here
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DRAWER: My Applications Drawer --- */}
      {isApplicationsDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-lg font-black text-slate-900">My Job Applications</h3>
                </div>
                <button
                  onClick={() => setIsApplicationsDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {applications.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  You haven't submitted any applications yet. Browse the job listings to apply!
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.map(app => (
                    <div key={app.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{app.jobTitle}</h4>
                          <p className="text-xs text-slate-600 font-semibold">{app.company}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          app.status === 'Interview' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                          app.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {app.status}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-200/60">
                        <div>Ref: <span className="font-mono font-bold text-slate-700">{app.id}</span></div>
                        <div>Resume: <span className="font-medium text-slate-700">{app.resumeFileName}</span></div>
                        <div>Date: {app.appliedAt}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => setIsApplicationsDrawerOpen(false)}
                className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Return to Job Feed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div className="space-y-1">
              <div className="font-bold text-white text-sm">Cauayan City Career Connect</div>
              <p className="text-slate-400 text-xs">Local Talent • Local Opportunities • A Brighter Future</p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
              <button onClick={() => setIsPrivacyModalOpen(true)} className="hover:text-emerald-400 transition min-h-[44px] flex items-center">
                Privacy Policy (RA 10173)
              </button>
              <span>•</span>
              <button onClick={() => setIsTermsModalOpen(true)} className="hover:text-emerald-400 transition min-h-[44px] flex items-center">
                Terms of Service
              </button>
              <span>•</span>
              <button onClick={() => setIsGuidanceModalOpen(true)} className="hover:text-emerald-400 transition min-h-[44px] flex items-center">
                First Time Jobseekers Act
              </button>
              <span>•</span>
              <a href="tel:0786522011" className="hover:text-emerald-400 transition min-h-[44px] flex items-center">
                PESO Hotline: (078) 652-2011
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
            <div>© {new Date().getFullYear()} Cauayan City Career Connect. All rights reserved. Barangay Marabulig 1, Cauayan City, Isabela.</div>
            <div>Built with secure validation, RBAC privacy standards, and responsive accessibility.</div>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Bottom Navigation Bar (<768px) with iOS Safe Area support */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <a 
          href="#jobs" 
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-emerald-800 min-h-[44px] justify-center px-2 active:scale-95 transition"
        >
          <Briefcase className="w-5 h-5 text-emerald-700" />
          <span>Jobs</span>
        </a>
        <button 
          onClick={() => setIsApplicationsDrawerOpen(true)}
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-slate-600 hover:text-emerald-800 relative min-h-[44px] justify-center px-2 active:scale-95 transition"
        >
          <div className="relative">
            <FileText className="w-5 h-5 text-slate-600" />
            <span className="absolute -top-1 -right-1.5 bg-emerald-600 text-white rounded-full text-[9px] w-4 h-4 flex items-center justify-center font-black shadow-xs">
              {applications.length}
            </span>
          </div>
          <span>Applications</span>
        </button>
        <button 
          onClick={() => {
            if (currentUser.role !== 'employer') handleRoleChange('employer');
            setIsPostJobModalOpen(true);
          }}
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-blue-700 hover:text-blue-900 min-h-[44px] justify-center px-2 active:scale-95 transition"
        >
          <PlusCircle className="w-5 h-5 text-blue-600" />
          <span>Post Job</span>
        </button>
        <button 
          onClick={() => setIsVerificationModalOpen(true)}
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-slate-600 hover:text-emerald-800 min-h-[44px] justify-center px-2 active:scale-95 transition"
        >
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>Residency</span>
        </button>
      </div>
    </div>
  );
};
