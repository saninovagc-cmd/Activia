'use client';

import React from 'react';
import { OutgoingMail } from '@/types';
import { useApp } from '@/context/AppContext';
import { Calendar, User, FileText, Download, CheckCircle, Clock } from 'lucide-react';
import { downloadSampleDocument } from '@/lib/downloadUtils';

interface OutgoingMailTableProps {
  mails: OutgoingMail[];
}

export const OutgoingMailTable: React.FC<OutgoingMailTableProps> = ({ mails }) => {
  const { showToast } = useApp();

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden w-full max-w-full">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-4 rounded-full bg-indigo-600 shrink-0" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Registre Chronologique des Courriers Sortants
          </h3>
          <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-full shrink-0">
            {mails.length} courrier(s)
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {mails.filter(m => m.status === 'envoye').length} expédiés
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            {mails.filter(m => m.status === 'valide').length} validés / prêts
          </span>
        </div>
      </div>

      {/* =========================================================================
          VUE MOBILE & TABLETTE (< 1024px) : Cartes fluides 100% SANS défilement
          ========================================================================= */}
      <div className="block lg:hidden divide-y divide-slate-100 p-3 bg-slate-50/40 space-y-2.5">
        {mails.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Aucun courrier sortant enregistré.
          </div>
        ) : (
          mails.map((mail) => (
            <div
              key={mail.id}
              className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5"
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {mail.mail_number}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  mail.status === 'envoye'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : mail.status === 'valide'
                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  {mail.status === 'envoye' ? 'Expédié' : mail.status === 'valide' ? 'Prêt à l’envoi' : mail.status}
                </span>
              </div>

              {/* Destinataire & Objet */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                  {mail.recipient}
                </h4>
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                  {mail.subject}
                </p>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                  <span className="font-mono">{mail.reference}</span>
                  <span>• {mail.mail_type}</span>
                </div>
              </div>

              {/* Signataire & Date */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Rédacteur</span>
                  <span className="font-semibold text-slate-800 truncate block">{mail.manager_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Date Envoi</span>
                  <span className="font-semibold text-slate-700">{mail.send_date}</span>
                </div>
              </div>

              {/* Action Download */}
              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    const fileName = mail.document_name || `Courrier_Sortant_${mail.mail_number.replace(/\//g, '_')}.pdf`;
                    downloadSampleDocument(fileName, mail.mail_number, 'courrier');
                    showToast('success', `Téléchargement du courrier officiel "${mail.mail_number}" initié.`);
                  }}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>Télécharger PDF</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* =========================================================================
          VUE DESKTOP (>= 1024px) : Tableau fluide 100% SANS barre de défilement
          ========================================================================= */}
      <div className="hidden lg:block w-full max-w-full overflow-hidden">
        <table className="w-full text-xs text-left text-slate-700 table-auto">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-3 font-semibold w-28">N° Chrono</th>
              <th className="py-3 px-2.5 font-semibold w-28">Date d’Envoi</th>
              <th className="py-3 px-3 font-semibold w-40">Destinataire</th>
              <th className="py-3 px-3 font-semibold">Objet du courrier</th>
              <th className="py-3 px-2.5 font-semibold w-28">Type</th>
              <th className="py-3 px-2.5 font-semibold w-32">Rédacteur</th>
              <th className="py-3 px-2.5 font-semibold w-28">Statut</th>
              <th className="py-3 px-3 font-semibold text-right w-20">Document</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {mails.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  Aucun courrier sortant enregistré.
                </td>
              </tr>
            ) : (
              mails.map((mail) => (
                <tr key={mail.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-700 whitespace-nowrap">
                    {mail.mail_number}
                  </td>
                  <td className="py-3 px-2.5 whitespace-nowrap">
                    <span className="font-semibold text-slate-900">{mail.send_date}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-900 truncate block leading-tight">{mail.recipient}</span>
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-medium text-slate-900 line-clamp-1 leading-tight">{mail.subject}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{mail.reference}</span>
                  </td>
                  <td className="py-3 px-2.5 text-slate-600 whitespace-nowrap">
                    {mail.mail_type}
                  </td>
                  <td className="py-3 px-2.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[9px] shrink-0">
                        {mail.manager_name.charAt(0)}
                      </div>
                      <span className="font-medium text-slate-800 text-[11px] truncate max-w-[90px]">{mail.manager_name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2.5 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      mail.status === 'envoye'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : mail.status === 'valide'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {mail.status === 'envoye' ? 'Expédié' : mail.status === 'valide' ? 'Prêt à l’envoi' : mail.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => {
                        const fileName = mail.document_name || `Courrier_Sortant_${mail.mail_number.replace(/\//g, '_')}.pdf`;
                        downloadSampleDocument(fileName, mail.mail_number, 'courrier');
                        showToast('success', `Téléchargement du courrier officiel "${mail.mail_number}" initié.`);
                      }}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                      title="Télécharger l'acte administratif / lettre officielle"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-600" />
                      PDF
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
