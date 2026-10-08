'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/context/AppContext';
import { TrainingItem } from '@/types';
import { TrainingDashboard } from '@/components/trainings/TrainingDashboard';
import { TrainingTable } from '@/components/trainings/TrainingTable';
import { TrainingModal } from '@/components/trainings/TrainingModal';
import { TrainingDetailModal } from '@/components/trainings/TrainingDetailModal';
import { GraduationCap, Plus, Award } from 'lucide-react';

export default function TrainingsPage() {
  const { trainings, addTraining, currentUser } = useApp();
  const [selectedTraining, setSelectedTraining] = useState<TrainingItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const canManage = currentUser.role === 'admin' || currentUser.role === 'chef_service' || currentUser.role === 'agent';

  const handleCreate = (data: Partial<TrainingItem>) => {
    addTraining(data);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Registre des Formations & Certification des Points Focaux
            </h1>
            <span className="text-[10px] font-bold uppercase bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full border border-purple-200">
              Phase 3 • Métiers
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestion des sessions de formation, habilitation des points focaux régionaux et délivrance des attestations officielles
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Inscrire un Participant</span>
          </button>
        )}
      </div>

      {/* Analytics Dashboard Header */}
      <TrainingDashboard trainings={trainings} />

      {/* Main Table */}
      <TrainingTable
        trainings={trainings}
        onSelect={(item) => setSelectedTraining(item)}
        onNew={() => setIsModalOpen(true)}
        canManage={canManage}
      />

      {/* Modals */}
      <TrainingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreate}
      />

      <TrainingDetailModal
        training={selectedTraining}
        onClose={() => setSelectedTraining(null)}
      />
      </div>
    </AppLayout>
  );
}
