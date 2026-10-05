'use client';

import React from 'react';
import { SignalStep } from '@/types';
import { Check, ChevronRight } from 'lucide-react';

interface SignalWorkflowProps {
  currentStep: SignalStep;
  onStepChange?: (step: SignalStep) => void;
  canEdit?: boolean;
}

const STEPS: { id: SignalStep; label: string; number: number }[] = [
  { id: 'signalement', label: 'Signalement', number: 1 },
  { id: 'evaluation', label: 'Évaluation', number: 2 },
  { id: 'investigation', label: 'Investigation', number: 3 },
  { id: 'echantillonnage', label: 'Échantillonnage', number: 4 },
  { id: 'analyse', label: 'Analyse Labo', number: 5 },
  { id: 'resultat', label: 'Résultat', number: 6 },
  { id: 'conclusion', label: 'Conclusion', number: 7 },
  { id: 'action_corrective', label: 'Action Corrective', number: 8 },
  { id: 'cloture', label: 'Clôture', number: 9 }
];

export const SignalWorkflow: React.FC<SignalWorkflowProps> = ({
  currentStep,
  onStepChange,
  canEdit = false
}) => {
  const currentIndex = STEPS.findIndex(s => s.id === currentStep);

  return (
    <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Chaîne d’investigation & Traitement ({currentIndex + 1}/9)
        </h4>
        <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          Étape actuelle : {STEPS[currentIndex]?.label || currentStep}
        </span>
      </div>

      {/* Horizontal step indicator */}
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5 text-center">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isFuture = idx > currentIndex;

          return (
            <button
              key={step.id}
              disabled={!canEdit}
              onClick={() => onStepChange && onStepChange(step.id)}
              className={`p-2 rounded-lg text-left transition-all border ${
                isCurrent
                  ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                  : isDone
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-white text-slate-400 border-slate-200 opacity-70'
              } ${canEdit ? 'cursor-pointer hover:border-blue-400' : 'cursor-default'}`}
            >
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className={`font-bold ${isCurrent ? 'text-blue-100' : isDone ? 'text-emerald-700' : 'text-slate-400'}`}>
                  Étape {step.number}
                </span>
                {isDone && <Check className="w-3 h-3 text-emerald-600" />}
              </div>
              <div className="font-semibold text-[11px] truncate">
                {step.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick advance control */}
      {canEdit && (
        <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
          <button
            disabled={currentIndex === 0}
            onClick={() => onStepChange && onStepChange(STEPS[currentIndex - 1].id)}
            className="px-3 py-1 text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Étape précédente
          </button>
          <span className="text-[11px] text-slate-500">
            Cliquez sur une étape ou utilisez les boutons pour faire progresser l’investigation
          </span>
          <button
            disabled={currentIndex === STEPS.length - 1}
            onClick={() => onStepChange && onStepChange(STEPS[currentIndex + 1].id)}
            className="px-3 py-1 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Étape suivante →
          </button>
        </div>
      )}
    </div>
  );
};
