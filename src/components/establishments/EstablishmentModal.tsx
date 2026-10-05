'use client';

import React, { useState, useEffect } from 'react';
import { Establishment, EstablishmentType, EstablishmentStatus } from '@/types';
import { useApp } from '@/context/AppContext';
import { X, Building2, MapPin, User, FileText, Phone, Mail, Calendar } from 'lucide-react';

interface EstablishmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Establishment>) => void;
  establishment?: Establishment | null;
}

export const EstablishmentModal: React.FC<EstablishmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  establishment
}) => {
  const { showToast } = useApp();
  const [formData, setFormData] = useState<Partial<Establishment>>({
    name: '',
    establishment_type: 'Officine',
    owner: '',
    responsible_pharmacist: '',
    address: '',
    city: '',
    department: 'Direction Régionale du Centre',
    phone: '',
    email: '',
    status: 'Actif',
    authorization_number: '',
    auth_date: new Date().toISOString().split('T')[0],
    expiry_date: ''
  });

  useEffect(() => {
    if (establishment) {
      setFormData(establishment);
    } else {
      setFormData({
        name: '',
        establishment_type: 'Officine',
        owner: '',
        responsible_pharmacist: '',
        address: '',
        city: '',
        department: 'Direction Régionale du Centre',
        phone: '',
        email: '',
        status: 'Actif',
        authorization_number: `AUT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        auth_date: new Date().toISOString().split('T')[0],
        expiry_date: new Date(Date.now() + 365 * 5 * 86400000).toISOString().split('T')[0]
      });
    }
  }, [establishment, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.responsible_pharmacist || !formData.city) {
      showToast('error', 'Veuillez renseigner au minimum la raison sociale, le pharmacien responsable et la ville.');
      return;
    }
    onSave(formData);
    showToast('success', establishment ? 'Fiche établissement mise à jour avec succès.' : 'Nouvel établissement créé avec succès.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {establishment ? `Modifier ${establishment.name}` : 'Enregistrer un Établissement'}
              </h2>
              <p className="text-xs text-slate-500">
                Référentiel des structures pharmaceutiques et biomédicales autorisées
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
          {/* Identity Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Nom / Raison Sociale *</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Pharmacie de la Victoire"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Type d’Établissement *</label>
              <select
                value={formData.establishment_type}
                onChange={e => setFormData({ ...formData, establishment_type: e.target.value as EstablishmentType })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="Officine">Officine de Pharmacie</option>
                <option value="Grossiste-Répartiteur">Grossiste-Répartiteur</option>
                <option value="Dépôt Pharmaceutique">Dépôt Pharmaceutique</option>
                <option value="Laboratoire Fabricant">Laboratoire Fabricant</option>
                <option value="Structure Hospitalière">Pharmacie Hospitalière (PUI)</option>
                <option value="Autre">Autre structure</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Pharmacien Responsable / Titulaire *</label>
              <input
                type="text"
                required
                value={formData.responsible_pharmacist || ''}
                onChange={e => setFormData({ ...formData, responsible_pharmacist: e.target.value })}
                placeholder="Ex: Dr. Moussa Traoré"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Propriétaire / Exploitant</label>
              <input
                type="text"
                value={formData.owner || ''}
                onChange={e => setFormData({ ...formData, owner: e.target.value })}
                placeholder="Ex: Dr. Moussa Traoré ou SARL Pharma"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Location & Contact Section */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Localisation & Contacts</p>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Adresse géographique</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Ex: Rue 14, Porte 205, Quartier Médina"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Commune / Ville *</label>
                  <input
                    type="text"
                    required
                    value={formData.city || ''}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Ex: Bamako / Dakar / Abidjan"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Département / Région Sanitaire</label>
                  <input
                    type="text"
                    value={formData.department || ''}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Ex: Direction Régionale de la Santé"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Téléphone de contact</label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+223 20 22 45 80"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Email institutionnel</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@pharmacie-victoire.ml"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Regulatory & Authorization Section */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Agrément & Réglementation</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">N° Agrément / Autorisation *</label>
                <input
                  type="text"
                  required
                  value={formData.authorization_number || ''}
                  onChange={e => setFormData({ ...formData, authorization_number: e.target.value })}
                  placeholder="AUT-2024-MS-0412"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Date d’autorisation</label>
                <input
                  type="date"
                  value={formData.auth_date || ''}
                  onChange={e => setFormData({ ...formData, auth_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Date d’expiration (si applicable)</label>
                <input
                  type="date"
                  value={formData.expiry_date || ''}
                  onChange={e => setFormData({ ...formData, expiry_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-3 space-y-1">
              <label className="font-semibold text-slate-700">Statut Administratif</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as EstablishmentStatus })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="Actif">Actif (Autorisé et en exploitation régulière)</option>
                <option value="En attente">En attente (Dossier d’agrément en cours d’examen)</option>
                <option value="Suspendu">Suspendu (Mesure administrative conservatoire)</option>
                <option value="Fermé">Fermé (Cessation d'activité ou radiation)</option>
              </select>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              {establishment ? 'Enregistrer les modifications' : 'Créer l’établissement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
