'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Establishment, EstablishmentStatus } from '@/types';
import { useApp } from '@/context/AppContext';
import { downloadSampleDocument } from '@/lib/downloadUtils';
import { 
  X, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar, 
  User, 
  FileCheck2, 
  Plus, 
  FileText, 
  History,
  FolderArchive,
  Download,
  ExternalLink,
  FolderPlus
} from 'lucide-react';

interface EstablishmentDetailModalProps {
  establishment: Establishment | null;
  onClose: () => void;
  onEdit: (etab: Establishment) => void;
}

export const EstablishmentDetailModal: React.FC<EstablishmentDetailModalProps> = ({
  establishment,
  onClose,
  onEdit
}) => {
  const router = useRouter();
  const { updateEstablishment, folders, auditLogs, currentUser, addFolder, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'identity' | 'inspections' | 'documents' | 'folders' | 'history'>('identity');

  // Inspection form state
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [inspDate, setInspDate] = useState(new Date().toISOString().split('T')[0]);
  const [inspInspector, setInspInspector] = useState(currentUser.full_name);
  const [inspOutcome, setInspOutcome] = useState('Conforme aux BPF/BPD sans remarque majeure');

  if (!establishment) return null;

  // Linked dossiers
  const linkedFolders = folders.filter(f => 
    f.structure.toLowerCase().includes(establishment.name.toLowerCase()) ||
    f.applicant.toLowerCase().includes(establishment.responsible_pharmacist.toLowerCase())
  );

  // Filtered audit logs
  const etabLogs = auditLogs.filter(l => l.entity_id === establishment.code || l.entity_name === establishment.name);

  const handleAddInspection = (e: React.FormEvent) => {
    e.preventDefault();
    const newInsp = {
      date: inspDate,
      inspector: inspInspector,
      outcome: inspOutcome
    };
    const updatedHistory = [...(establishment.inspection_history || []), newInsp];
    updateEstablishment(establishment.id, { inspection_history: updatedHistory });
    setShowInspectionForm(false);
    showToast('success', `Procès-verbal d'inspection consigné pour ${establishment.name}.`);
  };

  const handleCreateFolderForEstablishment = () => {
    const newF = addFolder({
      folder_type: 'Agrément Établissement',
      applicant: establishment.responsible_pharmacist,
      structure: establishment.name,
      receipt_date: new Date().toISOString().split('T')[0],
      manager_id: currentUser.id,
      priority: 'haute',
      due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      observations: `Demande d'instruction réglementaire ouverte depuis la fiche de l'établissement ${establishment.code}.`,
    });
    showToast('success', `Dossier réglementaire "${newF.folder_number}" ouvert pour ${establishment.name}.`);
    onClose();
    router.push('/folders');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0 mt-0.5">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                  {establishment.code}
                </span>
                <span className="text-xs text-slate-500 font-semibold">{establishment.establishment_type}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  establishment.status === 'Actif' ? 'bg-emerald-100 text-emerald-800' :
                  establishment.status === 'En attente' ? 'bg-amber-100 text-amber-800' :
                  establishment.status === 'Suspendu' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-800'
                }`}>
                  {establishment.status}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1">
                {establishment.name}
              </h2>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{establishment.address || establishment.city}, {establishment.department}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(establishment)}
              className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
            >
              Modifier
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-white overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('identity')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'identity' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Fiche d’identité & Cadre légal
          </button>
          <button
            onClick={() => setActiveTab('inspections')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'inspections' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Inspections & Contrôles ({establishment.inspection_history?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'documents' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Documents réglementaires
          </button>
          <button
            onClick={() => setActiveTab('folders')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'folders' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Dossiers rattachés ({linkedFolders.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Journal d’audit
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 text-xs">
          {/* TAB 1: Identity & Legal */}
          {activeTab === 'identity' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                  <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <User className="w-4 h-4 text-blue-600" />
                    Encadrement Pharmaceutique & Responsabilité
                  </h3>
                  <div className="space-y-1.5 text-slate-600">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Pharmacien Responsable :</span>
                      <strong className="text-slate-800">{establishment.responsible_pharmacist}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Propriétaire / Titulaire :</span>
                      <span>{establishment.owner || 'Identique au pharmacien responsable'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Contact téléphonique :</span>
                      <span>{establishment.phone || 'Non renseigné'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Courriel institutionnel :</span>
                      <span>{establishment.email || 'Non renseigné'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                  <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <FileCheck2 className="w-4 h-4 text-blue-600" />
                    Agrément & Titre d’Exploitation
                  </h3>
                  <div className="space-y-1.5 text-slate-600">
                    <div>
                      <span className="text-slate-500 block text-[11px]">N° Arrêté d’agrément ministériel :</span>
                      <span className="font-mono font-bold text-blue-900">{establishment.authorization_number}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Date d’octroi de l’autorisation :</span>
                      <span>{establishment.auth_date}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Validité légale / Date d’expiration :</span>
                      <span className={establishment.expiry_date ? 'font-semibold text-slate-800' : 'text-slate-500'}>
                        {establishment.expiry_date || 'Autorisation permanente sous réserve de conformité annuelle'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Statut administratif :</span>
                      <span className="font-semibold text-slate-800">{establishment.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Localisation & Circonscription Sanitaire
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-700">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Adresse exacte :</span>
                    <span>{establishment.address || 'Centre-ville'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Commune / Ville :</span>
                    <span>{establishment.city}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Département / Région :</span>
                    <span>{establishment.department}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Inspections & Contrôles */}
          {activeTab === 'inspections' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-xs">Historique des Inspections sur Site</h3>
                  <p className="text-[11px] text-slate-500">Traçabilité des visites de conformité et procès-verbaux (BPF, BPD, Bonnes Pratiques d'Officine)</p>
                </div>
                <button
                  onClick={() => setShowInspectionForm(!showInspectionForm)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Enregistrer une inspection</span>
                </button>
              </div>

              {showInspectionForm && (
                <form onSubmit={handleAddInspection} className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3">
                  <h4 className="font-bold text-blue-900 text-xs">Nouvelle visite d'inspection</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Date de l’inspection</label>
                      <input
                        type="date"
                        required
                        value={inspDate}
                        onChange={e => setInspDate(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Inspecteur / Pharmacien Chef</label>
                      <input
                        type="text"
                        required
                        value={inspInspector}
                        onChange={e => setInspInspector(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Constat & Issue du procès-verbal</label>
                    <input
                      type="text"
                      required
                      value={inspOutcome}
                      onChange={e => setInspOutcome(e.target.value)}
                      placeholder="Ex: Conforme avec recommandations sur la chaîne du froid"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowInspectionForm(false)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                    >
                      Valider le PV
                    </button>
                  </div>
                </form>
              )}

              {(!establishment.inspection_history || establishment.inspection_history.length === 0) ? (
                <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                  <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  Aucune inspection enregistrée pour cet établissement.
                </div>
              ) : (
                <div className="space-y-2">
                  {establishment.inspection_history.map((insp, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{insp.date}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-600 font-medium">Inspecteur : {insp.inspector}</span>
                        </div>
                        <p className="text-slate-700">{insp.outcome}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        PV Signé
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Documents */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-xs">Dossier Réglementaire Numérisé (GED)</h3>
                  <p className="text-[11px] text-slate-500">Actes administratifs, diplômes, plans de masse et certificats de conformité</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-rose-600" />
                    <div>
                      <div className="font-semibold text-slate-800">Arrete_Ouverture_{establishment.code}.pdf</div>
                      <div className="text-[11px] text-slate-400">PDF • 1.4 MB • Versé le {establishment.auth_date}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      downloadSampleDocument(`Arrete_Ouverture_${establishment.code}.pdf`, establishment.code, 'etablissement');
                      showToast('success', `Arrêté d'ouverture "${establishment.code}" téléchargé.`);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-md cursor-pointer transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    Télécharger
                  </button>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-semibold text-slate-800">Diplome_Pharmacien_Titulaire.pdf</div>
                      <div className="text-[11px] text-slate-400">PDF • 850 KB • Certifié conforme</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      downloadSampleDocument('Diplome_Pharmacien_Titulaire.pdf', establishment.code, 'etablissement');
                      showToast('success', `Diplôme du pharmacien responsable téléchargé.`);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-md cursor-pointer transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    Télécharger
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Linked Folders */}
          {activeTab === 'folders' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-xs">Dossiers Administratifs & Demandes d’Autorisation</h3>
                  <p className="text-[11px] text-slate-500">Demandes d'importation, visas publicitaires ou autorisations d'exploitation déposées</p>
                </div>
                <button
                  onClick={handleCreateFolderForEstablishment}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Ouvrir une demande / dossier</span>
                </button>
              </div>

              {linkedFolders.length === 0 ? (
                <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                  <FolderArchive className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="mb-2">Aucun dossier administratif en cours pour cet établissement.</p>
                  <button
                    onClick={handleCreateFolderForEstablishment}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Créer un premier dossier réglementaire
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {linkedFolders.map(f => (
                    <div
                      key={f.id}
                      onClick={() => {
                        onClose();
                        router.push('/folders');
                      }}
                      className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 hover:border-blue-300 flex items-center justify-between cursor-pointer transition-all group"
                      title="Ouvrir le dossier dans le module Dossiers"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-800 group-hover:text-blue-600 transition-colors">{f.folder_number}</span>
                          <span className="font-semibold text-slate-800">{f.folder_type}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600 opacity-60 ml-0.5" />
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Dépôt : {f.receipt_date} • Responsable : {f.manager_name}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {f.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: History / Audit */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div>
                <h3 className="font-bold text-slate-900 text-xs">Traçabilité & Historique d’Audit</h3>
                <p className="text-[11px] text-slate-500">Journal infalsifiable des modifications sur la fiche de l'établissement</p>
              </div>

              {etabLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                  <History className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  Aucun événement consigné dans le journal d’audit pour cet enregistrement.
                </div>
              ) : (
                <div className="space-y-2">
                  {etabLogs.map(l => (
                    <div key={l.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
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
            Fiche certifiée conforme • Registre National des Établissements Pharmaceutiques
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
