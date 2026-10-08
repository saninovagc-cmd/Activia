'use client';

import React, { useState } from 'react';
import { SignalItem, SignalStep, SignalSeverity } from '@/types';
import { useApp } from '@/context/AppContext';
import { SignalWorkflow } from './SignalWorkflow';
import { 
  X, 
  AlertTriangle, 
  FlaskConical, 
  CheckCircle2, 
  Clock, 
  User, 
  FileText, 
  Download, 
  Send, 
  ShieldAlert, 
  Activity, 
  Award,
  History,
  Building,
  Calendar
} from 'lucide-react';

interface SignalDetailModalProps {
  signal: SignalItem | null;
  onClose: () => void;
}

export const SignalDetailModal: React.FC<SignalDetailModalProps> = ({
  signal,
  onClose
}) => {
  const { 
    updateSignal, 
    updateSignalStep, 
    auditLogs, 
    currentUser, 
    createAlertFromSignal, 
    addOutgoingMail, 
    showToast,
    establishments 
  } = useApp();
  const [activeTab, setActiveTab] = useState<'summary' | 'workflow' | 'mapi' | 'lab' | 'actions' | 'history'>('summary');

  // MAPI state
  const [mapiScore, setMapiScore] = useState(signal?.imputability_score || 'Probable (Avis Commission)');
  const [mapiNotes, setMapiNotes] = useState(signal?.conclusion || '');

  // Lab state
  const [labResult, setLabResult] = useState<'Conforme' | 'Non conforme' | 'En attente' | 'Suspect'>(signal?.lab_result || 'En attente');
  const [labName, setLabName] = useState(signal?.lab_name || 'LNAM');
  const [sampleCode, setSampleCode] = useState(signal?.sample_code || 'ECH-2026-0084');

  // Action state
  const [correctiveActions, setCorrectiveActions] = useState(signal?.corrective_actions || '');
  const [statusVal, setStatusVal] = useState(signal?.status || 'en_cours');

  if (!signal) return null;

  const canEdit = currentUser.role === 'admin' || currentUser.role === 'chef_service' || currentUser.role === 'agent';

  const handleStepChange = (newStep: SignalStep) => {
    updateSignalStep(signal.id, newStep);
  };

  const handleSaveMapi = (e: React.FormEvent) => {
    e.preventDefault();
    updateSignal(signal.id, {
      imputability_score: mapiScore,
      conclusion: mapiNotes
    });
    showToast('Évaluation d’imputabilité MAPI enregistrée avec succès', 'success');
  };

  const handleSaveLab = (e: React.FormEvent) => {
    e.preventDefault();
    updateSignal(signal.id, {
      lab_name: labName,
      sample_code: sampleCode,
      lab_result: labResult,
      sample_taken: true,
      status: labResult === 'Non conforme' ? 'action_engagee' : 'analyse_recue'
    });
    showToast('Résultats de laboratoire mis à jour', 'success');
  };

  const handleSaveActions = (e: React.FormEvent) => {
    e.preventDefault();
    updateSignal(signal.id, {
      corrective_actions: correctiveActions,
      status: statusVal
    });
    showToast('Mesures correctives et statut mis à jour', 'success');
  };

  const handleTriggerAlert = () => {
    createAlertFromSignal(signal.id, signal.severity === 'Critique' ? 'Urgent' : 'Élevé');
  };

  const handleCreateRecallMail = () => {
    const newMail = addOutgoingMail({
      recipient: `${signal.manufacturer} / Grossistes-Répartiteurs`,
      reference: `RAPPEL-${signal.signal_number}`,
      subject: `Arrêté de rappel immédiat de lot : ${signal.product_name} (Lot ${signal.batch_number})`,
      mail_type: 'Notification Réglementaire',
      status: 'en_validation',
      document_name: `Arrete_Rappel_Lot_${signal.batch_number}.pdf`
    });
    showToast(`Courrier de rappel de lot ${newMail.mail_number} initié`, 'warning');
  };

  const sigLogs = auditLogs.filter(l => l.entity_id === signal.signal_number);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  {signal.signal_number}
                </span>
                <span className="text-xs font-semibold text-slate-700">{signal.signal_type}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  signal.severity === 'Critique' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                  signal.severity === 'Grave' ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                  signal.severity === 'Modérée' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {signal.severity}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1">
                {signal.product_name} — Lot: {signal.batch_number}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Fabricant : {signal.manufacturer} • Déclarant : {signal.reporter_name} ({signal.reporter_type})
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-white overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('summary')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'summary' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Fiche & Faits constatés
          </button>
          <button
            onClick={() => setActiveTab('workflow')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'workflow' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Chaîne d’investigation (9 étapes)
          </button>
          <button
            onClick={() => setActiveTab('mapi')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'mapi' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            MAPI & Imputabilité OMS
          </button>
          <button
            onClick={() => setActiveTab('lab')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'lab' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Échantillons & Contrôle Labo
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'actions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Mesures Sanitaires & Rappel
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Audit Log
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 text-xs">
          {/* TAB 1: Summary */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <User className="w-4 h-4 text-blue-600" />
                    Déclarant & Origine de l’Alerte
                  </h3>
                  <div className="space-y-1 text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Déclarant :</span>
                      <strong className="text-slate-800">{signal.reporter_name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Catégorie :</span>
                      <span>{signal.reporter_type}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Date de notification :</span>
                      <span>{signal.receipt_date}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Investigateur assigné :</span>
                      <span className="font-semibold text-blue-800">{signal.manager_name}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Produit Incriminé & Traçabilité
                  </h3>
                  <div className="space-y-1 text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Désignation commerciale / DCI :</span>
                      <strong className="text-slate-800">{signal.product_name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Numéro de lot :</span>
                      <span className="font-mono font-bold text-slate-800">{signal.batch_number}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Laboratoire fabricant :</span>
                      <span>{signal.manufacturer}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Type d’incident sanitaire :</span>
                      <span className="font-semibold text-slate-800">{signal.signal_type}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-800 text-xs">Exposé des Faits & Symptômes rapportés</h3>
                <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200 whitespace-pre-line">
                  {signal.description}
                </p>
              </div>

              {/* Lab & MAPI highlights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl">
                  <span className="text-[11px] font-bold text-purple-900 block mb-1">Prélèvement de contrôle :</span>
                  <div className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-purple-700" />
                    <span className="font-medium text-slate-800">
                      {signal.sample_taken ? `Échantillon ${signal.sample_code} déposé au ${signal.lab_name}` : 'Aucun prélèvement physique'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                  <span className="text-[11px] font-bold text-blue-900 block mb-1">Statut d'imputabilité MAPI :</span>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-700" />
                    <span className="font-medium text-slate-800">
                      {signal.imputability_score || 'En cours d’évaluation par le comité'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Workflow (9 steps) */}
          {activeTab === 'workflow' && (
            <div className="space-y-4">
              <SignalWorkflow
                currentStep={signal.workflow_step}
                onStepChange={handleStepChange}
                canEdit={canEdit}
              />

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-800 text-xs">Guide d’Exécution Réglementaire</h4>
                <div className="space-y-2 text-slate-600">
                  <p>
                    <strong>Étapes 1 à 3 :</strong> Réception de la notification, vérification de l’éligibilité (prévalidation MAPI) et déclenchement de l’enquête sur le terrain.
                  </p>
                  <p>
                    <strong>Étapes 4 à 6 :</strong> Prélèvement sous scellés, transmission au Laboratoire National de Contrôle et réception du bulletin d’analyse.
                  </p>
                  <p>
                    <strong>Étapes 7 à 9 :</strong> Réunion de la commission d’experts en imputabilité, promulgation des arrêtés de rappel / suspension, et clôture de l’alerte.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MAPI & Imputation OMS */}
          {activeTab === 'mapi' && (
            <form onSubmit={handleSaveMapi} className="space-y-4">
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                <h3 className="font-bold text-blue-900 text-xs">
                  Algorithme d’Imputabilité des MAPI (Organisation Mondiale de la Santé)
                </h3>
                <p className="text-slate-600 text-[11px]">
                  Évaluation de la relation de causalité entre l’administration du vaccin/médicament et la survenue de la manifestation post-vaccinale indésirable.
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Classification de Causalité (OMS / CIOMS) *</label>
                  <select
                    value={mapiScore}
                    onChange={e => setMapiScore(e.target.value)}
                    disabled={!canEdit}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold text-slate-800"
                  >
                    <option value="A1. Liée au produit vaccinal (effets connus)">A1. Cause liée au vaccin (propriétés inhérentes)</option>
                    <option value="A2. Liée à un défaut de qualité du vaccin">A2. Cause liée à un défaut de qualité du produit</option>
                    <option value="A3. Liée à une erreur de manipulation / vaccination">A3. Cause liée à une erreur de préparation ou d'administration</option>
                    <option value="A4. Réaction liée à l'anxiété ou stress de l'injection">A4. Réaction liée au stress de la vaccination</option>
                    <option value="B1. Temporairement liée mais preuves insuffisantes">B1. Temporairement compatible mais indéterminée</option>
                    <option value="C. Coïncidente (non liée au vaccin)">C. Événement fortuit / coïncident sans lien de cause</option>
                    <option value="Inclassable (informations complémentaires requises)">Inclassable (données manquantes)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Conclusion & Avis de la Commission Technique d’Experts</label>
                  <textarea
                    rows={4}
                    value={mapiNotes}
                    onChange={e => setMapiNotes(e.target.value)}
                    disabled={!canEdit}
                    placeholder="Synthèse des discussions du comité, antécédents du patient, heure exacte d'injection..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                {canEdit && (
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
                    >
                      Enregistrer la cotation MAPI
                    </button>
                  </div>
                )}
              </div>
            </form>
          )}

          {/* TAB 4: Lab & Sampling */}
          {activeTab === 'lab' && (
            <form onSubmit={handleSaveLab} className="space-y-4">
              <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl space-y-1">
                <h3 className="font-bold text-purple-900 text-xs">
                  Contrôle Analytique & Expertise de Laboratoire
                </h3>
                <p className="text-slate-600 text-[11px]">
                  Gestion des échantillons prélevés sous procès-verbal et résultats des tests physico-chimiques / microbiologiques.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Code Échantillon / Scellé</label>
                  <input
                    type="text"
                    value={sampleCode}
                    onChange={e => setSampleCode(e.target.value)}
                    disabled={!canEdit}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Laboratoire d’Analyse</label>
                  <input
                    type="text"
                    value={labName}
                    onChange={e => setLabName(e.target.value)}
                    disabled={!canEdit}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Verdict Analytique</label>
                  <select
                    value={labResult}
                    onChange={e => setLabResult(e.target.value as any)}
                    disabled={!canEdit}
                    className={`w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-bold ${
                      labResult === 'Conforme' ? 'text-emerald-700' :
                      labResult === 'Non conforme' ? 'text-rose-700' : 'text-amber-700'
                    }`}
                  >
                    <option value="En attente">⏳ En attente de bulletin</option>
                    <option value="Conforme">✅ Conforme aux spécifications de la Pharmacopée</option>
                    <option value="Non conforme">❌ Non conforme (Sous-dosage ou contamination)</option>
                    <option value="Suspect">⚠️ Suspect / Contrefaçon avérée</option>
                  </select>
                </div>
              </div>

              {canEdit && (
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs"
                  >
                    Mettre à jour le bulletin d’analyse
                  </button>
                </div>
              )}
            </form>
          )}

          {/* TAB 5: Actions & Recall */}
          {activeTab === 'actions' && (
            <form onSubmit={handleSaveActions} className="space-y-4">
              <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1">
                <h3 className="font-bold text-rose-900 text-xs">
                  Mesures Conservatoires & Sanitaires d'Urgence
                </h3>
                <p className="text-slate-600 text-[11px]">
                  Rappels de lots, arrêt de dispensation, publication d'alertes sanitaires et mise sous séquestre.
                </p>
              </div>

              {/* Quick Emergency Actions */}
              <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs text-slate-700 font-semibold">Actions Réglementaires d'Urgence :</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTriggerAlert}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold flex items-center gap-1.5 text-xs shadow-xs"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Déclencher Alerte Sanitaire
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateRecallMail}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-lg font-bold flex items-center gap-1.5 text-xs"
                  >
                    <Send className="w-3.5 h-3.5 text-rose-600" />
                    Générer Arrêté de Rappel
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Statut du Signalement</label>
                  <select
                    value={statusVal}
                    onChange={e => setStatusVal(e.target.value as any)}
                    disabled={!canEdit}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold"
                  >
                    <option value="en_cours">En cours d'investigation</option>
                    <option value="en_attente_labo">En attente des analyses laboratoire</option>
                    <option value="analyse_recue">Analyses reçues - Évaluation en cours</option>
                    <option value="action_engagee">Mesures sanitaires engagées (Rappel / Quarantaine)</option>
                    <option value="cloture">Dossier clôturé définitivement</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Mesures prises & Décisions ministérielles</label>
                  <textarea
                    rows={4}
                    value={correctiveActions}
                    onChange={e => setCorrectiveActions(e.target.value)}
                    disabled={!canEdit}
                    placeholder="Ex: Arrêté de rappel du lot LOT-2025-08 diffusé aux officines et grossistes. Quarantaine immédiate des stocks..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                {canEdit && (
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
                    >
                      Enregistrer les mesures prises
                    </button>
                  </div>
                )}
              </div>
            </form>
          )}

          {/* TAB 6: History & Audit */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div>
                <h3 className="font-bold text-slate-900 text-xs">Traçabilité & Historique d’Audit</h3>
                <p className="text-[11px] text-slate-500">Journal infalsifiable des modifications sur ce signalement</p>
              </div>

              {sigLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                  <History className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  Aucun événement consigné dans le journal d’audit pour ce signalement.
                </div>
              ) : (
                <div className="space-y-2">
                  {sigLogs.map(l => (
                    <div key={l.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800">{l.details}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{l.created_at}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Par : {l.user_name} ({l.user_role})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Dossier d’alerte sanitaire • Pharmacovigilance & Vigilance des Produits de Santé
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 border border-slate-300 rounded-lg"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

