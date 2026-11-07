'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { FolderTable } from '@/components/folders/FolderTable';
import { FolderModal } from '@/components/folders/FolderModal';
import { FolderDetailModal } from '@/components/folders/FolderDetailModal';
import { useApp } from '@/context/AppContext';
import { Folder, FolderType } from '@/types';
import { FolderArchive, Plus, Search, Filter, CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react';
import { ExportButton } from '@/components/common/ExportButton';
import { ExportConfig } from '@/lib/exportUtils';
import { DatePeriodFilter } from '@/components/common/DatePeriodFilter';
import { matchesDateFilter, extractUniqueYears } from '@/lib/dateFilterUtils';

function FoldersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type') || 'all';

  const { folders } = useApp();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);

  // Synchronisation dynamique lors du clic sur les sous-modules du menu MÉTIERS
  React.useEffect(() => {
    const t = searchParams.get('type');
    if (t) {
      setSelectedType(t);
    } else {
      setSelectedType('all');
    }
  }, [searchParams]);

  // Filtres temporels (Jour, Mois, Année)
  const [yearFilter, setYearFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  const availableYears = useMemo(() => {
    return extractUniqueYears(
      folders,
      (f) => f.receipt_date || f.created_at,
      ['2026', '2025', '2024', '2023']
    );
  }, [folders]);

  const folderTypes: FolderType[] = [
    'Agrément CNAECP (Clientèle Privée)',
    'Autorisation Installation CNAIAPS-EM',
    'Quitus d’Ouverture d’Officine',
    'Quitus de Transfert d’Officine',
    'Carte Visiteur Médical',
    'Notification d’absence',
    'Résiliation Pharmacien / Gérant',
    'Autorisation d’achat',
    'Autorisation de transit',
    'Autorisation de transit & AOI',
    'Publicité',
    'Revue PSUR / PBRER / DSUR',
    'Essais Cliniques & EIG',
    'Destruction',
    'Autorisation Matériel Médical & PCRL',
    'Autre Dossier Réglementaire'
  ];

  // Détection du sous-module métier actif si filtré par type
  const activeMetierInfo = useMemo(() => {
    if (selectedType === 'all') return null;
    const q = selectedType.toLowerCase();
    if (q.includes('cnaecp')) {
      return { service: 'Service des Licences (SL)', title: 'Agréments CNAECP (Exercice en Clientèle Privée)' };
    }
    if (q.includes('cnaiaps')) {
      return { service: 'Service des Licences (SL)', title: 'Autorisations d’Installation CNAIAPS-EM' };
    }
    if (q.includes('quitus')) {
      return { service: 'Service des Licences (SL)', title: 'Quitus d’Ouverture & Transfert d’Officine' };
    }
    if (q.includes('visiteur')) {
      return { service: 'Service des Licences (SL)', title: 'Cartes Professionnelles des Visiteurs Médicaux (VM)' };
    }
    if (q.includes('absence')) {
      return { service: 'Service des Licences (SL)', title: 'Notifications d’Absence des Pharmaciens Titulaires' };
    }
    if (q.includes('achat')) {
      return { service: 'Surveillance du Marché (SSMUR)', title: 'Autorisations d’Achat de Médicaments' };
    }
    if (q.includes('transit') || q.includes('aoi')) {
      return { service: 'Surveillance du Marché (SSMUR)', title: 'Autorisations d’Ouverture & Importation / Transit (AOI)' };
    }
    if (q.includes('publicit')) {
      return { service: 'Surveillance du Marché (SSMUR)', title: 'Demandes de Publicité & Promotion des Médicaments (AMM)' };
    }
    if (q.includes('destruct')) {
      return { service: 'Surveillance du Marché (SSMUR)', title: 'Procédures de Destruction & Déclassement de Produits' };
    }
    if (q.includes('psur')) {
      return { service: 'Vigilance des Produits de Santé (SVPS)', title: 'Rapports Périodiques de Sécurité (PSUR / PBRER / DSUR)' };
    }
    if (q.includes('essai')) {
      return { service: 'Vigilance des Produits de Santé (SVPS)', title: 'Protocoles d’Essais Cliniques & Événements Indésirables Graves (EIG)' };
    }
    return { service: 'Direction DLVS', title: selectedType };
  }, [selectedType]);

  // Filtering
  const filteredFolders = useMemo(() => {
    return folders.filter((f) => {
      if (selectedType !== 'all') {
        const qType = selectedType.toLowerCase();
        const fType = f.folder_type.toLowerCase();
        const matchesType = fType === qType || 
          fType.includes(qType) ||
          qType.includes(fType) ||
          (qType.includes('achat') && fType.includes('achat')) ||
          (qType.includes('transit') && (fType.includes('transit') || fType.includes('aoi'))) ||
          (qType.includes('publicit') && fType.includes('publicit')) ||
          (qType.includes('absence') && fType.includes('absence')) ||
          (qType.includes('visiteur') && fType.includes('visiteur')) ||
          (qType.includes('cnaecp') && fType.includes('cnaecp')) ||
          (qType.includes('cnaiaps') && fType.includes('cnaiaps')) ||
          (qType.includes('quitus') && fType.includes('quitus')) ||
          (qType.includes('psur') && fType.includes('psur')) ||
          (qType.includes('essai') && fType.includes('essai')) ||
          (qType.includes('destruct') && (fType.includes('destruct') || fType.includes('déchet')));
        if (!matchesType) return false;
      }
      if (selectedStatus !== 'all' && f.status !== selectedStatus) return false;

      // Filtre temporel (Jour, Mois, Année)
      if (!matchesDateFilter(f.receipt_date || f.created_at, { year: yearFilter, month: monthFilter, exactDate: dateFilter })) {
        return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchNum = f.folder_number.toLowerCase().includes(q);
        const matchStruct = f.structure.toLowerCase().includes(q);
        const matchApp = f.applicant.toLowerCase().includes(q);
        if (!matchNum && !matchStruct && !matchApp) return false;
      }
      return true;
    });
  }, [folders, selectedType, selectedStatus, search, yearFilter, monthFilter, dateFilter]);

  const totalFolders = filteredFolders.length;
  const enInstruction = filteredFolders.filter(f => f.status !== 'cloture' && f.status !== 'rejete').length;
  const autorises = filteredFolders.filter(f => f.decision === 'Favorable' || f.decision === 'Arrêté signé').length;
  const enRetard = filteredFolders.filter(f => new Date(f.due_date).getTime() < Date.now() && f.status !== 'cloture').length;

  const getFoldersExportConfig = (): ExportConfig => ({
    title: activeMetierInfo 
      ? `Registre Métier Officiel — ${activeMetierInfo.title}`
      : selectedType !== 'all' 
      ? `Registre officiel — ${selectedType}`
      : 'Registre Général des Dossiers Réglementaires & Demandes',
    subtitle: 'Agence béninoise du Médicament et des autres produits de Santé (ABMed) — Direction DLVS',
    filename: `dossiers_dlvs_${new Date().toISOString().split('T')[0]}`,
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
      { label: 'Favorables', value: filteredFolders.filter(f => f.decision === 'Favorable' || f.decision === 'Arrêté signé').length }
    ]
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header - Dynamique selon le sous-module métier actif */}
        {activeMetierInfo ? (
          <div className="bg-gradient-to-r from-[#0b1120] to-[#151f38] text-white p-5 rounded-2xl border border-slate-700/80 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                  Module 04 MÉTIERS
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  • {activeMetierInfo.service}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 mt-1">
                <FolderArchive className="w-6 h-6 text-emerald-400 shrink-0" />
                <span>{activeMetierInfo.title}</span>
              </h1>
              <p className="text-xs text-slate-400">
                Registre métier officiel • <strong className="text-emerald-300 font-bold">{filteredFolders.length} dossier(s) exploité(s)</strong> issu(s) des bases de données réelles DLVS
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap shrink-0">
              <button
                onClick={() => {
                  setSelectedType('all');
                  router.push('/folders');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Afficher tous les dossiers de tous les métiers"
              >
                <span>← Voir tous les dossiers</span>
              </button>
              <ExportButton getConfig={getFoldersExportConfig} />
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau Dossier</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                  Module 04 MÉTIERS
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  • Vue Globale Tous Services (SL, SSMUR, SVPS)
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <FolderArchive className="w-6 h-6 text-emerald-700" />
                Registre Global des Dossiers Réglementaires & Demandes
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Instruction, circuit de recevabilité, timeline des jalons et prise de décision sur l’ensemble des dossiers réels DLVS
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
        )}

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

          {/* Filtres temporels (Jour, Mois, Année) */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <DatePeriodFilter
              selectedYear={yearFilter}
              onYearChange={setYearFilter}
              selectedMonth={monthFilter}
              onMonthChange={setMonthFilter}
              selectedDate={dateFilter}
              onDateChange={setDateFilter}
              years={availableYears}
            />

            <div className="text-xs text-slate-500 font-medium">
              Résultats : <strong className="text-slate-800 font-bold">{filteredFolders.length}</strong> dossier(s)
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

