'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Task, PriorityLevel } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  User, 
  Search, 
  Filter, 
  AlertTriangle,
  FolderOpen,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

export const TaskList: React.FC = () => {
  const { activities, currentUser, updateTaskStatus, showToast } = useApp();

  const [filterMode, setFilterMode] = useState<'all' | 'mine' | 'delayed' | 'ongoing' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Flatten all tasks from all activities with parent activity info
  const allTasks: (Task & { activity_code: string; activity_title: string; activity_id: string })[] = [];
  activities.forEach(act => {
    act.tasks?.forEach(t => {
      allTasks.push({
        ...t,
        activity_code: act.code,
        activity_title: act.title,
        activity_id: act.id
      });
    });
  });

  const filteredTasks = allTasks.filter(task => {
    const isMine = task.assignee_id === currentUser.id;
    const isOverdue = task.status === 'en_retard' || (task.status !== 'termine' && new Date(task.due_date).getTime() < Date.now());

    if (filterMode === 'mine' && !isMine) return false;
    if (filterMode === 'delayed' && !isOverdue) return false;
    if (filterMode === 'ongoing' && task.status !== 'en_cours') return false;
    if (filterMode === 'completed' && task.status !== 'termine') return false;

    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchActivity = task.activity_title.toLowerCase().includes(q) || task.activity_code.toLowerCase().includes(q);
      const matchAssignee = (task.assignee_name || '').toLowerCase().includes(q);
      if (!matchTitle && !matchActivity && !matchAssignee) return false;
    }

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters & Search toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterMode === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Toutes ({allTasks.length})
          </button>
          <button
            onClick={() => setFilterMode('mine')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterMode === 'mine' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Mes tâches ({allTasks.filter(t => t.assignee_id === currentUser.id).length})
          </button>
          <button
            onClick={() => setFilterMode('delayed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterMode === 'delayed' ? 'bg-rose-600 text-white shadow-xs' : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            En retard ({allTasks.filter(t => t.status === 'en_retard' || (t.status !== 'termine' && new Date(t.due_date).getTime() < Date.now())).length})
          </button>
          <button
            onClick={() => setFilterMode('ongoing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterMode === 'ongoing' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            En cours ({allTasks.filter(t => t.status === 'en_cours').length})
          </button>
          <button
            onClick={() => setFilterMode('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterMode === 'completed' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Terminées ({allTasks.filter(t => t.status === 'termine').length})
          </button>
        </div>

        {/* Search & Priority */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une tâche..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800"
          >
            <option value="all">Toutes priorités</option>
            <option value="urgente">Urgente</option>
            <option value="haute">Haute</option>
            <option value="moyenne">Moyenne</option>
            <option value="basse">Basse</option>
          </select>
        </div>
      </div>

      {/* Tasks Table / Card List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Aucune tâche ne correspond à ces critères.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isOverdue = task.status === 'en_retard' || (task.status !== 'termine' && new Date(task.due_date).getTime() < Date.now());
            return (
              <div
                key={task.id}
                className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-start gap-3 flex-1">
                  {/* Status Toggle Checkbox */}
                  <button
                    onClick={() => {
                      const newStatus = task.status === 'termine' ? 'en_cours' : 'termine';
                      updateTaskStatus(task.id, newStatus);
                      showToast(
                        newStatus === 'termine' ? 'success' : 'info',
                        newStatus === 'termine' ? `Tâche "${task.title}" marquée comme terminée.` : `Tâche "${task.title}" remise en cours.`
                      );
                    }}
                    className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border transition-all cursor-pointer ${
                      task.status === 'termine'
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 hover:border-emerald-500 bg-white'
                    }`}
                    title={task.status === 'termine' ? 'Marquer en cours' : 'Marquer comme terminée'}
                  >
                    {task.status === 'termine' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>

                  {/* Task Info */}
                  <div className="space-y-1">
                    <p className={`font-semibold text-sm ${task.status === 'termine' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {task.title}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      <Link
                        href={`/activities`}
                        className="inline-flex items-center gap-1 font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded hover:underline"
                      >
                        {task.activity_code} <ArrowUpRight className="w-3 h-3" />
                      </Link>
                      <span className="truncate max-w-xs">{task.activity_title}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-700 font-medium">
                        <User className="w-3 h-3 text-slate-400" />
                        {task.assignee_name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Badges & Due date */}
                <div className="flex items-center gap-3 sm:justify-end">
                  <Badge priority={task.priority} />

                  <div className={`flex items-center gap-1 font-medium ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'}`}>
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{task.due_date}</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                    task.status === 'termine'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : isOverdue
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : 'bg-blue-50 text-blue-800 border-blue-200'
                  }`}>
                    {task.status === 'termine' ? 'Terminé' : isOverdue ? 'En retard' : 'En cours'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
