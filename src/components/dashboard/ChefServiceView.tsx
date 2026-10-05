'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { StatCard } from './StatCard';
import { Badge } from '@/components/ui/Badge';
import { 
  CheckCircle, 
  Clock, 
  AlertOctagon, 
  Mail, 
  FolderCheck, 
  ShieldAlert, 
  TrendingUp, 
  Users,
  Building
} from 'lucide-react';

export const ChefServiceView: React.FC = () => {
  const { activities, currentUser, allUsers } = useApp();
  const [selectedDept, setSelectedDept] = useState<string>(currentUser.department || 'Vigilances Sanitaires & MAPI');

  const departments = [
    'Vigilances Sanitaires & MAPI',
    'Établissements & Inspections',
    'Réglementation & PGR/PSUR',
    'Laboratoire & Échantillonnage',
    'Déchets & Autorisations Achat'
  ];

  // Filter activities by department
  const deptActivities = activities.filter(a => a.department === selectedDept || selectedDept === 'Tous');
  const realisees = deptActivities.filter(a => a.status === 'termine').length;
  const enCours = deptActivities.filter(a => a.status === 'en_cours').length;
  const enRetard = deptActivities.filter(a => a.status === 'en_retard').length;

  // Filter agents in this department
  const deptAgents = allUsers.filter(u => u.department === selectedDept);

  return (
    <div className="space-y-6">
      {/* Department Selector */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-600" />
            Vue Superviseur : {selectedDept}
          </h3>
          <p className="text-xs text-slate-500">Pilotage de la charge, des délais et des vigilances du service</p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-600">Filtrer par service :</label>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid: 4 Piliers Chef de Service */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pilier 1: Activités du Service */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Activité du Service</p>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Activités réalisées
              </span>
              <span className="font-bold text-slate-900">{realisees}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Activités en cours
              </span>
              <span className="font-bold text-slate-900">{enCours}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Activités en retard
              </span>
              <span className="font-bold text-rose-600">{enRetard}</span>
            </div>
          </div>
        </div>

        {/* Pilier 2: Dossiers Réglementaires */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dossiers Réglementaires</p>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Reçus (ce mois)</span>
              <span className="font-bold text-slate-900">44</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Traités / Validés</span>
              <span className="font-bold text-emerald-600">38</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">En attente avis</span>
              <span className="font-bold text-amber-600">6</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Dossiers en retard</span>
              <span className="font-bold text-rose-600">2</span>
            </div>
          </div>
        </div>

        {/* Pilier 3: Courriers */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Courriers</p>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Courriers entrants</span>
              <span className="font-bold text-slate-900">78</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Courriers sortants</span>
              <span className="font-bold text-slate-900">65</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Non traités</span>
              <span className="font-bold text-blue-600">12</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Délai limite &gt; 5j</span>
              <span className="font-bold text-rose-600">1</span>
            </div>
          </div>
        </div>

        {/* Pilier 4: Vigilance Sanitaire */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vigilance & Risques</p>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Signalements reçus</span>
              <span className="font-bold text-slate-900">18</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Alertes actives</span>
              <span className="font-bold text-amber-600">4</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Cas MAPI ouverts</span>
              <span className="font-bold text-blue-600">7</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Dossiers clôturés</span>
              <span className="font-bold text-emerald-600">14</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charge par agent du service */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Répartition de la Charge par Agent ({deptAgents.length} agents actifs)
            </h4>
            <p className="text-xs text-slate-500">Supervision des dossiers affectés et respect des délais</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
            Taux moyen de traitement : 88.4%
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-y border-slate-100">
              <tr>
                <th className="py-2.5 px-3">Agent</th>
                <th className="py-2.5 px-3">Titre</th>
                <th className="py-2.5 px-3 text-center">Activités Assignées</th>
                <th className="py-2.5 px-3 text-center">Tâches en Cours</th>
                <th className="py-2.5 px-3 text-center">En Retard</th>
                <th className="py-2.5 px-3 text-right">Délai Moyen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deptAgents.map((ag) => {
                const agActivities = activities.filter(a => a.manager_id === ag.id);
                const agDelayed = agActivities.filter(a => a.status === 'en_retard').length;
                return (
                  <tr key={ag.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                          {ag.full_name.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-900">{ag.full_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{ag.title}</td>
                    <td className="py-3 px-3 text-center font-bold text-slate-800">{agActivities.length}</td>
                    <td className="py-3 px-3 text-center font-semibold text-blue-600">{agActivities.length * 2}</td>
                    <td className="py-3 px-3 text-center">
                      {agDelayed > 0 ? (
                        <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200">
                          {agDelayed}
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-slate-700">4.5 jours</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
