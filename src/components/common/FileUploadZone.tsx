'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud, File, CheckCircle2, AlertCircle, RefreshCw, Sparkles, X, FileText, Image as ImageIcon, FileSpreadsheet } from 'lucide-react';
import { compressFile, formatFileSize, CompressedFileResult } from '@/lib/fileCompressor';

interface FileUploadZoneProps {
  label?: string;
  helperText?: string;
  accept?: string;
  onFileReady: (result: CompressedFileResult) => void;
  onClear?: () => void;
  selectedResult?: CompressedFileResult | null;
  className?: string;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  label = 'Sélectionner un fichier dans vos dossiers',
  helperText = 'PDF, Images scannées (JPG, PNG), Word ou Excel acceptés. Compression et allègement automatique de taille.',
  accept = '.pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx',
  onFileReady,
  onClear,
  selectedResult,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const result = await compressFile(file);
      onFileReady(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Impossible de traiter ce fichier.';
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onClear) onClear();
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <FileText className="w-5 h-5 text-rose-600" />;
      case 'Image': return <ImageIcon className="w-5 h-5 text-blue-600" />;
      case 'Excel': return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
      default: return <File className="w-5 h-5 text-indigo-600" />;
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />

      {!selectedResult ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/60 scale-[1.01]'
              : 'border-slate-300 hover:border-emerald-600 hover:bg-slate-50/70 bg-slate-50/30'
          }`}
        >
          {isProcessing ? (
            <div className="py-4 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-7 h-7 text-emerald-600 animate-spin" />
              <p className="text-xs font-bold text-slate-700">Traitement et compression intelligente du fichier...</p>
              <p className="text-[11px] text-slate-400">Allègement de la taille pour un chargement ultra-rapide</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">{label}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{helperText}</p>
              </div>
              <button
                type="button"
                className="mt-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs pointer-events-none"
              >
                Parcourir mes dossiers
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Fichier sélectionné avec affichage du gain de compression */
        <div className="bg-white rounded-xl border border-emerald-200 p-3.5 shadow-xs space-y-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-lg bg-slate-100 shrink-0">
                {getFileIcon(selectedResult.fileType)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate" title={selectedResult.fileName}>
                  {selectedResult.fileName}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                  <span className="text-slate-500">
                    Taille finale : <strong className="text-slate-800">{formatFileSize(selectedResult.compressedSizeKb)}</strong>
                  </span>
                  {selectedResult.isCompressed && (
                    <span className="text-slate-400 line-through text-[10px]">
                      {formatFileSize(selectedResult.originalSizeKb)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
              title="Retirer ce fichier et en choisir un autre"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Badge de compression et gain d'espace */}
          {selectedResult.isCompressed && selectedResult.savedPercentage > 0 ? (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Fichier compressé avec succès : <strong>-{selectedResult.savedPercentage}% d&apos;espace économisé</strong> ({formatFileSize(selectedResult.originalSizeKb)} → {formatFileSize(selectedResult.compressedSizeKb)})
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-[11px]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Fichier prêt et optimisé pour le versement administratif.</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold underline cursor-pointer"
            >
              Changer de fichier...
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
