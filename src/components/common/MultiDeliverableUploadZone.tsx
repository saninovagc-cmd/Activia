'use client';

import React, { useRef, useState } from 'react';
import { 
  Plus, 
  UploadCloud, 
  X, 
  FileText, 
  Image as ImageIcon, 
  FileSpreadsheet, 
  File, 
  RefreshCw, 
  Sparkles, 
  Trash2,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';
import { compressFile, formatFileSize, detectFileType } from '@/lib/fileCompressor';

export interface PendingDeliverable {
  id: string;
  name: string;
  fileType: 'PDF' | 'Word' | 'Excel' | 'Image' | 'Autre';
  originalSizeKb: number;
  compressedSizeKb: number;
  savedPercentage: number;
  dataUrl?: string;
  isProcessing?: boolean;
}

interface MultiDeliverableUploadZoneProps {
  items: PendingDeliverable[];
  onChange: (items: PendingDeliverable[]) => void;
  accept?: string;
  helperText?: string;
}

export const MultiDeliverableUploadZone: React.FC<MultiDeliverableUploadZoneProps> = ({
  items,
  onChange,
  accept = '.pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx',
  helperText = 'Sélectionnez un ou plusieurs fichiers. Cliquez sur « + » autant de fois que souhaité pour ajouter d’autres livrables.'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isGlobalProcessing, setIsGlobalProcessing] = useState(false);

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setIsGlobalProcessing(true);

    // Initial temporary entries with loading state
    const tempIds = fileArray.map(() => `pend-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    const newTempItems: PendingDeliverable[] = fileArray.map((f, i) => ({
      id: tempIds[i],
      name: f.name,
      fileType: detectFileType(f.name, f.type),
      originalSizeKb: Math.max(1, Math.round(f.size / 1024)),
      compressedSizeKb: Math.max(1, Math.round(f.size / 1024)),
      savedPercentage: 0,
      isProcessing: true,
    }));

    // Append to existing items
    const updatedWithLoading = [...items, ...newTempItems];
    onChange(updatedWithLoading);

    // Process files concurrently
    const processedResults = await Promise.all(
      fileArray.map(async (file, idx) => {
        try {
          const comp = await compressFile(file);
          return {
            id: tempIds[idx],
            name: file.name,
            fileType: comp.fileType,
            originalSizeKb: comp.originalSizeKb,
            compressedSizeKb: comp.compressedSizeKb,
            savedPercentage: comp.savedPercentage,
            dataUrl: comp.dataUrl,
            isProcessing: false,
          } as PendingDeliverable;
        } catch {
          const rawKb = Math.max(1, Math.round(file.size / 1024));
          return {
            id: tempIds[idx],
            name: file.name,
            fileType: detectFileType(file.name, file.type),
            originalSizeKb: rawKb,
            compressedSizeKb: rawKb,
            savedPercentage: 0,
            isProcessing: false,
          } as PendingDeliverable;
        }
      })
    );

    // Replace temp items with finalized results
    onChange(
      items.concat(processedResults)
    );
    setIsGlobalProcessing(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleUpdateItem = (id: string, updates: Partial<PendingDeliverable>) => {
    onChange(items.map(it => it.id === id ? { ...it, ...updates } : it));
  };

  const handleRemoveItem = (id: string) => {
    onChange(items.filter(it => it.id !== id));
  };

  const openPicker = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <FileText className="w-4 h-4 text-rose-600" />;
      case 'Image': return <ImageIcon className="w-4 h-4 text-blue-600" />;
      case 'Excel': return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
      default: return <File className="w-4 h-4 text-indigo-600" />;
    }
  };

  const totalOriginalKb = items.reduce((acc, it) => acc + (it.originalSizeKb || 0), 0);
  const totalCompressedKb = items.reduce((acc, it) => acc + (it.compressedSizeKb || 0), 0);
  const totalSavedKb = Math.max(0, totalOriginalKb - totalCompressedKb);
  const totalSavedPercent = totalOriginalKb > 0 ? Math.round((totalSavedKb / totalOriginalKb) * 100) : 0;

  return (
    <div className="space-y-3">
      {/* Hidden file input with multiple enabled */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        multiple
        className="hidden"
      />

      {/* Main drop / add area */}
      {items.length === 0 ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={openPicker}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/70 scale-[1.01]'
              : 'border-slate-300 hover:border-emerald-600 hover:bg-slate-50/80 bg-slate-50/40'
          }`}
        >
          {isGlobalProcessing ? (
            <div className="py-3 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
              <p className="text-xs font-bold text-slate-800">Compression et optimisation des fichiers...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-2xs">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Choisir les livrables dans vos dossiers
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">{helperText}</p>
              </div>
              <button
                type="button"
                className="mt-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 pointer-events-none"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Parcourir mes dossiers</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* List of staged files with add more button */
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>Livrables prêts à être enregistrés ({items.length})</span>
              {totalSavedPercent > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  -{totalSavedPercent}% d&apos;espace économisé
                </span>
              )}
            </span>

            {/* Quick '+' button to add more files anytime */}
            <button
              type="button"
              onClick={openPicker}
              className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
              title="Ajouter un autre fichier depuis vos dossiers"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter un fichier (+)</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white overflow-hidden shadow-2xs">
            {items.map((it, idx) => (
              <div key={it.id} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-slate-400 w-5 text-center shrink-0">
                    #{idx + 1}
                  </span>
                  <div className="p-1.5 rounded-lg bg-slate-100 shrink-0">
                    {getFileIcon(it.fileType)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <input
                      type="text"
                      value={it.name}
                      onChange={(e) => handleUpdateItem(it.id, { name: e.target.value })}
                      placeholder="Nom du livrable..."
                      className="w-full text-xs font-semibold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-600 focus:bg-white focus:outline-none px-1 py-0.5 rounded transition-all"
                    />
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                      {it.isProcessing ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          Optimisation en cours...
                        </span>
                      ) : (
                        <>
                          <span>Taille : {formatFileSize(it.compressedSizeKb)}</span>
                          {it.savedPercentage > 0 && (
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              -{it.savedPercentage}% (initial: {formatFileSize(it.originalSizeKb)})
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <select
                    value={it.fileType}
                    onChange={(e) => handleUpdateItem(it.id, { fileType: e.target.value as any })}
                    className="text-[11px] font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none"
                  >
                    <option value="PDF">PDF</option>
                    <option value="Word">Word</option>
                    <option value="Excel">Excel</option>
                    <option value="Image">Photo / Scan</option>
                    <option value="Autre">Autre</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(it.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Retirer ce livrable de la liste"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add more button row */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={openPicker}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 px-3 py-1.5 rounded-lg border border-dashed border-emerald-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un autre fichier (+)</span>
            </button>

            <span className="text-[11px] text-slate-500">
              {items.length} fichier{items.length > 1 ? 's' : ''} au total • {formatFileSize(totalCompressedKb)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
