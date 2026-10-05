'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/ui/Badge';
import { 
  AlertCircle, 
  Calendar, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  User,
  ExternalLink 
} from 'lucide-react';

export const ActionList: React.FC = () => {
  const router = useRouter();
  const { activities, tasks, currentUser, updateTaskStatus, showToast } = useApp();

  // "À traiter aujourd'hui": pending tasks for the current user OR high-priority items
  const urgentTasks = tasks
    .filter(t => t.status !== 'termine')
    .sort((a, b) => (a.priority === 'urgente' ? -1 : 1))
    .slice(0, 5);

  // "Échéances prochaines": activities coming due soon or delayed
  const upcomingActivities = [...activities]
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* 1. Zone À traiter aujourd'hui */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-amber-100 text-amber-800">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">À traiter aujourd’hui</h4>
              <p className="text-xs text-slate-500">Actions prioritaires et tâches en attente</p>
            </div>
          </div>
          <Link
            href="/tasks"
            className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            Voir tout ({tasks.filter(t => t.status !== 'termine').length})
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100 flex-1">
          {urgentTasks.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              Aucune action urgente en attente aujourd’hui.
            </div>
          ) : (
            urgentTasks.map((task) => (
              <div
                key={task.id}
                className="p-3.5 hover:bg-slate-50/80 transition-colors flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  <button
                    onClick={() => {
                      updateTaskStatus(task.id, 'termine');
                      showToast('success', `Tâche "${task.title}" validée et clôturée avec succès.`);
                    }}
                    className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                    title="Marquer comme terminée"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <div>
                    <p className="font-semibold text-slate-900 leading-tight">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {task.assignee_name}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-600">
                        <Calendar className="w-3 h-3" />
                        Échéance : {task.due_date}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge priority={task.priority} />
                  {task.status === 'en_retard' && (
                    <Badge status="en_retard">Retard</Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. Zone Échéances prochaines */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-rose-100 text-rose-800">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Échéances prochaines</h4>
              <p className="text-xs text-slate-500">Dossiers et activités à terme imminent</p>
            </div>
          </div>
          <Link
            href="/activities"
            className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            Consulter les activités
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100 flex-1">
          {upcomingActivities.map((act) => {
            const isDelayed = act.status === 'en_retard' || new Date(act.due_date).getTime() < Date.now();
            return (
              <div
                key={act.id}
                onClick={() => router.push('/activities')}
                className="p-3.5 hover:bg-slate-50/80 transition-colors flex items-start justify-between gap-3 text-xs cursor-pointer group"
                title="Consulter les détails de cette activité"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 group-hover:bg-blue-100 px-1.5 py-0.5 rounded transition-colors">
                      {act.code}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-[11px] text-slate-500">{act.department}</span>
                  </div>
                  <p className="font-semibold text-slate-900 mt-1 line-clamp-1 group-hover:text-blue-600 transition-colors">{act.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Resp. : <span className="font-medium text-slate-700">{act.manager_name}</span>
                  </p>
                </div>

                <div className="text-right flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 font-medium text-slate-700">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{act.due_date}</span>
                  </div>
                  <Badge status={isDelayed ? 'en_retard' : act.status} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
