'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { DocumentItem } from '@/types';
import { downloadSampleDocument } from '@/lib/downloadUtils';
import { 
  FileText, 
  FileSpreadsheet, 
  Image as ImageIcon, 
  File, 
  Search, 
  Download, 
  Trash2, 
  Upload, 
  Eye, 
  Folder, 
  Mail, 
  Activity,
  CheckCircle,
  X,
  ExternalLink
} from 'lucide-react';

export const DocumentBrowser: React.FC = () => {
  const { documents, addDocument, deleteDocument, currentUser, showToast } = useApp();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedEntity, setSelectedEntity] = useState('all');
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  // Upload simulation modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState<'PDF' | 'Word' | 'Excel' | 'Image'>('PDF');
  const [newDocRef, setNewDocRef] = useState('');
  const [newDocEntity, setNewDocEntity] = useState<'dossier' | 'courrier' | 'activite'>('dossier');

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      if (selectedType !== 'all' && doc.file_type !== selectedType) return false;
      if (selectedEntity !== 'all' && doc.entity_type !== selectedEntity) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = doc.name.toLowerCase().includes(q);
        const matchRef = doc.entity_ref.toLowerCase().includes(q);
        const matchAuthor = doc.uploaded_by_name.toLowerCase().includes(q);
        if (!matchName && !matchRef && !matchAuthor) return false;
      }
      return true;
    });
  }, [documents, selectedType, selectedEntity, search]);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;

    const docFileName = newDocName.trim().endsWith(`.${newDocType.toLowerCase()}`) ? newDocName.trim() : `${newDocName.trim()}.${newDocType === 'Word' ? 'docx' : newDocType === 'Excel' ? 'xlsx' : newDocType === 'Image' ? 'png' : 'pdf'}`;

    addDocument({
      name: docFileName,
      file_type: newDocType,
      size_kb: Math.floor(Math.random() * 2000) + 150,
      entity_type: newDocEntity,
      entity_ref: newDocRef || 'REF-GENERAL',
    });

    setNewDocName('');
    setNewDocRef('');
    setIsUploadOpen(false);
    showToast('success', `Document "${docFileName}" déposé et indexé avec succès dans le coffre GED sécurisé.`);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <FileText className="w-5 h-5 text-rose-600" />;
      case 'Word':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'Excel':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
      case 'Image':
        return <ImageIcon className="w-5 h-5 text-purple-600" />;
      default:
        return <File className="w-5 h-5 text-slate-500" />;
    }
  };

  const getEntityBadge = (entityType: string, ref: string) => {
    let route = '/folders';
    if (entityType === 'courrier') route = '/mail';
    if (entityType === 'activite') route = '/activities';

    switch (entityType) {
      case 'dossier':
        return (
          <Link href={route} className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 px-2 py-0.5 rounded border border-blue-200 transition-colors" title="Naviguer vers le module Dossiers">
            <Folder className="w-3 h-3" /> {ref}
            <ExternalLink className="w-2.5 h-2.5 opacity-60 ml-0.5" />
          </Link>
        );
      case 'courrier':
        return (
          <Link href={route} className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-300 px-2 py-0.5 rounded border border-indigo-200 transition-colors" title="Naviguer vers le module Courriers">
            <Mail className="w-3 h-3" /> {ref}
            <ExternalLink className="w-2.5 h-2.5 opacity-60 ml-0.5" />
          </Link>
        );
      case 'activite':
        return (
          <Link href={route} className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 hover:border-teal-300 px-2 py-0.5 rounded border border-teal-200 transition-colors" title="Naviguer vers le module Activités">
            <Activity className="w-3 h-3" /> {ref}
            <ExternalLink className="w-2.5 h-2.5 opacity-60 ml-0.5" />
          </Link>
        );
      default:
        return <span className="font-mono text-[11px] text-slate-600">{ref}</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Action Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un fichier, une référence, un auteur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white w-64"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800"
          >
            <option value="all">Tous types (PDF, Word, Excel, Images)</option>
            <option value="PDF">Fichiers PDF</option>
            <option value="Word">Documents Word</option>
            <option value="Excel">Tableurs Excel</option>
            <option value="Image">Images & Scans</option>
          </select>

          <select
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800"
          >
            <option value="all">Toutes associations</option>
            <option value="dossier">Rattaché à un Dossier</option>
            <option value="courrier">Rattaché à un Courrier</option>
            <option value="activite">Rattaché à une Activité</option>
          </select>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span>Déposer un Document</span>
        </button>
      </div>

      {/* Documents Grid / Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-4 rounded-full bg-blue-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Coffre-fort GED & Archives Numériques</h3>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">{filteredDocs.length} document(s)</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              {documents.filter(d => d.file_type === 'PDF').length} PDF
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {documents.filter(d => d.file_type === 'Excel').length} Excel
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              {documents.filter(d => d.file_type === 'Word').length} Word
            </span>
          </div>
        </div>
        {/* Vue Mobile & Tablette (< 1024px) : Cartes sans debordement */}
        <div className="block lg:hidden divide-y divide-slate-100">
          {filteredDocs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Aucun document ne correspond à vos filtres de recherche.
            </div>
          ) : (
            <div className="p-3 space-y-2.5">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/90 shadow-2xs space-y-2.5"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 bg-white rounded-lg border border-slate-200 shrink-0">
                      {getFileIcon(doc.file_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs text-slate-900 truncate">{doc.name}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                        <span className="font-medium">{doc.file_type}</span>
                        <span>•</span>
                        <span className="font-mono">{doc.size_kb > 1024 ? `${(doc.size_kb / 1024).toFixed(1)} MB` : `${doc.size_kb} KB`}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-[11px] pt-1 border-t border-slate-200/60">
                    <div className="truncate">
                      {getEntityBadge(doc.entity_type, doc.entity_ref)}
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">{doc.uploaded_at}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[10px] text-slate-600 truncate">
                      Par : <strong className="text-slate-800">{doc.uploaded_by_name}</strong>
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="p-1.5 text-slate-600 hover:text-blue-600 bg-white border border-slate-200 rounded-lg transition-colors cursor-pointer"
                        title="Aperçu du document"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          downloadSampleDocument(doc.name, doc.entity_ref, doc.entity_type);
                          showToast('success', `Téléchargement du document "${doc.name}" démarré.`);
                        }}
                        className="p-1.5 text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                        title="Télécharger"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      {(currentUser.role === 'admin' || currentUser.role === 'chef_service') && (
                        <button
                          onClick={() => {
                            if (confirm(`Supprimer définitivement ${doc.name} de la GED ?`)) {
                              deleteDocument(doc.id);
                            }
                          }}
                          className="p-1.5 text-rose-600 hover:text-rose-700 bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vue Desktop (>= 1024px) : Tableau fluide 100% */}
        <div className="hidden lg:block w-full max-w-full overflow-x-auto">
          <table className="w-full table-auto text-xs text-left text-slate-700 min-w-[760px] lg:min-w-0">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Fichier & Nom</th>
                <th className="py-2.5 px-3 font-semibold">Format</th>
                <th className="py-2.5 px-3 font-semibold">Taille</th>
                <th className="py-2.5 px-3 font-semibold">Rattaché à</th>
                <th className="py-2.5 px-3 font-semibold">Déposé par</th>
                <th className="py-2.5 px-3 font-semibold">Date de dépôt</th>
                <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Aucun document ne correspond à vos filtres de recherche.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Nom */}
                    <td className="py-2.5 px-3 max-w-xs">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-slate-100 rounded-md shrink-0">
                          {getFileIcon(doc.file_type)}
                        </div>
                        <span className="font-semibold text-slate-900 truncate">{doc.name}</span>
                      </div>
                    </td>

                    {/* Format */}
                    <td className="py-2.5 px-3 font-medium text-slate-600 whitespace-nowrap">
                      {doc.file_type}
                    </td>

                    {/* Taille */}
                    <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                      {doc.size_kb > 1024 ? `${(doc.size_kb / 1024).toFixed(1)} MB` : `${doc.size_kb} KB`}
                    </td>

                    {/* Rattaché à */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {getEntityBadge(doc.entity_type, doc.entity_ref)}
                    </td>

                    {/* Déposé par */}
                    <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                      {doc.uploaded_by_name}
                    </td>

                    {/* Date */}
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                      {doc.uploaded_at}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          title="Aperçu du document"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            downloadSampleDocument(doc.name, doc.entity_ref, doc.entity_type);
                            showToast('success', `Téléchargement du document "${doc.name}" démarré.`);
                          }}
                          className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          title="Télécharger"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        {(currentUser.role === 'admin' || currentUser.role === 'chef_service') && (
                          <button
                            onClick={() => {
                              if (confirm(`Supprimer définitivement ${doc.name} de la GED ?`)) {
                                deleteDocument(doc.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Déposer une pièce dans le coffre documentaire</h3>
              <button onClick={() => setIsUploadOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nom du fichier</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Certificat_Analytique_HPLC_2026.pdf"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Format de document</label>
                  <select
                    value={newDocType}
                    onChange={(e) => setNewDocType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="PDF">PDF</option>
                    <option value="Word">Word (.docx)</option>
                    <option value="Excel">Excel (.xlsx)</option>
                    <option value="Image">Image / Scan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type d'entité</label>
                  <select
                    value={newDocEntity}
                    onChange={(e) => setNewDocEntity(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="dossier">Dossier</option>
                    <option value="courrier">Courrier</option>
                    <option value="activite">Activité</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Référence associée</label>
                <input
                  type="text"
                  placeholder="Ex: DOS-2026-0089 ou ARR-2026-0891"
                  value={newDocRef}
                  onChange={(e) => setNewDocRef(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 rounded-lg text-slate-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getFileIcon(previewDoc.file_type)}
                <h3 className="font-bold text-slate-900 text-sm">{previewDoc.name}</h3>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
                {getFileIcon(previewDoc.file_type)}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-base">{previewDoc.name}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Format : {previewDoc.file_type} • Taille : {previewDoc.size_kb} KB • Déposé le {previewDoc.uploaded_at} par {previewDoc.uploaded_by_name}
                </p>
                <p className="text-xs text-blue-700 font-mono font-semibold mt-2">
                  Liaison : {previewDoc.entity_ref} ({previewDoc.entity_type})
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Document signé électroniquement et intègre dans le coffre documentaire sécurisé</span>
              </div>

              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={() => {
                    downloadSampleDocument(previewDoc.name, previewDoc.entity_ref, previewDoc.entity_type);
                    showToast('success', `Téléchargement du document "${previewDoc.name}" démarré.`);
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-4 h-4" /> Télécharger l'original
                </button>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

