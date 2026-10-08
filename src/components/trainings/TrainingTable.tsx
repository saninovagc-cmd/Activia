'use client';

import React, { useState } from 'react';
import { TrainingItem } from '@/types';
import { 
  GraduationCap, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Eye, 
  Award, 
  CheckCircle2, 
  Clock, 
  XCircle,
  FileCheck2,
  Calendar,
  Building,
  User
} from 'lucide-react';
import { ExportButton } from '@/components/common/ExportButton';
import { ExportConfig } from '@/lib/exportUtils';

interface TrainingTableProps {
  trainings: TrainingItem[];
  onSelect: (item: TrainingItem) => void;
  onNew: () => void;
  canManage: boolean;
}

export const TrainingTable: React.FC<TrainingTableProps> = ({
  trainings,
  onSelect,
  onNew,
  canManage
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [themeFilter, setThemeFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');

  const themes = Array.from(new Set(trainings.map(t => t.theme))).filter(Boolean);
  const regions = Array.from(new Set(trainings.map(t => t.region))).filter(Boolean);

  const filtered = trainings.filter(t => {
    const matchesSearch = 
      t.participant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.training_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.structure.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.trainer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.certificate_number && t.certificate_number.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTheme = themeFilter === 'all' || t.theme === themeFilter;
    const matchesRegion = regionFilter === 'all' || t.region === regionFilter;
    const matchesResult = resultFilter === 'all' || t.result === resultFilter;

    return matchesSearch && matchesTheme && matchesRegion && matchesResult;
  });

  const getExportConfig = (): ExportConfig => ({
    title: 'Registre des Formations & Habilitations des Points Focaux',
    subtitle: 'Direction de la Pharmacie et du Médicament — Suivi des compétences et certifications',
    filename: `formations_points_focaux_${new Date().toISOString().split('T')[0]}`,
    headers: ['Code Session', 'Participant', 'Fonction', 'Structure', 'Région', 'Thématique', 'Date', 'Résultat', 'Attestation'],
    rows: filtered.map(t => [
      t.training_code,
      t.participant_name,
      t.function_title,
      t.structure,
      t.region,
      t.theme,
      t.training_date,
      t.result,
      t.certificate_issued ? `Oui (${t.certificate_number || 'Délivrée'})` : 'Non'
    ]),
    summaryKpis: [
      { label: 'Total Inscrits', value: filtered.length },
      { label: 'Validés / Certifiés', value: filtered.filter(t => t.result === 'Validé').length },
      { label: 'Attestations Émises', value: filtered.filter(t => t.certificate_issued).length }
    ]
  });

  return (
    <div className="space-y-4">
      {/* Controls & Filter toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="flex-1 flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par nom, structure, formateur, n° attestation..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Theme filter */}
          <select
            value={themeFilter}
            onChange={e => setThemeFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-700"
          >
            <option value="all">Toutes les thématiques</option>
            {themes.map(th => (
              <option key={th} value={th}>{th}</option>
            ))}
          </select>

          {/* Region filter */}
          <select
            value={regionFilter}
            onChange={e => setRegionFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-700"
          >
            <option value="all">Toutes les régions</option>
            {regions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          {/* Result filter */}
          <select
            value={resultFilter}
            onChange={e => setResultFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-700"
          >
            <option value="all">Tous résultats</option>
            <option value="Validé">Validé</option>
            <option value="En cours">En cours</option>
            <option value="Ajourné">Ajourné</option>
          </select>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <ExportButton getConfig={getExportConfig} />

          {canManage && (
            <button
              onClick={onNew}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Inscrire un Participant</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-4 rounded-full bg-blue-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Registre des Formations & Points Focaux</h3>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">{filtered.length} agent(s)</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {trainings.filter(t => t.result === 'Validé').length} validés
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              {trainings.filter(t => t.certificate_issued).length} attestations délivrées
            </span>
          </div>
        </div>
      {/* =========================================================================
          VUE MOBILE & TABLETTE (< 1024px) : Cartes fluides 100% SANS défilement
          ========================================================================= */}
      <div className="block lg:hidden divide-y divide-slate-100 p-3 bg-slate-50/40 space-y-2.5">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            <GraduationCap className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            Aucun enregistrement ne correspond aux filtres sélectionnés.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5 cursor-pointer hover:border-purple-400 transition-all"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <span className="font-mono font-bold text-xs text-blue-900">{item.training_code}</span>
                  <span className="text-[10px] text-slate-500 block">{item.training_date}</span>
                </div>
                <div className="flex items-center gap-1">
                  {item.result === 'Validé' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Validé
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                      {item.result}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                  {item.participant_name}
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {item.function_title} • <span className="font-medium text-slate-700">{item.structure}</span>
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px]">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Thématique</span>
                <span className="font-semibold text-slate-800">{item.theme}</span>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Formateur : {item.trainer_name} ({item.duration_hours}h)
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] text-slate-500">{item.region} ({item.department})</span>
                <button
                  onClick={() => onSelect(item)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Consulter</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* =========================================================================
          VUE DESKTOP (>= 1024px) : Tableau fluide 100% SANS barre de défilement
          ========================================================================= */}
      <div className="hidden lg:block w-full max-w-full overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs table-auto min-w-[760px] lg:min-w-0">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-3 w-32">Code / Session</th>
              <th className="py-3 px-3">Participant & Fonction</th>
              <th className="py-3 px-3 w-40">Structure & Région</th>
              <th className="py-3 px-3">Thématique</th>
              <th className="py-3 px-2.5 w-36">Formateur</th>
              <th className="py-3 px-2.5 w-28">Résultat</th>
              <th className="py-3 px-2 text-right w-12">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    <GraduationCap className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    Aucun enregistrement ne correspond aux filtres sélectionnés.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => onSelect(item)}
                  >
                    <td className="py-3 px-4 font-mono font-medium">
                      <div className="text-blue-900 font-bold">{item.training_code}</div>
                      <div className="text-[11px] text-slate-500 font-normal">{item.training_date}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {item.participant_name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {item.function_title}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{item.structure}</div>
                      <div className="text-[11px] text-slate-500">{item.region} ({item.department})</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">{item.theme}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{item.trainer_name}</div>
                      <div className="text-[11px] text-slate-500">{item.duration_hours} heures de cours</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {item.result === 'Validé' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Validé
                          </span>
                        ) : item.result === 'En cours' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            En cours
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                            Ajourné
                          </span>
                        )}
                      </div>
                      {item.certificate_issued && (
                        <div className="text-[10px] text-purple-700 font-semibold mt-1">
                          Certifié ({item.certificate_number})
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelect(item)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Consulter la fiche individuelle"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 text-slate-500 text-xs flex items-center justify-between">
          <span>Affichage de <strong>{filtered.length}</strong> sur <strong>{trainings.length}</strong> participants répertoriés</span>
          <span className="text-[11px] text-slate-400">Registre National de Formation Continue</span>
        </div>
      </div>
    </div>
  );
};

