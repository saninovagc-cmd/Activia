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
  FileText
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
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-4 rounded-full bg-blue-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Registre Général des Courriers Entrants</h3>
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">{mails.length} courrier(s)</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            {mails.filter(m => new Date(m.due_date).getTime() < Date.now() && m.status !== 'cloture').length} en retard
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            {mails.filter(m => m.status !== 'cloture').length} en cours
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {mails.filter(m => m.status === 'cloture').length} clôturés
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left text-slate-700">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 font-semibold">N° Registre</th>
              <th className="py-3 px-4 font-semibold">Date & Réf.</th>
              <th className="py-3 px-4 font-semibold">Expéditeur</th>
              <th className="py-3 px-4 font-semibold">Objet du courrier</th>
              <th className="py-3 px-4 font-semibold">Service</th>
              <th className="py-3 px-4 font-semibold">Responsable</th>
              <th className="py-3 px-4 font-semibold">Échéance</th>
              <th className="py-3 px-4 font-semibold">Étape Workflow</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {mails.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  Aucun courrier entrant ne correspond à ces critères.
                </td>
              </tr>
            ) : (
              mails.map((mail) => {
                const isOverdue = new Date(mail.due_date).getTime() < Date.now() && mail.status !== 'cloture';
                const curStep = workflowSteps.find(s => s.status === mail.status) || workflowSteps[0];
                return (
                  <tr
                    key={mail.id}
                    onClick={() => onSelect(mail)}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                  >
                    {/* N° Registre */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {mail.register_number}
                      </span>
                    </td>

                    {/* Date & Réf */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <p className="font-semibold text-slate-900">{mail.receipt_date}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[120px] font-mono">{mail.reference}</p>
                    </td>

                    {/* Expéditeur */}
                    <td className="py-3 px-4 max-w-[180px]">
                      <p className="font-semibold text-slate-900 truncate">{mail.sender}</p>
                      <span className="text-[10px] text-slate-500">{mail.sender_type || mail.mail_type}</span>
                    </td>

                    {/* Objet */}
                    <td className="py-3 px-4 max-w-xs sm:max-w-sm">
                      <p className="font-semibold text-slate-900 line-clamp-1 group-hover:text-blue-700 transition-colors">
                        {mail.subject}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                        <Badge priority={mail.priority} />
                        {mail.scanned_doc_name && (
                          <span className="inline-flex items-center gap-1 text-blue-600">
                            <Paperclip className="w-3 h-3" /> Scanné
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Service */}
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {mail.department}
                    </td>

                    {/* Responsable */}
                    <td className="py-3 px-4 whitespace-nowrap relative" onClick={(e) => e.stopPropagation()}>
                      {mail.manager_name ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[9px]">
                            {mail.manager_name.charAt(0)}
                          </div>
                          <span className="font-medium text-slate-800">{mail.manager_name}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAssigningMailId(mail.id)}
                          className="px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded text-[11px] font-semibold flex items-center gap-1"
                        >
                          <UserCheck className="w-3 h-3" />
                          Affecter
                        </button>
                      )}

                      {/* Assignment inline dropdown */}
                      {assigningMailId === mail.id && (
                        <div className="absolute left-4 top-full z-30 mt-1 bg-white border border-slate-200 shadow-xl rounded-xl p-2 w-64">
                          <p className="text-[11px] font-bold text-slate-700 mb-1 px-2">Affecter le courrier à :</p>
                          <div className="max-h-40 overflow-y-auto divide-y divide-slate-100">
                            {allUsers.map((u) => (
                              <button
                                key={u.id}
                                onClick={() => {
                                  assignIncomingMail(mail.id, u.id);
                                  setAssigningMailId(null);
                                }}
                                className="w-full text-left p-1.5 text-xs hover:bg-slate-50 rounded text-slate-800 flex items-center justify-between"
                              >
                                <span>{u.full_name}</span>
                                <span className="text-[10px] text-slate-400">{u.role_label}</span>
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
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className={`flex items-center gap-1 font-medium ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                        <Calendar className="w-3 h-3" />
                        <span>{mail.due_date}</span>
                      </div>
                      {isOverdue && (
                        <span className="text-[10px] text-rose-600 font-bold">Retard</span>
                      )}
                    </td>

                    {/* Étape Workflow */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
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
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelect(mail)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                        title="Consulter la fiche complète"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
