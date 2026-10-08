'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/context/AppContext';
import { downloadFile } from '@/lib/downloadUtils';
import { 
  Settings, 
  Database, 
  Plus, 
  Check, 
  Shield, 
  RotateCcw, 
  X, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Copy, 
  RefreshCw, 
  Server, 
  Sparkles,
  Key,
  Eye,
  EyeOff,
  Lock,
  User
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { testSupabaseConnection, SupabaseConnectionStatus, isSupabaseConfigured } from '@/lib/supabase';
import { COMPLETE_SUPABASE_SQL } from '@/lib/completeSqlSchema';
import { UserProfile } from '@/types';

interface RefItem {
  id: string;
  title: string;
  items: string[];
}

export default function SettingsPage() {
  const { allUsers, currentUser, updateUserPassword, resetUserPassword, resetToDefaultData, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'referentials' | 'users' | 'database'>('referentials');
  const [dbStatus, setDbStatus] = useState<SupabaseConnectionStatus | null>(null);
  const [testingDb, setTestingDb] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // User password management states
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<UserProfile | null>(null);
  const [adminCustomPassword, setAdminCustomPassword] = useState('');
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);

  const runConnectionTest = async () => {
    setTestingDb(true);
    try {
      const res = await testSupabaseConnection();
      setDbStatus(res);
      if (res.isConnected) {
        showToast('success', `Connexion établie avec Supabase (${res.latencyMs} ms)`);
      } else {
        showToast('error', res.message);
      }
    } catch {
      showToast('error', 'Erreur lors du test de connexion');
    } finally {
      setTestingDb(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'database' && !dbStatus) {
      runConnectionTest();
    }
  }, [activeTab]);

  const [referentials, setReferentials] = useState<RefItem[]>([
    { id: 'act_types', title: "Types d'activités", items: ['Réglementaire', 'Inspection', 'Vigilance & Alerte', 'Échantillonnage', 'Évaluation Dossier', 'Formation', 'Réunion Technique', 'Autre'] },
    { id: 'statuses', title: "Statuts d'activités & dossiers", items: ['À faire', 'En cours', 'En attente', 'Terminé / Conforme', 'En retard', 'Annulé'] },
    { id: 'priorities', title: "Priorités réglementaires", items: ['Basse', 'Moyenne', 'Haute', 'Urgente'] },
    { id: 'departments', title: "Directions & Services DLVS", items: ['Direction (DLVS)', 'Service des Vigilances et des Produits de Santé (SVPS)', 'Service de la Surveillance du Marché (SSMUR)', 'Service des Licences (SL)'] },
    { id: 'etab_types', title: "Types d'établissements", items: ['Officine', 'Grossiste-Répartiteur', 'Dépôt Pharmaceutique', 'Laboratoire Fabricant', 'Structure Hospitalière'] },
    { id: 'sig_types', title: "Types de signalements", items: ['Défaut qualité', 'Effet indésirable grave', 'MAPI', 'Produit falsifié / illicite', 'Erreur médicamenteuse', 'Rupture de stock'] }
  ]);

  const [selectedRefForAdd, setSelectedRefForAdd] = useState<RefItem | null>(null);
  const [newEntryText, setNewEntryText] = useState('');

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRefForAdd || !newEntryText.trim()) return;

    setReferentials(prev => prev.map(r => {
      if (r.id === selectedRefForAdd.id) {
        if (r.items.includes(newEntryText.trim())) {
          showToast('error', `L'entrée "${newEntryText.trim()}" existe déjà dans cette table.`);
          return r;
        }
        return {
          ...r,
          items: [...r.items, newEntryText.trim()]
        };
      }
      return r;
    }));

    showToast('success', `Nouvelle valeur "${newEntryText.trim()}" ajoutée au référentiel "${selectedRefForAdd.title}".`);
    setNewEntryText('');
    setSelectedRefForAdd(null);
  };

  const handleRemoveEntry = (refId: string, itemToRemove: string) => {
    setReferentials(prev => prev.map(r => {
      if (r.id === refId) {
        return {
          ...r,
          items: r.items.filter(it => it !== itemToRemove)
        };
      }
      return r;
    }));
    showToast('info', `Valeur "${itemToRemove}" retirée de la table.`);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Settings className="w-6 h-6 text-blue-600" />
              Référentiels & Administration du Système
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Gestion centralisée des tables de référence, rôles utilisateurs et paramètres institutionnels
            </p>
          </div>

          <button
            onClick={() => {
              if (confirm('Confirmez-vous la purge complète des données pour démarrer à blanc (les 14 agents officiels DLVS et les référentiels sont conservés) ?')) {
                resetToDefaultData();
                showToast('info', 'Données purgées avec succès. Environnement de travail prêt à l’emploi.');
              }
            }}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Purger les données (Démarrage à blanc)
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('referentials')}
            className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'referentials' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Référentiels Métiers (Section 30)
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Utilisateurs & Rôles ({allUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'database' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            État Base de Données & Supabase
          </button>
        </div>

        {/* Tab 1: Referentials */}
        {activeTab === 'referentials' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {referentials.map((ref) => (
              <div key={ref.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-slate-900">{ref.title}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {ref.items.length} entrées
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {ref.items.map((it, i) => (
                      <span key={i} className="group inline-flex items-center gap-1 px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded text-[11px] border border-slate-200 transition-colors">
                        {it}
                        {(currentUser.role === 'admin' || currentUser.role === 'chef_service') && ref.items.length > 2 && (
                          <button
                            onClick={() => handleRemoveEntry(ref.id, it)}
                            className="opacity-0 group-hover:opacity-100 hover:text-rose-600 text-slate-400 ml-0.5 transition-opacity"
                            title={`Supprimer "${it}"`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedRefForAdd(ref);
                      setNewEntryText('');
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Ajouter une entrée
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Users & Password Management */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Explanatory banner */}
            <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="font-bold text-blue-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Règle d'attribution des accès DLVS (14 Collaborateurs)
                </p>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  • <strong>Identifiant</strong> : Initiale du prénom + Nom de famille (ex: <code className="bg-white px-1.5 py-0.5 rounded text-blue-700 font-mono font-bold">jsatchivi</code>)<br />
                  • <strong>Mot de passe initial</strong> : Nom de famille + 123 (ex: <code className="bg-white px-1.5 py-0.5 rounded text-blue-700 font-mono font-bold">satchivi123</code>)<br />
                  Chaque agent peut modifier son mot de passe. En tant qu&apos;administrateur, vous pouvez <strong>copier les accès</strong> pour les remettre à l&apos;agent ou <strong>réinitialiser</strong> son mot de passe au format par défaut.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Registre du Personnel &amp; Comptes Opérationnels ({allUsers.length})</h4>
                  <p className="text-xs text-slate-500">Gestion des identifiants, mots de passe et habilitations ministérielles</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-3 text-center">N°</th>
                      <th className="py-3 px-4">Collaborateur</th>
                      <th className="py-3 px-3">Identifiant</th>
                      <th className="py-3 px-4">Mot de passe</th>
                      <th className="py-3 px-4">Poste &amp; Direction</th>
                      <th className="py-3 px-3">Rôle RBAC</th>
                      <th className="py-3 px-4 text-right">Actions d&apos;accès</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allUsers.map((u) => {
                      const currentPass = u.password || u.default_password;
                      const isDefault = currentPass === u.default_password;
                      const isRevealed = !!revealedPasswords[u.id];
                      const isCopied = copiedUserId === u.id;

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3 text-center">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200">
                              {u.order || 1}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                                {u.full_name.charAt(0)}
                              </div>
                              <div>
                                <p className="leading-tight">{u.full_name}</p>
                                <p className="text-[10px] font-normal text-slate-500">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {u.username}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-slate-800 font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                {isRevealed ? currentPass : '••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => setRevealedPasswords(prev => ({ ...prev, [u.id]: !prev[u.id] }))}
                                className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors cursor-pointer"
                                title={isRevealed ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                              >
                                {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${isDefault ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-800 font-bold'}`}>
                                {isDefault ? 'Défaut' : 'Modifié'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 max-w-xs">
                            <p className="font-semibold text-slate-800 truncate">{u.title} • {u.post || u.role_label}</p>
                            <p className="text-[10px] text-slate-500 truncate">{u.department}</p>
                          </td>
                          <td className="py-3 px-3">
                            <Badge role={u.role}>{u.role_label}</Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Copier et donner */}
                              <button
                                type="button"
                                onClick={() => {
                                  const text = `ACTIVIA — Vos accès DLVS
Collaborateur : ${u.full_name}
Titre & Poste : ${u.title} (${u.post || u.role_label})
Identifiant   : ${u.username}
Mot de passe  : ${currentPass}
Lien d'accès  : ${typeof window !== 'undefined' ? window.location.origin : ''}/login

Conservez vos accès de manière confidentielle. Vous pourrez modifier votre mot de passe à tout moment dans votre espace.`;
                                  navigator.clipboard.writeText(text);
                                  setCopiedUserId(u.id);
                                  showToast('success', `Identifiants de ${u.full_name} copiés ! Prêt à transmettre.`);
                                  setTimeout(() => setCopiedUserId(null), 3000);
                                }}
                                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                title="Copier la fiche complète pour remettre à l'agent"
                              >
                                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{isCopied ? 'Copié !' : 'Copier les accès'}</span>
                              </button>

                              {/* Modifier */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedUserForPassword(u);
                                  setAdminCustomPassword('');
                                }}
                                className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                                title="Définir un mot de passe personnalisé"
                              >
                                <Key className="w-3.5 h-3.5" />
                              </button>

                              {/* Réinitialiser */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Confirmez-vous la réinitialisation du mot de passe de ${u.full_name} ?\nLe mot de passe redeviendra : "${u.default_password}"`)) {
                                    resetUserPassword(u.id);
                                  }
                                }}
                                className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                                title="Réinitialiser le mot de passe au format par défaut (nom+123)"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Database & Migration */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            {/* Supabase Live Status Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                    <Server className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900">Connexion Supabase PostgreSQL</h4>
                      {dbStatus?.isConnected ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Connecté ({dbStatus.latencyMs} ms)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          Vérification...
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Base de données Cloud institutionnelle hébergée sur Supabase
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={runConnectionTest}
                    disabled={testingDb}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testingDb ? 'animate-spin' : ''}`} />
                    {testingDb ? 'Test en cours...' : 'Tester la connexion'}
                  </button>

                  <a
                    href="https://supabase.com/dashboard/project/bkwspibjypklsrbvyfrn/sql/new"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Éditeur SQL Supabase
                  </a>
                </div>
              </div>

              {/* Paramètres de l'instance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">URL du Projet (API Endpoint)</p>
                  <p className="font-mono text-slate-900 font-semibold truncate select-all">
                    https://bkwspibjypklsrbvyfrn.supabase.co
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Clé Publique (Publishable Key)</p>
                  <p className="font-mono text-slate-900 font-semibold truncate select-all">
                    sb_publishable_Tdk6wZWQ6S5HrDVeho3boQ_vmtwP6LZ
                  </p>
                </div>
              </div>

              {/* Status message */}
              {dbStatus && (
                <div className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                  dbStatus.isConnected 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  {dbStatus.isConnected ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{dbStatus.message}</span>
                </div>
              )}
            </div>

            {/* Architecture SQL & Déploiement */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Schéma SQL Global & Données Officielles (14 Tables)</h4>
                  <p className="text-xs text-slate-500">
                    Script complet de création des tables, politiques de sécurité (RLS) et amorçage des 14 agents de la DLVS
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">Fichier de schéma unifié :</span>
                  <span className="font-mono text-blue-700 font-bold">supabase/complete_schema_and_seed.sql</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">Tables PostgreSQL couvertes (14) :</span>
                  <span className="font-mono text-slate-600 text-[11px] text-right">
                    profiles, activities, tasks, activity_comments, incoming_mails, outgoing_mails, folders, documents, establishments, signals_vigilance, trainings, alerts, notifications, audit_logs
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">Amorçage du Personnel (Seed) :</span>
                  <span className="text-emerald-700 font-bold">14 Collaborateurs officiels DLVS (Dr. SATCHIVI Jocelyne KANLE en N°1)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">Sécurité Row Level Security (RLS) :</span>
                  <span className="text-blue-700 font-semibold">Activée avec politiques de lecture/écriture automatiques</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-end gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(COMPLETE_SUPABASE_SQL);
                    setCopiedSql(true);
                    showToast('success', 'Script SQL copié dans le presse-papier !');
                    setTimeout(() => setCopiedSql(false), 3000);
                  }}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSql ? 'Copié !' : 'Copier le script SQL complet'}
                </button>

                <button
                  onClick={() => {
                    downloadFile('activia_complete_schema_and_seed.sql', COMPLETE_SUPABASE_SQL, 'application/sql');
                    showToast('success', 'Fichier SQL "activia_complete_schema_and_seed.sql" téléchargé.');
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Télécharger le script SQL (.sql)
                </button>
              </div>

              {/* Instructions rapides */}
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-xs space-y-2">
                <div className="flex items-center gap-2 text-blue-900 font-bold">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Comment initialiser votre base Supabase en 20 secondes :</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-700 text-[11px] leading-relaxed pl-1">
                  <li>Cliquez sur <strong>&laquo; Copier le script SQL complet &raquo;</strong> ci-dessus.</li>
                  <li>Ouvrez l’<a href="https://supabase.com/dashboard/project/bkwspibjypklsrbvyfrn/sql/new" target="_blank" rel="noreferrer" className="text-blue-700 underline font-semibold">Éditeur SQL Supabase</a> de votre projet.</li>
                  <li>Collez le script et cliquez sur <strong>Run</strong> (Exécuter). Toutes les tables et les 14 profils officiels seront instantanément opérationnels !</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Modal for adding referential entry */}
        {selectedRefForAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Ajouter une valeur</h3>
                  <p className="text-xs text-slate-500">{selectedRefForAdd.title}</p>
                </div>
                <button
                  onClick={() => setSelectedRefForAdd(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleAddEntry} className="p-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Intitulé de la nouvelle entrée réglementaire
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newEntryText}
                    onChange={(e) => setNewEntryText(e.target.value)}
                    placeholder="Ex: Dispositifs Médicaux Innovants..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRefForAdd(null)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Enregistrer l'entrée
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal for setting custom password by Administrator */}
        {selectedUserForPassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-600 text-white">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Définir un mot de passe</h3>
                    <p className="text-[11px] text-slate-300">{selectedUserForPassword.full_name} ({selectedUserForPassword.username})</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUserForPassword(null)}
                  className="text-slate-400 hover:text-white p-1 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!adminCustomPassword.trim()) return;
                  if (adminCustomPassword.trim().length < 4) {
                    showToast('error', 'Le mot de passe doit comporter au moins 4 caractères.');
                    return;
                  }
                  updateUserPassword(selectedUserForPassword.id, adminCustomPassword.trim());
                  setSelectedUserForPassword(null);
                  setAdminCustomPassword('');
                }}
                className="p-5 space-y-4"
              >
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <p className="text-slate-600">
                    Mot de passe par défaut : <strong className="font-mono text-blue-700">{selectedUserForPassword.default_password}</strong>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Vous pouvez lui attribuer un mot de passe temporaire ou spécifique que l&apos;agent pourra utiliser immédiatement.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nouveau mot de passe pour {selectedUserForPassword.full_name}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      autoFocus
                      value={adminCustomPassword}
                      onChange={(e) => setAdminCustomPassword(e.target.value)}
                      placeholder="Nouveau mot de passe..."
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedUserForPassword(null)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Valider le mot de passe
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
