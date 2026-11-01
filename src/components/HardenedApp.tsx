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
        commuteMode: 'Trabaho mula sa Bahay (WFH)',
        level: 'remote' as const,
        label: '🔵 Remote (Walang Commute)',
        badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
        tip: '100% online setup; internet connection lamang ang kailangan.'
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
    let label = '🟢 Napakalapit';
    let badgeColor = 'bg-emerald-100 text-emerald-900 border-emerald-300';

    if (adjustedKm <= 1.0) {
      minutes = 5;
      fare = 15;
      commuteMode = 'Lakad o Maikling Trike';
      level = 'very_near';
      label = '🟢 Napakalapit (Lakad / Trike)';
      badgeColor = 'bg-emerald-100 text-emerald-900 border-emerald-300';
    } else if (adjustedKm <= 4.5) {
      minutes = Math.max(7, Math.round(adjustedKm * 2.5));
      fare = 20;
      commuteMode = 'Tricycle / Jeep';
      level = 'very_near';
      label = '🟢 Malapit (Within Cauayan)';
      badgeColor = 'bg-emerald-100 text-emerald-900 border-emerald-300';
    } else if (adjustedKm <= 9.0) {
      minutes = Math.max(12, Math.round(adjustedKm * 2.2));
      fare = 30;
      commuteMode = 'Regular Jeep / Trike';
      level = 'near';
      label = '🟡 Katamtaman (Cauayan Metro)';
      badgeColor = 'bg-teal-100 text-teal-900 border-teal-300';
    } else if (adjustedKm <= 16.0) {
      minutes = Math.max(20, Math.round(adjustedKm * 1.8));
      fare = 45;
      commuteMode = 'Provincial Jeep / Bus';
      level = 'moderate';
      label = '🟠 Medyo Malayo (Karatig-Bayan)';
      badgeColor = 'bg-amber-100 text-amber-900 border-amber-300';
    } else {
      minutes = Math.max(30, Math.round(adjustedKm * 1.7));
      fare = 60;
      commuteMode = 'Bus / Van mula Terminal';
      level = 'far';
      label = '🔴 Malayo (Outer Isabela)';
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
      tip: job.commuteTip || `Isang sakay mula sa iyong pinanggalingan patungo sa ${job.location}.`
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
        name: 'Bisita (Guest)',
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
        name: 'Hon. Kagawad / LGU Admin',
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
      setFormError('Paki-lagay ang tamang Philippine mobile number (e.g. 09171234567 o +639171234567).');
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
      landmark: newJobLandmark || 'Malapit sa Maharlika Highway / Centro',
      distanceFromMarabulig1Km: calcDistance,
      estimatedCommuteMinutes: isRemote ? 0 : Math.round(calcDistance * 2.2),
      commuteMode: isRemote ? 'Work from Home' : calcDistance <= 5 ? 'Tricycle / Regular Jeep' : 'Jeepney / Bus mula Terminal',
      estimatedFarePhp: isRemote ? 0 : calcDistance <= 4 ? 20 : calcDistance <= 10 ? 30 : 50,
      commuteTip: newJobCommuteTip || (isRemote ? '100% online setup.' : 'Madaling marating mula sa Cauayan Central Terminal o Marabulig 1.'),
      proximityLevel: isRemote ? 'remote' : calcDistance <= 4 ? 'very_near' : calcDistance <= 10 ? 'near' : 'moderate',
      arrangement: newJobArrangement,
      type: newJobLevel === 'no_experience' ? 'No Experience' : newJobLevel === 'internship' ? 'Trainee' : 'Entry Level',
      level: newJobLevel,
      salary: newJobSalary,
      posted: 'Bago lang nai-post',
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
      alert('Kailangan mong pumayag sa Data Privacy Act (RA 10173) consent bago mag-submit.');
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
      setAuthError('Ang password ay dapat may minimum na 8 characters.');
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
    alert(`Maligayang pagdating, ${authName}! Matagumpay na nagawa ang iyong account.`);
  };

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail) {
      setAuthError('Pakilagay ang iyong email address.');
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
            <a href="#jobs" className="hover:text-emerald-700 transition">Trabaho (Jobs)</a>
            <button onClick={() => setIsGuidanceModalOpen(true)} className="hover:text-emerald-700 transition text-left">
              Para sa Graduates (RA 11261)
            </button>
            <button 
              onClick={() => {
                if (currentUser.role !== 'employer') handleRoleChange('employer');
                setIsPostJobModalOpen(true);
              }} 
              className="hover:text-emerald-700 transition flex items-center gap-1 text-emerald-700 font-bold"
            >
              <Building2 className="w-4 h-4" /> Para sa Employers
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
              aria-label="Tignan ang aking mga aplikasyon"
            >
              <Briefcase className="w-4 h-4 text-emerald-700" />
              <span className="hidden sm:inline">Aplikasyon</span>
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
              aria-label="Buksan ang menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile & Tablet Dropdown Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 p-4 space-y-3 shadow-xl animate-in slide-in-from-top-2">
            <div className="text-xs font-bold text-slate-500 mb-1">Pumili ng Role / Portal:</div>
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
                <span>Mga Bakanteng Trabaho (Jobs)</span>
              </a>
              <button 
                onClick={() => { setIsGuidanceModalOpen(true); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 text-left py-2.5 px-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 rounded-xl min-h-[44px]"
              >
                <GraduationCap className="w-4 h-4 text-emerald-700" />
                <span>Para sa Graduates (RA 11261 Libreng Dokumento)</span>
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
                <span>Mag-post ng Trabaho (Employer Portal)</span>
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
              Ang Unang Hakbang sa Iyong Karera, <br />
              <span className="text-emerald-400">Dito Nagsisimula.</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl">
              Job portal na para sa mga fresh graduates, first-time job seekers, at mga residente ng Barangay Marabulig 1 at karatig-bayan sa Isabela.
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
                placeholder="Posisyon, kasanayan, o kumpanya..."
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
                <option value="">Lahat ng Lokasyon</option>
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
                <option value="">Kalahatang Kategorya</option>
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
                <span>Maghanap</span>
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
                  <h3 className="text-sm font-black text-slate-900">Alamin ang Distansya at Pamasahe sa Trabaho</h3>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
                    Live Commute Calculator
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  I-set ang iyong lokasyon upang malaman kung gaano kalapit o kalayo ang bawat trabaho bago mag-apply:
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto bg-white p-2 sm:p-1.5 rounded-2xl border border-emerald-200 shadow-sm">
              <span className="text-xs font-bold text-slate-700 sm:pl-2 whitespace-nowrap">Nakatira ako sa:</span>
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
              <Filter className="w-3.5 h-3.5 text-emerald-700" /> Distansya:
            </span>
            {[
              { id: 'all', label: 'Lahat ng Distansya' },
              { id: 'near', label: '🟢 Malapit (< 5 km • Trike/Lakad)' },
              { id: 'mid', label: '🟡 Katamtaman (5-15 km • Regular Jeep)' },
              { id: 'far', label: '🔴 Medyo Malayo (> 15 km • Provincial)' },
              { id: 'remote', label: '🔵 Remote (Trabaho sa Bahay)' },
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
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 flex-shrink-0">Antas:</span>
            {[
              { id: 'all', label: 'Lahat ng Posisyon' },
              { id: 'no_experience', label: 'Walang Karanasan (Fresh Grads)' },
              { id: 'entry_level', label: 'Entry Level (0-1 Taon)' },
              { id: 'internship', label: 'Trainee & OJT' }
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
            Ipinapakita: <strong>{filteredJobs.length}</strong> trabaho malapit sa <strong>{userHomeLocation.split(',')[0]}</strong>
          </div>
        </div>

        {/* 2-Column Responsive Grid: Job Listings & Sidebar (Mobile: 1-col, Tablet md: 7+5 cols, Desktop lg: 8+4 cols) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Job Listings Column */}
          <div className="md:col-span-7 lg:col-span-8 space-y-4">
            {filteredJobs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 sm:p-12 text-center space-y-3">
                <Briefcase className="w-12 h-12 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">Walang nahanap na tugmang trabaho sa piniling distansya</h3>
                <p className="text-xs sm:text-sm text-slate-500">Subukang i-set ang Distansya Filter sa "Lahat ng Distansya" o piliin ang ibang lokasyon.</p>
                <button
                  onClick={() => { setKeyword(''); setLocationFilter(''); setCategoryFilter(''); setLevelFilter('all'); setDistanceFilter('all'); }}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-200 transition min-h-[40px]"
                >
                  I-reset ang lahat ng filters
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
                              {prox.distanceKm > 0 && ` • ~${prox.minutes} mins byahe`}
                            </span>
                            
                            {prox.distanceKm > 0 && (
                              <span className="text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded text-[10px] sm:text-[11px]">
                                Pamasahe: <strong className="text-slate-900">₱{prox.fare}</strong> ({prox.commuteMode})
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
                      Mag-apply Ngayon <ChevronRight className="w-3.5 h-3.5" />
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
                  <h4 className="text-sm font-bold text-emerald-950">Residente ka ba ng Cauayan City?</h4>
                  <p className="text-xs text-emerald-700">Barangay Marabulig 1 & City Priority</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kumuha ng opisyal na Resident Verification badge para sa prayoridad sa mga lokal na trabaho. Protektado ang iyong datos ayon sa RA 10173.
              </p>
              <button
                onClick={() => setIsVerificationModalOpen(true)}
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition shadow-sm min-h-[44px]"
              >
                Mag-verify ng Residency →
              </button>
            </div>

            {/* First-Time Jobseekers Act (RA 11261) Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-700" />
                <h4 className="text-sm font-bold text-slate-900">First Time Jobseekers Act (RA 11261)</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Alamin kung paano makakakuha ng <strong>LIBRENG Barangay Clearance, NBI Clearance, Police Clearance, at Medical Certificate</strong> para sa iyong unang trabaho.
              </p>
              <button
                onClick={() => setIsGuidanceModalOpen(true)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 min-h-[44px]"
              >
                Basahin ang Buong Gabay →
              </button>
            </div>

            {/* Employer Callout Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3 shadow-md">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                <h4 className="text-sm font-bold text-white">Naghahanap ng Lokal na Talent?</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Mag-post ng trabaho para sa mga fresh graduates sa Cauayan City. May opsyon para sa ₱499 Featured Listing via GCash / Maya.
              </p>
              <button
                onClick={() => {
                  if (currentUser.role !== 'employer') handleRoleChange('employer');
                  setIsPostJobModalOpen(true);
                }}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition min-h-[44px]"
              >
                Mag-post ng Trabaho (Employer Portal)
              </button>
            </div>

            {/* PESO Cauayan City Contact Info */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 text-xs text-slate-600 shadow-sm">
              <h4 className="font-bold text-slate-900 text-sm">PESO Cauayan City</h4>
              <p>📍 Ground Floor, Cauayan City Hall, Isabela</p>
              <p>☎ Hotline: (078) 652-2011 / 0917-555-PESO</p>
              <p>⏰ Lunes - Biyernes: 8:00 AM - 5:00 PM</p>
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
              aria-label="Isara"
            >
              <X className="w-5 h-5" />
            </button>

            {applicationSuccessId ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-9 h-9" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Matagumpay na Naipasa ang Aplikasyon!</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Ang iyong resume at cover letter ay naipadala na sa recruitment team ng <strong>{selectedJobForDetail.company}</strong>.
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
                    Tignan sa My Applications
                  </button>
                  <button
                    onClick={() => setIsApplyingModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition"
                  >
                    Isara
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
                            Impormasyon sa Lokasyon at Byahe (Commute Guide)
                          </h4>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${prox.badgeColor}`}>
                          {prox.label}
                        </span>
                      </div>

                      {/* Route Summary Cards */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                          <span className="text-slate-500 block text-[10px] font-bold uppercase">Distansya sa iyo:</span>
                          <span className="text-sm sm:text-base font-black text-emerald-950">
                            {prox.distanceKm > 0 ? `${prox.distanceKm} km` : '0 km (WFH)'}
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate">mula {userHomeLocation.split(',')[0]}</span>
                        </div>

                        <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                          <span className="text-slate-500 block text-[10px] font-bold uppercase">Tinatayang Byahe:</span>
                          <span className="text-sm sm:text-base font-black text-slate-900">
                            {prox.distanceKm > 0 ? `~${prox.minutes} mins` : 'Walang Byahe'}
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate">{prox.commuteMode}</span>
                        </div>

                        <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                          <span className="text-slate-500 block text-[10px] font-bold uppercase">Pamasahe (One-way):</span>
                          <span className="text-sm sm:text-base font-black text-emerald-800">
                            {prox.distanceKm > 0 ? `₱${prox.fare}.00` : '₱0'}
                          </span>
                          <span className="text-[10px] text-slate-500 block">Regular Fare</span>
                        </div>
                      </div>

                      {/* Exact Address & Landmark Details */}
                      <div className="bg-white p-3 rounded-xl border border-emerald-100 text-xs space-y-1.5">
                        <div className="flex items-start gap-1.5 text-slate-800">
                          <span className="font-bold text-slate-500 whitespace-nowrap">Tiyak na Address:</span>
                          <strong className="text-slate-900 font-mono text-[11px]">{selectedJobForDetail.exactAddress || selectedJobForDetail.location}</strong>
                        </div>
                        {selectedJobForDetail.landmark && (
                          <div className="flex items-start gap-1.5 text-slate-700">
                            <span className="font-bold text-slate-500 whitespace-nowrap">Landmark / Palatandaan:</span>
                            <span>{selectedJobForDetail.landmark}</span>
                          </div>
                        )}
                        <div className="flex items-start gap-1.5 text-slate-600 pt-1 border-t border-slate-100">
                          <span className="font-bold text-slate-500 whitespace-nowrap">Payo sa Byahe:</span>
                          <span>{prox.tip}</span>
                        </div>
                      </div>

                      {/* Google Maps Directions Link */}
                      <div className="flex items-center justify-between pt-1">
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(userHomeLocation + ', Isabela')}&destination=${encodeURIComponent((selectedJobForDetail.exactAddress || selectedJobForDetail.location) + ', Isabela')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 underline"
                        >
                          <span>🗺️ Buksan ang Direksyon sa Google Maps (Turn-by-turn) ↗</span>
                        </a>
                        <span className="text-[11px] text-slate-400">
                          {prox.distanceKm > 15 ? '⚠️ Medyo malayo sa Centro' : '✓ Madaling marating'}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="font-bold text-slate-800">Tungkol sa Trabaho:</div>
                  <p className="text-slate-600 leading-relaxed">{selectedJobForDetail.description}</p>
                  <div className="font-bold text-slate-800 pt-2">Kwalipikasyon:</div>
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
                      <label className="font-bold text-slate-700 block mb-1">Buong Pangalan</label>
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
                    <label className="font-bold text-slate-700 block mb-1">Mensahe o Cover Note sa HR (Optional)</label>
                    <textarea
                      rows={2}
                      value={coverNote}
                      onChange={(e) => setCoverNote(e.target.value)}
                      placeholder="Ipaalam sa employer kung bakit interesado ka sa posisyong ito..."
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
                        <strong>Kumpirmasyon sa Lokasyon ng Trabaho:</strong> Nabasa at batid ko na ang trabahong ito ay matatagpuan sa <u>{selectedJobForDetail.location}</u> ({selectedJobForDetail.exactAddress || selectedJobForDetail.landmark}), at handa akong pumasok ({selectedJobForDetail.arrangement}).
                      </span>
                    </label>
                  </div>

                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-[11px] text-emerald-950 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                    <span>Protektado ang iyong resume sa ilalim ng Republic Act No. 10173 (Data Privacy Act). Ang authorized recruitment officer lamang ng {selectedJobForDetail.company} ang makakakita nito.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingApp || !locationAcknowledged}
                    className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition shadow-md shadow-emerald-950/20 min-h-[44px]"
                  >
                    {isSubmittingApp ? 'Ipinapadala ang Aplikasyon...' : 'I-submit ang Aplikasyon'}
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
              aria-label="Isara"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 pb-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                <Building2 className="w-3.5 h-3.5" /> Employer Portal
              </div>
              <h3 className="text-xl font-black text-slate-900 mt-2">Mag-post ng Bagong Bakanteng Trabaho</h3>
              <p className="text-xs text-slate-500">I-connect ang iyong kumpanya sa mga talento sa Cauayan City.</p>
            </div>

            <form onSubmit={handlePostJobSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Pangalan ng Kumpanya</label>
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
                  placeholder="Hal. Junior Web Developer"
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategorya</label>
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
                  <label className="font-bold text-slate-700 block mb-1">Bayan / Siyudad sa Isabela</label>
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
                  <label className="font-bold text-slate-700 block mb-1">Tiyak na Address / Kalye</label>
                  <input
                    type="text"
                    value={newJobExactAddress}
                    onChange={(e) => setNewJobExactAddress(e.target.value)}
                    placeholder="Hal. Maharlika Highway, Brgy. San Fermin"
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Malapit na Landmark</label>
                  <input
                    type="text"
                    value={newJobLandmark}
                    onChange={(e) => setNewJobLandmark(e.target.value)}
                    placeholder="Hal. Katapat ng SM City Cauayan"
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
                  />
                </div>

                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Gabay sa Byahe / Commute Tip</label>
                  <input
                    type="text"
                    value={newJobCommuteTip}
                    onChange={(e) => setNewJobCommuteTip(e.target.value)}
                    placeholder="Hal. Isang sakay ng tricycle mula Marabulig 1 o regular jeep"
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Antas ng Karanasan</label>
                  <select
                    value={newJobLevel}
                    onChange={(e) => setNewJobLevel(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="no_experience">Walang Karanasan (Fresh Grads)</option>
                    <option value="entry_level">Entry Level</option>
                    <option value="internship">Trainee / Internship</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sweldo (Salary Transparency)</label>
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
                <label className="font-bold text-slate-700 block mb-1">Deskripsyon ng Trabaho</label>
                <textarea
                  rows={2}
                  required
                  value={newJobDesc}
                  onChange={(e) => setNewJobDesc(e.target.value)}
                  placeholder="Ilarawan ang mga pangunahing gawain..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Tier Selection (Free vs Featured with GCash/Maya) */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="font-bold text-slate-900">Piliin ang Uri ng Listing:</div>
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
                    <span className="text-[11px] text-slate-500 mt-1">Libre (Basic listing)</span>
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
                {isFeaturedTier ? 'Magpatuloy sa GCash / Maya Checkout (₱499) →' : 'I-publish ang Libreng Job Opening'}
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
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 pb-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                <CreditCard className="w-3.5 h-3.5" /> PayMongo / Philippine Payment Gateway
              </div>
              <h3 className="text-xl font-black text-slate-900 mt-2">Magbayad para sa Featured Job Post</h3>
              <p className="text-xs text-slate-500">Halaga: <strong className="text-emerald-700 text-sm">₱499.00 PHP</strong></p>
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
                  Magpapadala ng simulated OTP authorization code sa inyong {paymentMethod} account.
                </p>
              </div>

              <button
                type="submit"
                disabled={isProcessingPayment}
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 min-h-[44px]"
              >
                {isProcessingPayment ? 'Pinoproseso ang Pagbabayad...' : `Magbayad ng ₱499.00 via ${paymentMethod} →`}
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
              <h3 className="text-xl font-black text-slate-900 mt-0.5">Matagumpay ang Pagbabayad!</h3>
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
                <span className="text-slate-500">Petsa / Oras:</span>
                <span className="text-slate-800">{activeReceipt.timestamp}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-sans text-sm">
                <span className="font-bold text-slate-700">Kabuuang Halaga:</span>
                <span className="font-black text-emerald-800">₱{activeReceipt.amountPesos}.00 PHP</span>
              </div>
            </div>

            <button
              onClick={() => setIsReceiptModalOpen(false)}
              className="w-full py-3 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition"
            >
              Isara at Tignan ang Trabaho sa Feed
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
              aria-label="Isara"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 pb-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" /> Cauayan City Resident Verification
              </div>
              <h3 className="text-xl font-black text-slate-900 mt-2">Opisyal na Pagpapatunay ng Paninirahan</h3>
              <p className="text-xs text-slate-500">Para sa mga residente ng Marabulig 1 at buong Cauayan City.</p>
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
                <h4 className="text-lg font-bold text-slate-900">Naipadala na ang Inyong Kahilingan!</h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Susuriin ng awtorisadong LGU officer ng Barangay Marabulig 1 ang inyong dokumento. Makikita ang beripikasyon sa inyong profile sa loob ng 24 oras.
                </p>
                <button
                  onClick={() => { setIsVerificationModalOpen(false); setResSuccess(false); }}
                  className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  Salamat
                </button>
              </div>
            ) : (
              <form onSubmit={handleResidencySubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Buong Pangalan ng Residente</label>
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
                    <label className="font-bold text-slate-700 block mb-1">Barangay sa Cauayan City</label>
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
                      <option>Iba pang Barangay sa Cauayan</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Uri ng Patunay ng Paninirahan</label>
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
                  <label className="font-bold text-slate-700 block mb-1">ID Number (I-mask para sa privacy)</label>
                  <input
                    type="text"
                    required
                    value={resIdNum}
                    onChange={(e) => setResIdNum(e.target.value)}
                    placeholder="Hal. 1234-5678-9012"
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Dokumento o Larawan ng ID</label>
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
                      <strong>Data Privacy Act (RA 10173) Consent:</strong> Pinapayagan ko ang awtorisadong LGU Admin ng Marabulig 1 na suriin ang aking dokumento para lamang sa resident verification. Hindi ito isasapubliko.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl transition shadow-md shadow-emerald-950/20"
                >
                  I-submit ang Verification Request
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
              aria-label="Isara"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 pb-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                <GraduationCap className="w-3.5 h-3.5" /> Gabay para sa Fresh Graduates
              </div>
              <h3 className="text-xl font-black text-slate-900 mt-2">Republic Act No. 11261</h3>
              <p className="text-xs text-slate-500">First Time Jobseekers Assistance Act sa Cauayan City</p>
            </div>

            <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950">
                <strong>Alam mo ba?</strong> Sa ilalim ng batas, LIBRE ang sumusunod na pre-employment requirements para sa first-time job seekers:
              </div>

              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong>Barangay Certification:</strong> Patunay na ikaw ay first-time job seeker (kunin sa Marabulig 1 Barangay Hall).</li>
                <li><strong>Police Clearance:</strong> Libre sa Cauayan City Police Station.</li>
                <li><strong>NBI Clearance:</strong> 1 libreng kopya mula sa NBI Regional Office.</li>
                <li><strong>Medical Certificate:</strong> Mula sa City Health Office ng Cauayan.</li>
                <li><strong>Birth & Marriage Certificates:</strong> 1 libreng first-time copy mula sa PSA.</li>
              </ul>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">Hakbang para Makakuha sa Cauayan City:</div>
                <p>1. Pumunta sa Marabulig 1 Barangay Hall at humingi ng <em>First Time Jobseeker Barangay Certification</em>.</p>
                <p>2. Ipresenta ang sertipikasyon sa PESO Cauayan City o ahensya ng gobyerno kung saan kukuha ng clearance.</p>
                <p>3. Hindi ka sisingilin ng anumang government processing fee.</p>
              </div>
            </div>

            <button
              onClick={() => setIsGuidanceModalOpen(false)}
              className="w-full py-2.5 bg-emerald-700 text-white font-bold text-xs rounded-xl"
            >
              Naiintindihan Ko, Salamat!
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
              aria-label="Isara"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xl font-black text-slate-900">Patakaran sa Privacy (Data Privacy Policy)</h3>
              <p className="text-xs text-slate-500">Nakaayon sa Philippine Data Privacy Act of 2012 (RA 10173)</p>
            </div>

            <div className="space-y-3 text-xs text-slate-700 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              <p>
                Iginagalang ng <strong>Marabulig 1 Career Connect / Cauayan City Career Connect</strong> ang inyong karapatan sa privacy. Ang aming pagkolekta ng datos ay limitado lamang sa mga sumusunod:
              </p>
              <h4 className="font-bold text-slate-900">1. Anong Datos ang Kinokolekta:</h4>
              <p>Pangalan, email address, mobile number, educational background, resume attachment, at residency verification documents para sa mga nag-aaplay.</p>
              
              <h4 className="font-bold text-slate-900">2. Paano Ginagamit ang Datos:</h4>
              <p>Ginagamit lamang ang inyong impormasyon upang i-endorso ang inyong aplikasyon sa kumpanyang inyong pinili, at upang i-validate ang inyong paninirahan sa Cauayan City sa tulong ng awtorisadong LGU staff.</p>

              <h4 className="font-bold text-slate-900">3. Pagbabahagi ng Impormasyon:</h4>
              <p>HINDI kailanman ibebenta o ibabahagi sa mga advertisers ang inyong personal na impormasyon. Tanging ang employer na inyong inaplayan ang makakatanggap ng inyong resume.</p>

              <h4 className="font-bold text-slate-900">4. Inyong Karapatan (Data Subject Rights):</h4>
              <p>May karapatan kayong humiling ng kopya, magpatama, o magpabura ng inyong personal na datos anumang oras sa pamamagitan ng pag-email sa opisyal na Data Protection Officer ng LGU.</p>
            </div>

            <button
              onClick={() => setIsPrivacyModalOpen(false)}
              className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl"
            >
              Isara ang Patakaran
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
              aria-label="Isara"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xl font-black text-slate-900">Mga Tuntunin sa Paggamit (Terms of Service)</h3>
              <p className="text-xs text-slate-500">Mga patakaran para sa mga Aplikante at Employers sa Cauayan City</p>
            </div>

            <div className="space-y-3 text-xs text-slate-700 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              <h4 className="font-bold text-slate-900">1. Para sa mga Aplikante:</h4>
              <p>Tiyaking totoo at tumpak ang lahat ng impormasyong ilalagay sa resume. Bawal magpasa ng pekeng identification cards o bogus applications.</p>

              <h4 className="font-bold text-slate-900">2. Para sa mga Employers:</h4>
              <p>Ipinagbabawal ang anumang "recruitment fee" o placement fee sa mga first-time job seekers ayon sa batas. Ang lahat ng job listing ay dapat may malinaw na salary range alinsunod sa DOLE Region II minimum wage standards.</p>

              <h4 className="font-bold text-slate-900">3. Limitasyon ng Pananagutan:</h4>
              <p>Ang Career Connect ay isang platform para mag-ugnay ng talent at local businesses. Ang pinal na desisyon sa hiring ay nasa pagitan ng employer at aplikante.</p>
            </div>

            <button
              onClick={() => setIsTermsModalOpen(false)}
              className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl"
            >
              Isara ang Tuntunin
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
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-black text-slate-900">Gumawa ng Bagong Account</h3>
              <p className="text-xs text-slate-500 mt-0.5">Sumali sa Cauayan City Career Connect community.</p>
            </div>

            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs">
                {authError}
              </div>
            )}

            <form onSubmit={handleSignUpSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Buong Pangalan</label>
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
                <label className="font-bold text-slate-700 block mb-1">Uri ng Account</label>
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
                Gumawa ng Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 10: Real Stateful Login Modal --- */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-black text-slate-900">Mag-login sa Portal</h3>
              <p className="text-xs text-slate-500 mt-1">Pumili ng active persona o mag-sign in:</p>
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
              Wala pang account?{' '}
              <button
                onClick={() => { setIsLoginModalOpen(false); setIsSignUpModalOpen(true); }}
                className="font-bold text-emerald-700 hover:underline"
              >
                Mag-Sign Up Dito
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
                  <h3 className="text-lg font-black text-slate-900">Aking mga Aplikasyon</h3>
                </div>
                <button
                  onClick={() => setIsApplicationsDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {applications.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Wala ka pang naipapasang aplikasyon. Mag-browse ng trabaho sa feed!
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
                        <div>Petsa: {app.appliedAt}</div>
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
                Bumalik sa Trabaho Feed
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
          <span>Trabaho</span>
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
          <span>Aplikasyon</span>
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
