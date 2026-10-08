'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Activity, Task } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { ActivityExecutionModal } from '@/components/tasks/ActivityExecutionModal';
import { 
  Search, 
  Calendar, 
  Eye, 
  Edit3, 
  UserCheck, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  FolderOpen
} from 'lucide-react';

export const TaskList: React.FC = () => {
  const { activities, allUsers, currentUser, updateTaskStatus, showToast } = useApp();

  // Role detection: Chef de service and Admin see ALL tasks/activities of the service
  const isSupervision = currentUser.role === 'chef_service' || currentUser.role === 'admin';

  const [activeTab, setActiveTab] = useState<'activities' | 'tasks'>('activities');
  const [selectedCollaboratorId, setSelectedCollaboratorId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected activity for execution & deliverables modal
  const [executingActivity, setExecutingActivity] = useState<Activity | null>(null);

  // Flatten all sub-tasks with parent activity info
  const allTasks: (Task & { activity_code: string; activity_title: string; activity_id: string; department: string })[] = [];
  activities.forEach(act => {
    act.tasks?.forEach(t => {
      allTasks.push({
        ...t,
        activity_code: act.code,
        activity_title: act.title,
        activity_id: act.id,
        department: act.department
      });
    });
  });

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    return activities.filter(act => {
      // If agent: only see activities assigned to them
      if (!isSupervision) {
        const isAssigned = act.manager_id === currentUser.id || act.collaborators?.some(c => c.id === currentUser.id);
        if (!isAssigned) return false;
      } else if (selectedCollaboratorId !== 'all') {
        const isAssigned = act.manager_id === selectedCollaboratorId || act.collaborators?.some(c => c.id === selectedCollaboratorId);
        if (!isAssigned) return false;
      }

      if (statusFilter !== 'all' && act.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && act.priority !== priorityFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = act.title.toLowerCase().includes(q);
        const matchCode = act.code.toLowerCase().includes(q);
        const matchManager = act.manager_name.toLowerCase().includes(q);
        if (!matchTitle && !matchCode && !matchManager) return false;
      }

      return true;
    });
  }, [activities, isSupervision, currentUser, selectedCollaboratorId, statusFilter, priorityFilter, searchQuery]);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return allTasks.filter(task => {
      // If agent: only see tasks assigned to them
      if (!isSupervision) {
        if (task.assignee_id !== currentUser.id) return false;
      } else if (selectedCollaboratorId !== 'all') {
        if (task.assignee_id !== selectedCollaboratorId) return false;
      }

      if (statusFilter !== 'all' && task.status !== statusFilter) return false;
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
  }, [allTasks, isSupervision, currentUser, selectedCollaboratorId, statusFilter, priorityFilter, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Role / Supervision Context Banner */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${
        isSupervision 
          ? 'bg-blue-50/70 border-blue-200 text-blue-950' 
          : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
            isSupervision ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
          }`}>
            {isSupervision ? 'CHEF' : 'AGENT'}
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wide">
              {isSupervision 
                ? 'Espace Supervision — Vue Globale du Service' 
                : `Espace Opérationnel — Activités & Tâches sous votre responsabilité`}
            </h2>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {isSupervision 
                ? 'Supervision de toutes les activités et tâches de l’ensemble des collaborateurs du service.'
                : 'Consultez les activités qui vous sont affectées, actualisez vos taux d’avancement et déposez vos livrables officiels.'}
            </p>
          </div>
        </div>

        {/* Supervision filter: select collaborator */}
        {isSupervision && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-bold text-slate-700">Filtrer par agent :</span>
            <select
              value={selectedCollaboratorId}
              onChange={(e) => setSelectedCollaboratorId(e.target.value)}
              className="text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800"
            >
              <option value="all">Tous les collaborateurs ({allUsers.length})</option>
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name} ({u.role_label})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tabs & Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('activities')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'activities'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Activités Affectées ({filteredActivities.length})
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'tasks'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tâches & Jalons ({filteredTasks.length})
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-xl justify-end">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par code, intitulé, responsable..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800"
          >
            <option value="all">Tous statuts</option>
            <option value="a_faire">À faire</option>
            <option value="en_cours">En cours</option>
            <option value="en_attente">En attente</option>
            <option value="termine">Terminé</option>
          </select>

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

      {/* Main Table Container */}
      {activeTab === 'activities' ? (
        /* VUE 1 : ACTIVITÉS AFFECTÉES & EXÉCUTION */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-4 rounded-full bg-blue-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Activités Programmées & Exécution des Livrables
              </h3>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
                {filteredActivities.length} activité(s)
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                {filteredActivities.filter(a => a.status === 'en_cours').length} en cours
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                {filteredActivities.filter(a => a.status === 'en_retard' || (a.status !== 'termine' && new Date(a.due_date).getTime() < Date.now())).length} en retard
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {filteredActivities.filter(a => a.status === 'termine').length} terminées
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-700">
              <thead>
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Activité Programmée</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Responsable</th>
                  <th className="py-3 px-4">Priorité</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-center">Avancement</th>
                  <th className="py-3 px-4 text-center">Livrables</th>
                  <th className="py-3 px-4">Échéance</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400 text-xs">
                      Aucune activité programmée ne correspond à vos filtres.
                    </td>
                  </tr>
                ) : (
                  filteredActivities.map((act) => {
                    const isOverdue = new Date(act.due_date).getTime() < Date.now() && act.status !== 'termine';
                    const docCount = act.documents?.length || 0;
                    return (
                      <tr 
                        key={act.id} 
                        className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                        onClick={() => setExecutingActivity(act)}
                      >
                        {/* Code */}
                        <td className="py-3 px-4 whitespace-nowrap font-mono font-bold text-blue-700">
                          {act.code}
                        </td>

                        {/* Titre */}
                        <td className="py-3 px-4 max-w-sm">
                          <p className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                            {act.title}
                          </p>
                          <span className="text-[10px] text-slate-400 font-medium">{act.activity_type}</span>
                        </td>

                        {/* Service */}
                        <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-medium">
                          {act.department}
                        </td>

                        {/* Responsable */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-semibold text-slate-900">{act.manager_name}</span>
                        </td>

                        {/* Priorité */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <Badge priority={act.priority} />
                        </td>

                        {/* Statut */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <Badge status={act.status} />
                        </td>

                        {/* Avancement */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            <div className="w-16 bg-slate-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  act.status === 'termine' ? 'bg-emerald-500' : isOverdue ? 'bg-rose-500' : 'bg-blue-600'
                                }`}
                                style={{ width: `${act.progress_percentage}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-bold text-slate-800 w-7 text-right">
                              {act.progress_percentage}%
                            </span>
                          </div>
                        </td>

                        {/* Livrables */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                            docCount > 0 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                              : 'bg-slate-50 text-slate-400 border-slate-200'
                          }`}>
                            {docCount} livrable(s)
                          </span>
                        </td>

                        {/* Échéance */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`font-medium ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                            {act.due_date}
                          </span>
                          {isOverdue && <span className="block text-[10px] text-rose-600 font-bold">Retard</span>}
                        </td>

                        {/* Action Exécuter */}
                        <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setExecutingActivity(act)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                            title="Ouvrir l'espace d'exécution, avancement et dépôt de livrables"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Exécuter
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
      ) : (
        /* VUE 2 : TÂCHES OPÉRATIONNELLES DÉTAILLÉES */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-4 rounded-full bg-blue-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Registre des Tâches Opérationnelles & Jalons
              </h3>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
                {filteredTasks.length} tâche(s)
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                {filteredTasks.filter(t => t.status === 'en_cours').length} en cours
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                {filteredTasks.filter(t => t.status === 'en_retard' || (t.status !== 'termine' && new Date(t.due_date).getTime() < Date.now())).length} en retard
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {filteredTasks.filter(t => t.status === 'termine').length} terminées
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
      )}

      {/* Modal d'exécution & dépôt des livrables */}
      <ActivityExecutionModal
        activity={executingActivity}
        isOpen={!!executingActivity}
        onClose={() => setExecutingActivity(null)}
      />
    </div>
  );
};
