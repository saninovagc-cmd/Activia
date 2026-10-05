'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ActivityCalendar } from '@/components/activities/ActivityCalendar';
import { ActivityDetailModal } from '@/components/activities/ActivityDetailModal';
import { ActivityModal } from '@/components/activities/ActivityModal';
import { useApp } from '@/context/AppContext';
import { Activity } from '@/types';
import { Calendar as CalendarIcon } from 'lucide-react';

export default function CalendarPage() {
  const { activities } = useApp();
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [activityToEdit, setActivityToEdit] = useState<Activity | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <AppLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            Planning & Calendrier des Échéances
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Vue chronologique des commissions, inspections, échéances réglementaires et jalons
          </p>
        </div>

        <ActivityCalendar
          activities={activities}
          onSelect={(act) => setSelectedActivity(act)}
        />

        <ActivityDetailModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
          onEdit={(act) => {
            setSelectedActivity(null);
            setActivityToEdit(act);
            setIsEditModalOpen(true);
          }}
        />

        <ActivityModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          activityToEdit={activityToEdit}
        />
      </div>
    </AppLayout>
  );
}
