'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { TaskList } from '@/components/tasks/TaskList';
import { CheckSquare } from 'lucide-react';

export default function TasksPage() {
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
        </div>

        <TaskList />
      </div>
    </AppLayout>
  );
}
