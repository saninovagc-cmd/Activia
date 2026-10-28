'use client';

import React, { useState } from 'react';
import { IncomingMail, IncomingMailStatus } from '@/types';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/ui/Badge';
import { 
  Calendar, 
  User, 
  Paperclip, 
  ArrowRight, 
  UserCheck, 
  Eye, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface IncomingMailTableProps {
  mails: IncomingMail[];
  onSelect: (mail: IncomingMail) => void;
}

export const IncomingMailTable: React.FC<IncomingMailTableProps> = ({
  mails,
  onSelect,
}) => {
  const { allUsers, assignIncomingMail, updateIncomingMailStatus } = useApp();
  const [assigningMailId, setAssigningMailId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  const totalPages = Math.ceil(mails.length / pageSize) || 1;
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, mails.length);
  const paginatedMails = mails.slice(startIndex, endIndex);

  const workflowSteps: { status: IncomingMailStatus; label: string; stepNumber: number }[] = [
    { status: 'reception', label: '1. Réception', stepNumber: 1 },
    { status: 'enregistrement', label: '2. Enregistrement', stepNumber: 2 },
    { status: 'affectation', label: '3. Affectation', stepNumber: 3 },
    { status: 'traitement', label: '4. Traitement', stepNumber: 4 },
    { status: 'validation', label: '5. Validation', stepNumber: 5 },
    { status: 'reponse', label: '6. Réponse', stepNumber: 6 },
    { status: 'cloture', label: '7. Clôture', stepNumber: 7 },
  ];

  const advanceWorkflow = (mail: IncomingMail, e: React.MouseEvent) => {
    e.stopPropagation();
    const curIndex = workflowSteps.findIndex(s => s.status === mail.status);
    if (curIndex >= 0 && curIndex < workflowSteps.length - 1) {
      updateIncomingMailStatus(mail.id, workflowSteps[curIndex + 1].status);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden w-full max-w-full">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-4 rounded-full bg-blue-600 shrink-0" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Registre Général des Courriers Entrants
          </h3>
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full shrink-0">
            {mails.length} courrier(s)
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            {mails.filter(m => new Date(m.due_date).getTime() < Date.now() && m.status !== 'cloture').length} en retard
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            {mails.filter(m => m.status !== 'cloture').length} en cours
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {mails.filter(m => m.status === 'cloture').length} clôturés
          </span>
        </div>
      </div>

      {/* =========================================================================
          VUE MOBILE & TABLETTE (< 1024px) : Cartes fluides 100% SANS défilement
          ========================================================================= */}
      <div className="block lg:hidden divide-y divide-slate-100 p-3 bg-slate-50/40 space-y-2.5">
        {mails.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Aucun courrier entrant ne correspond à ces critères.
          </div>
        ) : (
          paginatedMails.map((mail) => {
            const isOverdue = new Date(mail.due_date).getTime() < Date.now() && mail.status !== 'cloture';
            const curStep = workflowSteps.find(s => s.status === mail.status) || workflowSteps[0];
            return (
              <div
                key={mail.id}
                onClick={() => onSelect(mail)}
                className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-blue-400 transition-all cursor-pointer space-y-2.5"
              >
                {/* Header: N° Registre + Date */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {mail.register_number}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0 text-[11px] text-slate-500">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{mail.receipt_date}</span>
                    <Badge priority={mail.priority} />
                  </div>
                </div>

                {/* Expéditeur & Objet */}
                <div>
                  <h4 className="font-bold text-slate-900 text-sm leading-snug break-words">
                    {mail.sender}
                  </h4>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed break-words whitespace-normal">
                    {mail.subject}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500">
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{mail.reference}</span>
                    <span>• {mail.department}</span>
                  </div>
                </div>

                {/* Responsable & Échéance */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Responsable</span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {mail.manager_name || 'Non affecté'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Échéance</span>
                    <span className={`font-semibold flex items-center gap-1 ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                      {mail.due_date}
                    </span>
                  </div>
                </div>

                {/* Workflow step & Actions */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 flex-wrap" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      mail.status === 'cloture'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : mail.status === 'traitement' || mail.status === 'validation'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {curStep.label}
                    </span>
                    {mail.status !== 'cloture' && (
                      <button
                        onClick={(e) => advanceWorkflow(mail, e)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Étape suivante"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => onSelect(mail)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Consulter</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* =========================================================================
          VUE DESKTOP (>= 1024px) : Tableau fluide 100% SANS barre de défilement
          ========================================================================= */}
      <div className="hidden lg:block w-full max-w-full">
        <table className="w-full text-xs text-left text-slate-800 table-fixed border-collapse">
          <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider border-b border-slate-200 text-[11px]">
            <tr>
              <th className="py-3 px-3 font-bold w-[12%]">N° Registre</th>
              <th className="py-3 px-2.5 font-bold w-[11%]">Date & Réf.</th>
              <th className="py-3 px-3 font-bold w-[20%]">Expéditeur</th>
              <th className="py-3 px-3 font-bold w-[30%]">Objet du courrier</th>
              <th className="py-3 px-2.5 font-bold w-[14%]">Responsable</th>
              <th className="py-3 px-2 font-bold w-[8%] text-center">Échéance</th>
              <th className="py-3 px-2.5 font-bold w-[10%]">Étape</th>
              <th className="py-3 px-2 text-right w-[5%]">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {mails.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  Aucun courrier entrant ne correspond à ces critères.
                </td>
              </tr>
            ) : (
              paginatedMails.map((mail) => {
                const isOverdue = new Date(mail.due_date).getTime() < Date.now() && mail.status !== 'cloture';
                const curStep = workflowSteps.find(s => s.status === mail.status) || workflowSteps[0];
                return (
                  <tr
                    key={mail.id}
                    onClick={() => onSelect(mail)}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                  >
                    {/* N° Registre */}
                    <td className="py-3 px-3 align-top whitespace-nowrap">
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 block text-center">
                        {mail.register_number}
                      </span>
                    </td>

                    {/* Date & Réf */}
                    <td className="py-3 px-2.5 align-top">
                      <p className="font-bold text-slate-900">{mail.receipt_date}</p>
                      <p className="text-[11px] text-slate-500 font-mono break-all leading-tight mt-0.5">{mail.reference}</p>
                    </td>

                    {/* Expéditeur - Retour à la ligne automatique */}
                    <td className="py-3 px-3 align-top">
                      <p className="font-bold text-slate-900 leading-snug break-words whitespace-normal">{mail.sender}</p>
                      <span className="text-[11px] text-slate-500 block mt-0.5 break-words">{mail.sender_type || mail.mail_type}</span>
                    </td>

                    {/* Objet - Retour à la ligne automatique SANS coupure */}
                    <td className="py-3 px-3 align-top">
                      <p className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug break-words whitespace-normal">
                        {mail.subject}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                        <Badge priority={mail.priority} />
                        {mail.scanned_doc_name && (
                          <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                            <Paperclip className="w-3 h-3" /> Scanné
                          </span>
                        )}
                        <span className="text-slate-400">• {mail.department}</span>
                      </div>
                    </td>

                    {/* Responsable */}
                    <td className="py-3 px-2.5 align-top relative" onClick={(e) => e.stopPropagation()}>
                      {mail.manager_name ? (
                        <div className="flex items-start gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                            {mail.manager_name.charAt(0)}
                          </div>
                          <span className="font-medium text-slate-800 text-xs leading-snug break-words whitespace-normal">{mail.manager_name}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAssigningMailId(mail.id)}
                          className="px-2 py-0.5 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded text-[10px] font-semibold flex items-center gap-1"
                        >
                          <UserCheck className="w-3 h-3" />
                          Affecter
                        </button>
                      )}

                      {/* Dropdown affectation */}
                      {assigningMailId === mail.id && (
                        <div className="absolute left-2 top-full z-30 mt-1 bg-white border border-slate-200 shadow-xl rounded-xl p-2 w-56">
                          <p className="text-[10px] font-bold text-slate-700 mb-1 px-2">Affecter à :</p>
                          <div className="max-h-40 overflow-y-auto divide-y divide-slate-100">
                            {allUsers.map((u) => (
                              <button
                                key={u.id}
                                onClick={() => {
                                  assignIncomingMail(mail.id, u.id);
                                  setAssigningMailId(null);
                                }}
                                className="w-full text-left p-1.5 text-[11px] hover:bg-slate-50 rounded text-slate-800 flex items-center justify-between"
                              >
                                <span className="truncate">{u.full_name}</span>
                                <span className="text-[9px] text-slate-400 shrink-0">{u.role_label}</span>
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={() => setAssigningMailId(null)}
                            className="mt-1 w-full text-center py-1 text-[10px] text-slate-500 hover:bg-slate-100 rounded"
                          >
                            Fermer
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Échéance */}
                    <td className="py-3 px-2.5 whitespace-nowrap">
                      <div className={`flex items-center gap-1 font-medium text-[11px] ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                        <Calendar className="w-3 h-3 shrink-0" />
                        <span>{mail.due_date}</span>
                      </div>
                    </td>

                    {/* Étape Workflow */}
                    <td className="py-3 px-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          mail.status === 'cloture'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : mail.status === 'traitement' || mail.status === 'validation'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {curStep.label}
                        </span>

                        {mail.status !== 'cloture' && (
                          <button
                            onClick={(e) => advanceWorkflow(mail, e)}
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                            title="Passer à l'étape suivante"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-2 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelect(mail)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                        title="Consulter"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {mails.length > 0 && (
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-slate-600 text-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>
              Affichage de <strong>{startIndex + 1}</strong> à <strong>{endIndex}</strong> sur <strong>{mails.length}</strong> courriers
            </span>
            <div className="flex items-center gap-1 ml-3">
              <span className="text-[11px] text-slate-400">Lignes :</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-700"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Page précédente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 py-0.5 font-semibold text-slate-700">
              Page {safePage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Page suivante"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
