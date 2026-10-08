'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { LucideIcon, ArrowLeft, Layers, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface PhasePlaceholderProps {
  title: string;
  phase: string;
  description: string;
  icon: LucideIcon;
  deliverables: string[];
}

export const PhasePlaceholder: React.FC<PhasePlaceholderProps> = ({
  title,
  phase,
  description,
  icon: Icon,
  deliverables,
}) => {
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-4 border border-blue-200 shadow-xs">
          <Icon className="w-8 h-8" />
        </div>

        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
          <Layers className="w-3.5 h-3.5" />
          Prévu en {phase}
        </span>

        <h1 className="text-2xl font-black text-slate-900 mt-4">{title}</h1>
        <p className="text-slate-600 text-sm mt-2 max-w-lg mx-auto leading-relaxed">
          {description}
        </p>

        <div className="mt-8 bg-white p-6 rounded-2xl border border-slate-200 text-left shadow-xs">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Fonctionnalités programmées pour ce module :
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-700">
            {deliverables.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            Retour au Tableau de Bord
          </Link>
          <Link
            href="/activities"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            Consulter les Activités
          </Link>
        </div>
      </div>
    </AppLayout>
  );
};

