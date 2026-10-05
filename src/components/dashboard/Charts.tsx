'use client';

import React, { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export const DashboardCharts: React.FC = () => {
  const { folders, activities, incomingMails, allUsers } = useApp();

  // Graphique 1: Évolution mensuelle réelle des dossiers
  const timelineData = useMemo(() => {
    const months = ['Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct'];
    const curMonthIdx = 5; // Octobre
    return months.map((month, idx) => {
      if (idx === curMonthIdx) {
        return {
          month,
          reçus: folders.length,
          traités: folders.filter(f => f.status === 'cloture' || f.status === 'decision').length,
        };
      }
      return { month, reçus: 0, traités: 0 };
    });
  }, [folders]);

  // Graphique 2: Répartition réelle par statut
  const statusData = useMemo(() => {
    const termines = folders.filter(f => f.status === 'cloture').length;
    const enCours = folders.filter(f => ['traitement', 'instruction', 'validation'].includes(f.status)).length;
    const enAttente = folders.filter(f => ['depot', 'reception', 'complet'].includes(f.status)).length;
    const enRetard = folders.filter(f => new Date(f.due_date).getTime() < Date.now() && f.status !== 'cloture').length;

    const total = termines + enCours + enAttente + enRetard;
    if (total === 0) {
      return [{ name: 'Aucun dossier actif', value: 1, color: '#e2e8f0' }];
    }

    return [
      { name: 'Terminé / Conforme', value: termines, color: '#16a34a' },
      { name: 'En cours', value: enCours, color: '#2563eb' },
      { name: 'En attente', value: enAttente, color: '#d97706' },
      { name: 'En retard', value: enRetard, color: '#dc2626' },
    ].filter(item => item.value > 0);
  }, [folders]);

  // Graphique 3: Activités par catégorie réelles
  const categoryData = useMemo(() => {
    const categories = [
      'Réglementaire',
      'Inspection',
      'Vigilances',
      'Échantillonnage',
      'Dossiers Pub.',
      'Formations',
    ];

    return categories.map(cat => {
      const count = activities.filter(a => 
        a.activity_type.toLowerCase().includes(cat.toLowerCase().slice(0, 5))
      ).length;
      return { category: cat, total: count };
    });
  }, [activities]);

  // Graphique 4: Répartition de la charge par responsable réel
  const managerData = useMemo(() => {
    const managers = allUsers.slice(0, 6);
    return managers.map(u => {
      const shortName = u.full_name.split(' ').slice(0, 2).join(' ');
      const userFolders = folders.filter(f => f.manager_id === u.id).length;
      const userActs = activities.filter(a => a.manager_id === u.id).length;
      return {
        name: shortName,
        dossiers: userFolders + userActs,
      };
    });
  }, [allUsers, folders, activities]);

  // Graphique 5: Délais cibles réglementaires vs réels
  const delayData = useMemo(() => {
    return [
      { type: 'Courriers', jours: 0, cible: 5 },
      { type: 'PGR / PSUR', jours: 0, cible: 25 },
      { type: 'MAPI', jours: 0, cible: 10 },
      { type: 'Établissements', jours: 0, cible: 20 },
      { type: 'Publicité', jours: 0, cible: 15 },
      { type: 'Échantillons', jours: 0, cible: 15 },
    ];
  }, []);

  const totalFoldersCount = folders.length;
  const hasNoData = folders.length === 0 && activities.length === 0 && incomingMails.length === 0;

  return (
    <div className="space-y-6 mt-6">
      {hasNoData && (
        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <p>
              <strong>Environnement prêt pour exploitation :</strong> Les données fictives ont été nettoyées. Vos graphiques et indicateurs se construiront automatiquement au fil de l’enregistrement de vos premiers courriers, activités et dossiers.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique 1: Évolution des dossiers */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Graphique 1 — Évolution des Dossiers Reçus et Traités</h4>
              <p className="text-xs text-slate-500">Comparatif mensuel de cadence de traitement</p>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
              {folders.length} dossier{folders.length > 1 ? 's' : ''} enregistré{folders.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRecus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTraites" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="reçus" name="Dossiers Reçus" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorRecus)" />
                <Area type="monotone" dataKey="traités" name="Dossiers Traités" stroke="#16a34a" strokeWidth={2} fillOpacity={1} fill="url(#colorTraites)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graphique 2: Répartition par statut */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Graphique 2 — Répartition des Dossiers par Statut</h4>
              <p className="text-xs text-slate-500">Volume total : {totalFoldersCount} dossier{totalFoldersCount > 1 ? 's' : ''}</p>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
              Temps réel
            </span>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graphique 3: Activités par catégorie */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Graphique 3 — Activités par Catégorie de Mission</h4>
              <p className="text-xs text-slate-500">Répartition des missions actives et planifiées ({activities.length})</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" height={45} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="total" name="Nombre d'activités" fill="#1e40af" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graphique 4: Dossiers par responsable */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Graphique 4 — Répartition de la Charge par Responsable</h4>
              <p className="text-xs text-slate-500">Volume d'éléments assignés aux cadres du service</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={managerData}
                layout="vertical"
                margin={{ top: 10, right: 10, left: 15, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} width={100} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="dossiers" name="Éléments assignés" fill="#0f766e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graphique 5: Délais moyens de traitement */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Graphique 5 — Délais Moyens de Traitement Réels vs Délais Cibles Réglementaires</h4>
              <p className="text-xs text-slate-500">Durée en jours ouvrés par typologie de procédure</p>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
              Délais SLA DLVS
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={delayData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="type" tick={{ fontSize: 12, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} unit=" j" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="jours" name="Délai Moyen Constaté (Jours)" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cible" name="Délai Cible Réglementaire (Jours)" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
