'use client';

import React from 'react';
import { Folder } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Calendar, User, Eye, CheckCircle, AlertTriangle, FileText, ArrowRight } from 'lucide-react';

interface FolderTableProps {
  folders: Folder[];
  onSelect: (folder: Folder) => void;
}

export const FolderTable: React.FC<FolderTableProps> = ({ folders, onSelect }) => {
  const enRetard = folders.filter(f => new Date(f.due_date).getTime() < Date.now() && f.status !== 'cloture').length;
  const favorables = folders.filter(f => f.decision === 'Favorable').length;
  const enCours = folders.filter(f => f.status !== 'cloture' && f.status !== 'rejete').length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden w-full max-w-full">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-4 rounded-full bg-blue-600 shrink-0" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Registre des Dossiers d'Instruction Réglementaire
          </h3>
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full shrink-0">
            {folders.length} dossier(s)
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            {enCours} en instruction
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            {enRetard} hors SLA
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {favorables} avis favorables
          </span>
        </div>
      </div>

      {/* =========================================================================
          VUE MOBILE & TABLETTE (< 1024px) : Cartes fluides 100% SANS défilement
          ========================================================================= */}
      <div className="block lg:hidden divide-y divide-slate-100 p-3 bg-slate-50/40 space-y-2.5">
        {folders.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Aucun dossier ne correspond à ces critères.
          </div>
        ) : (
          folders.map((folder) => {
            const isOverdue = new Date(folder.due_date).getTime() < Date.now() && folder.status !== 'cloture';
            return (
              <div
                key={folder.id}
                onClick={() => onSelect(folder)}
                className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-blue-400 transition-all cursor-pointer space-y-2.5"
              >
                {/* Header: N° Dossier + Badges */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {folder.folder_number}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge priority={folder.priority} />
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200 uppercase">
                      {folder.status}
                    </span>
                  </div>
                </div>

                {/* Structure & Demandeur */}
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                    {folder.structure}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {folder.folder_type} • <span className="font-medium text-slate-600">{folder.applicant}</span>
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Évaluateur</span>
                    <span className="font-semibold text-slate-800 truncate block">{folder.manager_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Échéance SLA</span>
                    <span className={`font-semibold flex items-center gap-1 ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {folder.due_date}
                    </span>
                  </div>
                </div>

                {/* Progress bar & Decision */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                      <span>Circuit</span>
                      <span className="font-bold text-slate-700">{folder.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full ${
                          folder.status === 'cloture' ? 'bg-emerald-500' : isOverdue ? 'bg-rose-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${folder.progress_percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${
                    folder.decision === 'Favorable'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : folder.decision === 'Défavorable'
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}>
                    {folder.decision || 'En attente'}
                  </span>
                </div>

                {/* Button */}
                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onSelect(folder)}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Consulter le dossier</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* =========================================================================
          VUE DESKTOP (>= 1024px) : Tableau fluide avec overflow-x-auto (aucune coupure)
          ========================================================================= */}
      <div className="hidden lg:block w-full max-w-full overflow-x-auto">
        <table className="w-full text-xs text-left text-slate-700 table-auto min-w-[760px] lg:min-w-0">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-3 font-semibold w-28">N° Dossier</th>
              <th className="py-3 px-3 font-semibold w-36">Procédure</th>
              <th className="py-3 px-3 font-semibold">Structure & Demandeur</th>
              <th className="py-3 px-2.5 font-semibold w-32">Évaluateur</th>
              <th className="py-3 px-2 font-semibold w-20">Priorité</th>
              <th className="py-3 px-2.5 font-semibold w-24">Étape</th>
              <th className="py-3 px-2 text-center w-24">Avancement</th>
              <th className="py-3 px-2.5 font-semibold w-28">Échéance SLA</th>
              <th className="py-3 px-2.5 font-semibold w-24">Décision</th>
              <th className="py-3 px-2 text-right w-12">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {folders.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400">
                  Aucun dossier ne correspond à ces critères.
                </td>
              </tr>
            ) : (
              folders.map((folder) => {
                const isOverdue = new Date(folder.due_date).getTime() < Date.now() && folder.status !== 'cloture';
                return (
                  <tr
                    key={folder.id}
                    onClick={() => onSelect(folder)}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                  >
                    {/* N° Dossier */}
                    <td className="py-3 px-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {folder.folder_number}
                    </td>

                    {/* Type */}
                    <td className="py-3 px-3 font-medium text-slate-800 whitespace-nowrap">
                      {folder.folder_type}
                    </td>

                    {/* Structure & Demandeur */}
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors leading-tight">
                        {folder.structure}
                      </p>
                      <p className="text-[11px] text-slate-500">{folder.applicant}</p>
                    </td>

                    {/* Évaluateur */}
                    <td className="py-3 px-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[9px] shrink-0">
                          {folder.manager_name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-800 truncate text-[11px]">{folder.manager_name}</span>
                      </div>
                    </td>

                    {/* Priorité */}
                    <td className="py-3 px-2 whitespace-nowrap">
                      <Badge priority={folder.priority} />
                    </td>

                    {/* Étape */}
                    <td className="py-3 px-2.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200 uppercase tracking-wider">
                        {folder.status}
                      </span>
                    </td>

                    {/* Avancement */}
                    <td className="py-3 px-2 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <div className="w-12 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              folder.status === 'cloture' ? 'bg-emerald-500' : isOverdue ? 'bg-rose-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${folder.progress_percentage}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-700 w-6 text-right">
                          {folder.progress_percentage}%
                        </span>
                      </div>
                    </td>

                    {/* Échéance SLA */}
                    <td className="py-3 px-2.5 whitespace-nowrap">
                      <div className={`flex items-center gap-1 font-medium text-[11px] ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{folder.due_date}</span>
                      </div>
                    </td>

                    {/* Décision */}
                    <td className="py-3 px-2.5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        folder.decision === 'Favorable'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : folder.decision === 'Défavorable'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : folder.decision === 'Avis avec réserves'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        {folder.decision || 'En attente'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-2 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(folder);
                        }}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                        title="Consulter le dossier"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
