'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
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
import { ExportButton } from '@/components/common/ExportButton';
import { ExportConfig } from '@/lib/exportUtils';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get('view');
  const [viewMode, setViewMode] = useState<'general' | 'service'>(
    viewParam === 'service' ? 'service' : 'general'
  );

  React.useEffect(() => {
    setViewMode(viewParam === 'service' ? 'service' : 'general');
  }, [viewParam]);

  const switchView = (mode: 'general' | 'service') => {
    setViewMode(mode);
    if (mode === 'service') {
      router.push('/dashboard?view=service');
    } else {
      router.push('/dashboard');
    }
  };

  const { stats, currentUser } = useApp();

  const getDashboardExportConfig = (): ExportConfig => ({
    title: 'Tableau de Bord Général — Synthèse de Pilotage',
    subtitle: 'Direction de la Pharmacie et du Médicament — Indicateurs Clés de Performance ACTIVIA',
    filename: `tableau_de_bord_activia_${new Date().toISOString().split('T')[0]}`,
    headers: ['Domaine', 'Indicateur Clé', 'Valeur Actuelle', 'Statut / Tendance', 'Détails'],
    rows: [
      ['Dossiers', 'Total Dossiers Enregistrés', stats.totalFolders, 'Actif', 'Volume global des dossiers gérés'],
      ['Dossiers', 'Dossiers en cours de traitement', stats.foldersInProgress, 'En cours', 'Dossiers en instruction active'],
      ['Dossiers', 'Dossiers traités et validés', stats.foldersTreated, 'Succès', 'Dossiers clôturés avec décision'],
      ['Dossiers', 'Dossiers en retard (SLA)', stats.foldersDelayed, stats.foldersDelayed > 0 ? 'Alerte' : 'Normal', 'Dossiers dépassant l’échéance'],
      ['Dossiers', 'Demandes en attente', stats.pendingRequests, stats.pendingRequests > 0 ? 'En attente' : 'Normal', 'Demandes nécessitant validation'],
      ['Courriers', 'Courriers Arrivée (Reçus)', stats.incomingMail, 'Actif', 'Courriers entrants enregistrés'],
      ['Courriers', 'Courriers Départ (Envoyés)', stats.outgoingMail, 'Actif', 'Courriers et ampliations sortantes'],
      ['Activités', 'Activités du Service en cours', stats.activitiesInProgress, 'En cours', 'Missions réglementaires et techniques'],
      ['Activités', 'Activités en retard', stats.activitiesDelayed, stats.activitiesDelayed > 0 ? 'Retard' : 'À jour', 'Missions nécessitant relance'],
      ['Vigilances', 'Signalements Sanitaires Ouverts', stats.openReports, 'Surveillance', 'Notifications reçues'],
      ['Vigilances', 'Alertes Actives prioritaires', stats.activeAlerts, stats.activeAlerts > 0 ? 'Alerte' : 'Calme', 'Mesures d’urgence']
    ],
    summaryKpis: [
      { label: 'Total Dossiers', value: stats.totalFolders },
      { label: 'Dossiers en Retard', value: stats.foldersDelayed },
      { label: 'Courriers Entrants', value: stats.incomingMail },
      { label: 'Alertes Sanitaires', value: stats.activeAlerts }
    ]
  });

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
                onClick={() => switchView('general')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  viewMode === 'general'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Vue Générale
              </button>
              <Link
                href="/dashboard/service"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Vue Chef de Service
              </Link>
            </div>

            <ExportButton getConfig={getDashboardExportConfig} />
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

