'use client';

import React, { useState, useEffect } from 'react';
import { Activity, ActivityStatus, ActivityType, PriorityLevel } from '@/types';
import { useApp } from '@/context/AppContext';
import { X, Save } from 'lucide-react';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityToEdit?: Activity | null;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  onClose,
  activityToEdit,
}) => {
  const { allUsers, currentUser, addActivity, updateActivity } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [activityType, setActivityType] = useState<ActivityType>('Réglementaire');
  const [priority, setPriority] = useState<PriorityLevel>('moyenne');
  const [status, setStatus] = useState<ActivityStatus>('a_faire');
  const [progress, setProgress] = useState(0);
  const [department, setDepartment] = useState('');
  const [managerId, setManagerId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [associatedFolder, setAssociatedFolder] = useState('');

  const departments = [
    'Direction & SI Réglementaire',
    'Vigilances Sanitaires & MAPI',
    'Établissements & Inspections',
    'Réglementation & PGR/PSUR',
    'Laboratoire & Échantillonnage',
    'Promotion Médicale & Essais',
    'Déchets & Autorisations Achat',
    'Bureau du Courrier & Réception'
  ];

  const activityTypes: ActivityType[] = [
    'Réglementaire',
    'Inspection',
    'Vigilance & Alerte',
    'Échantillonnage',
    'Évaluation Dossier',
    'Formation',
    'Réunion Technique',
    'Autre'
  ];

  useEffect(() => {
    if (activityToEdit) {
      setTitle(activityToEdit.title);
      setDescription(activityToEdit.description);
      setActivityType(activityToEdit.activity_type);
      setPriority(activityToEdit.priority);
      setStatus(activityToEdit.status);
      setProgress(activityToEdit.progress_percentage);
      setDepartment(activityToEdit.department);
      setManagerId(activityToEdit.manager_id);
      setStartDate(activityToEdit.start_date);
      setDueDate(activityToEdit.due_date);
      setAssociatedFolder(activityToEdit.associated_folder || '');
    } else {
      setTitle('');
      setDescription('');
      setActivityType('Réglementaire');
      setPriority('moyenne');
      setStatus('a_faire');
      setProgress(0);
      setDepartment(currentUser.department || 'Direction & SI Réglementaire');
      setManagerId(currentUser.id);
      setStartDate(new Date().toISOString().split('T')[0]);
      setDueDate(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
      setAssociatedFolder('');
    }
  }, [activityToEdit, currentUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const manager = allUsers.find(u => u.id === managerId) || currentUser;

    if (activityToEdit) {
      updateActivity(activityToEdit.id, {
        title,
        description,
        activity_type: activityType,
        priority,
        status,
        progress_percentage: progress,
        department,
        manager_id: manager.id,
        manager_name: manager.full_name,
        start_date: startDate,
        due_date: dueDate,
        associated_folder: associatedFolder,
      });
    } else {
      addActivity({
        title,
        description,
        activity_type: activityType,
        priority,
        status,
        progress_percentage: progress,
        department,
        manager_id: manager.id,
        manager_name: manager.full_name,
        start_date: startDate,
        due_date: dueDate,
        associated_folder: associatedFolder,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {activityToEdit ? `Modifier l'activité ${activityToEdit.code}` : 'Créer une nouvelle activité'}
            </h3>
            <p className="text-xs text-slate-500">
              Enregistrement dans le registre centralisé ACTIVIA
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Titre */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Titre de l’activité <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Campagne d'échantillonnage annuel 2026..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description & Objectifs
            </label>
            <textarea
              rows={3}
              placeholder="Détaillez le périmètre technique, les cibles, les normes applicables..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Type & Priorité */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Type de mission <span className="text-rose-500">*</span>
              </label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value as ActivityType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900"
              >
                {activityTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priorité
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

          {/* Département & Responsable */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Service concerné <span className="text-rose-500">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Responsable pilote <span className="text-rose-500">*</span>
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
          </div>

          {/* Statut & Avancement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Statut
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ActivityStatus)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900"
              >
                <option value="a_faire">À faire</option>
                <option value="en_cours">En cours</option>
                <option value="en_attente">En attente</option>
                <option value="termine">Terminé</option>
                <option value="en_retard">En retard</option>
                <option value="annule">Annulé</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pourcentage d’avancement : {progress}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg cursor-pointer accent-blue-600 mt-2"
              />
            </div>
          </div>

          {/* Dates & Dossier associé */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date de début
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date limite (Échéance) <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dossier associé (Réf.)
              </label>
              <input
                type="text"
                placeholder="Ex: DOS-2026-0042"
                value={associatedFolder}
                onChange={(e) => setAssociatedFolder(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          </div>

          {/* Modal Footer */}
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
              {activityToEdit ? 'Enregistrer les modifications' : 'Créer l’activité'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

