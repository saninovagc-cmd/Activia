'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { FolderTable } from '@/components/folders/FolderTable';
import { FolderModal } from '@/components/folders/FolderModal';
import { FolderDetailModal } from '@/components/folders/FolderDetailModal';
import { useApp } from '@/context/AppContext';
import { Folder, FolderType } from '@/types';
import { FolderArchive, Plus, Search, Filter, CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react';
import { ExportButton } from '@/components/common/ExportButton';
import { ExportConfig } from '@/lib/exportUtils';

function FoldersPageContent() {
  const { folders } = useApp();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);

  const folderTypes: FolderType[] = [
    'Autorisation d’achat',
    'Agrément Établissement',
    'Publicité & Promotion',
    'Enregistrement PGR',
    'Revue PSUR / PBRER',
    'Essai Clinique & EIG',
    'Élimination Déchets',
    'Autre Dossier Technique'
  ];

  // Filtering
  const filteredFolders = useMemo(() => {
    return folders.filter((f) => {
      if (selectedType !== 'all' && f.folder_type !== selectedType) return false;
      if (selectedStatus !== 'all' && f.status !== selectedStatus) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchNum = f.folder_number.toLowerCase().includes(q);
        const matchStruct = f.structure.toLowerCase().includes(q);
        const matchApp = f.applicant.toLowerCase().includes(q);
        if (!matchNum && !matchStruct && !matchApp) return false;
      }
      return true;
    });
  }, [folders, selectedType, selectedStatus, search]);

  const totalFolders = folders.length;
  const enInstruction = folders.filter(f => f.status !== 'cloture' && f.status !== 'rejete').length;
  const autorises = folders.filter(f => f.decision === 'Favorable').length;
  const enRetard = folders.filter(f => new Date(f.due_date).getTime() < Date.now() && f.status !== 'cloture').length;

  const getFoldersExportConfig = (): ExportConfig => ({
    title: 'Registre des Dossiers Réglementaires & Demandes',
    subtitle: 'Direction de la Pharmacie et du Médicament — Suivi des autorisations et homologations ACTIVIA',
    filename: `dossiers_activia_${new Date().toISOString().split('T')[0]}`,
    headers: ['N° Dossier', 'Structure / Demandeur', 'Typologie', 'Priorité', 'Statut / Étape', 'Date Dépôt', 'Échéance SLA', 'Décision'],
    rows: filteredFolders.map(f => [
      f.folder_number,
      `${f.structure} (${f.applicant})`,
      f.folder_type,
      f.priority,
      f.status,
      f.receipt_date,
      f.due_date,
      f.decision || 'En attente'
    ]),
    summaryKpis: [
      { label: 'Total Dossiers', value: filteredFolders.length },
      { label: 'En Instruction', value: filteredFolders.filter(f => f.status !== 'cloture' && f.status !== 'rejete').length },
      { label: 'En Retard SLA', value: filteredFolders.filter(f => new Date(f.due_date).getTime() < Date.now() && f.status !== 'cloture').length },
      { label: 'Favorables', value: filteredFolders.filter(f => f.decision === 'Favorable').length }
    ]
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FolderArchive className="w-6 h-6 text-blue-600" />
              Gestion des Dossiers & Demandes Réglementaires
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Instruction, circuit de recevabilité, timeline des jalons et prise de décision
            </p>
          </div>

          <div className="flex items-center gap-2">
            <ExportButton getConfig={getFoldersExportConfig} />
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Dossier</span>
            </button>
          </div>
        </div>

        {/* KPI Mini Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Total Dossiers Enregistrés</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalFolders}</p>
            <span className="text-[11px] text-blue-600 font-medium">Toutes procédures</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">En Cours d’Instruction</span>
            <p className="text-2xl font-black text-blue-600 mt-1">{enInstruction}</p>
            <span className="text-[11px] text-slate-500 font-medium">Circuit ouvert</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Hors Délais SLA</span>
            <p className="text-2xl font-black text-rose-600 mt-1">{enRetard}</p>
            <span className="text-[11px] text-rose-600 font-medium">Action prioritaire</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Décisions Favorables</span>
            <p className="text-2xl font-black text-emerald-600 mt-1">{autorises}</p>
            <span className="text-[11px] text-emerald-600 font-medium">Autorisations délivrées</span>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par numéro, structure, demandeur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            {/* Type */}
            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
              >
                <option value="all">Tous types de dossiers</option>
                {folderTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Statut */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
              >
                <option value="all">Toutes étapes du circuit</option>
                <option value="depot">Dépôt</option>
                <option value="reception">Réception</option>
                <option value="verification">Vérification</option>
                <option value="complet">Dossier complet</option>
                <option value="traitement">Traitement</option>
                <option value="validation">Validation</option>
                <option value="decision">Décision</option>
                <option value="notification">Notification</option>
                <option value="cloture">Clôture</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table of Folders */}
        <FolderTable
          folders={filteredFolders}
          onSelect={(folder) => setSelectedFolder(folder)}
        />

        {/* Create Folder Modal */}
        <FolderModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />

        {/* Detail Modal */}
        <FolderDetailModal
          folder={selectedFolder}
          onClose={() => setSelectedFolder(null)}
        />
      </div>
    </AppLayout>
  );
}

export default function FoldersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-500">Chargement des dossiers...</div>}>
      <FoldersPageContent />
    </Suspense>
  );
}

