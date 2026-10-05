'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast, hideToast } = useApp();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-600 shrink-0" />
  };

  const borders = {
    success: 'border-emerald-200 bg-white shadow-lg shadow-emerald-950/5',
    warning: 'border-amber-200 bg-white shadow-lg shadow-amber-950/5',
    error: 'border-rose-200 bg-white shadow-lg shadow-rose-950/5',
    info: 'border-blue-200 bg-white shadow-lg shadow-blue-950/5'
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${borders[toast.type]} max-w-md`}>
        {icons[toast.type]}
        <p className="text-xs font-semibold text-slate-800 leading-snug">{toast.message}</p>
        <button
          onClick={hideToast}
          className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors ml-2"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
