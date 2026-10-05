'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Mail, Send, Clock, AlertTriangle, CheckCircle, FileText } from 'lucide-react';

export const MailDashboard: React.FC = () => {
  const { incomingMails, outgoingMails } = useApp();

  const totalIn = incomingMails.length;
  const totalOut = outgoingMails.length;
  const nonAffectes = incomingMails.filter(m => !m.manager_id || m.status === 'reception' || m.status === 'enregistrement').length;
  const enTraitement = incomingMails.filter(m => m.status === 'traitement' || m.status === 'validation').length;
  const enRetard = incomingMails.filter(m => new Date(m.due_date).getTime() < Date.now() && m.status !== 'cloture').length;
  const clotures = incomingMails.filter(m => m.status === 'cloture').length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Courriers Entrants</span>
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <Mail className="w-4 h-4" />
          </div>
        </div>
        <p className="text-xl font-bold text-slate-900 mt-1">{totalIn}</p>
        <p className="text-[11px] text-blue-600 font-medium mt-0.5">Indexés au registre</p>
      </div>

      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Courriers Sortants</span>
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <Send className="w-4 h-4" />
          </div>
        </div>
        <p className="text-xl font-bold text-slate-900 mt-1">{totalOut}</p>
        <p className="text-[11px] text-indigo-600 font-medium mt-0.5">Expédiés & archivés</p>
      </div>

      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">À Affecter</span>
          <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <p className="text-xl font-bold text-amber-600 mt-1">{nonAffectes}</p>
        <p className="text-[11px] text-slate-500 mt-0.5">Attente attribution</p>
      </div>

      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">En Traitement</span>
          <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <p className="text-xl font-bold text-slate-900 mt-1">{enTraitement}</p>
        <p className="text-[11px] text-sky-600 font-medium mt-0.5">Instruction en cours</p>
      </div>

      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Hors Délais (SLA)</span>
          <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <p className="text-xl font-bold text-rose-600 mt-1">{enRetard}</p>
        <p className="text-[11px] text-rose-600 font-medium mt-0.5">Échéance dépassée</p>
      </div>

      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Clôturés / Répondus</span>
          <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>
        <p className="text-xl font-bold text-emerald-600 mt-1">{clotures}</p>
        <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Circuit complété</p>
      </div>
    </div>
  );
};
