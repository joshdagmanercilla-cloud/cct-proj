import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-20 md:bottom-5 right-4 z-[60] flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)] sm:w-auto"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg text-xs font-medium bg-white ${
            toast.type === 'success'
              ? 'border-emerald-200 text-emerald-950'
              : toast.type === 'error'
              ? 'border-red-200 text-red-950'
              : 'border-slate-200 text-slate-900'
          }`}
        >
          {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-slate-600 shrink-0" />}
          <span className="flex-1">{toast.text}</span>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            className="p-1 text-slate-400 hover:text-slate-700 rounded"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
