// Reusable Toast Notification System
import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const newToast = { id, message, type };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toastSuccess = useCallback((msg, duration) => addToast(msg, 'success', duration), [addToast]);
  const toastError = useCallback((msg, duration) => addToast(msg, 'error', duration), [addToast]);
  const toastWarning = useCallback((msg, duration) => addToast(msg, 'warning', duration), [addToast]);
  const toastInfo = useCallback((msg, duration) => addToast(msg, 'info', duration), [addToast]);

  return (
    <ToastContext.Provider
      value={{ addToast, removeToast, toastSuccess, toastError, toastWarning, toastInfo }}
    >
      {children}

      {/* Floating Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3 sm:px-0">
        {toasts.map((toast) => {
          let bgClass = 'bg-white border-stone-200 text-slate-800';
          let IconComponent = Info;
          let iconColor = 'text-blue-500';

          if (toast.type === 'success') {
            IconComponent = CheckCircle2;
            iconColor = 'text-emerald-500';
          } else if (toast.type === 'error') {
            IconComponent = AlertCircle;
            iconColor = 'text-rose-500';
          } else if (toast.type === 'warning') {
            IconComponent = AlertTriangle;
            iconColor = 'text-amber-500';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2 ${bgClass}`}
              role="alert"
            >
              <IconComponent className={`w-5 h-5 shrink-0 ${iconColor} mt-0.5`} />
              <div className="flex-1 text-xs font-medium leading-relaxed">
                {toast.message}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 rounded p-0.5 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
