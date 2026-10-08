'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { FolderType, PriorityLevel } from '@/types';
import { X, Save, FolderPlus } from 'lucide-react';

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FolderModal: React.FC<FolderModalProps> = ({ isOpen, onClose }) => {
  const { allUsers, currentUser, addFolder } = useApp();

  const [folderType, setFolderType] = useState<FolderType>('Autorisation d’achat');
  const [applicant, setApplicant] = useState('');
  const [structure, setStructure] = useState('');
  const [managerId, setManagerId] = useState(currentUser.id);
  const [priority, setPriority] = useState<PriorityLevel>('moyenne');
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0]);
  const [observations, setObservations] = useState('');

  const folderTypes: FolderType[] = [
    'Autorisation d’achat',
    'Agrément Établissement',
    'Publicité & Promotion',
    'Enregistrement PGR',
    'Revue PSUR / PBRER',
    'Essai Clinique & EIG',
    'Élimination Déchets',
    'Autre Dossier Technique'
  ];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicant.trim() || !structure.trim()) return;

    addFolder({
      folder_type: folderType,
      applicant,
      structure,
      manager_id: managerId,
      priority,
      receipt_date: receiptDate,
      due_date: dueDate,
      observations,
      status: 'depot',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Enregistrer un Nouveau Dossier / Demande</h3>
              <p className="text-xs text-slate-500">Ouverture d’une procédure d’instruction réglementaire</p>
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Type de dossier ou demande <span className="text-rose-500">*</span>
            </label>
            <select
              value={folderType}
              onChange={(e) => setFolderType(e.target.value as FolderType)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900"
            >
              {folderTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Structure / Établissement pétitionnaire <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Hôpital Universitaire, Laboratoire Sandoz..."
                value={structure}
                onChange={(e) => setStructure(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nom du demandeur / Responsable légal <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Dr. Martin, Pharmacien Responsable..."
                value={applicant}
                onChange={(e) => setApplicant(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Évaluateur pilote désigné
              </label>
              <select
                value={managerId}
                onChange={(e) => setManagerId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900"
              >
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.role_label})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Niveau d'urgence (Priorité)
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900"
              >
                <option value="basse">Basse</option>
                <option value="moyenne">Moyenne</option>
                <option value="haute">Haute</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date de dépôt officiel
              </label>
              <input
                type="date"
                required
                value={receiptDate}
                onChange={(e) => setReceiptDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date limite réglementaire (SLA) <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observations & Pièces fournies
            </label>
            <textarea
              rows={2}
              placeholder="Spécifiez la liste des pièces justificatives fournies ou consignes particulières..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              Ouvrir le dossier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

