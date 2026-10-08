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

      {/* Tasks Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-4 rounded-full bg-blue-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Registre des Tâches Opérationnelles</h3>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">{filteredTasks.length} tâche(s)</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              {allTasks.filter(t => t.status === 'en_cours').length} en cours
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              {allTasks.filter(t => t.status === 'en_retard' || (t.status !== 'termine' && new Date(t.due_date).getTime() < Date.now())).length} en retard
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {allTasks.filter(t => t.status === 'termine').length} terminées
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead>
              <tr>
                <th className="py-3 px-3 text-center w-12">Fait</th>
                <th className="py-3 px-4">Tâche</th>
                <th className="py-3 px-4">Activité rattachée</th>
                <th className="py-3 px-4">Responsable</th>
                <th className="py-3 px-4">Priorité</th>
                <th className="py-3 px-4">Échéance</th>
                <th className="py-3 px-4 text-center">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    Aucune tâche ne correspond à ces critères.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const isOverdue = task.status === 'en_retard' || (task.status !== 'termine' && new Date(task.due_date).getTime() < Date.now());
                  return (
                    <tr key={task.id}>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => {
                            const newStatus = task.status === 'termine' ? 'en_cours' : 'termine';
                            updateTaskStatus(task.id, newStatus);
                            showToast(
                              newStatus === 'termine' ? 'success' : 'info',
                              newStatus === 'termine' ? `Tâche "${task.title}" marquée comme terminée.` : `Tâche "${task.title}" remise en cours.`
                            );
                          }}
                          className={`w-5 h-5 rounded inline-flex items-center justify-center border transition-all cursor-pointer text-xs font-bold ${
                            task.status === 'termine'
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 hover:border-emerald-500 bg-white'
                          }`}
                          title={task.status === 'termine' ? 'Marquer en cours' : 'Marquer comme terminée'}
                        >
                          {task.status === 'termine' ? '✓' : ''}
                        </button>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <p className={`font-semibold ${task.status === 'termine' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {task.title}
                        </p>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <Link
                          href={`/activities`}
                          className="font-mono font-bold text-blue-700 hover:underline"
                        >
                          {task.activity_code}
                        </Link>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{task.activity_title}</p>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-800">
                        {task.assignee_name || '—'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <Badge priority={task.priority} />
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`font-medium ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                          {task.due_date}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          task.status === 'termine'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : isOverdue
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}>
                          {task.status === 'termine' ? 'Terminé' : isOverdue ? 'En retard' : 'En cours'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

