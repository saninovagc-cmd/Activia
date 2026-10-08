'use client';

import React from 'react';
import { FolderStatus } from '@/types';
import { Check, Clock, ChevronRight } from 'lucide-react';

interface FolderTimelineProps {
  currentStatus: FolderStatus;
  onAdvance?: () => void;
  readOnly?: boolean;
}

export const FolderTimeline: React.FC<FolderTimelineProps> = ({
  currentStatus,
  onAdvance,
  readOnly = false,
}) => {
  const steps: { status: FolderStatus; label: string }[] = [
    { status: 'depot', label: '1. Dépôt' },
    { status: 'reception', label: '2. Réception' },
    { status: 'verification', label: '3. Vérification' },
    { status: 'complet', label: '4. Dossier complet' },
    { status: 'traitement', label: '5. Traitement' },
    { status: 'validation', label: '6. Validation' },
    { status: 'decision', label: '7. Décision' },
    { status: 'notification', label: '8. Notification' },
    { status: 'cloture', label: '9. Clôture' },
  ];

  const currentIndex = steps.findIndex(s => s.status === currentStatus);

  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Circuit Réglementaire du Dossier
          </h4>
          <p className="text-[11px] text-slate-500">
            Progression actuelle : Étape {currentIndex + 1} sur 9 ({Math.round(((currentIndex + 1) / steps.length) * 100)}%)
          </p>
        </div>

        {!readOnly && currentIndex < steps.length - 1 && onAdvance && (
          <button
            onClick={onAdvance}
            className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
          >
            Passer à l'étape suivante
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Vue Mobile & Tablette (< 1024px) : Grille adaptative 100% SANS défilement */}
      <div className="block lg:hidden space-y-3">
        {/* Barre de progression globale */}
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-300"
            style={{ width: `${Math.round(((currentIndex + 1) / steps.length) * 100)}%` }}
          />
        </div>

        {/* Grille des étapes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            return (
              <div
                key={step.status}
                className={`flex items-center gap-2 p-2 rounded-lg border text-xs transition-colors ${
                  isCurrent
                    ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold ring-1 ring-blue-300'
                    : isCompleted
                    ? 'bg-emerald-50/60 border-emerald-200 text-slate-800'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-3 h-3" /> : idx + 1}
                </div>
                <span className="truncate text-[11px]">{step.label.replace(/^\d+\.\s*/, '')}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vue Desktop (>= 1024px) : Stepper horizontal fluide */}
      <div className="hidden lg:flex items-center w-full min-w-0 pt-2 pb-1">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          return (
            <React.Fragment key={step.status}>
              <div className="flex flex-col items-center flex-1 text-center min-w-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all shrink-0 ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-xs'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span
                  className={`text-[10px] mt-1.5 font-medium truncate w-full px-1 ${
                    isCurrent
                      ? 'text-blue-700 font-bold'
                      : isCompleted
                      ? 'text-slate-800'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {idx < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-1 shrink-0 ${
                    idx < currentIndex ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

