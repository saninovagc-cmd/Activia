'use client';

import React, { useState } from 'react';
import { Folder } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Calendar, User, Eye, CheckCircle, AlertTriangle, FileText, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface FolderTableProps {
  folders: Folder[];
  onSelect: (folder: Folder) => void;
}

export const FolderTable: React.FC<FolderTableProps> = ({ folders, onSelect }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  const totalPages = Math.ceil(folders.length / pageSize) || 1;
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, folders.length);
  const paginatedFolders = folders.slice(startIndex, endIndex);

  const enRetard = folders.filter(f => new Date(f.due_date).getTime() < Date.now() && f.status !== 'cloture').length;
  const favorables = folders.filter(f => f.decision === 'Favorable' || f.decision === 'Arrêté signé').length;
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
          paginatedFolders.map((folder) => {
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
          VUE DESKTOP (>= 1024px) : Tableau fluide 100% SANS barre de défilement
          ========================================================================= */}
      <div className="hidden lg:block w-full max-w-full">
        <table className="w-full text-xs text-left text-slate-800 table-fixed border-collapse">
          <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider border-b border-slate-200 text-[11px]">
            <tr>
              <th className="py-3 px-3 font-bold w-[12%]">N° Dossier</th>
              <th className="py-3 px-2.5 font-bold w-[17%]">Procédure</th>
              <th className="py-3 px-3 font-bold w-[25%]">Structure & Demandeur</th>
              <th className="py-3 px-2.5 font-bold w-[12%]">Évaluateur</th>
              <th className="py-3 px-2 font-bold w-[8%] text-center">Priorité</th>
              <th className="py-3 px-2.5 font-bold w-[9%] text-center">Étape</th>
              <th className="py-3 px-2 font-bold w-[8%] text-center">Progrès</th>
              <th className="py-3 px-2.5 font-bold w-[9%] text-center">Décision</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {folders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  Aucun dossier ne correspond à ces critères.
                </td>
              </tr>
            ) : (
              paginatedFolders.map((folder) => {
                const isOverdue = new Date(folder.due_date).getTime() < Date.now() && folder.status !== 'cloture';
                return (
                  <tr
                    key={folder.id}
                    onClick={() => onSelect(folder)}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                  >
                    {/* N° Dossier */}
                    <td className="py-3 px-3 align-top whitespace-nowrap">
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 block text-center">
                        {folder.folder_number}
                      </span>
                      <span className="block text-[11px] text-slate-400 text-center mt-1">
                        {folder.receipt_date}
                      </span>
                    </td>

                    {/* Type / Procédure */}
                    <td className="py-3 px-2.5 align-top">
                      <p className="font-semibold text-slate-900 leading-snug break-words whitespace-normal">
                        {folder.folder_type}
                      </p>
                    </td>

                    {/* Structure & Demandeur */}
                    <td className="py-3 px-3 align-top">
                      <p className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug break-words whitespace-normal">
                        {folder.structure}
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5 leading-snug break-words whitespace-normal">
                        {folder.applicant}
                      </p>
                    </td>

                    {/* Évaluateur */}
                    <td className="py-3 px-2.5 align-top">
                      <div className="flex items-start gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                          {folder.manager_name ? folder.manager_name.charAt(0) : '?'}
                        </div>
                        <span className="font-medium text-slate-800 text-xs leading-snug break-words whitespace-normal">
                          {folder.manager_name || 'Non assigné'}
                        </span>
                      </div>
                    </td>

                    {/* Priorité */}
                    <td className="py-3 px-2 text-center align-top whitespace-nowrap">
                      <Badge priority={folder.priority} />
                    </td>

                    {/* Étape */}
                    <td className="py-3 px-2.5 text-center align-top whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200 uppercase tracking-wider inline-block">
                        {folder.status}
                      </span>
                    </td>

                    {/* Avancement */}
                    <td className="py-3 px-2 text-center align-top whitespace-nowrap">
                      <div className="inline-flex flex-col items-center gap-1">
                        <span className="text-xs font-bold text-slate-700">
                          {folder.progress_percentage}%
                        </span>
                        <div className="w-14 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              folder.status === 'cloture' ? 'bg-emerald-500' : isOverdue ? 'bg-rose-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${folder.progress_percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Décision */}
                    <td className="py-3 px-2.5 text-center align-top whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-block ${
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
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {folders.length > 0 && (
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-slate-600 text-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>
              Affichage de <strong>{startIndex + 1}</strong> à <strong>{endIndex}</strong> sur <strong>{folders.length}</strong> dossiers
            </span>
            <div className="flex items-center gap-1 ml-3">
              <span className="text-[11px] text-slate-400">Lignes :</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-700"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Page précédente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 py-0.5 font-semibold text-slate-700">
              Page {safePage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Page suivante"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
