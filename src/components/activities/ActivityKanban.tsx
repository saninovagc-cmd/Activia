'use client';

import React from 'react';
import { Activity, ActivityStatus } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { useApp } from '@/context/AppContext';
import { Calendar, User, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

interface ActivityKanbanProps {
  activities: Activity[];
  onSelect: (activity: Activity) => void;
}

export const ActivityKanban: React.FC<ActivityKanbanProps> = ({
  activities,
  onSelect,
}) => {
  const { updateActivityStatus } = useApp();

  const columns: { status: ActivityStatus; label: string; dot: string }[] = [
    { status: 'a_faire', label: 'À faire', dot: 'bg-slate-400' },
    { status: 'en_cours', label: 'En cours', dot: 'bg-blue-500' },
    { status: 'en_attente', label: 'En attente', dot: 'bg-amber-500' },
    { status: 'en_retard', label: 'En retard', dot: 'bg-rose-500' },
    { status: 'termine', label: 'Terminé / Conforme', dot: 'bg-emerald-500' },
  ];

  const statusOrder: ActivityStatus[] = ['a_faire', 'en_cours', 'en_attente', 'en_retard', 'termine'];

  const moveActivity = (act: Activity, direction: 'prev' | 'next') => {
    const currentIndex = statusOrder.indexOf(act.status);
    if (direction === 'prev' && currentIndex > 0) {
      updateActivityStatus(act.id, statusOrder[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < statusOrder.length - 1) {
      updateActivityStatus(act.id, statusOrder[currentIndex + 1]);
    }
  };

  return (
    <div className="overflow-x-auto w-full max-w-full pb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 min-w-0">
        {columns.map((col) => {
          const colActivities = activities.filter((a) => a.status === col.status);
          return (
            <div
              key={col.status}
              className="bg-slate-100/70 rounded-xl p-3 border border-slate-200 flex flex-col min-w-0"
            >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                <h4 className="text-xs font-bold text-slate-800">{col.label}</h4>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-white text-[11px] font-bold text-slate-600 border border-slate-200 shadow-2xs">
                {colActivities.length}
              </span>
            </div>

            {/* Column Cards */}
            <div className="mt-3 space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
              {colActivities.length === 0 ? (
                <div className="h-28 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-xs text-slate-400">
                  Aucune activité
                </div>
              ) : (
                colActivities.map((act) => (
                  <div
                    key={act.id}
                    onClick={() => onSelect(act)}
                    className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                          {act.code}
                        </span>
                        <Badge priority={act.priority} />
                      </div>

                      <h5 className="font-semibold text-xs text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {act.title}
                      </h5>

                      <p className="text-[11px] text-slate-500 mt-1 truncate">
                        {act.department}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100">
                      {/* Progress bar */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                        <span>Avancement</span>
                        <span className="font-bold text-slate-800">{act.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            act.status === 'termine' ? 'bg-emerald-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${act.progress_percentage}%` }}
                        />
                      </div>

                      {/* Footer: Manager & Due Date */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[90px] font-medium text-slate-700">
                            {act.manager_name.split(' ')[0]}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{act.due_date.substring(5)}</span>
                        </div>
                      </div>

                      {/* Move left / right quick actions */}
                      <div 
                        className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50 text-slate-400" 
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => moveActivity(act, 'prev')}
                          disabled={act.status === statusOrder[0]}
                          className="p-1 hover:text-slate-800 disabled:opacity-30 rounded hover:bg-slate-100 transition-colors"
                          title="Statut précédent"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[10px] text-slate-400 font-medium">Déplacer</span>
                        <button
                          onClick={() => moveActivity(act, 'next')}
                          disabled={act.status === statusOrder[statusOrder.length - 1]}
                          className="p-1 hover:text-slate-800 disabled:opacity-30 rounded hover:bg-slate-100 transition-colors"
                          title="Statut suivant"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
};
