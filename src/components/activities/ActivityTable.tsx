'use client';

import React, { useState } from 'react';
import { Activity } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { 
  Eye, 
  Edit3, 
  Trash2, 
  Calendar, 
  ArrowUpDown, 
  Folder 
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface ActivityTableProps {
  activities: Activity[];
  onSelect: (activity: Activity) => void;
  onEdit: (activity: Activity) => void;
}

export const ActivityTable: React.FC<ActivityTableProps> = ({
  activities,
  onSelect,
  onEdit,
}) => {
  const { deleteActivity, currentUser } = useApp();
  const [sortField, setSortField] = useState<keyof Activity>('due_date');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const canDelete = currentUser.role === 'admin' || currentUser.role === 'chef_service';

  const handleSort = (field: keyof Activity) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedActivities = [...activities].sort((a, b) => {
    let aVal = a[sortField] || '';
    let bVal = b[sortField] || '';
    if (aVal < bVal) return sortAsc ? -1 : 1;
    if (aVal > bVal) return sortAsc ? 1 : -1;
    return 0;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left text-slate-700">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th 
                onClick={() => handleSort('code')}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  Code
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('title')}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  Titre & Périmètre
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 font-semibold">Service</th>
              <th className="py-3 px-4 font-semibold">Priorité</th>
              <th 
                onClick={() => handleSort('status')}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  Statut
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 font-semibold text-center">Avancement</th>
              <th className="py-3 px-4 font-semibold">Responsable</th>
              <th 
                onClick={() => handleSort('due_date')}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  Échéance
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {sortedActivities.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400 text-sm">
                  Aucune activité ne correspond aux filtres appliqués.
                </td>
              </tr>
            ) : (
              sortedActivities.map((act) => {
                const isOverdue = act.status === 'en_retard' || (act.status !== 'termine' && new Date(act.due_date).getTime() < Date.now());
                return (
                  <tr
                    key={act.id}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    onClick={() => onSelect(act)}
                  >
                    {/* Code */}
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {act.code}
                    </td>

                    {/* Titre */}
                    <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                      <p className="font-semibold text-slate-900 line-clamp-1 group-hover:text-blue-700 transition-colors">
                        {act.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                        <span className="font-medium text-slate-600">{act.activity_type}</span>
                        {act.associated_folder && (
                          <span className="flex items-center gap-1 text-slate-400">
                            • <Folder className="w-3 h-3" /> {act.associated_folder}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Service */}
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {act.department}
                    </td>

                    {/* Priorité */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge priority={act.priority} />
                    </td>

                    {/* Statut */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge status={isOverdue ? 'en_retard' : act.status} />
                    </td>

                    {/* Avancement */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-16 bg-slate-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              act.status === 'termine' ? 'bg-emerald-500' : isOverdue ? 'bg-rose-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${act.progress_percentage}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 w-7 text-right">
                          {act.progress_percentage}%
                        </span>
                      </div>
                    </td>

                    {/* Responsable */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                          {act.manager_name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-800">{act.manager_name}</span>
                      </div>
                    </td>

                    {/* Échéance */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className={`flex items-center gap-1 font-medium ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{act.due_date}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onSelect(act)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                          title="Consulter la fiche"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(act)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-md transition-colors"
                          title="Modifier"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {canDelete && (
                          <button
                            onClick={() => {
                              if (confirm(`Confirmez-vous la suppression de l'activité ${act.code} ?`)) {
                                deleteActivity(act.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
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
