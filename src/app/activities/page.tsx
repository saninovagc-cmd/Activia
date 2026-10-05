'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { ActivityTable } from '@/components/activities/ActivityTable';
import { ActivityKanban } from '@/components/activities/ActivityKanban';
import { ActivityCalendar } from '@/components/activities/ActivityCalendar';
import { ActivityModal } from '@/components/activities/ActivityModal';
import { ActivityDetailModal } from '@/components/activities/ActivityDetailModal';
import { useApp } from '@/context/AppContext';
import { Activity, ActivityStatus, ActivityType, PriorityLevel } from '@/types';
import { 
  Table as TableIcon, 
  Kanban as KanbanIcon, 
  Calendar as CalendarIcon, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  X
} from 'lucide-react';

function ActivitiesContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const { activities, allUsers } = useApp();

  const [viewMode, setViewMode] = useState<'table' | 'kanban' | 'calendar'>('table');
  const [search, setSearch] = useState(initialSearch);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedManager, setSelectedManager] = useState<string>('all');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState<Activity | null>(null);
  const [selectedActivityDetail, setSelectedActivityDetail] = useState<Activity | null>(null);

  // Departments list
  const departments = useMemo(() => {
    return Array.from(new Set(activities.map(a => a.department)));
  }, [activities]);

  // Types list
  const types: ActivityType[] = [
    'Réglementaire',
    'Inspection',
    'Vigilance & Alerte',
    'Échantillonnage',
    'Évaluation Dossier',
    'Formation',
    'Réunion Technique',
    'Autre'
  ];

  // Filtering
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      if (selectedStatus !== 'all' && act.status !== selectedStatus) return false;
      if (selectedPriority !== 'all' && act.priority !== selectedPriority) return false;
      if (selectedType !== 'all' && act.activity_type !== selectedType) return false;
      if (selectedDept !== 'all' && act.department !== selectedDept) return false;
      if (selectedManager !== 'all' && act.manager_id !== selectedManager) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchCode = act.code.toLowerCase().includes(q);
        const matchTitle = act.title.toLowerCase().includes(q);
        const matchDesc = (act.description || '').toLowerCase().includes(q);
        const matchManager = act.manager_name.toLowerCase().includes(q);
        const matchFolder = (act.associated_folder || '').toLowerCase().includes(q);
        if (!matchCode && !matchTitle && !matchDesc && !matchManager && !matchFolder) {
          return false;
        }
      }

      return true;
    });
  }, [activities, selectedStatus, selectedPriority, selectedType, selectedDept, selectedManager, search]);

  const resetFilters = () => {
    setSearch('');
    setSelectedStatus('all');
    setSelectedPriority('all');
    setSelectedType('all');
    setSelectedDept('all');
    setSelectedManager('all');
  };

  const hasActiveFilters = search || selectedStatus !== 'all' || selectedPriority !== 'all' || selectedType !== 'all' || selectedDept !== 'all' || selectedManager !== 'all';

  const exportCSV = () => {
    const headers = ['Code', 'Titre', 'Type', 'Priorité', 'Statut', 'Avancement (%)', 'Responsable', 'Département', 'Échéance'];
    const rows = filteredActivities.map(a => [
      a.code,
      `"${a.title.replace(/"/g, '""')}"`,
      a.activity_type,
      a.priority,
      a.status,
      a.progress_percentage,
      `"${a.manager_name}"`,
      `"${a.department}"`,
      a.due_date
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `activites_activia_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout>
      <div className="space-y-5">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Module Activités du Service
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Pilotage des missions réglementaires, inspections, échantillonnages et vigilances
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher: Table, Kanban, Calendar */}
            <div className="bg-slate-200/80 p-1 rounded-xl flex items-center gap-1 text-xs">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Vue Tableau"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Vue Kanban"
              >
                <KanbanIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'calendar' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Vue Calendrier"
              >
                <CalendarIcon className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={exportCSV}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
              title="Exporter les activités au format CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exporter</span>
            </button>

            <button
              onClick={() => {
                setActivityToEdit(null);
                setIsCreateModalOpen(true);
              }}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle Activité</span>
            </button>
          </div>
        </div>

        {/* Filter Bar (Section 9) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
            {/* Search input */}
            <div className="lg:col-span-2 relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par mot-clé, code, titre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            {/* Filter Statut */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
              >
                <option value="all">Tous les statuts</option>
                <option value="a_faire">À faire</option>
                <option value="en_cours">En cours</option>
                <option value="en_attente">En attente</option>
                <option value="termine">Terminé</option>
                <option value="en_retard">En retard</option>
              </select>
            </div>

            {/* Filter Priorité */}
            <div>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
              >
                <option value="all">Toutes priorités</option>
                <option value="urgente">Urgente</option>
                <option value="haute">Haute</option>
                <option value="moyenne">Moyenne</option>
                <option value="basse">Basse</option>
              </select>
            </div>

            {/* Filter Type */}
            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
              >
                <option value="all">Tous types</option>
                {types.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Filter Département */}
            <div>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
              >
                <option value="all">Tous départements</option>
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active filters indicators */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
              <span className="font-medium">
                {filteredActivities.length} activité(s) trouvée(s) sur {activities.length} au total
              </span>
              <button
                onClick={resetFilters}
                className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>

        {/* View Mode Switching */}
        {viewMode === 'table' && (
          <ActivityTable
            activities={filteredActivities}
            onSelect={(act) => setSelectedActivityDetail(act)}
            onEdit={(act) => {
              setActivityToEdit(act);
              setIsCreateModalOpen(true);
            }}
          />
        )}

        {viewMode === 'kanban' && (
          <ActivityKanban
            activities={filteredActivities}
            onSelect={(act) => setSelectedActivityDetail(act)}
          />
        )}

        {viewMode === 'calendar' && (
          <ActivityCalendar
            activities={filteredActivities}
            onSelect={(act) => setSelectedActivityDetail(act)}
          />
        )}

        {/* Modal Création / Édition */}
        <ActivityModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          activityToEdit={activityToEdit}
        />

        {/* Modal Fiche Détaillée 5 Onglets */}
        <ActivityDetailModal
          activity={selectedActivityDetail}
          onClose={() => setSelectedActivityDetail(null)}
          onEdit={(act) => {
            setSelectedActivityDetail(null);
            setActivityToEdit(act);
            setIsCreateModalOpen(true);
          }}
        />
      </div>
    </AppLayout>
  );
}

export default function ActivitiesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-500">Chargement des activités...</div>}>
      <ActivitiesContent />
    </Suspense>
  );
}

