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
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-4 rounded-full bg-blue-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Registre des Dossiers d'Instruction Réglementaire</h3>
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">{folders.length} dossier(s)</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
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
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left text-slate-700">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 font-semibold">N° Dossier</th>
              <th className="py-3 px-4 font-semibold">Type de Procédure</th>
              <th className="py-3 px-4 font-semibold">Structure & Demandeur</th>
              <th className="py-3 px-4 font-semibold">Évaluateur Pilote</th>
              <th className="py-3 px-4 font-semibold">Priorité</th>
              <th className="py-3 px-4 font-semibold">Étape du Circuit</th>
              <th className="py-3 px-4 font-semibold text-center">Avancement</th>
              <th className="py-3 px-4 font-semibold">Échéance SLA</th>
              <th className="py-3 px-4 font-semibold">Décision</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
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
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {folder.folder_number}
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-800">
                      {folder.folder_type}
                    </td>

                    {/* Structure & Demandeur */}
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <p className="font-semibold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                        {folder.structure}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{folder.applicant}</p>
                    </td>

                    {/* Évaluateur */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[9px]">
                          {folder.manager_name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-800">{folder.manager_name}</span>
                      </div>
                    </td>

                    {/* Priorité */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge priority={folder.priority} />
                    </td>

                    {/* Étape */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200 uppercase tracking-wider">
                        {folder.status}
                      </span>
                    </td>

                    {/* Avancement */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-16 bg-slate-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              folder.status === 'cloture' ? 'bg-emerald-500' : isOverdue ? 'bg-rose-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${folder.progress_percentage}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 w-7 text-right">
                          {folder.progress_percentage}%
                        </span>
                      </div>
                    </td>

                    {/* Échéance SLA */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className={`flex items-center gap-1 font-medium ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{folder.due_date}</span>
                      </div>
                      {isOverdue && (
                        <span className="text-[10px] text-rose-600 font-bold">Retard SLA</span>
                      )}
                    </td>

                    {/* Décision */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
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
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => onSelect(folder)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                        title="Consulter le dossier"
                      >
                        <Eye className="w-4 h-4" />
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
