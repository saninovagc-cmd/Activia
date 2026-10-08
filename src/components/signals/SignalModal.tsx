'use client';

import React, { useState } from 'react';
import { SignalItem, SignalType, SignalSeverity } from '@/types';
import { useApp } from '@/context/AppContext';
import { X, AlertTriangle, FlaskConical, User, ShieldAlert } from 'lucide-react';

interface SignalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<SignalItem>) => void;
}

export const SignalModal: React.FC<SignalModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const { allUsers, currentUser, showToast } = useApp();

  const [formData, setFormData] = useState<Partial<SignalItem>>({
    reporter_name: '',
    reporter_type: 'Médecin Hospitalier',
    product_name: '',
    batch_number: '',
    manufacturer: '',
    signal_type: 'MAPI',
    severity: 'Grave',
    description: '',
    manager_id: currentUser.id,
    receipt_date: new Date().toISOString().split('T')[0],
    sample_taken: false,
    sample_code: '',
    lab_name: 'Laboratoire National de Contrôle des Médicaments (LNAM)'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_name || !formData.reporter_name || !formData.description) {
      showToast('error', 'Veuillez renseigner le produit, le déclarant et la description de l’incident.');
      return;
    }
    onSave(formData);
    showToast('success', `Signalement enregistré pour le produit "${formData.product_name}".`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Enregistrer un Signalement Sanitaire / Alerte
              </h2>
              <p className="text-xs text-slate-500">
                Notification officielle de pharmacovigilance, MAPI ou défaut qualité
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Declarant info */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Origine de la déclaration</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Nom du déclarant / Structure *</label>
                <input
                  type="text"
                  required
                  value={formData.reporter_name || ''}
                  onChange={e => setFormData({ ...formData, reporter_name: e.target.value })}
                  placeholder="Ex: Dr. Diallo - CHU du Point G"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Catégorie de déclarant *</label>
                <select
                  value={formData.reporter_type}
                  onChange={e => setFormData({ ...formData, reporter_type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Médecin Hospitalier">Médecin Hospitalier</option>
                  <option value="Pharmacien d’Officine">Pharmacien d’Officine</option>
                  <option value="Centre de Santé / Dispensaire">Centre de Santé / Dispensaire</option>
                  <option value="Point Focal Vigilance">Point Focal Vigilance</option>
                  <option value="Fabricant / Titulaire AMM">Fabricant / Titulaire AMM</option>
                  <option value="Patient / Usager">Patient / Usager</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product & Lot */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Produit de santé incriminé</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1 md:col-span-2">
                <label className="font-semibold text-slate-700">DCI / Spécialité commerciale *</label>
                <input
                  type="text"
                  required
                  value={formData.product_name || ''}
                  onChange={e => setFormData({ ...formData, product_name: e.target.value })}
                  placeholder="Ex: Paracétamol Sirop 120mg/5ml"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">N° de Lot *</label>
                <input
                  type="text"
                  required
                  value={formData.batch_number || ''}
                  onChange={e => setFormData({ ...formData, batch_number: e.target.value })}
                  placeholder="Ex: LOT-2025-08"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Fabricant / Laboratoire détenteur</label>
              <input
                type="text"
                value={formData.manufacturer || ''}
                onChange={e => setFormData({ ...formData, manufacturer: e.target.value })}
                placeholder="Ex: Pharma International SA"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              />
            </div>
          </div>

          {/* Incident Type & Severity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Type de Signalement *</label>
              <select
                value={formData.signal_type}
                onChange={e => setFormData({ ...formData, signal_type: e.target.value as SignalType })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="MAPI">MAPI (Manifestations Post-Vaccinales Indésirables)</option>
                <option value="Défaut qualité">Défaut de Qualité (aspect, précipité, packaging)</option>
                <option value="Effet indésirable grave">Effet Indésirable Grave (EIG / Hospitalisation)</option>
                <option value="Produit falsifié / illicite">Produit falsifié / Circuit illicite</option>
                <option value="Erreur médicamenteuse">Erreur médicamenteuse (étiquetage, posologie)</option>
                <option value="Rupture de stock">Tension d'approvisionnement critique</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Niveau de Gravité *</label>
              <select
                value={formData.severity}
                onChange={e => setFormData({ ...formData, severity: e.target.value as SignalSeverity })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold"
              >
                <option value="Critique">Critique (Pronostic vital / Rappel urgent)</option>
                <option value="Grave">Grave (Hospitalisation / Atteinte d'organe)</option>
                <option value="Modérée">Modérée (Nécessite investigation)</option>
                <option value="Faible">Faible (Mineur sans conséquence clinique)</option>
              </select>
            </div>
          </div>

          {/* Sampling & Laboratory */}
          <div className="p-3.5 bg-purple-50/60 border border-purple-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sample_chk"
                checked={Boolean(formData.sample_taken)}
                onChange={e => setFormData({ ...formData, sample_taken: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <label htmlFor="sample_chk" className="font-bold text-purple-900 cursor-pointer">
                Prélèvement d’échantillons physiques effectué pour analyse de laboratoire
              </label>
            </div>

            {formData.sample_taken && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Code scellé / Réf. Échantillon</label>
                  <input
                    type="text"
                    value={formData.sample_code || ''}
                    onChange={e => setFormData({ ...formData, sample_code: e.target.value })}
                    placeholder="Ex: ECH-2026-042"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Laboratoire destinataire</label>
                  <input
                    type="text"
                    value={formData.lab_name || ''}
                    onChange={e => setFormData({ ...formData, lab_name: e.target.value })}
                    placeholder="Ex: LNAM"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Description détaillée des faits constatés *</label>
            <textarea
              required
              rows={3}
              value={formData.description || ''}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Décrire les symptômes observés, le délai d’apparition, l’aspect physique du produit incriminé..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          {/* Assignee & Receipt Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Agent en charge de l’investigation</label>
              <select
                value={formData.manager_id}
                onChange={e => setFormData({ ...formData, manager_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                {allUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.full_name} ({u.role_label})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Date de notification</label>
              <input
                type="date"
                value={formData.receipt_date || ''}
                onChange={e => setFormData({ ...formData, receipt_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
            >
              Enregistrer le signalement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
