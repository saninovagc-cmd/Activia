'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { DashboardCharts } from '@/components/dashboard/Charts';
import { ActionList } from '@/components/dashboard/ActionList';
import { ChefServiceView } from '@/components/dashboard/ChefServiceView';
import { useApp } from '@/context/AppContext';
import { 
  Folder, 
  FolderCheck, 
  FolderClock, 
  AlertTriangle, 
  Mail, 
  Send, 
  Activity as ActivityIcon, 
  Clock, 
  HelpCircle, 
  FileWarning, 
  Flame,
  LayoutDashboard,
  ShieldCheck,
  Download
} from 'lucide-react';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialView = searchParams.get('view') === 'service' ? 'service' : 'general';
  const [viewMode, setViewMode] = useState<'general' | 'service'>(initialView);

  const { stats, currentUser } = useApp();

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Title & View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Tableau de Bord Institutionnel
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Pilotage centralisé des activités, dossiers et courriers du service
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-200/80 p-1 rounded-xl flex items-center gap-1 text-xs">
              <button
                onClick={() => setViewMode('general')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  viewMode === 'general'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Vue Générale
              </button>
              <button
                onClick={() => setViewMode('service')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  viewMode === 'service'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Vue Chef de Service
              </button>
            </div>

            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
              title="Exporter ou imprimer le tableau de bord"
            >
              <Download className="w-3.5 h-3.5" />
              Exporter
            </button>
          </div>
        </div>

        {/* View Mode Router */}
        {viewMode === 'service' ? (
          <ChefServiceView />
        ) : (
          <>
            {/* 11 KPI Cards (Section 8) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
              <StatCard
                title="Total Dossiers"
                value={stats.totalFolders}
                subtitle="Dossiers enregistrés"
                icon={Folder}
                colorScheme="slate"
                onClick={() => router.push('/folders')}
              />
              <StatCard
                title="Dossiers en cours"
                value={stats.foldersInProgress}
                subtitle="En instruction"
                icon={FolderClock}
                colorScheme="blue"
                onClick={() => router.push('/folders')}
              />
              <StatCard
                title="Dossiers traités"
                value={stats.foldersTreated}
                subtitle="Clôturés conformes"
                icon={FolderCheck}
                colorScheme="emerald"
                onClick={() => router.push('/folders')}
              />
              <StatCard
                title="Dossiers en retard"
                value={stats.foldersDelayed}
                subtitle="Hors délai SLA"
                icon={AlertTriangle}
                colorScheme="rose"
                onClick={() => router.push('/folders')}
              />
              <StatCard
                title="Courriers entrants"
                value={stats.incomingMail}
                subtitle="Reçus et indexés"
                icon={Mail}
                colorScheme="indigo"
                onClick={() => router.push('/mail')}
              />
              <StatCard
                title="Courriers sortants"
                value={stats.outgoingMail}
                subtitle="Validés et envoyés"
                icon={Send}
                colorScheme="blue"
                onClick={() => router.push('/mail')}
              />
              <StatCard
                title="Activités en cours"
                value={stats.activitiesInProgress}
                subtitle="Missions actives"
                icon={ActivityIcon}
                colorScheme="blue"
                onClick={() => router.push('/activities')}
              />
              <StatCard
                title="Activités en retard"
                value={stats.activitiesDelayed}
                subtitle="Échéance dépassée"
                icon={Clock}
                colorScheme="rose"
                onClick={() => router.push('/activities')}
              />
              <StatCard
                title="Demandes en attente"
                value={stats.pendingRequests}
                subtitle="Attente validation"
                icon={HelpCircle}
                colorScheme="amber"
                onClick={() => router.push('/folders')}
              />
              <StatCard
                title="Signalements ouverts"
                value={stats.openReports}
                subtitle="Vigilances sanitaires"
                icon={FileWarning}
                colorScheme="amber"
                onClick={() => router.push('/signals')}
              />
              <StatCard
                title="Alertes actives"
                value={stats.activeAlerts}
                subtitle="Priorité absolue"
                icon={Flame}
                colorScheme="rose"
                onClick={() => router.push('/signals')}
              />
            </div>

            {/* 5 Graphiques Recharts (Section 8) */}
            <DashboardCharts />

            {/* À traiter aujourd'hui & Échéances prochaines (Section 8) */}
            <ActionList />
          </>
        )}
      </div>
    </AppLayout>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-500">Chargement du tableau de bord...</div>}>
      <DashboardContent />
    </Suspense>
  );
}

