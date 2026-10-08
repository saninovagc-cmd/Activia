'use client';

import React from 'react';
import { OutgoingMail } from '@/types';
import { useApp } from '@/context/AppContext';
import { downloadSampleDocument } from '@/lib/downloadUtils';
import { Badge } from '@/components/ui/Badge';
import { Send, FileText, Download, Calendar, User, Eye } from 'lucide-react';

interface OutgoingMailTableProps {
  mails: OutgoingMail[];
}

export const OutgoingMailTable: React.FC<OutgoingMailTableProps> = ({ mails }) => {
  const { showToast } = useApp();
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-4 rounded-full bg-indigo-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Registre Chronologique des Courriers Sortants</h3>
          <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-full">{mails.length} courrier(s)</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
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
      <div className="overflow-x-auto w-full max-w-full">
        <table className="w-full min-w-[750px] text-xs text-left text-slate-700">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 font-semibold">N° Chrono</th>
              <th className="py-3 px-4 font-semibold">Date d’Envoi</th>
              <th className="py-3 px-4 font-semibold">Destinataire</th>
              <th className="py-3 px-4 font-semibold">Objet du courrier</th>
              <th className="py-3 px-4 font-semibold">Type</th>
              <th className="py-3 px-4 font-semibold">Signataire / Rédacteur</th>
              <th className="py-3 px-4 font-semibold">Statut</th>
              <th className="py-3 px-4 font-semibold text-right">Document & Actions</th>
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
                  <td className="py-3 px-4 font-mono font-bold text-indigo-700 whitespace-nowrap">
                    {mail.mail_number}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-semibold text-slate-900">{mail.send_date}</span>
                  </td>
                  <td className="py-3 px-4 max-w-[200px]">
                    <span className="font-semibold text-slate-900 truncate block">{mail.recipient}</span>
                  </td>
                  <td className="py-3 px-4 max-w-sm">
                    <p className="font-medium text-slate-900 line-clamp-1">{mail.subject}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{mail.reference}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                    {mail.mail_type}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[9px]">
                        {mail.manager_name.charAt(0)}
                      </div>
                      <span className="font-medium text-slate-800">{mail.manager_name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      mail.status === 'envoye'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : mail.status === 'valide'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {mail.status === 'envoye' ? 'Expédié' : mail.status === 'valide' ? 'Prêt à l’envoi' : mail.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => {
                        const fileName = mail.document_name || `Courrier_Sortant_${mail.mail_number.replace(/\//g, '_')}.pdf`;
                        downloadSampleDocument(fileName, mail.mail_number, 'courrier');
                        showToast('success', `Téléchargement du courrier officiel "${mail.mail_number}" initié.`);
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                      title="Télécharger l'acte administratif / lettre officielle signée"
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
