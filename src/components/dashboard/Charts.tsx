'use client';

import React from 'react';
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

// Data 1: Évolution des dossiers reçus et traités
const timelineData = [
  { month: 'Avr', reçus: 38, traités: 30 },
  { month: 'Mai', reçus: 45, traités: 42 },
  { month: 'Juin', reçus: 52, traités: 47 },
  { month: 'Juil', reçus: 40, traités: 39 },
  { month: 'Août', reçus: 32, traités: 35 },
  { month: 'Sept', reçus: 58, traités: 51 },
  { month: 'Oct', reçus: 44, traités: 38 },
];

// Data 2: Répartition par statut
const statusData = [
  { name: 'Terminé / Conforme', value: 86, color: '#16a34a' },
  { name: 'En cours', value: 42, color: '#2563eb' },
  { name: 'En attente', value: 12, color: '#d97706' },
  { name: 'En retard', value: 8, color: '#dc2626' },
];

// Data 3: Activités par catégorie
const categoryData = [
  { category: 'Réglementaire', total: 24 },
  { category: 'Inspection', total: 18 },
  { category: 'Vigilances', total: 32 },
  { category: 'Échantillonnage', total: 15 },
  { category: 'Dossiers Pub.', total: 14 },
  { category: 'Formations', total: 9 },
];

// Data 4: Dossiers par responsable
const managerData = [
  { name: 'Dr. HOUNGUE', dossiers: 28 },
  { name: 'Dr. ALOFA', dossiers: 22 },
  { name: 'Dr. KINTIN', dossiers: 19 },
  { name: 'Dr. AROUNA', dossiers: 17 },
  { name: 'Dr. LOKOUN', dossiers: 14 },
  { name: 'Dr. GANHOU', dossiers: 11 },
];

// Data 5: Délais moyens de traitement (en jours)
const delayData = [
  { type: 'Courriers', jours: 3.2, cible: 5 },
  { type: 'PGR / PSUR', jours: 21.5, cible: 25 },
  { type: 'MAPI', jours: 7.8, cible: 10 },
  { type: 'Établissements', jours: 18.0, cible: 20 },
  { type: 'Publicité', jours: 11.4, cible: 15 },
  { type: 'Échantillons', jours: 14.2, cible: 15 },
];

export const DashboardCharts: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Graphique 1: Évolution des dossiers */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Graphique 1 — Évolution des Dossiers Reçus et Traités</h4>
            <p className="text-xs text-slate-500">Comparatif mensuel de cadence de traitement</p>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
            Cadence +12%
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
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
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
            <p className="text-xs text-slate-500">Volume total : 148 dossiers actifs</p>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
            58% Conformes
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
            <p className="text-xs text-slate-500">Répartition des missions actives et planifiées</p>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" height={45} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
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
            <p className="text-xs text-slate-500">Volume de dossiers et activités en cours de pilotage</p>
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
              <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} width={80} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Bar dataKey="dossiers" name="Dossiers assignés" fill="#0f766e" radius={[0, 4, 4, 0]} />
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
            Objectif SLA moyen respecté à 94%
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
  );
};
