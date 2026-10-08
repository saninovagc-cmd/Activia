'use client';

import React, { useState } from 'react';
import { Folder, FolderStatus } from '@/types';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/ui/Badge';
import { FolderTimeline } from './FolderTimeline';
import { downloadSampleDocument } from '@/lib/downloadUtils';
import { 
  X, 
  Calendar, 
  User, 
  Building, 
  FileText, 
  Paperclip, 
  History, 
  CheckCircle2, 
  AlertCircle,
  Download,
  Send,
  Award,
  Plus,
  MessageSquare,
  Building2,
  ExternalLink
} from 'lucide-react';

import { MultiDeliverableUploadZone, PendingDeliverable } from '@/components/common/MultiDeliverableUploadZone';

interface FolderDetailModalProps {
  folder: Folder | null;
  onClose: () => void;
  onViewEstablishment?: (etabName: string) => void;
}

export const FolderDetailModal: React.FC<FolderDetailModalProps> = ({ 
  folder, 
  onClose,
  onViewEstablishment
}) => {
  const { 
    advanceFolderStep, 
    updateFolder, 
    auditLogs, 
    currentUser, 
    addCommentToFolder, 
    addDocumentToFolder,
    addOutgoingMail,
    establishments,
    showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'general' | 'workflow' | 'documents' | 'history' | 'comments'>('general');
  const [decisionNotes, setDecisionNotes] = useState(folder?.decision_notes || '');
  const [newDecision, setNewDecision] = useState<'Favorable' | 'Défavorable' | 'Avis avec réserves' | 'En attente'>(
    (folder?.decision as any) || 'Favorable'
  );
  
  // Comment state
  const [commentInput, setCommentInput] = useState('');

  // Upload document state
  const [showDocUpload, setShowDocUpload] = useState(false);
  const [pendingFolderDocs, setPendingFolderDocs] = useState<PendingDeliverable[]>([]);

  if (!folder) return null;

  const folderLogs = auditLogs.filter(l => l.entity_id === folder.folder_number);

  // Check matching establishment
  const matchedEtab = establishments.find(e => 
    e.name.toLowerCase().includes(folder.structure.toLowerCase()) || 
    folder.structure.toLowerCase().includes(e.name.toLowerCase())
  );

  const handleRecordDecision = (e: React.FormEvent) => {
    e.preventDefault();
    updateFolder(folder.id, {
      decision: newDecision,
      decision_date: new Date().toISOString().split('T')[0],
      decision_notes: decisionNotes,
      status: newDecision === 'Défavorable' ? 'rejete' : 'decision'
    });
    showToast(`Décision "${newDecision}" consignée au dossier ${folder.folder_number}`, 'success');
  };

  const handleCreateNotificationMail = () => {
    const newMail = addOutgoingMail({
      recipient: `${folder.applicant} — ${folder.structure}`,
      reference: `NOTIF-${folder.folder_number}`,
      subject: `Notification de décision : ${folder.folder_type} (${newDecision || folder.decision || 'Avis officiel'})`,
      mail_type: 'Notification Réglementaire',
      status: 'en_validation',
      document_name: `Arrete_Notification_${folder.folder_number}.pdf`
    });
    showToast(`Courrier de notification sortant ${newMail.mail_number} généré`, 'success');
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    addCommentToFolder(folder.id, commentInput.trim());
    setCommentInput('');
  };

  const handleSaveAllFolderDocs = () => {
    if (pendingFolderDocs.length === 0) {
      showToast('Veuillez ajouter au moins une pièce', 'warning');
      return;
    }

    pendingFolderDocs.forEach(item => {
      addDocumentToFolder(folder.id, {
        name: item.name.trim() || 'Document sans nom',
        size_kb: item.compressedSizeKb,
        original_size_kb: item.originalSizeKb,
        file_type: item.fileType,
        data_url: item.dataUrl,
      });
    });

    setPendingFolderDocs([]);
    setShowDocUpload(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                {folder.folder_number}
              </span>
              <span className="text-xs text-slate-500 font-semibold">{folder.folder_type}</span>
              <Badge priority={folder.priority} />
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-800 uppercase">
                {folder.status}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-2">
              {folder.structure} — {folder.applicant}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5 Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-white overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'general' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Informations générales
          </button>
          <button
            onClick={() => setActiveTab('workflow')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'workflow' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Workflow & Jalons
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'documents' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Pièces & GED ({folder.documents?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'comments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Notes & Discussion ({folder.comments?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Historique & Audit ({folderLogs.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-800 text-xs">
          {/* TAB 1: General */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Linked Establishment Ribbon if found */}
              {matchedEtab && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-5 h-5 text-emerald-700" />
                    <div>
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                        Établissement Répertorié Associé
                      </span>
                      <strong className="text-slate-900">{matchedEtab.name}</strong> ({matchedEtab.code}) — {matchedEtab.city}
                    </div>
                  </div>
                  {onViewEstablishment && (
                    <button
                      onClick={() => onViewEstablishment(matchedEtab.name)}
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-md transition-colors flex items-center gap-1"
                    >
                      Voir la fiche <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500">Structure / Entreprise</span>
                  <p className="font-semibold text-slate-900 mt-1">{folder.structure}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500">Demandeur / Représentant</span>
                  <p className="font-semibold text-slate-900 mt-1">{folder.applicant}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500">Évaluateur Pilote</span>
                  <p className="font-semibold text-slate-900 mt-1">{folder.manager_name}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500">Date de dépôt officiel</span>
                  <p className="font-semibold text-slate-900 mt-1">{folder.receipt_date}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500">Date limite réglementaire (SLA)</span>
                  <p className="font-semibold text-rose-600 mt-1">{folder.due_date}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500">Décision Finale</span>
                  <p className="font-bold text-slate-900 mt-1">{folder.decision || 'En cours d’instruction'}</p>
                </div>
              </div>

              {/* Formulaire d'enregistrement de décision */}
              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-blue-600" />
                    Prise de Décision Administrative & Avis Technique
                  </h4>
                  {folder.decision && folder.decision !== 'En attente' && (
                    <button
                      type="button"
                      onClick={handleCreateNotificationMail}
                      className="px-3 py-1 bg-white hover:bg-slate-100 text-blue-700 border border-blue-300 rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Émettre lettre de notification
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Avis / Décision</label>
                    <select
                      value={newDecision}
                      onChange={(e) => setNewDecision(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                    >
                      <option value="Favorable">Favorable (Agrément / Autorisation accordée)</option>
                      <option value="Avis avec réserves">Avis avec réserves (Modifications requises)</option>
                      <option value="Défavorable">Défavorable (Rejet du dossier)</option>
                      <option value="En attente">En attente de pièces</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Motifs & Réserves</label>
                    <input
                      type="text"
                      placeholder="Motifs de la décision ou réserves émises..."
                      value={decisionNotes}
                      onChange={(e) => setDecisionNotes(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleRecordDecision}
                    className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs transition-colors"
                  >
                    Consigner la décision officielle
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Workflow */}
          {activeTab === 'workflow' && (
            <div className="space-y-4">
              <FolderTimeline
                currentStatus={folder.status}
                onAdvance={() => advanceFolderStep(folder.id)}
              />

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900">Chaîne Réglementaire d'Instruction</h4>
                <p className="text-slate-600 leading-relaxed">
                  Le dossier suit la chaîne réglementaire : Dépôt → Réception → Vérification de complétude → Traitement technique par l’évaluateur → Validation hiérarchique → Décision officielle → Notification au demandeur → Clôture et archivage.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Documents */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">Pièces Justificatives Déposées</h4>
                  <p className="text-[11px] text-slate-500">Documents versés au dossier et archivés dans la GED</p>
                </div>
                <button
                  onClick={() => setShowDocUpload(!showDocUpload)}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs cursor-pointer text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showDocUpload ? 'Fermer' : 'Verser des pièces (+)'}</span>
                </button>
              </div>

              {/* Inline Upload Form */}
              {showDocUpload && (
                <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-slate-900 text-xs">
                      Versement de pièces au dossier (sélectionnez vos fichiers ou cliquez sur « + » pour en ajouter d&apos;autres) :
                    </h5>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                      Compression automatique
                    </span>
                  </div>

                  <MultiDeliverableUploadZone
                    items={pendingFolderDocs}
                    onChange={setPendingFolderDocs}
                    helperText="Récépissés, fiches techniques, certificats. Cliquez sur « + » pour ajouter autant de pièces que souhaité."
                  />

                  {pendingFolderDocs.length > 0 && (
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => {
                          setShowDocUpload(false);
                          setPendingFolderDocs([]);
                        }}
                        className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveAllFolderDocs}
                        className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Verser les {pendingFolderDocs.length} pièce{pendingFolderDocs.length > 1 ? 's' : ''} au dossier</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Document List */}
              <div className="space-y-2">
                {(!folder.documents || folder.documents.length === 0) ? (
                  <div className="p-8 text-center text-slate-400 border border-dashed rounded-xl">
                    Aucun document déposé pour ce dossier. Cliquez sur &laquo; Verser une pièce &raquo; pour en ajouter.
                  </div>
                ) : (
                  folder.documents.map((doc) => (
                    <div key={doc.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                          <Paperclip className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{doc.name}</p>
                          <p className="text-[10px] text-slate-400">{doc.size_kb} KB • Déposé le {doc.uploaded_at}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => downloadSampleDocument(doc.name, folder.folder_number, folder.folder_type)}
                        className="px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-md flex items-center gap-1 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Télécharger</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Comments & Discussion */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-900">Fil de Discussion Technique & Instructions</h4>
                <p className="text-[11px] text-slate-500">Échanges internes entre évaluateurs et chef de service</p>
              </div>

              {/* Post comment form */}
              <form onSubmit={handlePostComment} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <textarea
                  rows={2}
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Ajouter une instruction, remarque ou observation sur le dossier..."
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Publier l'observation
                  </button>
                </div>
              </form>

              {/* Comment stream */}
              <div className="space-y-2.5">
                {(!folder.comments || folder.comments.length === 0) ? (
                  <p className="text-slate-400 italic text-center py-6">Aucun commentaire technique pour ce dossier.</p>
                ) : (
                  folder.comments.map((com) => (
                    <div key={com.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{com.author_name} ({com.author_role})</span>
                        <span className="text-[10px] text-slate-400 font-mono">{com.created_at}</span>
                      </div>
                      <p className="text-slate-700 whitespace-pre-line">{com.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: History */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div>
                <h4 className="font-bold text-slate-900">Journal d'Audit du Dossier</h4>
                <p className="text-[11px] text-slate-500">Traçabilité légale infalsifiable de toutes les étapes et décisions</p>
              </div>

              {folderLogs.length === 0 ? (
                <p className="text-slate-500 italic">Aucun enregistrement d'audit pour ce dossier.</p>
              ) : (
                folderLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{log.user_name} ({log.user_role})</span>
                      <span className="text-[10px] text-slate-400">{log.created_at}</span>
                    </div>
                    <p className="text-slate-700 mt-1">{log.details}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Dossier d’instruction réglementaire • Archivage certifié
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

