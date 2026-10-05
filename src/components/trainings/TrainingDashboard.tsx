'use client';

import React from 'react';
import { TrainingItem } from '@/types';
import { GraduationCap, Award, MapPin, Clock, CheckCircle2, BookOpen } from 'lucide-react';

interface TrainingDashboardProps {
  trainings: TrainingItem[];
}

export const TrainingDashboard: React.FC<TrainingDashboardProps> = ({ trainings }) => {
  const total = trainings.length;
  const validated = trainings.filter(t => t.result === 'Validé').length;
  const validationRate = total > 0 ? Math.round((validated / total) * 100) : 0;
  const totalHours = trainings.reduce((acc, curr) => acc + (curr.duration_hours || 0), 0);
  const certificatesIssued = trainings.filter(t => t.certificate_issued).length;

  const uniqueRegions = Array.from(new Set(trainings.map(t => t.region))).filter(Boolean);

  // Theme count
  const themeCounts: { [key: string]: number } = {};
  trainings.forEach(t => {
    themeCounts[t.theme] = (themeCounts[t.theme] || 0) + 1;
  });

  return (
    <div className="space-y-4">
      {/* Top 5 metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">Points Focaux Formés</span>
            <span className="text-lg font-black text-slate-900">{total}</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">Taux de Réussite</span>
            <span className="text-lg font-black text-emerald-700">{validationRate}%</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">Attestations Émises</span>
            <span className="text-lg font-black text-purple-700">{certificatesIssued}</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">Heures Dispensées</span>
            <span className="text-lg font-black text-amber-700">{totalHours} h</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">Régions Couvertes</span>
            <span className="text-lg font-black text-indigo-700">{uniqueRegions.length}</span>
          </div>
        </div>
      </div>

      {/* Breakdown panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* By Theme */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-blue-600" />
            Répartition des Participants par Thématique de Formation
          </h3>
          <div className="space-y-2 text-xs">
            {Object.entries(themeCounts).map(([theme, count]) => {
              const pct = Math.round((count / total) * 100);
              return (
                <div key={theme} className="space-y-1">
                  <div className="flex justify-between text-slate-700">
                    <span className="font-medium truncate">{theme}</span>
                    <span className="font-semibold text-slate-900">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Regional coverage */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-indigo-600" />
            Couverture Régionale du Réseau des Points Focaux
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {uniqueRegions.map(region => {
              const count = trainings.filter(t => t.region === region).length;
              return (
                <div key={region} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                  <span className="font-medium text-slate-700 truncate">{region}</span>
                  <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px] border border-indigo-200">
                    {count} formé{count > 1 ? 's' : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
