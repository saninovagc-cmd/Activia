'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Search, Filter, ShieldCheck, Download, History, User } from 'lucide-react';

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

  const exportAuditCSV = () => {
    const headers = ['ID', 'Date', 'Utilisateur', 'Rôle', 'Module', 'Action', 'Entité ID', 'Entité Nom', 'Détails', 'Ancienne Valeur', 'Nouvelle Valeur'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.created_at,
      `"${l.user_name}"`,
      `"${l.user_role}"`,
      l.module,
      l.action,
      l.entity_id,
      `"${l.entity_name}"`,
      `"${l.details}"`,
      l.old_value || '',
      l.new_value || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `audit_logs_activia_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

        <button
          onClick={exportAuditCSV}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Exporter l'Audit (CSV)
        </button>
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
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Horodatage</th>
                <th className="py-3 px-4 font-semibold">Utilisateur</th>
                <th className="py-3 px-4 font-semibold">Action</th>
                <th className="py-3 px-4 font-semibold">Module</th>
                <th className="py-3 px-4 font-semibold">Élément concerné</th>
                <th className="py-3 px-4 font-semibold">Détails de l'opération</th>
                <th className="py-3 px-4 font-semibold">Changement</th>
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
