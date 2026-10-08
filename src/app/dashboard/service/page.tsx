'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { ChefServiceView } from '@/components/dashboard/ChefServiceView';
import { 
  LayoutDashboard,
  ShieldCheck,
  Download
} from 'lucide-react';

import { ExportButton } from '@/components/common/ExportButton';
import { ExportConfig } from '@/lib/exportUtils';
import { useApp } from '@/context/AppContext';

export default function ChefServiceDashboardPage() {
  const router = useRouter();
  const { activities, folders, incomingMails, outgoingMails, signals, allUsers } = useApp();

  const getChefServiceExportConfig = (): ExportConfig => {
    const rows: (string | number)[][] = [
      ['Activités', 'Activités totales du service', activities.length, 'Opérationnel', 'Toutes typologies'],
      ['Activités', 'Activités terminées', activities.filter(a => a.status === 'termine').length, 'Clôturé', 'Missions exécutées'],
      ['Activités', 'Activités en cours', activities.filter(a => a.status === 'en_cours').length, 'En cours', 'Missions actives'],
      ['Activités', 'Activités en retard', activities.filter(a => a.status === 'en_retard' || (a.status !== 'termine' && new Date(a.due_date).getTime() < Date.now())).length, 'Retard', 'Nécessite arbitrage'],
      ['Dossiers', 'Dossiers reçus', folders.length, 'Enregistré', 'Dossiers réglementaires'],
      ['Dossiers', 'Dossiers validés / clôturés', folders.filter(f => f.status === 'cloture' || f.status === 'decision').length, 'Validé', 'Décision prise'],
      ['Dossiers', 'Dossiers en attente', folders.filter(f => ['depot', 'reception', 'complet', 'verification'].includes(f.status)).length, 'En attente', 'En cours d\'instruction'],
      ['Dossiers', 'Dossiers en retard', folders.filter(f => new Date(f.due_date).getTime() < Date.now() && f.status !== 'cloture' && f.status !== 'rejete').length, 'Alerte', 'Délai dépassé'],
      ['Courriers', 'Courriers arrivées reçus', incomingMails.length, 'Enregistré', 'Registre entrée'],
      ['Courriers', 'Courriers départs émis', outgoingMails.length, 'Émis', 'Registre sortie'],
      ['Courriers', 'Courriers arrivées non clôturés', incomingMails.filter(m => m.status !== 'cloture' && m.status !== 'reponse').length, 'À traiter', 'En attente réponse'],
      ['Vigilances', 'Signalements & Alertes', signals.length, 'Surveillance', 'Événements sanitaires'],
    ];

    allUsers.forEach(u => {
      const userActs = activities.filter(a => a.manager_id === u.id);
      const userFolders = folders.filter(f => f.manager_id === u.id);
      rows.push([
        'Agent / Charge',
        `${u.first_name} ${u.last_name} (${u.role})`,
        `${userActs.length} act. / ${userFolders.length} doss.`,
        u.department || 'Non assigné',
        `Email: ${u.email}`
      ]);
    });

    return {
      title: 'Tableau de Bord Chef de Service — Supervision Opérationnelle',
      subtitle: 'Direction de la Pharmacie et du Médicament — Suivi des charges, délais et performances',
      filename: `supervision_chef_service_${new Date().toISOString().split('T')[0]}`,
      headers: ['Catégorie / Périmètre', 'Élément / Indicateur', 'Quantité / Charge', 'Statut / Affectation', 'Observations'],
      rows,
      summaryKpis: [
        { label: 'Activités Totales', value: activities.length },
        { label: 'Dossiers Déposés', value: folders.length },
        { label: 'Courriers Reçus', value: incomingMails.length },
        { label: 'Agents Référencés', value: allUsers.length }
      ]
    };
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Title & View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Tableau de Bord Chef de Service
              </h1>
              <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                Supervision
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Pilotage par département, charge des agents, indicateurs de performance et délais
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-200/80 p-1 rounded-xl flex items-center gap-1 text-xs">
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all text-slate-600 hover:text-slate-900"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Vue Générale
              </Link>
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all bg-emerald-700 text-white shadow-xs cursor-default"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Vue Chef de Service
              </button>
            </div>

            <ExportButton getConfig={getChefServiceExportConfig} />
          </div>
        </div>

        {/* Supervision Chef de Service */}
        <ChefServiceView />
      </div>
    </AppLayout>
  );
}
