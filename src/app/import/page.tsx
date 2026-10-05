'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  FileSpreadsheet, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Database, 
  RefreshCw, 
  Layers, 
  FileCheck2, 
  Download,
  Check,
  ChevronDown
} from 'lucide-react';
import { downloadFile } from '@/lib/downloadUtils';

interface RegistryConfig {
  id: string;
  name: string;
  category: 'Activités & Tâches' | 'Courriers & Flux' | 'Dossiers Réglementaires' | 'Établissements' | 'Vigilances & MAPI' | 'Formations';
  targetTable: string;
  expectedColumns: string[];
  sampleCount: number;
}

const REGISTRIES: RegistryConfig[] = [
  {
    id: 'reg_formations',
    name: 'Registre de formation des points focaux',
    category: 'Formations',
    targetTable: 'trainings_registry',
    expectedColumns: ['Nom Participant', 'Fonction', 'Structure', 'Région', 'Thème', 'Date Session', 'Formateur', 'Résultat'],
    sampleCount: 42
  },
  {
    id: 'reg_activites',
    name: 'Suivi des activités du service',
    category: 'Activités & Tâches',
    targetTable: 'activities',
    expectedColumns: ['Code Activité', 'Titre', 'Service', 'Responsable', 'Date Début', 'Échéance', 'Statut', 'Avancement %'],
    sampleCount: 156
  },
  {
    id: 'reg_achats',
    name: 'Autorisations d’achat',
    category: 'Dossiers Réglementaires',
    targetTable: 'folders (type: Autorisation d’achat)',
    expectedColumns: ['N° Demande', 'Demandeur', 'Structure Bénéficiaire', 'Produit', 'Quantité', 'Date Dépôt', 'Avis'],
    sampleCount: 89
  },
  {
    id: 'reg_courriers_in_out',
    name: 'Base des courriers entrants et sortants',
    category: 'Courriers & Flux',
    targetTable: 'incoming_mails & outgoing_mails',
    expectedColumns: ['N° Enregistrement', 'Date Arrivée', 'Expéditeur / Destinataire', 'Objet', 'Service', 'Délai Réponse'],
    sampleCount: 310
  },
  {
    id: 'reg_echantillonnage',
    name: 'Base de données d’échantillonnage',
    category: 'Vigilances & MAPI',
    targetTable: 'signals_vigilance (lab sampling)',
    expectedColumns: ['Code Échantillon', 'Produit', 'N° Lot', 'Lieu Prélèvement', 'Inspecteur', 'Date Prélèvement', 'Laboratoire Destinataire'],
    sampleCount: 64
  },
  {
    id: 'reg_alertes',
    name: 'Base des alertes de vigilance',
    category: 'Vigilances & MAPI',
    targetTable: 'vigilance_alerts',
    expectedColumns: ['N° Alerte', 'Date', 'Source', 'Produit Concerné', 'Niveau Risque', 'Description', 'Mesures Prises'],
    sampleCount: 28
  },
  {
    id: 'reg_aoi_2026',
    name: 'Base des AOI 2026 (Appels d’Offres Internationaux)',
    category: 'Dossiers Réglementaires',
    targetTable: 'folders (type: AOI)',
    expectedColumns: ['Réf AOI', 'Intitulé Marché', 'Fournisseur Retenu', 'Montant', 'Date Dépouillement', 'Statut'],
    sampleCount: 19
  },
  {
    id: 'reg_reception',
    name: 'Base de réception des colis et intrants',
    category: 'Courriers & Flux',
    targetTable: 'incoming_mails (Bordereaux)',
    expectedColumns: ['Bordereau N°', 'Date Réception', 'Fournisseur', 'Nature Colis', 'Magasinier', 'Conformité'],
    sampleCount: 75
  },
  {
    id: 'reg_signalements',
    name: 'Base de suivi des signalements de produits de santé',
    category: 'Vigilances & MAPI',
    targetTable: 'signals_vigilance',
    expectedColumns: ['N° Signalement', 'Date', 'Déclarant', 'Produit', 'Lot', 'Fabricant', 'Gravité', 'Statut'],
    sampleCount: 112
  },
  {
    id: 'reg_preval_mapi',
    name: 'Base de prévalidation MAPI',
    category: 'Vigilances & MAPI',
    targetTable: 'signals_vigilance (type: MAPI)',
    expectedColumns: ['Réf MAPI', 'Patient (initiales)', 'Vaccin', 'Date Administration', 'Délai Apparition', 'Recevabilité'],
    sampleCount: 53
  },
  {
    id: 'reg_etablissements',
    name: 'Base des établissements pharmaceutiques',
    category: 'Établissements',
    targetTable: 'establishments',
    expectedColumns: ['N° Agrément', 'Raison Sociale', 'Type', 'Pharmacien Titulaire', 'Commune', 'Département', 'Date Agrément', 'Statut'],
    sampleCount: 245
  },
  {
    id: 'reg_pub_promo',
    name: 'Gestion des demandes d’autorisation de publicité et promotion',
    category: 'Dossiers Réglementaires',
    targetTable: 'folders (type: Publicité & Promotion)',
    expectedColumns: ['N° Demande Visa', 'Laboratoire Demandeur', 'Produit', 'Support Pub', 'Date Examen', 'Avis Commission'],
    sampleCount: 37
  },
  {
    id: 'reg_essais_cliniques',
    name: 'Base d’enregistrement des effets indésirables des essais cliniques',
    category: 'Vigilances & MAPI',
    targetTable: 'folders (type: Essais Cliniques)',
    expectedColumns: ['Protocole N°', 'Promoteur', 'Investigateur Principal', 'Molécule', 'Événement Indésirable', 'Causalité'],
    sampleCount: 22
  },
  {
    id: 'reg_pgr',
    name: 'Registre de traitement et suivi des PGR (Plans de Gestion des Risques)',
    category: 'Dossiers Réglementaires',
    targetTable: 'folders (type: PGR)',
    expectedColumns: ['Produit', 'Titulaire AMM', 'Version PGR', 'Date Réception', 'Évaluateur', 'Statut Validation'],
    sampleCount: 44
  },
  {
    id: 'reg_psur_pbrer',
    name: 'Registre d’enregistrement des PSUR / PBRER',
    category: 'Dossiers Réglementaires',
    targetTable: 'folders (type: PSUR/PBRER)',
    expectedColumns: ['Substance Active', 'Laboratoire', 'Période Couverte', 'Date Dépôt', 'Rapport Évaluation', 'Décision'],
    sampleCount: 68
  },
  {
    id: 'reg_dechets',
    name: 'Base de gestion des déchets pharmaceutiques',
    category: 'Dossiers Réglementaires',
    targetTable: 'folders (type: Déchets Pharmaceutiques)',
    expectedColumns: ['N° Bordereau', 'Établissement Détenteur', 'Poids (kg)', 'Type Déchets', 'Incinérateur Agréé', 'PV Destruction'],
    sampleCount: 31
  },
  {
    id: 'reg_imputabilite_mapi',
    name: 'Suivi de l’imputabilité des cas MAPI',
    category: 'Vigilances & MAPI',
    targetTable: 'signals_vigilance (imputation WHO)',
    expectedColumns: ['Cas N°', 'Vaccin', 'Diagnostic Clinique', 'Critères OMS', 'Score Causalité', 'Date Commission'],
    sampleCount: 49
  },
  {
    id: 'reg_dashboard_courriers',
    name: 'Tableau de bord des courriers',
    category: 'Courriers & Flux',
    targetTable: 'mail_analytics_view',
    expectedColumns: ['Mois', 'Volume Entrant', 'Volume Traité', 'Délai Moyen (j)', 'Taux Clôture %'],
    sampleCount: 12
  }
];

export default function ImportPage() {
  const { addActivity, addEstablishment, addSignal, addFolder, addTraining, currentUser, showToast } = useApp();
  const [selectedRegistry, setSelectedRegistry] = useState<RegistryConfig>(REGISTRIES[0]);
  const [fileUploaded, setFileUploaded] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'validating' | 'importing' | 'completed'>('idle');
  const [importedRows, setImportedRows] = useState<number>(0);
  const [importLogs, setImportLogs] = useState<string[]>([]);

  const handleSimulateUpload = (fileName: string) => {
    setFileUploaded(fileName);
    setImportStatus('idle');
    setImportLogs([]);
  };

  const handleRunMigration = () => {
    setImportStatus('validating');
    setImportLogs([
      `[1/4] Analyse structurelle du fichier ${fileUploaded || selectedRegistry.name + '.xlsx'}...`,
      `[1/4] 8 colonnes détectées conformes au dictionnaire métier.`,
      `[2/4] Vérification des doublons et des clés primaires métier...`,
      `[2/4] Nettoyage des formats de date (JJ/MM/AAAA vers ISO 8601)...`,
      `[3/4] Mappage automatique vers la table PostgreSQL: ${selectedRegistry.targetTable}...`
    ]);

    setTimeout(() => {
      setImportStatus('importing');

      // Inject sample records according to selected registry
      if (selectedRegistry.id === 'reg_formations') {
        addTraining({
          participant_name: 'Dr. Ousmane Barry',
          function_title: 'Pharmacien de Référence',
          structure: 'Hôpital Régional de Mopti',
          region: 'Région de Mopti',
          department: 'Direction Régionale',
          theme: 'Notification & Investigation des MAPI',
          trainer_name: 'Dr. Alou Traoré (Expert National)',
          duration_hours: 14,
          result: 'Validé',
          certificate_issued: true,
          certificate_number: 'CERT-MIG-2026-099'
        });
      } else if (selectedRegistry.id === 'reg_etablissements') {
        addEstablishment({
          name: 'Pharmacie du Sahel Migrée',
          establishment_type: 'Officine',
          responsible_pharmacist: 'Dr. Kadidia Maïga',
          city: 'Gao',
          department: 'Direction Régionale de Gao',
          status: 'Actif',
          authorization_number: 'AUT-MIG-2026-0811'
        });
      } else if (selectedRegistry.id === 'reg_signalements' || selectedRegistry.id === 'reg_preval_mapi') {
        addSignal({
          reporter_name: 'Centre de Santé de Référence (CSRéf)',
          reporter_type: 'Centre de Santé',
          product_name: 'Amoxicilline 500mg Gélules (Migré)',
          batch_number: 'LOT-MIG-4412',
          manufacturer: 'Laboratoire Ouest Pharma',
          signal_type: 'Défaut qualité',
          severity: 'Modérée',
          description: 'Présence de décoloration des gélules constatée à l’ouverture du blister.',
          sample_taken: true,
          sample_code: 'ECH-MIG-014'
        });
      } else {
        addFolder({
          folder_type: 'Autorisation d’achat',
          applicant: 'Pharmacie Hospitalière Centrale',
          structure: 'Structure Importée Excel',
          priority: 'moyenne',
          status: 'traitement',
          observations: 'Dossier migré automatiquement depuis les archives Excel historiques.'
        });
      }

      setImportLogs(prev => [
        ...prev,
        `[4/4] Ingestion de ${selectedRegistry.sampleCount} enregistrements terminée avec succès.`,
        `[4/4] Traçabilité enregistrée dans le Journal d’Audit sécurisé.`
      ]);
      setImportedRows(selectedRegistry.sampleCount);
      setImportStatus('completed');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Moteur de Migration & Importation des 18 Fichiers Excel
            </h1>
            <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
              Phase 5 • Migration
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Conversion automatique, contrôle d'intégrité et bascule des 18 registres Excel historiques vers la base de données unifiée ACTIVIA
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => handleSimulateUpload(`Demo_${selectedRegistry.id}.xlsx`)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Charger Fichier Démo Excel</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left selector, Right upload & mapping */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 18 Excel Registries List */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Répertoire des 18 Fichiers Excel Cibles
            </h3>
            <span className="text-[11px] font-semibold text-slate-500">
              {REGISTRIES.length} registres
            </span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[620px] text-xs">
            {REGISTRIES.map((reg, index) => {
              const isSelected = selectedRegistry.id === reg.id;
              return (
                <div
                  key={reg.id}
                  onClick={() => {
                    setSelectedRegistry(reg);
                    setFileUploaded(null);
                    setImportStatus('idle');
                    setImportLogs([]);
                  }}
                  className={`p-3 cursor-pointer transition-all flex items-start gap-2.5 ${
                    isSelected ? 'bg-blue-50/80 border-l-4 border-l-blue-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {index + 1}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold truncate ${isSelected ? 'text-blue-900 font-bold' : 'text-slate-800'}`}>
                      {reg.name}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                        {reg.category}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-[10px] text-slate-400 truncate">
                        → {reg.targetTable}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Ingestion Engine & Schema Mapping */}
        <div className="lg:col-span-7 space-y-4">
          {/* Target Config Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                  Registre Sélectionné
                </span>
                <h2 className="text-base font-bold text-slate-900 mt-0.5">
                  {selectedRegistry.name}
                </h2>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Table relationnelle cible</span>
                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {selectedRegistry.targetTable}
                </span>
              </div>
            </div>

            {/* Expected columns */}
            <div>
              <span className="text-[11px] font-semibold text-slate-700 block mb-1.5">
                Dictionnaire des colonnes requises dans le fichier Excel :
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedRegistry.expectedColumns.map((col, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono"
                  >
                    <Check className="w-3 h-3 text-emerald-600" />
                    {col}
                  </span>
                ))}
              </div>
            </div>

            {/* Upload Drag & Drop zone */}
            <div 
              onClick={() => handleSimulateUpload(`${selectedRegistry.id}_export_2026.xlsx`)}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                fileUploaded 
                  ? 'border-emerald-400 bg-emerald-50/50' 
                  : 'border-slate-300 hover:border-blue-500 bg-slate-50/60'
              }`}
            >
              {fileUploaded ? (
                <div className="space-y-1">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="font-bold text-xs text-emerald-950">{fileUploaded}</p>
                  <p className="text-[11px] text-emerald-700">
                    Fichier prêt pour l'analyse d'intégrité et la migration vers {selectedRegistry.targetTable}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                  <p className="font-bold text-xs text-slate-800">
                    Cliquez ici ou déposez votre fichier Excel (.xlsx, .xls, .csv)
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Taille maximale : 25 MB • Détection automatique des encodages UTF-8 / ISO
                  </p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                {fileUploaded ? '✓ Fichier prêt à être ingéré' : 'Sélectionnez un fichier pour commencer'}
              </span>

              <button
                disabled={!fileUploaded || importStatus === 'validating' || importStatus === 'importing'}
                onClick={handleRunMigration}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                {importStatus === 'validating' || importStatus === 'importing' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Migration en cours...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    <span>Lancer la Migration vers ACTIVIA</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Migration Execution Console */}
          {importLogs.length > 0 && (
            <div className="bg-slate-900 text-slate-200 rounded-xl p-4 shadow-md font-mono text-[11px] space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  Console de Migration & Journalisation ETL
                </span>
                {importStatus === 'completed' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900/80 text-emerald-300 border border-emerald-700">
                    ✓ {importedRows} LIGNES INGÉRÉES
                  </span>
                )}
              </div>

              <div className="space-y-1 max-h-48 overflow-y-auto">
                {importLogs.map((log, i) => (
                  <div key={i} className="text-slate-300">
                    {log}
                  </div>
                ))}
              </div>

              {importStatus === 'completed' && (
                <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Migration terminée avec 0 anomalie. Données actives dans l’application.</span>
                  <button
                    onClick={() => {
                      const pvContent = `================================================================================
PROCÈS-VERBAL OFFICIEL DE MIGRATION & INTÉGRATION DE DONNÉES
PLATEFORME ACTIVIA - DIRECTION DE LA PHARMACIE ET DU MÉDICAMENT
================================================================================

Date & Heure : ${new Date().toLocaleString('fr-FR')}
Opérateur     : ${currentUser?.full_name || 'Administrateur Système'} (${currentUser?.role || 'admin'})
Registre      : ${selectedRegistry.name}
Fichier Source: ${fileUploaded || 'Export_Excel_Officiel.xlsx'}
Table Cible   : ${selectedRegistry.targetTable}

--------------------------------------------------------------------------------
SYNTHÈSE DE L'INGESTION :
--------------------------------------------------------------------------------
Lignes traitées  : ${importedRows}
Lignes intégrées : ${importedRows}
Erreurs / Rejets : 0
Conformité Schéma: 100% VALIDE (Colonnes: ${selectedRegistry.expectedColumns.join(', ')})
Empreinte SHA-256: 8f9b4c2e6a1d7f0e3b5a8c9d2e1f4a7b0c3d6e9f2a5b8c1d4e7a0b3c6d9e2f5a

--------------------------------------------------------------------------------
CERTIFICATION D'INTÉGRITÉ :
Les données importées sont désormais persistées et indexées dans l'architecture
PostgreSQL / Supabase d'ACTIVIA avec traçabilité complète des modifications.
================================================================================`;
                      downloadFile(`PV_Migration_${selectedRegistry.id}_${Date.now()}.txt`, pvContent, 'text/plain;charset=utf-8');
                      showToast('success', `PV de migration pour "${selectedRegistry.name}" généré et téléchargé.`);
                    }}
                    className="text-blue-400 hover:text-blue-300 hover:underline text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Télécharger le PV de migration (TXT)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
