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
    const aVal = a[sortField] || '';
    const bVal = b[sortField] || '';
    if (aVal < bVal) return sortAsc ? -1 : 1;
    if (aVal > bVal) return sortAsc ? 1 : -1;
    return 0;
  });

  // Regroupement par service (ordre officiel DLVS, puis autres services)
  const SERVICE_ORDER = [
    'Direction (DLVS)',
    'Service des Vigilances et des Produits de Santé (SVPS)',
    'Service de la Surveillance du Marché (SSMUR)',
    'Service des Licences (SL)',
  ];
  const groupsMap = new Map<string, Activity[]>();
  sortedActivities.forEach(a => {
    const key = a.department || 'Service non renseigné';
    if (!groupsMap.has(key)) groupsMap.set(key, []);
    groupsMap.get(key)!.push(a);
  });
  const groupedByService = Array.from(groupsMap.entries()).sort(([a], [b]) => {
    const ia = SERVICE_ORDER.indexOf(a);
    const ib = SERVICE_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden w-full max-w-full">
      {/* Table Header Summary */}
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-4 rounded-full bg-blue-600 shrink-0" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Plan Opérationnel des Activités par Service (DLVS)
          </h3>
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full shrink-0">
            {activities.length} activité(s)
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            {activities.filter(a => a.status === 'en_cours').length} en cours
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            {activities.filter(a => a.status === 'en_retard' || (a.status !== 'termine' && new Date(a.due_date).getTime() < Date.now())).length} en retard
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {activities.filter(a => a.status === 'termine').length} terminées
          </span>
        </div>
      </div>

      {/* =========================================================================
          VUE MOBILE & TABLETTE (< 1024px) : Cartes fluides 100% SANS défilement
          ========================================================================= */}
      <div className="block lg:hidden divide-y divide-slate-100">
        {sortedActivities.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Aucune activité ne correspond aux filtres appliqués.
          </div>
        ) : (
          groupedByService.map(([service, items]) => {
            const lateCount = items.filter(a => a.status === 'en_retard' || (a.status !== 'termine' && new Date(a.due_date).getTime() < Date.now())).length;
            return (
              <div key={service} className="p-3 bg-slate-50/50">
                {/* Service Group Header */}
                <div className="flex items-center justify-between py-2 px-3 mb-2 rounded-lg bg-slate-900 text-white text-xs font-bold">
                  <span className="truncate">{service}</span>
                  <span className="text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-full shrink-0">
                    {items.length} {lateCount > 0 ? `• ${lateCount} retard` : ''}
                  </span>
                </div>

                {/* Cards for items */}
                <div className="space-y-2.5">
                  {items.map((act) => {
                    const isOverdue = act.status === 'en_retard' || (act.status !== 'termine' && new Date(act.due_date).getTime() < Date.now());
                    return (
                      <div
                        key={act.id}
                        onClick={() => onSelect(act)}
                        className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-blue-400 transition-all cursor-pointer space-y-2.5"
                      >
                        {/* Top: Code + Badges */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {act.code}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Badge priority={act.priority} />
                            <Badge status={isOverdue ? 'en_retard' : act.status} />
                          </div>
                        </div>

                        {/* Title & Type */}
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                            {act.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 flex-wrap">
                            <span className="font-semibold text-slate-600">{act.activity_type}</span>
                            {act.associated_folder && (
                              <span className="flex items-center gap-1 text-slate-400">
                                • <Folder className="w-3 h-3" /> {act.associated_folder}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Info details: Responsable, Échéance, Avancement */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Responsable</span>
                            <span className="font-semibold text-slate-800 truncate block">{act.manager_name}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Échéance</span>
                            <span className={`font-semibold flex items-center gap-1 ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {act.due_date}
                            </span>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                            <span>Avancement</span>
                            <span className="font-bold text-slate-700">{act.progress_percentage}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full ${
                                act.status === 'termine' ? 'bg-emerald-500' : isOverdue ? 'bg-rose-500' : 'bg-blue-600'
                              }`}
                              style={{ width: `${act.progress_percentage}%` }}
                            />
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onSelect(act)}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Détails</span>
                          </button>
                          <button
                            onClick={() => onEdit(act)}
                            className="px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg flex items-center gap-1 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Modifier</span>
                          </button>
                          {canDelete && (
                            <button
                              onClick={() => {
                                if (confirm(`Confirmez-vous la suppression de l'activité ${act.code} ?`)) {
                                  deleteActivity(act.id);
                                }
                              }}
                              className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* =========================================================================
          VUE DESKTOP (>= 1024px) : Tableau fluide 100% SANS barre de défilement
          ========================================================================= */}
      <div className="hidden lg:block w-full max-w-full overflow-hidden">
        <table className="w-full text-xs text-left text-slate-700 table-auto">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th 
                onClick={() => handleSort('code')}
                className="py-3 px-3 font-semibold cursor-pointer hover:text-slate-900 transition-colors w-32"
              >
                <div className="flex items-center gap-1">
                  Code
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('title')}
                className="py-3 px-3 font-semibold cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1">
                  Titre & Périmètre
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-2.5 font-semibold w-24">Priorité</th>
              <th 
                onClick={() => handleSort('status')}
                className="py-3 px-2.5 font-semibold cursor-pointer hover:text-slate-900 transition-colors w-28"
              >
                <div className="flex items-center gap-1">
                  Statut
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-2.5 font-semibold text-center w-28">Avancement</th>
              <th className="py-3 px-3 font-semibold w-36">Responsable</th>
              <th 
                onClick={() => handleSort('due_date')}
                className="py-3 px-3 font-semibold cursor-pointer hover:text-slate-900 transition-colors w-28"
              >
                <div className="flex items-center gap-1">
                  Échéance
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 font-semibold text-right w-24">Actions</th>
            </tr>
          </thead>

          <tbody>
            {sortedActivities.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                  Aucune activité ne correspond aux filtres appliqués.
                </td>
              </tr>
            ) : (
              groupedByService.map(([service, items]) => {
                const lateCount = items.filter(a => a.status === 'en_retard' || (a.status !== 'termine' && new Date(a.due_date).getTime() < Date.now())).length;
                return (
                  <React.Fragment key={service}>
                    <tr className="table-group-row">
                      <td colSpan={8} className="py-2 px-3">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-4 rounded-full bg-blue-400" />
                            {service}
                          </span>
                          <span className="flex items-center gap-2 text-[10px] font-semibold">
                            <span className="px-2 py-0.5 rounded-full bg-white/15">{items.length} activité(s)</span>
                            {lateCount > 0 && (
                              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white">{lateCount} en retard</span>
                            )}
                          </span>
                        </div>
                      </td>
                    </tr>
                    {items.map((act) => {
                      const isOverdue = act.status === 'en_retard' || (act.status !== 'termine' && new Date(act.due_date).getTime() < Date.now());
                      return (
                        <tr
                          key={act.id}
                          className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                          onClick={() => onSelect(act)}
                        >
                          {/* Code */}
                          <td className="py-3 px-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                            {act.code}
                          </td>

                          {/* Titre */}
                          <td className="py-3 px-3">
                            <p className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors leading-tight">
                              {act.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                              <span className="font-medium text-slate-600">{act.activity_type}</span>
                              {act.associated_folder && (
                                <span className="flex items-center gap-1 text-slate-400 truncate">
                                  • <Folder className="w-3 h-3 shrink-0" /> {act.associated_folder}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Priorité */}
                          <td className="py-3 px-2.5 whitespace-nowrap">
                            <Badge priority={act.priority} />
                          </td>

                          {/* Statut */}
                          <td className="py-3 px-2.5 whitespace-nowrap">
                            <Badge status={isOverdue ? 'en_retard' : act.status} />
                          </td>

                          {/* Avancement */}
                          <td className="py-3 px-2.5 text-center whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <div className="w-14 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-1.5 rounded-full ${
                                    act.status === 'termine' ? 'bg-emerald-500' : isOverdue ? 'bg-rose-500' : 'bg-blue-600'
                                  }`}
                                  style={{ width: `${act.progress_percentage}%` }}
                                />
                              </div>
                              <span className="text-[10.5px] font-bold text-slate-700 w-6 text-right">
                                {act.progress_percentage}%
                              </span>
                            </div>
                          </td>

                          {/* Responsable */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[9px] shrink-0">
                                {act.manager_name.charAt(0)}
                              </div>
                              <span className="font-medium text-slate-800 truncate text-[11px]">{act.manager_name}</span>
                            </div>
                          </td>

                          {/* Échéance */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className={`flex items-center gap-1 font-medium text-[11px] ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                              <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{act.due_date}</span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => onSelect(act)}
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                                title="Consulter la fiche"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onEdit(act)}
                                className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-md transition-colors"
                                title="Modifier"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
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
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
