'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { MailDashboard } from '@/components/mail/MailDashboard';
import { IncomingMailTable } from '@/components/mail/IncomingMailTable';
import { OutgoingMailTable } from '@/components/mail/OutgoingMailTable';
import { MailModal } from '@/components/mail/MailModal';
import { MailDetailModal } from '@/components/mail/MailDetailModal';
import { useApp } from '@/context/AppContext';
import { IncomingMail } from '@/types';
import { Mail, Send, Plus, Search, Filter, Download } from 'lucide-react';

function MailPageContent() {
  const { incomingMails, outgoingMails } = useApp();

  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMail, setSelectedMail] = useState<IncomingMail | null>(null);

  // Filter incoming mails
  const filteredIncoming = useMemo(() => {
    return incomingMails.filter((m) => {
      if (selectedDept !== 'all' && m.department !== selectedDept) return false;
      if (selectedStatus !== 'all' && m.status !== selectedStatus) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchNum = m.register_number.toLowerCase().includes(q);
        const matchSender = m.sender.toLowerCase().includes(q);
        const matchSubj = m.subject.toLowerCase().includes(q);
        const matchRef = (m.reference || '').toLowerCase().includes(q);
        if (!matchNum && !matchSender && !matchSubj && !matchRef) return false;
      }
      return true;
    });
  }, [incomingMails, selectedDept, selectedStatus, search]);

  // Filter outgoing mails
  const filteredOutgoing = useMemo(() => {
    return outgoingMails.filter((m) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchNum = m.mail_number.toLowerCase().includes(q);
        const matchRecip = m.recipient.toLowerCase().includes(q);
        const matchSubj = m.subject.toLowerCase().includes(q);
        if (!matchNum && !matchRecip && !matchSubj) return false;
      }
      return true;
    });
  }, [outgoingMails, search]);

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
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Mail className="w-6 h-6 text-blue-600" />
              Registre des Courriers Entrants & Sortants
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Traçabilité chronologique, affectation réglementaire et circuit d’instruction des courriers
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Courrier</span>
            </button>
          </div>
        </div>

        {/* Tableau de bord analytique des courriers (Section 10) */}
        <MailDashboard />

        {/* Tab switch & Search Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Tabs In/Out */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setActiveTab('incoming')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'incoming' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                Courriers Entrants ({incomingMails.length})
              </button>
              <button
                onClick={() => setActiveTab('outgoing')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'outgoing' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                Courriers Sortants ({outgoingMails.length})
              </button>
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher par numéro, expéditeur, objet, référence..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>

              {activeTab === 'incoming' && (
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800"
                >
                  <option value="all">Tous services</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Content based on selected tab */}
        {activeTab === 'incoming' ? (
          <IncomingMailTable
            mails={filteredIncoming}
            onSelect={(mail) => setSelectedMail(mail)}
          />
        ) : (
          <OutgoingMailTable mails={filteredOutgoing} />
        )}

        {/* Modal Enregistrement */}
        <MailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          defaultMode={activeTab}
        />

        {/* Modal Détail Courrier */}
        <MailDetailModal
          mail={selectedMail}
          onClose={() => setSelectedMail(null)}
        />
      </div>
    </AppLayout>
  );
}

export default function MailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-500">Chargement des courriers...</div>}>
      <MailPageContent />
    </Suspense>
  );
}

