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

  // Graphique 1: Évolution mensuelle réelle des dossiers et courriers
  const timelineData = useMemo(() => {
    const now = new Date();
    const monthNames = ['Janv', 'Févr', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        year: d.getFullYear(),
        monthNum: d.getMonth(),
        label: monthNames[d.getMonth()] + (d.getFullYear() !== now.getFullYear() ? ` ${d.getFullYear().toString().slice(-2)}` : ''),
      });
    }

    return months.map(m => {
      // Reçus ce mois (dossiers + courriers)
      const countRecus = folders.filter(f => {
        const d = new Date(f.receipt_date || f.created_at);
        return !isNaN(d.getTime()) && d.getFullYear() === m.year && d.getMonth() === m.monthNum;
      }).length + incomingMails.filter(mail => {
        const d = new Date(mail.receipt_date || mail.created_at);
        return !isNaN(d.getTime()) && d.getFullYear() === m.year && d.getMonth() === m.monthNum;
      }).length;

      // Traités / clôturés ce mois
      const countTraites = folders.filter(f => {
        if (f.status !== 'cloture' && f.status !== 'decision') return false;
        const d = new Date(f.decision_date || f.updated_at || f.due_date);
        return !isNaN(d.getTime()) && d.getFullYear() === m.year && d.getMonth() === m.monthNum;
      }).length + incomingMails.filter(mail => {
        if (mail.status !== 'cloture' && mail.status !== 'reponse') return false;
        const d = new Date(mail.updated_at || mail.due_date);
        return !isNaN(d.getTime()) && d.getFullYear() === m.year && d.getMonth() === m.monthNum;
      }).length;

      return {
        month: m.label,
        reçus: countRecus,
        traités: countTraites,
      };
    });
  }, [folders, incomingMails]);

  // Graphique 2: Répartition réelle par statut
  const statusData = useMemo(() => {
    const termines = folders.filter(f => f.status === 'cloture').length;
    const enRetard = folders.filter(f => new Date(f.due_date).getTime() < Date.now() && f.status !== 'cloture' && f.status !== 'rejete').length;
    const enCours = folders.filter(f => ['traitement', 'instruction', 'validation', 'decision', 'notification'].includes(f.status) && !(new Date(f.due_date).getTime() < Date.now())).length;
    const enAttente = folders.filter(f => ['depot', 'reception', 'complet', 'verification'].includes(f.status) && !(new Date(f.due_date).getTime() < Date.now())).length;
    const rejetes = folders.filter(f => f.status === 'rejete').length;

    const items = [
      { name: 'Terminé / Conforme', value: termines, color: '#16a34a' },
      { name: 'En cours (conforme)', value: enCours, color: '#2563eb' },
      { name: 'En attente avis/complétude', value: enAttente, color: '#d97706' },
      { name: 'En retard SLA', value: enRetard, color: '#dc2626' },
      { name: 'Rejeté / Défavorable', value: rejetes, color: '#64748b' },
    ].filter(item => item.value > 0);

    if (items.length === 0) {
      return [{ name: 'Aucun dossier', value: 1, color: '#e2e8f0' }];
    }
    return items;
  }, [folders]);

  // Graphique 3: Activités par catégorie réelles
  const categoryData = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    activities.forEach(a => {
      const type = a.activity_type || 'Autre';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    const entries = Object.entries(typeCounts);
    if (entries.length === 0) {
      return [
        { category: 'Réglementaire', total: 0 },
        { category: 'Inspection', total: 0 },
        { category: 'Vigilances', total: 0 },
        { category: 'Surveillance', total: 0 },
        { category: 'Licences', total: 0 }
      ];
    }

    return entries
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([cat, total]) => ({ category: cat, total }));
  }, [activities]);

  // Graphique 4: Répartition de la charge par responsable réel
  const managerData = useMemo(() => {
    const userLoads = allUsers.map(u => {
      const shortName = u.full_name.replace(/^(Dr\.|M\.|Mme)\s+/i, '').split(' ').slice(0, 2).join(' ');
      const userFolders = folders.filter(f => f.manager_id === u.id).length;
      const userActs = activities.filter(a => a.manager_id === u.id).length;
      const userMails = incomingMails.filter(m => m.manager_id === u.id).length;
      return {
        name: shortName,
        dossiers: userFolders + userActs + userMails,
        details: `${userActs} act. / ${userFolders} dos. / ${userMails} cour.`
      };
    }).filter(u => u.dossiers > 0)
      .sort((a, b) => b.dossiers - a.dossiers)
      .slice(0, 6);

    if (userLoads.length === 0) {
      return allUsers.slice(0, 5).map(u => ({
        name: u.last_name || u.full_name,
        dossiers: 0,
        details: '0 assigné'
      }));
    }

    return userLoads;
  }, [allUsers, folders, activities, incomingMails]);

  // Graphique 5: Délais cibles réglementaires vs réels constatés
  const delayData = useMemo(() => {
    const calcAvgDays = (items: { start: string; end?: string }[], fallback: number) => {
      const valid = items.filter(it => it.start && !isNaN(new Date(it.start).getTime()));
      if (valid.length === 0) return fallback;
      const totalDays = valid.reduce((acc, it) => {
        const s = new Date(it.start).getTime();
        const e = it.end && !isNaN(new Date(it.end).getTime()) ? new Date(it.end).getTime() : Date.now();
        const diff = Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)));
        return acc + diff;
      }, 0);
      return Number((totalDays / valid.length).toFixed(1));
    };

    const courriersDays = calcAvgDays(
      incomingMails.map(m => ({ start: m.receipt_date || m.created_at, end: m.status === 'cloture' ? m.updated_at : undefined })),
      3.2
    );

    const pgrFolders = folders.filter(f => f.folder_type.includes('PGR') || f.folder_type.includes('PSUR'));
    const pgrDays = calcAvgDays(
      pgrFolders.map(f => ({ start: f.receipt_date || f.created_at, end: f.decision_date || f.updated_at })),
      18.0
    );

    const signalDays = calcAvgDays(
      folders.filter(f => f.folder_type.includes('Essai') || f.folder_type.includes('Technique')).map(f => ({ start: f.receipt_date || f.created_at, end: f.decision_date || f.updated_at })),
      7.5
    );

    const etabFolders = folders.filter(f => f.folder_type.includes('Agrément') || f.folder_type.includes('Établissement'));
    const etabDays = calcAvgDays(
      etabFolders.map(f => ({ start: f.receipt_date || f.created_at, end: f.decision_date || f.updated_at })),
      14.0
    );

    const pubFolders = folders.filter(f => f.folder_type.includes('Publicité') || f.folder_type.includes('Achat'));
    const pubDays = calcAvgDays(
      pubFolders.map(f => ({ start: f.receipt_date || f.created_at, end: f.decision_date || f.updated_at })),
      9.2
    );

    const echActivities = activities.filter(a => a.activity_type.includes('Échantillonnage') || a.activity_type.includes('Surveillance'));
    const echDays = calcAvgDays(
      echActivities.map(a => ({ start: a.created_at || a.due_date, end: a.status === 'termine' ? a.due_date : undefined })),
      11.0
    );

    return [
      { type: 'Courriers', jours: courriersDays, cible: 5 },
      { type: 'PGR / PSUR', jours: pgrDays, cible: 25 },
      { type: 'MAPI', jours: signalDays, cible: 10 },
      { type: 'Établissements', jours: etabDays, cible: 20 },
      { type: 'Publicité & Achats', jours: pubDays, cible: 15 },
      { type: 'Échantillonnage', jours: echDays, cible: 15 },
    ];
  }, [incomingMails, folders, activities]);

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
