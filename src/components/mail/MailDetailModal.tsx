'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IncomingMail, IncomingMailStatus, FolderType } from '@/types';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/ui/Badge';
import { downloadSampleDocument } from '@/lib/downloadUtils';
import { 
  X, 
  Calendar, 
  User, 
  Building, 
  FileText, 
  Paperclip, 
  History, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Download,
  Send,
  FolderArchive,
  ExternalLink
} from 'lucide-react';

interface MailDetailModalProps {
  mail: IncomingMail | null;
  onClose: () => void;
}

export const MailDetailModal: React.FC<MailDetailModalProps> = ({ mail, onClose }) => {
  const router = useRouter();
  const { 
    allUsers, 
    assignIncomingMail, 
    updateIncomingMailStatus, 
    auditLogs,
    createOutgoingResponseMail,
    createFolderFromMail,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'general' | 'workflow' | 'document' | 'history'>('general');
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [selectedFolderType, setSelectedFolderType] = useState<FolderType>('Autorisation d’achat');

  if (!mail) return null;

  const mailLogs = auditLogs.filter(l => l.entity_id === mail.register_number);

  const workflowSteps: { status: IncomingMailStatus; label: string; stepNumber: number; desc: string }[] = [
    { status: 'reception', label: 'Réception', stepNumber: 1, desc: 'Dépôt physique ou numérique au secrétariat' },
    { status: 'enregistrement', label: 'Enregistrement', stepNumber: 2, desc: 'Attribution du numéro chronologique et indexation' },
    { status: 'affectation', label: 'Affectation', stepNumber: 3, desc: 'Attribution au chef de service ou agent évaluateur' },
    { status: 'traitement', label: 'Traitement', stepNumber: 4, desc: 'Instruction technique et rédaction de la réponse' },
    { status: 'validation', label: 'Validation', stepNumber: 5, desc: 'Revue et visa hiérarchique' },
    { status: 'reponse', label: 'Réponse', stepNumber: 6, desc: 'Émission du courrier de réponse officiel' },
    { status: 'cloture', label: 'Clôture', stepNumber: 7, desc: 'Archivage et fin de la procédure' },
  ];

  const currentStepIndex = workflowSteps.findIndex(s => s.status === mail.status);

  const handleCreateResponse = () => {
    createOutgoingResponseMail(mail.id);
  };

  const handleTransformToFolder = () => {
    createFolderFromMail(mail.id, selectedFolderType);
    setShowFolderModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                {mail.register_number}
              </span>
              <span className="text-xs text-slate-500 font-medium">{mail.mail_type}</span>
              <Badge priority={mail.priority} />
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-2">{mail.subject}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
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
            Circuit & Workflow (Étape {currentStepIndex + 1}/7)
          </button>
          <button
            onClick={() => setActiveTab('document')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'document' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Document Scanné
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Historique & Audit ({mailLogs.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-800 text-xs">
          {activeTab === 'general' && (
            <div className="space-y-4">
              {/* Quick Action Ribbon */}
              <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs text-slate-600 font-semibold">Actions inter-services rapides :</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCreateResponse}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Créer courrier réponse</span>
                  </button>
                  <button
                    onClick={() => setShowFolderModal(true)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <FolderArchive className="w-3.5 h-3.5 text-blue-600" />
                    <span>Créer dossier d'instruction</span>
                  </button>
                </div>
              </div>

              {/* Transform to folder popin */}
              {showFolderModal && (
                <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl space-y-3">
                  <h4 className="font-bold text-blue-900">Ouverture d'un dossier réglementaire depuis ce courrier</h4>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Type de dossier à initialiser :</label>
                    <select
                      value={selectedFolderType}
                      onChange={(e) => setSelectedFolderType(e.target.value as any)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                    >
                      <option value="Autorisation d’achat">Autorisation d’achat</option>
                      <option value="Agrément Établissement">Agrément Établissement</option>
                      <option value="Publicité & Promotion">Publicité & Promotion</option>
                      <option value="Enregistrement PGR">Enregistrement PGR</option>
                      <option value="Revue PSUR / PBRER">Revue PSUR / PBRER</option>
                      <option value="Essai Clinique & EIG">Essai Clinique & EIG</option>
                      <option value="Élimination Déchets">Élimination Déchets</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowFolderModal(false)}
                      className="px-3 py-1 bg-white border rounded-lg text-slate-600"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleTransformToFolder}
                      className="px-3.5 py-1 bg-blue-600 text-white rounded-lg font-bold"
                    >
                      Créer le dossier
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500">Expéditeur Officiel</span>
                  <p className="font-semibold text-slate-900 mt-1">{mail.sender}</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">Réf. : {mail.reference}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500">Service concerné</span>
                  <p className="font-semibold text-slate-900 mt-1">{mail.department}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Responsable : {mail.manager_name || 'Non encore affecté'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500">Date de réception</span>
                  <p className="font-semibold text-slate-900 mt-1">{mail.receipt_date}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500">Échéance de traitement</span>
                  <p className="font-semibold text-rose-600 mt-1">{mail.due_date}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500">Dossier lié</span>
                  {mail.linked_folder_number ? (
                    <div 
                      onClick={() => {
                        onClose();
                        router.push('/folders');
                      }}
                      className="cursor-pointer group flex items-center gap-1 mt-1"
                    >
                      <strong className="text-blue-700 group-hover:underline">{mail.linked_folder_number}</strong>
                      <ExternalLink className="w-3 h-3 text-blue-500" />
                    </div>
                  ) : (
                    <p className="text-slate-400 mt-1">Aucun dossier rattaché</p>
                  )}
                </div>
              </div>

              {mail.observations && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Observations & Consignes</h4>
                  <p className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
                    {mail.observations}
                  </p>
                </div>
              )}

              {/* Assignment Box if unassigned */}
              {!mail.manager_id && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-amber-900">Ce courrier nécessite une affectation</p>
                    <p className="text-[11px] text-amber-700">Assignez-le à un agent pour démarrer l'instruction.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedAssignee}
                      onChange={(e) => setSelectedAssignee(e.target.value)}
                      className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="">Sélectionner un agent</option>
                      {allUsers.map((u) => (
                        <option key={u.id} value={u.id}>{u.full_name}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        if (selectedAssignee) assignIncomingMail(mail.id, selectedAssignee);
                      }}
                      disabled={!selectedAssignee}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg font-bold disabled:opacity-50"
                    >
                      Affecter
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'workflow' && (
            <div className="space-y-4">
              <p className="text-slate-600 text-xs">
                Workflow institutionnel du courrier : <strong>Réception → Enregistrement → Affectation → Traitement → Validation → Réponse → Clôture</strong>.
              </p>

              <div className="space-y-3">
                {workflowSteps.map((step, idx) => {
                  const isCurrent = step.status === mail.status;
                  const isPassed = idx < currentStepIndex;
                  return (
                    <div
                      key={step.status}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                        isCurrent
                          ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-600/20'
                          : isPassed
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                          : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                          isPassed
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-blue-600 text-white animate-pulse'
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {isPassed ? '✓' : step.stepNumber}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{step.label}</p>
                          <p className="text-[11px] text-slate-500">{step.desc}</p>
                        </div>
                      </div>

                      {isCurrent && idx < workflowSteps.length - 1 && (
                        <button
                          onClick={() => updateIncomingMailStatus(mail.id, workflowSteps[idx + 1].status)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1 shadow-xs"
                        >
                          Valider cette étape <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'document' && (
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
                <Paperclip className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-900">{mail.scanned_doc_name || 'Courrier_Scanne_Original.pdf'}</p>
              <p className="text-slate-500 text-xs">Numérisé et stocké dans le bucket Supabase Storage</p>
              <button
                onClick={() => downloadSampleDocument(mail.scanned_doc_name || 'Courrier_Scanne.pdf', mail.register_number, 'Courrier Entrant')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold inline-flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Télécharger la pièce
              </button>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              {mailLogs.length === 0 ? (
                <p className="text-slate-500 italic">Aucune trace d'audit enregistrée pour ce courrier.</p>
              ) : (
                mailLogs.map((log) => (
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
      </div>
    </div>
  );
};
