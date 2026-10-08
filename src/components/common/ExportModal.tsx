'use client';

import React from 'react';
import { X, FileSpreadsheet, FileText, Download, Printer, Sparkles } from 'lucide-react';
import { ExportConfig, exportToExcel, exportToPdf } from '@/lib/exportUtils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ExportConfig;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, config }) => {
  if (!isOpen) return null;

  const handleExportExcel = () => {
    exportToExcel(config);
    onClose();
  };

  const handleExportPdf = () => {
    exportToPdf(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Exporter les données</h3>
              <p className="text-xs text-slate-500">
                {config.title} • {config.rows.length} élément{config.rows.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Options */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 font-medium">
            Choisissez le format d&apos;exportation selon votre besoin :
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Option 1: Excel */}
            <button
              type="button"
              onClick={handleExportExcel}
              className="p-4 rounded-xl border-2 border-emerald-200 hover:border-emerald-600 hover:bg-emerald-50/40 text-left transition-all group flex flex-col justify-between space-y-3 cursor-pointer bg-emerald-50/15"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  Tableur
                </span>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-800">
                  Format Excel (.xls)
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Feuille de calcul exploitable avec colonnes, données brutes et métadonnées.
                </p>
              </div>
              <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-700 group-hover:underline">
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger Excel</span>
              </div>
            </button>

            {/* Option 2: PDF */}
            <button
              type="button"
              onClick={handleExportPdf}
              className="p-4 rounded-xl border-2 border-rose-200 hover:border-rose-600 hover:bg-rose-50/40 text-left transition-all group flex flex-col justify-between space-y-3 cursor-pointer bg-rose-50/15"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-full">
                  Rapport A4
                </span>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-rose-800">
                  Format PDF (.pdf)
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Document officiel imprimable au format paysage avec sceau et en-tête institutionnel.
                </p>
              </div>
              <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-rose-700 group-hover:underline">
                <Printer className="w-3.5 h-3.5" />
                <span>Générer / Imprimer PDF</span>
              </div>
            </button>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>L&apos;export prend en compte les filtres et recherches actuellement appliqués sur votre écran.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
