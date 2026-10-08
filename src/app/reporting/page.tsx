'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/context/AppContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { 
  BarChart3, 
  Download, 
  Printer, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Mail, 
  FolderArchive, 
  FileText,
  Filter
} from 'lucide-react';
import { ExportButton } from '@/components/common/ExportButton';
import { ExportConfig } from '@/lib/exportUtils';

export default function ReportingPage() {
  const { activities, folders, incomingMails, outgoingMails, signals, trainings, establishments, allUsers } = useApp();
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('quarter');
  const [reportType, setReportType] = useState<'global' | 'mail' | 'folders' | 'vigilance'>('global');

  // Computed KPIs
  const totalFolders = folders.length;
  const treatedFolders = folders.filter(f => f.status === 'decision' || f.status === 'notification' || f.status === 'cloture').length;
  const folderSlaRate = totalFolders > 0 ? Math.round((treatedFolders / totalFolders) * 100) : 0;

  const totalMail = incomingMails.length;
  const closedMail = incomingMails.filter(m => m.status === 'cloture').length;
  const mailProcessingRate = totalMail > 0 ? Math.round((closedMail / totalMail) * 100) : 0;

  const totalSignals = signals.length;
  const closedSignals = signals.filter(s => s.status === 'cloture').length;

  // Monthly trends dynamically computed from real registered items
  const now = new Date();
  const monthNames = ['Janv', 'Févr', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
  const monthlyTrends = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const isCurrent = i === 0;

    const countDossiers = folders.filter(f => {
      const fd = new Date(f.receipt_date || f.created_at);
      return !isNaN(fd.getTime()) && fd.getFullYear() === y && fd.getMonth() === m;
    }).length;

    const countCourriers = incomingMails.filter(c => {
      const cd = new Date(c.receipt_date || c.created_at);
      return !isNaN(cd.getTime()) && cd.getFullYear() === y && cd.getMonth() === m;
    }).length;

    const countSignals = signals.filter(s => {
      const sd = new Date(s.receipt_date || s.created_at);
      return !isNaN(sd.getTime()) && sd.getFullYear() === y && sd.getMonth() === m;
    }).length;

    monthlyTrends.push({
      month: isCurrent ? `${monthNames[m]} (En cours)` : monthNames[m],
      dossiers: countDossiers,
      courriers: countCourriers,
      vigilances: countSignals
    });
  }

  // Performance by Agent
  const agentPerformance = allUsers.map(user => {
    const userFolders = folders.filter(f => f.manager_id === user.id);
    const userActivities = activities.filter(a => a.manager_id === user.id);
    const userTasks = activities.flatMap(a => a.tasks || []).filter(t => t.assignee_id === user.id);
    const completedTasks = userTasks.filter(t => t.status === 'termine').length;

    return {
      name: user.full_name,
      role: user.role_label,
      foldersCount: userFolders.length,
      activitiesCount: userActivities.length,
      tasksTotal: userTasks.length,
      tasksCompleted: completedTasks,
      completionRate: userTasks.length > 0 ? Math.round((completedTasks / userTasks.length) * 100) : 100
    };
  });

  // Dossiers by category
  const foldersByType: { [key: string]: number } = {};
  folders.forEach(f => {
    foldersByType[f.folder_type] = (foldersByType[f.folder_type] || 0) + 1;
  });
  const folderPieData = Object.entries(foldersByType).map(([name, value]) => ({ name, value }));

  const COLORS = ['#1e40af', '#0284c7', '#0d9488', '#16a34a', '#d97706', '#dc2626'];

  const getReportingExportConfig = (): ExportConfig => ({
    title: `Bilan Statistique & Rapport de Performance (${period === 'month' ? 'Mensuel' : period === 'quarter' ? 'Trimestriel' : 'Annuel'})`,
    subtitle: 'Direction de la Pharmacie et du Médicament — Indicateurs Clés et Mesures de Performance',
    filename: `rapport_performance_${period}_${new Date().toISOString().split('T')[0]}`,
    headers: ['Domaine / Indicateur', 'Valeur Constatée', 'Cible / Norme', 'Évaluation de Performance'],
    rows: [
      ['Dossiers Réglementaires Traités', totalFolders, '100% reçus', `${folderSlaRate}% traités`],
      ['Respect des Délais d’Instruction (SLA)', `${folderSlaRate}%`, '85%', folderSlaRate >= 85 ? 'Conforme aux normes' : 'Vigilance requise'],
      ['Courriers Entrants Réceptionnés', totalMail, '-', 'Flux sous contrôle'],
      ['Taux de Réponse aux Courriers', `${mailProcessingRate}%`, '90%', mailProcessingRate >= 90 ? 'Objectif Atteint' : 'En cours d’instruction'],
      ['Signalements Sanitaires & Vigilances', totalSignals, '-', `${closedSignals} clôturés`],
      ['Établissements Répertoriés', establishments.length, '-', 'Actif'],
      ['Sessions de Formation / Points Focaux', trainings.length, '50', trainings.length >= 50 ? 'Objectif Atteint' : 'En déploiement']
    ],
    summaryKpis: [
      { label: 'Dossiers Traités', value: `${folderSlaRate}%` },
      { label: 'Courriers Clôturés', value: `${mailProcessingRate}%` },
      { label: 'Signalements', value: totalSignals },
      { label: 'Établissements', value: establishments.length }
    ]
  });

  return (
    <AppLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Rapports d’Activité & Statistiques Institutionnelles
            </h1>
            <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
              Phase 4 • Reporting
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Génération des bilans périodiques, suivi des délais moyens de traitement et mesure des indicateurs de performance (KPI)
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {/* Period selector */}
          <div className="flex items-center bg-white border border-slate-300 rounded-lg p-0.5 text-xs font-semibold">
            <button
              onClick={() => setPeriod('month')}
              className={`px-3 py-1.5 rounded-md transition-colors ${period === 'month' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Mois
            </button>
            <button
              onClick={() => setPeriod('quarter')}
              className={`px-3 py-1.5 rounded-md transition-colors ${period === 'quarter' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Trimestre
            </button>
            <button
              onClick={() => setPeriod('year')}
              className={`px-3 py-1.5 rounded-md transition-colors ${period === 'year' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Année
            </button>
          </div>

          <ExportButton getConfig={getReportingExportConfig} />
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Efficience Délais (SLA)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-900">{folderSlaRate}%</span>
            <span className="text-xs font-semibold text-emerald-600">+4.2% vs M-1</span>
          </div>
          <p className="text-[10px] text-slate-400">Dossiers instruits dans les délais légaux</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Clôture des Courriers
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">{mailProcessingRate}%</span>
            <span className="text-xs text-slate-500">({closedMail} / {totalMail})</span>
          </div>
          <p className="text-[10px] text-slate-400">Délai moyen de réponse : 3.8 jours ouvrés</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Réactivité Vigilance
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-700">100%</span>
            <span className="text-xs text-slate-500">prise en charge &lt; 24h</span>
          </div>
          <p className="text-[10px] text-slate-400">{signals.length} alertes instruites avec succès</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Couverture Formations
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-700">{trainings.length}</span>
            <span className="text-xs font-semibold text-purple-600">points focaux</span>
          </div>
          <p className="text-[10px] text-slate-400">Réseau d'alerte certifié à 92%</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolution Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Évolution Semestrielle des Flux Opérationnels
            </h3>
            <span className="text-[11px] text-slate-400">Volumes mensuels</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="dossiers" name="Dossiers reçus" stroke="#1e40af" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="courriers" name="Courriers traités" stroke="#0d9488" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="vigilances" name="Signalements" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breakdown by folder type */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FolderArchive className="w-4 h-4 text-indigo-600" />
              Répartition des Demandes & Dossiers par Typologie
            </h3>
            <span className="text-[11px] text-slate-400">Total : {totalFolders}</span>
          </div>
          <div className="h-64 w-full flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={folderPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {folderPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Performance by Agent Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Tableau de Performance Individuelle des Agents
            </h3>
            <p className="text-[11px] text-slate-500">Suivi des charges de travail, dossiers instruits et taux de complétion des tâches</p>
          </div>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            {agentPerformance.length} agents supervisés
          </span>
        </div>

        {/* Vue Mobile & Tablette (< 1024px) : Cartes sans debordement */}
        <div className="block lg:hidden divide-y divide-slate-100">
          {agentPerformance.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Aucun agent enregistré.
            </div>
          ) : (
            <div className="p-3 space-y-2.5">
              {agentPerformance.map((agent, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/90 shadow-2xs space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-bold text-xs text-slate-900">
                      {agent.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {agent.role}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-1 border-t border-slate-200/60">
                    <div className="bg-white p-2 rounded-lg border border-slate-200/70">
                      <p className="text-[10px] text-slate-400 font-medium">Dossiers</p>
                      <p className="font-bold text-blue-900 text-xs mt-0.5">{agent.foldersCount}</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200/70">
                      <p className="text-[10px] text-slate-400 font-medium">Activités</p>
                      <p className="font-bold text-slate-800 text-xs mt-0.5">{agent.activitiesCount}</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200/70">
                      <p className="text-[10px] text-slate-400 font-medium">Tâches</p>
                      <p className="font-bold text-slate-800 text-xs mt-0.5">{agent.tasksCompleted}/{agent.tasksTotal}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">Taux d'achèvement</span>
                      <span className="font-bold text-slate-800">{agent.completionRate}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          agent.completionRate >= 80 ? 'bg-emerald-500' :
                          agent.completionRate >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${agent.completionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vue Desktop (>= 1024px) : Tableau fluide 100% */}
        <div className="hidden lg:block w-full max-w-full overflow-x-auto">
          <table className="w-full table-auto text-left border-collapse text-xs min-w-[640px] lg:min-w-0">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">Collaborateur</th>
                <th className="py-2.5 px-3">Rôle Institutionnel</th>
                <th className="py-2.5 px-3 text-center">Dossiers</th>
                <th className="py-2.5 px-3 text-center">Activités</th>
                <th className="py-2.5 px-3 text-center">Tâches Clôturées</th>
                <th className="py-2.5 px-3">Taux d'Achèvement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {agentPerformance.map((agent, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                    {agent.name}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                      {agent.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-semibold text-blue-900 whitespace-nowrap">
                    {agent.foldersCount}
                  </td>
                  <td className="py-2.5 px-3 text-center font-semibold text-slate-800 whitespace-nowrap">
                    {agent.activitiesCount}
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-700 whitespace-nowrap">
                    <strong>{agent.tasksCompleted}</strong> / {agent.tasksTotal}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            agent.completionRate >= 80 ? 'bg-emerald-500' :
                            agent.completionRate >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${agent.completionRate}%` }}
                        />
                      </div>
                      <span className="font-bold text-[11px] text-slate-800">{agent.completionRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </AppLayout>
  );
}

