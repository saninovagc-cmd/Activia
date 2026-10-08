'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { TaskList } from '@/components/tasks/TaskList';
import { CheckSquare } from 'lucide-react';
import { ExportButton } from '@/components/common/ExportButton';
import { ExportConfig } from '@/lib/exportUtils';
import { useApp } from '@/context/AppContext';

export default function TasksPage() {
  const { activities, allUsers } = useApp();

  const getTasksExportConfig = (): ExportConfig => {
    const taskRows: (string | number)[][] = [];
    activities.forEach(act => {
      if (act.tasks && act.tasks.length > 0) {
        act.tasks.forEach(t => {
          taskRows.push([
            act.code,
            act.title,
            t.title,
            t.assignee_name || act.manager_name,
            t.priority,
            t.status,
            t.due_date || act.due_date
          ]);
        });
      } else {
        taskRows.push([
          act.code,
          act.title,
          'Activité complète (sans sous-tâche)',
          act.manager_name,
          act.priority,
          act.status,
          act.due_date
        ]);
      }
    });

    return {
      title: 'Suivi des Tâches Opérationnelles & Jalons de Service',
      subtitle: 'Direction de la Pharmacie et du Médicament — Planification opérationnelle ACTIVIA',
      filename: `taches_activia_${new Date().toISOString().split('T')[0]}`,
      headers: ['Code Activité', 'Activité Parente', 'Intitulé Tâche / Jalon', 'Assigné à', 'Priorité', 'Statut', 'Date Échéance'],
      rows: taskRows,
      summaryKpis: [
        { label: 'Total Tâches', value: taskRows.length },
        { label: 'Activités Source', value: activities.length },
        { label: 'Agents Mobilisés', value: allUsers.length }
      ]
    };
  };

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <CheckSquare className="w-6 h-6 text-blue-600" />
              Tâches Opérationnelles & Délais
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Suivi individuel et collectif des tâches, jalons et délais d’exécution du service
            </p>
          </div>

          <div className="flex items-center gap-2">
            <ExportButton getConfig={getTasksExportConfig} />
          </div>
        </div>

        <TaskList />
      </div>
    </AppLayout>
  );
}
