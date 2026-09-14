"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toast: {
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
    warning: (message: string, title?: string) => void;
  };
  showToast: (type: ToastType, message: string, title?: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, message: string, title?: string, duration = 3500) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    
    let safeMessage = message;
    if (typeof message === 'string' && message.length > 150) {
      safeMessage = message.substring(0, 150) + "... (See console for full details)";
      console.error("Full toast error:", message);
    }
    
    const newToast: ToastMessage = { id, type, title, message: safeMessage, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    success: (message: string, title?: string) => showToast('success', message, title),
    error: (message: string, title?: string) => showToast('error', message, title),
    info: (message: string, title?: string) => showToast('info', message, title),
    warning: (message: string, title?: string) => showToast('warning', message, title),
  };

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-cyan-400 shrink-0" />;
    }
  };

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/40 bg-gray-900/95 text-emerald-300 shadow-emerald-500/10';
      case 'error':
        return 'border-rose-500/40 bg-gray-900/95 text-rose-300 shadow-rose-500/10';
      case 'warning':
        return 'border-amber-500/40 bg-gray-900/95 text-amber-300 shadow-amber-500/10';
      case 'info':
      default:
        return 'border-cyan-500/40 bg-gray-900/95 text-cyan-300 shadow-cyan-500/10';
    }
  };

  return (
    <ToastContext.Provider value={{ toast, showToast }}>
      {children}
      {/* Toast Render Container - Bottom Right / Mobile Bottom */}
      <div className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:left-auto sm:right-6 z-[100] flex flex-col-reverse space-y-reverse space-y-3 sm:max-w-sm w-auto sm:w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-xl border shadow-2xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-5 duration-200 flex items-start gap-3 ${getToastStyles(
              t.type
            )}`}
          >
            {getToastIcon(t.type)}
            <div className="flex-1 text-xs">
              {t.title && <div className="font-bold text-white mb-0.5 text-xs">{t.title}</div>}
              <div className="text-gray-200 leading-snug">{t.message}</div>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-gray-400 hover:text-white p-0.5 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
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
