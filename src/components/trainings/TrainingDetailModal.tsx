import React from 'react';
import { TrainingItem } from '@/types';
import { useApp } from '@/context/AppContext';
import { downloadCertificate } from '@/lib/downloadUtils';
import { 
  X, 
  GraduationCap, 
  Award, 
  MapPin, 
  Building, 
  User, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Download, 
  Printer,
  FileCheck2,
  ShieldCheck
} from 'lucide-react';

interface TrainingDetailModalProps {
  training: TrainingItem | null;
  onClose: () => void;
}

export const TrainingDetailModal: React.FC<TrainingDetailModalProps> = ({
  training,
  onClose
}) => {
  const { showToast } = useApp();
  if (!training) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0 mt-0.5">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  {training.training_code}
                </span>
                <span className="text-xs font-semibold text-slate-700">{training.theme}</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1">
                {training.participant_name} — {training.function_title}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {training.structure} • {training.region} ({training.department})
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Official Certificate Card Preview */}
          <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-2xl border-2 border-blue-200/80 shadow-xs relative overflow-hidden">
            <div className="absolute top-2 right-3 opacity-10">
              <GraduationCap className="w-40 h-40 text-blue-900" />
            </div>

            <div className="text-center space-y-2 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-bold uppercase tracking-wider text-[10px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                République • Direction Sanitaire & Réglementaire
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                ATTESTATION OFFICIELLE DE FORMATION CONTINUE
              </h3>
              <p className="text-[11px] text-slate-600 max-w-lg mx-auto">
                Il est certifié par la présente que le praticien soussigné a suivi avec succès le cycle de renforcement des compétences techniques et réglementaires :
              </p>
            </div>

            <div className="my-5 p-4 bg-white/90 rounded-xl border border-blue-100 text-center space-y-1 relative z-10">
              <div className="text-xs text-slate-500 uppercase font-semibold">Bénéficiaire</div>
              <div className="text-base font-black text-blue-950">{training.participant_name}</div>
              <div className="text-xs text-slate-600 font-medium">{training.function_title} — {training.structure}</div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px] relative z-10">
              <div className="p-2.5 bg-white/80 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Thématique</span>
                <strong className="text-slate-800">{training.theme}</strong>
              </div>
              <div className="p-2.5 bg-white/80 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Volume horaire</span>
                <strong className="text-slate-800">{training.duration_hours} Heures</strong>
              </div>
              <div className="p-2.5 bg-white/80 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Date d’évaluation</span>
                <strong className="text-slate-800">{training.training_date}</strong>
              </div>
              <div className="p-2.5 bg-white/80 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Statut</span>
                <strong className="text-emerald-700">Validé avec Mention</strong>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600 relative z-10">
              <div>
                <span className="text-slate-400 block text-[10px]">Formateur référent :</span>
                <strong>{training.trainer_name}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">Numéro d’enregistrement :</span>
                <strong className="font-mono text-blue-900">{training.certificate_number || 'CERT-REG-2026'}</strong>
              </div>
            </div>
          </div>

          {/* Additional details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Building className="w-4 h-4 text-blue-600" />
                Affectation Sanitaire & Réseau Régional
              </h4>
              <div className="space-y-1 text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px]">Structure de base :</span>
                  <span className="font-medium text-slate-800">{training.structure}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Région sanitaire :</span>
                  <span>{training.region}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Département / Direction :</span>
                  <span>{training.department}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Award className="w-4 h-4 text-purple-600" />
                Validité & Recyclage Périodique
              </h4>
              <div className="space-y-1 text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px]">Agrément point focal :</span>
                  <span className="text-emerald-700 font-bold">Actif & Habilité</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Période de recyclage recommandée :</span>
                  <span>Tous les 24 mois (Prochain recyclage : Octobre 2028)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                downloadCertificate(
                  training.participant_name,
                  training.function_title,
                  training.structure,
                  training.theme,
                  training.certificate_number || 'CERT-2026',
                  training.training_date,
                  training.trainer_name,
                  training.duration_hours
                );
                showToast(`Attestation ${training.certificate_number || ''} téléchargée avec succès`, 'success');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger l’Attestation (PDF)</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer</span>
            </button>
          </div>

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
