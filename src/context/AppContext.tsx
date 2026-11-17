import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  CommuteRoute,
  Job,
  JobAlert,
  Language,
  UserProfile,
  UserRole,
} from '../types';
import { INITIAL_JOBS } from '../data/initialJobs';
import { INITIAL_COMMUTE_ROUTES } from '../data/initialCommuteRoutes';
import { apiRequest, getAuthToken, setAuthToken } from '../utils/api';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface AppContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  currentUser: UserProfile;
  isAuthReady: boolean;
  switchDemoRole: (role: UserRole) => Promise<void>;
  loginWithEmail: (email: string) => Promise<void>;
  registerAccount: (payload: {
    name: string;
    email: string;
    password: string;
    role: 'jobseeker' | 'employer';
    barangay?: string;
    companyName?: string;
  }) => Promise<void>;
  logout: () => void;
  jobs: Job[];
  jobsLoading: boolean;
  jobsError: string;
  refreshJobs: (includeAll?: boolean) => Promise<void>;
  commuteRoutes: CommuteRoute[];
  refreshCommuteRoutes: () => Promise<void>;
  homeBarangay: string;
  setHomeBarangay: (barangay: string) => void;
  savedJobIds: number[];
  toggleSaveJob: (jobId: number) => void;
  alerts: JobAlert[];
  refreshAlerts: () => Promise<void>;
  createAlert: (payload: Omit<JobAlert, 'id' | 'active' | 'createdAt'>) => Promise<void>;
  deleteAlert: (id: string) => Promise<void>;
  toasts: ToastMessage[];
  notify: (text: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
}

const GUEST_USER: UserProfile = {
  id: 'user-guest',
  name: 'Guest User',
  email: '',
  phone: '',
  role: 'guest',
  barangay: 'Marabulig 1',
  isResidentVerified: false,
};

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('cauayan_lang_v3');
    return saved === 'fil' ? 'fil' : 'en';
  });

  const setLang = (next: Language) => {
    setLangState(next);
    localStorage.setItem('cauayan_lang_v3', next);
  };

  const [currentUser, setCurrentUser] = useState<UserProfile>(GUEST_USER);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState('');

  const [commuteRoutes, setCommuteRoutes] = useState<CommuteRoute[]>(INITIAL_COMMUTE_ROUTES);

  const [homeBarangay, setHomeBarangayState] = useState<string>(() => {
    return localStorage.getItem('cauayan_home_barangay_v3') || 'Marabulig 1, Cauayan City';
  });

  const setHomeBarangay = (b: string) => {
    setHomeBarangayState(b);
    localStorage.setItem('cauayan_home_barangay_v3', b);
  };

  const [savedJobIds, setSavedJobIds] = useState<number[]>(() => {
    try {
      const raw = localStorage.getItem('cauayan_saved_jobs_v3');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const notify = useCallback((text: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  };

  const refreshJobs = useCallback(async (includeAll = false) => {
    setJobsLoading(true);
    setJobsError('');
    try {
      const res = await apiRequest<{ jobs: Job[] }>(`/api/jobs${includeAll ? '?all=1' : ''}`);
      setJobs(res.jobs);
    } catch (err) {
      setJobsError(err instanceof Error ? err.message : 'Unable to load job listings.');
    } finally {
      setJobsLoading(false);
    }
  }, []);

  const refreshCommuteRoutes = useCallback(async () => {
    try {
      const res = await apiRequest<{ routes: CommuteRoute[] }>('/api/commute/routes');
      setCommuteRoutes(res.routes);
    } catch {
      // Retain existing fallback routes
    }
  }, []);

  const refreshAlerts = useCallback(async () => {
    try {
      const emailParam = currentUser.email ? `?email=${encodeURIComponent(currentUser.email)}` : '';
      const res = await apiRequest<{ alerts: JobAlert[] }>(`/api/alerts${emailParam}`);
      setAlerts(res.alerts);
    } catch {
      // Ignore silent background alert refresh failures
    }
  }, [currentUser.email]);

  const switchDemoRole = useCallback(
    async (role: UserRole) => {
      if (role === 'guest') {
        setAuthToken('');
        setCurrentUser(GUEST_USER);
        return;
      }
      const res = await apiRequest<{ user: UserProfile; token: string }>('/api/auth/demo-switch', {
        method: 'POST',
        body: JSON.stringify({ role }),
      });
      setAuthToken(res.token);
      setCurrentUser(res.user);
      notify(`Signed in as ${res.user.name} (${res.user.role.replace('_', ' ')})`, 'success');
    },
    [notify]
  );

  // Restore session or default to signed-in demo jobseeker on first visit
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const existingToken = getAuthToken();
        if (existingToken) {
          const me = await apiRequest<{ user: UserProfile | null }>('/api/auth/me');
          if (active && me.user) {
            setCurrentUser(me.user);
            setIsAuthReady(true);
            return;
          }
        }
        // Seamless demo jobseeker session if no token present
        const res = await apiRequest<{ user: UserProfile; token: string }>('/api/auth/demo-switch', {
          method: 'POST',
          body: JSON.stringify({ role: 'jobseeker' }),
        });
        if (active) {
          setAuthToken(res.token);
          setCurrentUser(res.user);
        }
      } catch {
        if (active) setCurrentUser(GUEST_USER);
      } finally {
        if (active) setIsAuthReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;
    const isAdminSide = ['super_admin', 'employer', 'reviewer'].includes(currentUser.role);
    refreshJobs(isAdminSide);
    refreshCommuteRoutes();
    refreshAlerts();
  }, [isAuthReady, currentUser.role, refreshJobs, refreshCommuteRoutes, refreshAlerts]);

  const loginWithEmail = async (email: string) => {
    const res = await apiRequest<{ user: UserProfile; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    setAuthToken(res.token);
    setCurrentUser(res.user);
    notify(`Welcome back, ${res.user.name}`, 'success');
  };

  const registerAccount = async (payload: {
    name: string;
    email: string;
    password: string;
    role: 'jobseeker' | 'employer';
    barangay?: string;
    companyName?: string;
  }) => {
    const res = await apiRequest<{ user: UserProfile; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setAuthToken(res.token);
    setCurrentUser(res.user);
    notify(`Account created! Welcome, ${res.user.name}.`, 'success');
  };

  const logout = () => {
    setAuthToken('');
    setCurrentUser(GUEST_USER);
    notify('You have been signed out.', 'info');
  };

  const toggleSaveJob = (jobId: number) => {
    setSavedJobIds((prev) => {
      const exists = prev.includes(jobId);
      const next = exists ? prev.filter((id) => id !== jobId) : [jobId, ...prev];
      localStorage.setItem('cauayan_saved_jobs_v3', JSON.stringify(next));
      notify(exists ? 'Removed from saved jobs.' : 'Job saved to your list.', 'success');
      return next;
    });
  };

  const createAlert = async (payload: Omit<JobAlert, 'id' | 'active' | 'createdAt'>) => {
    const res = await apiRequest<{ alert: JobAlert }>('/api/alerts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setAlerts((prev) => [res.alert, ...prev]);
    notify('Job alert activated!', 'success');
  };

  const deleteAlert = async (id: string) => {
    await apiRequest(`/api/alerts/${encodeURIComponent(id)}`, { method: 'DELETE' });
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    notify('Job alert removed.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        currentUser,
        isAuthReady,
        switchDemoRole,
        loginWithEmail,
        registerAccount,
        logout,
        jobs,
        jobsLoading,
        jobsError,
        refreshJobs,
        commuteRoutes,
        refreshCommuteRoutes,
        homeBarangay,
        setHomeBarangay,
        savedJobIds,
        toggleSaveJob,
        alerts,
        refreshAlerts,
        createAlert,
        deleteAlert,
        toasts,
        notify,
        dismissToast,
        isAuthModalOpen,
        setIsAuthModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
