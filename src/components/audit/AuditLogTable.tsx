'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Search, Filter, ShieldCheck, Download, History, User } from 'lucide-react';
import { ExportButton } from '@/components/common/ExportButton';
import { ExportConfig } from '@/lib/exportUtils';

export const AuditLogTable: React.FC = () => {
  const { auditLogs } = useApp();
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  const filteredLogs = auditLogs.filter(log => {
    if (moduleFilter !== 'all' && log.module !== moduleFilter) return false;
    if (actionFilter !== 'all' && log.action !== actionFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchUser = log.user_name.toLowerCase().includes(q);
      const matchDetails = log.details.toLowerCase().includes(q);
      const matchEntity = log.entity_id.toLowerCase().includes(q) || log.entity_name.toLowerCase().includes(q);
      if (!matchUser && !matchDetails && !matchEntity) return false;
    }
    return true;
  });

  const getAuditExportConfig = (): ExportConfig => ({
    title: 'Journal d’Audit & Traçabilité des Opérations',
    subtitle: 'Direction de la Pharmacie et du Médicament — Registre immuable de conformité',
    filename: `audit_activia_${new Date().toISOString().split('T')[0]}`,
    headers: ['Date & Heure', 'Utilisateur', 'Rôle', 'Module', 'Action', 'Entité Ciblée', 'Détails des modifications'],
    rows: filteredLogs.map(l => [
      l.created_at,
      l.user_name,
      l.user_role,
      l.module,
      l.action,
      `${l.entity_name} (${l.entity_id})`,
      l.details
    ]),
    summaryKpis: [
      { label: 'Total Entrées', value: filteredLogs.length },
      { label: 'Créations', value: filteredLogs.filter(l => l.action === 'CREATE').length },
      { label: 'Modifications', value: filteredLogs.filter(l => l.action === 'UPDATE' || l.action === 'STATUS_CHANGE').length },
      { label: 'Suppressions', value: filteredLogs.filter(l => l.action === 'DELETE').length }
    ]
  });

  const actionBadgeColors: Record<string, { bg: string; text: string }> = {
    CREATE: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
    UPDATE: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
    STATUS_CHANGE: { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700' },
    DELETE: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700' },
    ASSIGN: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
  };

  return (
    <div className="space-y-4">
      {/* Header toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par agent, action, référence..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white w-64"
            />
          </div>

          {/* Module Filter */}
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800"
          >
            <option value="all">Tous les modules</option>
            <option value="Activités">Activités</option>
            <option value="Tâches">Tâches</option>
            <option value="Sécurité">Sécurité & Profils</option>
            <option value="Courriers">Courriers</option>
            <option value="Dossiers">Dossiers</option>
          </select>

          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800"
          >
            <option value="all">Toutes les actions</option>
            <option value="CREATE">Création (CREATE)</option>
            <option value="STATUS_CHANGE">Changement statut (STATUS_CHANGE)</option>
            <option value="UPDATE">Modification (UPDATE)</option>
            <option value="ASSIGN">Affectation (ASSIGN)</option>
            <option value="DELETE">Suppression (DELETE)</option>
          </select>
        </div>

        <ExportButton getConfig={getAuditExportConfig} />
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-4 rounded-full bg-slate-800" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Journal d’Audit & Traçabilité des Actions</h3>
            <span className="text-[11px] font-semibold text-slate-700 bg-slate-200/80 px-2 py-0.5 rounded-full">{filteredLogs.length} entrée(s)</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {filteredLogs.filter(l => l.action === 'CREATE').length} créations
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              {filteredLogs.filter(l => l.action === 'UPDATE' || l.action === 'STATUS_CHANGE').length} modifications
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {filteredLogs.filter(l => l.action === 'ASSIGN').length} affectations
            </span>
          </div>
        </div>
      {/* =========================================================================
          VUE MOBILE & TABLETTE (< 1024px) : Cartes fluides 100% SANS défilement
          ========================================================================= */}
      <div className="block lg:hidden divide-y divide-slate-100 p-3 bg-slate-50/40 space-y-2.5">
        {filteredLogs.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Aucune entrée d'audit ne correspond à vos filtres.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const badge = actionBadgeColors[log.action] || { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-700' };
            return (
              <div key={log.id} className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.bg} ${badge.text}`}>
                    {log.action} • {log.module}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">{log.created_at}</span>
                </div>

                <div className="text-xs">
                  <p className="font-semibold text-slate-900">{log.details}</p>
                  <p className="text-[11px] text-blue-700 font-mono mt-0.5">Réf: {log.entity_id}</p>
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[11px] text-slate-500">
                  <span>Par <strong>{log.user_name}</strong> ({log.user_role})</span>
                  {log.old_value && log.new_value && (
                    <span className="font-mono text-[10px] text-emerald-700 font-semibold">{log.old_value} → {log.new_value}</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* =========================================================================
          VUE DESKTOP (>= 1024px) : Tableau fluide 100% SANS barre de défilement
          ========================================================================= */}
      <div className="hidden lg:block w-full max-w-full overflow-x-auto">
        <table className="w-full text-xs text-left text-slate-700 table-auto min-w-[760px] lg:min-w-0">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-3 w-36 font-semibold">Horodatage</th>
              <th className="py-3 px-3 w-40 font-semibold">Utilisateur</th>
              <th className="py-3 px-2.5 w-24 font-semibold">Action</th>
              <th className="py-3 px-2.5 w-28 font-semibold">Module</th>
              <th className="py-3 px-3 w-32 font-semibold">Élément</th>
              <th className="py-3 px-3 font-semibold">Détails de l'opération</th>
              <th className="py-3 px-3 w-32 font-semibold">Changement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Aucune entrée d'audit ne correspond à vos filtres.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const badge = actionBadgeColors[log.action] || { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-700' };
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Horodatage */}
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {log.created_at}
                      </td>

                      {/* Utilisateur */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div>
                          <p className="font-semibold text-slate-900">{log.user_name}</p>
                          <p className="text-[10px] text-slate-400">{log.user_role}</p>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.bg} ${badge.text}`}>
                          {log.action}
                        </span>
                      </td>

                      {/* Module */}
                      <td className="py-3 px-4 font-medium text-slate-700 whitespace-nowrap">
                        {log.module}
                      </td>

                      {/* Élément concerné */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                          {log.entity_id}
                        </span>
                      </td>

                      {/* Détails */}
                      <td className="py-3 px-4 text-slate-800 max-w-sm">
                        {log.details}
                      </td>

                      {/* Changement */}
                      <td className="py-3 px-4 whitespace-nowrap text-[11px]">
                        {log.old_value && log.new_value ? (
                          <span>
                            <span className="text-slate-500 font-mono">{log.old_value}</span>
                            <span className="text-slate-400 mx-1">→</span>
                            <span className="text-emerald-700 font-bold font-mono">{log.new_value}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
