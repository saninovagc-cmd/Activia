'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { MailType, PriorityLevel } from '@/types';
import { X, Save, Mail, Send, Paperclip } from 'lucide-react';

interface MailModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'incoming' | 'outgoing';
}

export const MailModal: React.FC<MailModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'incoming',
}) => {
  const { allUsers, currentUser, addIncomingMail, addOutgoingMail } = useApp();

  const [mode, setMode] = useState<'incoming' | 'outgoing'>(defaultMode);

  // Incoming state
  const [sender, setSender] = useState('');
  const [senderType, setSenderType] = useState('Usager');
  const [reference, setReference] = useState('');
  const [subject, setSubject] = useState('');
  const [mailType, setMailType] = useState<MailType>('Officiel');
  const [department, setDepartment] = useState('Vigilances Sanitaires & MAPI');
  const [managerId, setManagerId] = useState('');
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]);
  const [priority, setPriority] = useState<PriorityLevel>('moyenne');
  const [observations, setObservations] = useState('');
  const [scannedDocName, setScannedDocName] = useState('');

  // Outgoing state
  const [recipient, setRecipient] = useState('');
  const [sendDate, setSendDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    if (mode === 'incoming') {
      const manager = allUsers.find(u => u.id === managerId);
      addIncomingMail({
        sender,
        sender_type: senderType,
        reference: reference || `REF-${Date.now().toString().slice(-4)}`,
        subject,
        mail_type: mailType,
        department,
        manager_id: manager?.id,
        manager_name: manager?.full_name,
        receipt_date: receiptDate,
        due_date: dueDate,
        priority,
        observations,
        scanned_doc_name: scannedDocName || 'Courrier_Scanne.pdf',
        status: manager ? 'affectation' : 'enregistrement',
      });
    } else {
      const manager = allUsers.find(u => u.id === managerId) || currentUser;
      addOutgoingMail({
        recipient,
        reference: reference || `DEP-${Date.now().toString().slice(-4)}`,
        subject,
        mail_type: mailType,
        manager_id: manager.id,
        manager_name: manager.full_name,
        send_date: sendDate,
        document_name: 'Courrier_Officiel_Signe.pdf',
        status: 'envoye',
      });
    }

    onClose();
  };

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              {mode === 'incoming' ? <Mail className="w-5 h-5" /> : <Send className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {mode === 'incoming' ? 'Enregistrement Courrier Entrant' : 'Émission Courrier Sortant'}
              </h3>
              <p className="text-xs text-slate-500">
                Indexation officielle au registre institutionnel du service
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

        {/* Mode Selector */}
        <div className="px-6 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-600 mr-2">Type d’opération :</span>
          <button
            type="button"
            onClick={() => setMode('incoming')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              mode === 'incoming' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-300'
            }`}
          >
            Courrier Entrant (Arrivée)
          </button>
          <button
            type="button"
            onClick={() => setMode('outgoing')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              mode === 'outgoing' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-300'
            }`}
          >
            Courrier Sortant (Départ)
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {mode === 'incoming' ? (
            <>
              {/* Expéditeur & Réf */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Expéditeur (Structure / Titulaire) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Laboratoires Novis, Hôpital Central..."
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Référence de l’expéditeur
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: MIN/DGS/2026-102"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              {/* Objet */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Objet du courrier entrant <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ex: Dépôt du rapport de sécurité périodique pour la spécialité..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Typologie & Service */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nature / Type de courrier
                  </label>
                  <select
                    value={mailType}
                    onChange={(e) => setMailType(e.target.value as MailType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900"
                  >
                    <option value="Officiel">Officiel</option>
                    <option value="Demande Usager">Demande Usager</option>
                    <option value="Notification Réglementaire">Notification Réglementaire</option>
                    <option value="Rapport / PV">Rapport / PV</option>
                    <option value="Circulaire Ministérielle">Circulaire Ministérielle</option>
                    <option value="Contentieux">Contentieux</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Service destinataire
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
              </div>

              {/* Affectation & Priorité */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Affecter à un responsable (optionnel)
                  </label>
                  <select
                    value={managerId}
                    onChange={(e) => setManagerId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="">-- En attente d'affectation --</option>
                    {allUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.full_name} ({u.role_label})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priorité de traitement
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

              {/* Dates & Pièce jointe */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date de réception
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
                    Date limite (SLA)
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
                    Document scanné (Nom)
                  </label>
                  <input
                    type="text"
                    placeholder="Courrier_Scanne.pdf"
                    value={scannedDocName}
                    onChange={(e) => setScannedDocName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observations & Consignes particulières
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes de transmission ou instructions de traitement..."
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </>
          ) : (
            <>
              {/* Mode Outgoing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Destinataire officiel <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Direction CHU, Agence Mediatiks..."
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date d’envoi
                  </label>
                  <input
                    type="date"
                    required
                    value={sendDate}
                    onChange={(e) => setSendDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Objet du courrier sortant <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ex: Notification de décision d'autorisation d'achat dérogatoire..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Signataire / Rédacteur
                  </label>
                  <select
                    value={managerId || currentUser.id}
                    onChange={(e) => setManagerId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
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
                    Type de correspondance
                  </label>
                  <select
                    value={mailType}
                    onChange={(e) => setMailType(e.target.value as MailType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900"
                  >
                    <option value="Officiel">Courrier Officiel</option>
                    <option value="Rapport / PV">Arrêté / Décision</option>
                    <option value="Notification Réglementaire">Notification</option>
                  </select>
                </div>
              </div>
            </>
          )}

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
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              {mode === 'incoming' ? 'Enregistrer le courrier entrant' : 'Enregistrer et émettre'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
