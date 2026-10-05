'use client';

import React, { useState } from 'react';
import { VigilanceAlert } from '@/types';
import { useApp } from '@/context/AppContext';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Plus, 
  Clock, 
  User, 
  Search,
  Filter,
  FileWarning
} from 'lucide-react';

interface AlertsListProps {
  alerts: VigilanceAlert[];
  canManage: boolean;
}

export const AlertsList: React.FC<AlertsListProps> = ({ alerts, canManage }) => {
  const { addAlert, closeAlert } = useApp();
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'cloturee'>('active');
  const [showNewModal, setShowNewModal] = useState(false);

  // New alert form
  const [source, setSource] = useState('OMS / Système Mondial de Surveillance');
  const [product, setProduct] = useState('');
  const [nature, setNature] = useState('Produit Falsifié / Contrefaçon');
  const [riskLevel, setRiskLevel] = useState<'Faible' | 'Moyen' | 'Élevé' | 'Urgent'>('Urgent');
  const [description, setDescription] = useState('');
  const [actionsRequired, setActionsRequired] = useState('');

  const filtered = alerts.filter(a => {
    if (filterStatus === 'all') return true;
    return a.status === filterStatus;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !description) return;
    addAlert({
      source,
      product_name: product,
      nature,
      risk_level: riskLevel,
      description,
      actions_required: actionsRequired
    });
    setShowNewModal(false);
    setProduct('');
    setDescription('');
    setActionsRequired('');
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'Urgent':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white animate-pulse">URGENT</span>;
      case 'Élevé':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">Élevé</span>;
      case 'Moyen':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">Moyen</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">Faible</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filterStatus === 'active' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Alertes actives ({alerts.filter(a => a.status === 'active').length})
          </button>
          <button
            onClick={() => setFilterStatus('cloturee')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filterStatus === 'cloturee' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Alertes clôturées ({alerts.filter(a => a.status === 'cloturee').length})
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              filterStatus === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Toutes ({alerts.length})
          </button>
        </div>

        {canManage && (
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Déclencher une Alerte Sanitaire</span>
          </button>
        )}
      </div>

      {/* Alert list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl border border-slate-200 text-slate-400">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
            Aucune alerte sanitaire active pour le moment.
          </div>
        ) : (
          filtered.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border transition-all ${
                alert.status === 'active'
                  ? 'bg-rose-50/50 border-rose-200 shadow-xs'
                  : 'bg-white border-slate-200 opacity-75'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-rose-100 pb-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-rose-900 bg-rose-100 px-2 py-0.5 rounded border border-rose-200">
                    {alert.alert_number}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {alert.product_name}
                  </h3>
                  {getRiskBadge(alert.risk_level)}
                  <span className="text-xs text-slate-500 font-medium">({alert.nature})</span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">Déclenchée le {alert.alert_date}</span>
                  {alert.status === 'active' && canManage && (
                    <button
                      onClick={() => closeAlert(alert.id)}
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-md transition-colors"
                    >
                      Clôturer l'alerte
                    </button>
                  )}
                  {alert.status === 'cloturee' && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-slate-200 text-slate-700 rounded-full">
                      Clôturée le {alert.closing_date}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-semibold text-slate-700 block mb-1">Description du risque :</span>
                  <p className="text-slate-600 bg-white/80 p-2.5 rounded-lg border border-slate-200">
                    {alert.description}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-slate-700 block mb-1">Mesures & Actions requises :</span>
                  <p className="text-slate-700 bg-amber-50/70 p-2.5 rounded-lg border border-amber-200 font-medium">
                    {alert.actions_required}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>Source : <strong>{alert.source}</strong></span>
                <span>Responsable de la cellule de crise : <strong>{alert.manager_name}</strong></span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for new alert */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileWarning className="w-5 h-5 text-rose-600" />
                Déclenchement d’une Alerte Sanitaire Majeure
              </h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Produit ou substance concernée *</label>
                  <input
                    type="text"
                    required
                    value={product}
                    onChange={e => setProduct(e.target.value)}
                    placeholder="Ex: Médicament contrefait / Sirop toxique"
                    className="w-full px-3 py-1.5 border rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Niveau de risque *</label>
                  <select
                    value={riskLevel}
                    onChange={e => setRiskLevel(e.target.value as any)}
                    className="w-full px-3 py-1.5 border rounded-lg bg-white font-bold"
                  >
                    <option value="Urgent">URGENT (Danger immédiat de mort)</option>
                    <option value="Élevé">Élevé (Atteinte sévère à la santé)</option>
                    <option value="Moyen">Moyen (Défaut réglementaire substantiel)</option>
                    <option value="Faible">Faible (Précaution)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Source d’information</label>
                  <input
                    type="text"
                    value={source}
                    onChange={e => setSource(e.target.value)}
                    className="w-full px-3 py-1.5 border rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Nature de l’alerte</label>
                  <input
                    type="text"
                    value={nature}
                    onChange={e => setNature(e.target.value)}
                    className="w-full px-3 py-1.5 border rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Description détaillée de la menace *</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Circonstances, numéros de lot suspects, pays d’origine..."
                  className="w-full px-3 py-1.5 border rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Mesures immédiates requises *</label>
                <textarea
                  rows={2}
                  required
                  value={actionsRequired}
                  onChange={e => setActionsRequired(e.target.value)}
                  placeholder="Quarantaine immédiate, contrôle aux frontières, communiqué de presse..."
                  className="w-full px-3 py-1.5 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3 py-1.5 border rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Diffuser l’alerte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
