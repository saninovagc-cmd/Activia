'use client';

import React, { useState } from 'react';
import { SignalItem, SignalType, SignalSeverity, SignalStep } from '@/types';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Eye, 
  FlaskConical, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText,
  ShieldAlert
} from 'lucide-react';

interface SignalTableProps {
  signals: SignalItem[];
  onSelect: (signal: SignalItem) => void;
  onNew: () => void;
  canManage: boolean;
}

export const SignalTable: React.FC<SignalTableProps> = ({
  signals,
  onSelect,
  onNew,
  canManage
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [sampleFilter, setSampleFilter] = useState<string>('all');

  const filtered = signals.filter(s => {
    const matchesSearch = 
      s.signal_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.batch_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.reporter_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || s.signal_type === typeFilter;
    const matchesSeverity = severityFilter === 'all' || s.severity === severityFilter;
    const matchesSample = 
      sampleFilter === 'all' ? true :
      sampleFilter === 'sampled' ? s.sample_taken : !s.sample_taken;

    return matchesSearch && matchesType && matchesSeverity && matchesSample;
  });

  const getSeverityBadge = (severity: SignalSeverity) => {
    switch (severity) {
      case 'Critique':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">🔴 Critique</span>;
      case 'Grave':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-300">🟠 Grave</span>;
      case 'Modérée':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">🟡 Modérée</span>;
      case 'Faible':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">🟢 Faible</span>;
      default:
        return <span>{severity}</span>;
    }
  };

  const exportCSV = () => {
    const headers = ['Numero,Date,Declarant,Type Declarant,Produit,Lot,Fabricant,Type,Gravite,Echantillon,Laboratoire,Resultat,Etape,Statut,Responsable\n'];
    const rows = filtered.map(s => 
      `"${s.signal_number}","${s.receipt_date}","${s.reporter_name}","${s.reporter_type}","${s.product_name}","${s.batch_number}","${s.manufacturer}","${s.signal_type}","${s.severity}","${s.sample_taken ? 'Oui' : 'Non'}","${s.lab_name || ''}","${s.lab_result || ''}","${s.workflow_step}","${s.status}","${s.manager_name}"`
    );
    const blob = new Blob([headers.concat(rows.join('\n')).join('')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `registre_signalements_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Search and filters bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="flex-1 flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par n° signalement, produit, lot, déclarant, fabricant..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous types d’incidents</option>
            <option value="MAPI">MAPI (Manifestations Post-Vaccinales)</option>
            <option value="Défaut qualité">Défaut qualité</option>
            <option value="Effet indésirable grave">Effet indésirable grave</option>
            <option value="Produit falsifié / illicite">Produit falsifié / illicite</option>
            <option value="Erreur médicamenteuse">Erreur médicamenteuse</option>
            <option value="Rupture de stock">Rupture de stock</option>
          </select>

          {/* Severity filter */}
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Toutes gravités</option>
            <option value="Critique">Critique</option>
            <option value="Grave">Grave</option>
            <option value="Modérée">Modérée</option>
            <option value="Faible">Faible</option>
          </select>

          {/* Sample filter */}
          <select
            value={sampleFilter}
            onChange={e => setSampleFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Échantillons : Tous</option>
            <option value="sampled">Échantillonné</option>
            <option value="not_sampled">Sans prélèvement</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {canManage && (
            <button
              onClick={onNew}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Signalement</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">N° Dossier & Date</th>
                <th className="py-3 px-4">Produit & N° Lot</th>
                <th className="py-3 px-4">Déclarant</th>
                <th className="py-3 px-4">Type & Gravité</th>
                <th className="py-3 px-4">Échantillon / Labo</th>
                <th className="py-3 px-4">Étape Workflow</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    Aucun signalement ne correspond à ces critères.
                  </td>
                </tr>
              ) : (
                filtered.map((sig) => (
                  <tr 
                    key={sig.id} 
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => onSelect(sig)}
                  >
                    <td className="py-3 px-4 font-mono font-medium">
                      <div className="text-blue-900 font-bold">{sig.signal_number}</div>
                      <div className="text-[11px] text-slate-500 font-normal">{sig.receipt_date}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {sig.product_name}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <span className="font-mono bg-slate-100 px-1 py-0.2 rounded border border-slate-200">Lot: {sig.batch_number}</span>
                        <span>• {sig.manufacturer}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{sig.reporter_name}</div>
                      <div className="text-[11px] text-slate-500">{sig.reporter_type}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 mb-1">{sig.signal_type}</div>
                      <div>{getSeverityBadge(sig.severity)}</div>
                    </td>
                    <td className="py-3 px-4">
                      {sig.sample_taken ? (
                        <div>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            <FlaskConical className="w-3 h-3" />
                            {sig.sample_code || 'Prélevé'}
                          </span>
                          {sig.lab_result && (
                            <div className={`text-[10px] font-bold mt-1 ${
                              sig.lab_result === 'Conforme' ? 'text-emerald-700' :
                              sig.lab_result === 'Non conforme' ? 'text-rose-700' : 'text-amber-700'
                            }`}>
                              Résultat : {sig.lab_result}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Sans prélèvement</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 uppercase tracking-tight">
                        {sig.workflow_step.replace('_', ' ')}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Resp: {sig.manager_name}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelect(sig)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Consulter le dossier d'investigation"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 text-slate-500 text-xs flex items-center justify-between">
          <span>Affichage de <strong>{filtered.length}</strong> sur <strong>{signals.length}</strong> signalements sanitaires</span>
          <span className="text-[11px] text-slate-400">Suivi en temps réel de la pharmacovigilance</span>
        </div>
      </div>
    </div>
  );
};
