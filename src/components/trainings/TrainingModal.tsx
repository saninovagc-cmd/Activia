'use client';

import React, { useState } from 'react';
import { TrainingItem } from '@/types';
import { useApp } from '@/context/AppContext';
import { X, GraduationCap, Award, MapPin, Building, User } from 'lucide-react';

interface TrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<TrainingItem>) => void;
}

export const TrainingModal: React.FC<TrainingModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const { showToast } = useApp();
  const [formData, setFormData] = useState<Partial<TrainingItem>>({
    participant_name: '',
    function_title: 'Pharmacien Point Focal',
    structure: 'Centre de Santé de Référence (CSRéf)',
    region: 'Région de Kayes',
    department: 'Direction Régionale de la Santé',
    theme: 'Notification & Investigation des MAPI',
    training_date: new Date().toISOString().split('T')[0],
    trainer_name: 'Dr. Alou Traoré (Expert National)',
    duration_hours: 14,
    result: 'Validé',
    certificate_issued: true,
    certificate_number: `CERT-2026-${Math.floor(100 + Math.random() * 900)}`
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.participant_name || !formData.structure) {
      showToast('error', 'Veuillez renseigner le nom du participant et sa structure.');
      return;
    }
    onSave(formData);
    showToast('success', `Participant "${formData.participant_name}" enregistré avec succès.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Inscrire un Participant au Registre de Formation
              </h2>
              <p className="text-xs text-slate-500">
                Point focal vigilance ou professionnel de santé formé
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
          {/* Identity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Nom et Prénom du Participant *</label>
              <input
                type="text"
                required
                value={formData.participant_name || ''}
                onChange={e => setFormData({ ...formData, participant_name: e.target.value })}
                placeholder="Ex: Dr. Mariam Coulibaly"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Fonction / Titre</label>
              <input
                type="text"
                value={formData.function_title || ''}
                onChange={e => setFormData({ ...formData, function_title: e.target.value })}
                placeholder="Ex: Pharmacien Chef de District"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              />
            </div>
          </div>

          {/* Structure & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Structure sanitaire de rattachement *</label>
              <input
                type="text"
                required
                value={formData.structure || ''}
                onChange={e => setFormData({ ...formData, structure: e.target.value })}
                placeholder="Ex: Hôpital Régional de Sikasso"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Région Sanitaire</label>
              <input
                type="text"
                value={formData.region || ''}
                onChange={e => setFormData({ ...formData, region: e.target.value })}
                placeholder="Ex: Région de Sikasso"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              />
            </div>
          </div>

          {/* Theme & Trainer */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Thématique du Module de Formation *</label>
            <select
              value={formData.theme}
              onChange={e => setFormData({ ...formData, theme: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
            >
              <option value="Notification & Investigation des MAPI">Notification & Investigation des MAPI</option>
              <option value="Bonnes Pratiques de Distribution (BPD)">Bonnes Pratiques de Distribution (BPD)</option>
              <option value="Gestion Sécurisée des Déchets Pharmaceutiques">Gestion Sécurisée des Déchets Pharmaceutiques</option>
              <option value="Détection des Produits Médicaux Falsifiés">Détection des Produits Médicaux Falsifiés</option>
              <option value="Pharmacovigilance & Notification des Effets Indésirables">Pharmacovigilance & Notification des Effets Indésirables</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1 md:col-span-2">
              <label className="font-semibold text-slate-700">Formateur / Expert</label>
              <input
                type="text"
                value={formData.trainer_name || ''}
                onChange={e => setFormData({ ...formData, trainer_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Durée (heures)</label>
              <input
                type="number"
                min={1}
                value={formData.duration_hours || 14}
                onChange={e => setFormData({ ...formData, duration_hours: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              />
            </div>
          </div>

          {/* Date & Result */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Date de la Session</label>
              <input
                type="date"
                value={formData.training_date || ''}
                onChange={e => setFormData({ ...formData, training_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Résultat de l’Évaluation</label>
              <select
                value={formData.result}
                onChange={e => setFormData({ ...formData, result: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold"
              >
                <option value="Validé">Validé (Admis avec succès)</option>
                <option value="En cours">En cours de validation</option>
                <option value="Ajourné">Ajourné (Session de rattrapage requise)</option>
              </select>
            </div>
          </div>

          {/* Certificate */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="cert_chk"
                checked={Boolean(formData.certificate_issued)}
                onChange={e => setFormData({ ...formData, certificate_issued: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="cert_chk" className="font-bold text-slate-800 cursor-pointer">
                Attestation officielle de formation continue délivrée
              </label>
            </div>

            {formData.certificate_issued && (
              <div className="space-y-1 pt-1">
                <label className="font-semibold text-slate-700">Numéro de Certificat / Attestation</label>
                <input
                  type="text"
                  value={formData.certificate_number || ''}
                  onChange={e => setFormData({ ...formData, certificate_number: e.target.value })}
                  placeholder="CERT-2026-089"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-mono"
                />
              </div>
            )}
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
            >
              Inscrire au registre
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
