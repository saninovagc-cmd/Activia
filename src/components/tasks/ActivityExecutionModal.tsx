'use client';

import React, { useState, useEffect } from 'react';
import { Activity, ActivityStatus } from '@/types';
import { useApp } from '@/context/AppContext';
import { downloadSampleDocument } from '@/lib/downloadUtils';
import { 
  X, 
  CheckCircle, 
  Clock, 
  FileText, 
  Upload, 
  Download, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';

interface ActivityExecutionModalProps {
  activity: Activity | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ActivityExecutionModal: React.FC<ActivityExecutionModalProps> = ({
  activity,
  isOpen,
  onClose,
}) => {
  const { 
    currentUser, 
    updateActivity, 
    addDocumentToActivity, 
    addCommentToActivity, 
    showToast 
  } = useApp();

  const [status, setStatus] = useState<ActivityStatus>('en_cours');
  const [progress, setProgress] = useState<number>(0);
  const [commentText, setCommentText] = useState('');
  
  // Deliverable upload state
  const [showAddDoc, setShowAddDoc] = useState(false);
  const [deliverableName, setDeliverableName] = useState('');
  const [deliverableType, setDeliverableType] = useState<'PDF' | 'Word' | 'Excel' | 'Image'>('PDF');

  useEffect(() => {
    if (activity) {
      setStatus(activity.status);
      setProgress(activity.progress_percentage || 0);
      setCommentText('');
      setShowAddDoc(false);
      setDeliverableName('');
    }
  }, [activity, isOpen]);

  if (!isOpen || !activity) return null;

  const handleAddDeliverable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverableName.trim()) return;

    const ext = deliverableType === 'PDF' ? '.pdf' : deliverableType === 'Word' ? '.docx' : deliverableType === 'Excel' ? '.xlsx' : '.png';
    const finalName = deliverableName.trim().toLowerCase().endsWith(ext)
      ? deliverableName.trim()
      : `${deliverableName.trim()}${ext}`;

    addDocumentToActivity(activity.id, {
      name: finalName,
      file_type: deliverableType,
      size_kb: Math.floor(Math.random() * 1500) + 250,
    });

    showToast('success', `Livrable "${finalName}" déposé et rattaché à l'activité.`);
    setDeliverableName('');
    setShowAddDoc(false);
  };

  const handleSaveProgress = (e: React.FormEvent) => {
    e.preventDefault();

    const isFinished = status === 'termine' || progress === 100;
    const finalStatus = isFinished ? 'termine' : status;
    const finalProgress = isFinished ? 100 : progress;

    updateActivity(activity.id, {
      status: finalStatus,
      progress_percentage: finalProgress,
      completed_at: isFinished ? new Date().toISOString().split('T')[0] : undefined,
    });

    if (commentText.trim()) {
      addCommentToActivity(activity.id, commentText.trim());
    }

    showToast('success', `Avancement de l'activité ${activity.code} mis à jour (${finalProgress}% • ${finalStatus}).`);
    onClose();
  };

  const isOverdue = new Date(activity.due_date).getTime() < Date.now() && activity.status !== 'termine';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {activity.code}
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                {activity.department}
              </span>
            </div>
            <h2 className="text-base font-black text-slate-900 mt-1">
              {activity.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSaveProgress} className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Metadata banner */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-500 font-medium block text-[10px] uppercase">Responsable assigné</span>
              <strong className="text-slate-900">{activity.manager_name}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium block text-[10px] uppercase">Date d'échéance</span>
              <span className={`font-semibold ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-800'}`}>
                {activity.due_date} {isOverdue && '(En retard)'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block text-[10px] uppercase">Priorité</span>
              <span className="font-bold text-slate-800 uppercase">{activity.priority}</span>
            </div>
          </div>

          {/* Section 1: Statut & Niveau d'avancement */}
          <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <span className="w-2 h-3.5 rounded-full bg-blue-600" />
              1. Statut & Niveau d'Avancement Opérationnel
            </h3>

            {/* Statut selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {[
                { val: 'a_faire', label: 'À faire', bg: 'bg-slate-100 text-slate-700 border-slate-300' },
                { val: 'en_cours', label: 'En cours', bg: 'bg-blue-50 text-blue-800 border-blue-300' },
                { val: 'en_attente', label: 'En attente', bg: 'bg-amber-50 text-amber-800 border-amber-300' },
                { val: 'termine', label: 'Terminé / Conforme', bg: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
              ].map(st => (
                <button
                  key={st.val}
                  type="button"
                  onClick={() => {
                    setStatus(st.val as ActivityStatus);
                    if (st.val === 'termine') setProgress(100);
                  }}
                  className={`p-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    status === st.val
                      ? `${st.bg} ring-2 ring-blue-600 shadow-xs`
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Avancement Slider */}
            <div className="pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  Niveau d'Avancement :
                </label>
                <span className="text-base font-black font-mono text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                  {progress}%
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progress}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setProgress(val);
                  if (val === 100) setStatus('termine');
                  else if (val > 0 && status === 'a_faire') setStatus('en_cours');
                }}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />

              <div className="flex items-center justify-between gap-1 text-[10px] text-slate-500 font-semibold pt-1">
                <button
                  type="button"
                  onClick={() => setProgress(25)}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200"
                >
                  25% Démarrage
                </button>
                <button
                  type="button"
                  onClick={() => setProgress(50)}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200"
                >
                  50% Mi-parcours
                </button>
                <button
                  type="button"
                  onClick={() => setProgress(75)}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200"
                >
                  75% Finalisation
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProgress(100);
                    setStatus('termine');
                  }}
                  className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold"
                >
                  100% Terminé
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Livrables de l'activité */}
          <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <span className="w-2 h-3.5 rounded-full bg-emerald-600" />
                2. Livrables & Documents Justificatifs ({activity.documents?.length || 0})
              </h3>

              <button
                type="button"
                onClick={() => setShowAddDoc(!showAddDoc)}
                className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
              >
                {showAddDoc ? 'Fermer' : '+ Ajouter un livrable'}
              </button>
            </div>

            {/* Formulaire ajout livrable */}
            {showAddDoc && (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-300 space-y-3">
                <p className="text-[11px] font-bold text-slate-700">Dépôt d'un nouveau livrable / document officiel :</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      required
                      placeholder="Intitulé du livrable (ex : Rapport d'inspection PV.pdf)"
                      value={deliverableName}
                      onChange={(e) => setDeliverableName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <select
                      value={deliverableType}
                      onChange={(e) => setDeliverableType(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-800"
                    >
                      <option value="PDF">Format PDF</option>
                      <option value="Word">Format Word</option>
                      <option value="Excel">Tableur Excel</option>
                      <option value="Image">Photo / Scan</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddDoc(false)}
                    className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleAddDeliverable}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Déposer le livrable
                  </button>
                </div>
              </div>
            )}

            {/* Liste des livrables existants */}
            {activity.documents && activity.documents.length > 0 ? (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                {activity.documents.map((doc) => (
                  <div key={doc.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50">
                    <div className="min-w-0 pr-2">
                      <p className="font-semibold text-slate-900 truncate">{doc.name}</p>
                      <p className="text-[10px] text-slate-500">
                        {doc.file_type} • {doc.size_kb} KB • Déposé le {doc.uploaded_at} par {doc.uploaded_by_name}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        downloadSampleDocument(doc.name, activity.code, 'activite');
                        showToast('info', `Téléchargement du livrable "${doc.name}" initié.`);
                      }}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-600" />
                      Télécharger
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-1">
                Aucun livrable déposé pour le moment. Cliquez sur « + Ajouter un livrable » pour joindre votre rapport ou justificatif.
              </p>
            )}
          </div>

          {/* Section 3: Notes d'exécution & Observations */}
          <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <span className="w-2 h-3.5 rounded-full bg-slate-700" />
              3. Observations & Note d'Exécution d'Étape
            </h3>

            <textarea
              rows={3}
              placeholder="Rédigez ici votre compte-rendu d'exécution, actions entreprises ou difficultés rencontrées..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />

            {/* Commentaires existants */}
            {activity.comments && activity.comments.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Historique des comptes-rendus :
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {activity.comments.map((c) => (
                    <div key={c.id} className="p-2 bg-slate-50 rounded-lg text-xs border border-slate-100">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                        <strong className="text-slate-800">{c.author_name} ({c.author_role})</strong>
                        <span>{c.created_at}</span>
                      </div>
                      <p className="text-slate-700">{c.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 cursor-pointer transition-colors"
            >
              Enregistrer l'avancement & les livrables
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
