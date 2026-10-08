'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Building,
  Users,
} from 'lucide-react';

export const ChefServiceView: React.FC = () => {
  const { activities, folders, incomingMails, outgoingMails, signals, alerts, currentUser, allUsers } = useApp();
  const [selectedDept, setSelectedDept] = useState<string>(currentUser.department || 'Tous');

  const departments = [
    'Tous',
    'Direction (DLVS)',
    'Service des Vigilances et des Produits de Santé (SVPS)',
    'Service de la Surveillance du Marché (SSMUR)',
    'Service des Licences (SL)'
  ];

  // Filter activities by department
  const deptActivities = activities.filter(a => selectedDept === 'Tous' || a.department === selectedDept);
  const realisees = deptActivities.filter(a => a.status === 'termine').length;
  const enCours = deptActivities.filter(a => a.status === 'en_cours').length;
  const enRetard = deptActivities.filter(a => a.status === 'en_retard' || (a.status !== 'termine' && new Date(a.due_date).getTime() < Date.now())).length;

  // Filter folders by department via manager or regulatory type
  const deptFolders = folders.filter(f => {
    if (selectedDept === 'Tous') return true;
    const mgr = allUsers.find(u => u.id === f.manager_id);
    if (mgr && mgr.department === selectedDept) return true;
    if (selectedDept === 'Service des Vigilances et des Produits de Santé (SVPS)') {
      return ['Enregistrement PGR', 'Revue PSUR / PBRER', 'Essai Clinique & EIG'].includes(f.folder_type);
    }
    if (selectedDept === 'Service de la Surveillance du Marché (SSMUR)') {
      return ['Autorisation d’achat', 'Publicité & Promotion', 'Élimination Déchets'].includes(f.folder_type);
    }
    if (selectedDept === 'Service des Licences (SL)') {
      return ['Agrément Établissement'].includes(f.folder_type);
    }
    return false;
  });
  const foldersRecus = deptFolders.length;
  const foldersTraites = deptFolders.filter(f => f.status === 'cloture' || f.status === 'decision').length;
  const foldersEnAttente = deptFolders.filter(f => ['depot', 'reception', 'complet', 'verification'].includes(f.status)).length;
  const foldersEnRetard = deptFolders.filter(f => new Date(f.due_date).getTime() < Date.now() && f.status !== 'cloture' && f.status !== 'rejete').length;

  // Filter incoming & outgoing mails by department
  const deptMailsIn = incomingMails.filter(m => selectedDept === 'Tous' || m.department === selectedDept);
  const mailsInCount = deptMailsIn.length;
  const deptMailsOut = outgoingMails.filter(m => {
    if (selectedDept === 'Tous') return true;
    const mgr = allUsers.find(u => u.id === m.manager_id);
    if (mgr && mgr.department === selectedDept) return true;
    if (m.linked_incoming_id) {
      const inc = incomingMails.find(i => i.id === m.linked_incoming_id);
      if (inc && inc.department === selectedDept) return true;
    }
    return false;
  });
  const mailsOutCount = deptMailsOut.length;
  const mailsNonTraites = deptMailsIn.filter(m => m.status !== 'cloture' && m.status !== 'reponse').length;
  const mailsEnRetard = deptMailsIn.filter(m => new Date(m.due_date).getTime() < Date.now() && m.status !== 'cloture').length;

  // Vigilances & Signalements filtered by relevance to department
  const deptSignals = signals.filter(s => {
    if (selectedDept === 'Tous') return true;
    if (selectedDept === 'Service des Vigilances et des Produits de Santé (SVPS)') {
      return s.signal_type.includes('MAPI') || s.signal_type.includes('indésirable') || s.signal_type.includes('pharmacovigilance');
    }
    if (selectedDept === 'Service de la Surveillance du Marché (SSMUR)') {
      return s.signal_type.includes('falsifié') || s.signal_type.includes('qualité') || s.signal_type.includes('illicite');
    }
    if (selectedDept === 'Service des Licences (SL)') {
      return s.reporter_type?.includes('Établissement') || s.reporter_type?.includes('Officine');
    }
    return true;
  });
  const signalsCount = deptSignals.length;
  const activeAlertsCount = alerts.filter(a => {
    if (a.status !== 'active') return false;
    if (selectedDept === 'Tous') return true;
    if (selectedDept === 'Service des Vigilances et des Produits de Santé (SVPS)') return true;
    if (selectedDept === 'Service de la Surveillance du Marché (SSMUR)') return a.nature.includes('contrefait') || a.nature.includes('falsifié');
    return false;
  }).length;
  const mapiOpen = deptSignals.filter(s => s.signal_type.toLowerCase().includes('mapi') && s.status !== 'cloture').length;
  const signalsClosed = deptSignals.filter(s => s.status === 'cloture').length;

  // Filter agents in this department
  const deptAgents = allUsers.filter(u => selectedDept === 'Tous' || u.department === selectedDept);

  return (
    <div className="space-y-6">
      {/* Department Selector */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-600" />
            Vue Superviseur : {selectedDept}
          </h3>
          <p className="text-xs text-slate-500">Pilotage en temps réel de la charge, des délais et des vigilances du service</p>
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
              <span className="text-slate-600">Total dossiers</span>
              <span className="font-bold text-slate-900">{foldersRecus}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Traités / Validés</span>
              <span className="font-bold text-emerald-600">{foldersTraites}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">En attente avis</span>
              <span className="font-bold text-amber-600">{foldersEnAttente}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Dossiers en retard</span>
              <span className="font-bold text-rose-600">{foldersEnRetard}</span>
            </div>
          </div>
        </div>

        {/* Pilier 3: Courriers */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Courriers</p>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Courriers entrants</span>
              <span className="font-bold text-slate-900">{mailsInCount}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Courriers sortants</span>
              <span className="font-bold text-slate-900">{mailsOutCount}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Non traités</span>
              <span className="font-bold text-blue-600">{mailsNonTraites}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Délai limite dépassé</span>
              <span className="font-bold text-rose-600">{mailsEnRetard}</span>
            </div>
          </div>
        </div>

        {/* Pilier 4: Vigilance Sanitaire */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vigilance & Risques</p>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Signalements reçus</span>
              <span className="font-bold text-slate-900">{signalsCount}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Alertes actives</span>
              <span className="font-bold text-amber-600">{activeAlertsCount}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Cas MAPI ouverts</span>
              <span className="font-bold text-blue-600">{mapiOpen}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Dossiers clôturés</span>
              <span className="font-bold text-emerald-600">{signalsClosed}</span>
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
              Répartition de la Charge par Collaborateur ({deptAgents.length} agents)
            </h4>
            <p className="text-xs text-slate-500">Supervision des activités, dossiers et courriers affectés avec suivi des retards</p>
          </div>
        </div>

        {/* Vue Mobile & Tablette (< 1024px) : Cartes sans debordement */}
        <div className="block lg:hidden divide-y divide-slate-100">
          {deptAgents.map((ag) => {
            const agActivities = activities.filter(a => a.manager_id === ag.id);
            const agFolders = folders.filter(f => f.manager_id === ag.id);
            const agMails = incomingMails.filter(m => m.manager_id === ag.id);
            const agDelayed = 
              agActivities.filter(a => a.status === 'en_retard' || (a.status !== 'termine' && new Date(a.due_date).getTime() < Date.now())).length +
              agFolders.filter(f => new Date(f.due_date).getTime() < Date.now() && f.status !== 'cloture' && f.status !== 'rejete').length +
              agMails.filter(m => new Date(m.due_date).getTime() < Date.now() && m.status !== 'cloture').length;
            const totalItems = agActivities.length + agFolders.length + agMails.length;

            return (
              <div key={ag.id} className="p-3.5 space-y-2 bg-slate-50/50">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                      {ag.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900">{ag.full_name}</p>
                      <p className="text-[10px] text-slate-500">{ag.role_label || ag.title}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    agDelayed > 0
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : totalItems > 4
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {agDelayed > 0 ? `${agDelayed} retard(s)` : totalItems > 4 ? 'En charge' : 'Disponible'}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 text-center text-xs pt-1 border-t border-slate-200/60">
                  <div className="bg-white p-2 rounded-lg border border-slate-200/70">
                    <p className="text-[10px] text-slate-400 font-medium">Activités</p>
                    <p className="font-bold text-slate-800 text-xs mt-0.5">{agActivities.length}</p>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200/70">
                    <p className="text-[10px] text-slate-400 font-medium">Dossiers</p>
                    <p className="font-bold text-emerald-700 text-xs mt-0.5">{agFolders.length}</p>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200/70">
                    <p className="text-[10px] text-slate-400 font-medium">Courriers</p>
                    <p className="font-bold text-blue-600 text-xs mt-0.5">{agMails.length}</p>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200/70">
                    <p className="text-[10px] text-slate-400 font-medium">En retard</p>
                    <p className="font-bold text-xs mt-0.5">
                      {agDelayed > 0 ? (
                        <span className="text-rose-600 font-bold">{agDelayed}</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Vue Desktop (>= 1024px) : Tableau fluide */}
        <div className="hidden lg:block w-full max-w-full overflow-x-auto">
          <table className="w-full text-xs text-left table-auto min-w-[640px] lg:min-w-0">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-y border-slate-100">
              <tr>
                <th className="py-2.5 px-3">Collaborateur</th>
                <th className="py-2.5 px-3">Titre / Rôle</th>
                <th className="py-2.5 px-3 text-center">Activités</th>
                <th className="py-2.5 px-3 text-center">Dossiers</th>
                <th className="py-2.5 px-3 text-center">Courriers</th>
                <th className="py-2.5 px-3 text-center">En Retard</th>
                <th className="py-2.5 px-3 text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deptAgents.map((ag) => {
                const agActivities = activities.filter(a => a.manager_id === ag.id);
                const agFolders = folders.filter(f => f.manager_id === ag.id);
                const agMails = incomingMails.filter(m => m.manager_id === ag.id);
                const agDelayed = 
                  agActivities.filter(a => a.status === 'en_retard' || (a.status !== 'termine' && new Date(a.due_date).getTime() < Date.now())).length +
                  agFolders.filter(f => new Date(f.due_date).getTime() < Date.now() && f.status !== 'cloture' && f.status !== 'rejete').length +
                  agMails.filter(m => new Date(m.due_date).getTime() < Date.now() && m.status !== 'cloture').length;
                const totalItems = agActivities.length + agFolders.length + agMails.length;

                return (
                  <tr key={ag.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                          {ag.full_name.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-900">{ag.full_name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{ag.role_label || ag.title}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-800">{agActivities.length}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-emerald-700">{agFolders.length}</td>
                    <td className="py-2.5 px-3 text-center font-semibold text-blue-600">{agMails.length}</td>
                    <td className="py-2.5 px-3 text-center">
                      {agDelayed > 0 ? (
                        <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200">
                          {agDelayed}
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        agDelayed > 0
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : totalItems > 4
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {agDelayed > 0 ? `${agDelayed} retard(s)` : totalItems > 4 ? 'En charge' : 'Disponible'}
                      </span>
                    </td>
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
