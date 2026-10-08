'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  ArrowRight, 
  FileCheck2, 
  Building2, 
  AlertTriangle, 
  FolderArchive, 
  Mail, 
  CheckCircle2, 
  Database, 
  Users, 
  ExternalLink,
  Sparkles,
  LogOut,
  ChevronRight,
  Eye,
  EyeOff,
  Activity as ActivityIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export default function HomePage() {
  const router = useRouter();
  const { allUsers, currentUser, isAuthenticated, login, logout, switchUser } = useApp();

  const [identifier, setIdentifier] = useState('jsatchivi');
  const [password, setPassword] = useState('satchivi123');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');

    setTimeout(() => {
      const res = login(identifier, password);
      if (res.success) {
        router.push('/dashboard');
      } else {
        setLoginError(res.message || 'Identifiant ou mot de passe incorrect.');
        setLoading(false);
      }
    }, 300);
  };

  const handleAgentClick = (u: typeof allUsers[0]) => {
    switchUser(u.id);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Benin Institutional Bar */}
      <div className="bg-slate-950 text-white text-[11px] py-1.5 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-xs" />
              <span className="w-2.5 h-2.5 bg-amber-400 rounded-xs" />
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-xs" />
            </div>
            <span className="font-semibold tracking-wide text-slate-300">
              RÉPUBLIQUE DU BÉNIN • MINISTÈRE DE LA SANTÉ
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="hidden sm:inline">Portail Réglementaire DLVS</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Plateforme en ligne
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-blue-600/20">
              A
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-slate-900 tracking-tight">ACTIVIA</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-800 uppercase tracking-wider">
                  DLVS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Direction des Licences, de la Vigilance et de la Surveillance du Marché
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && currentUser ? (
              <div className="flex items-center gap-2.5">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-900 leading-tight">{currentUser.full_name}</p>
                  <p className="text-[10px] text-blue-600 font-mono">@{currentUser.username}</p>
                </div>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Mon Espace de Travail</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => {
                    logout();
                    router.push('/login');
                  }}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Déconnexion"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Se connecter</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white via-slate-50 to-slate-100 border-b border-slate-200 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Presentation */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Système Officiel de Pilotage Réglementaire DLVS
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Gestion des Licences, Vigilances et Surveillance du Marché Sanitaire
              </h1>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                ACTIVIA centralise et sécurise les procédures de la <strong>DLVS</strong> du Ministère de la Santé : instruction des dossiers de licence, matériovigilance &amp; pharmacovigilance (MAPI), contrôle post-commercialisation et traçabilité intégrale des courriers.
              </p>

              {/* Status Pills */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <p className="text-lg sm:text-xl font-black text-blue-600">14</p>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Agents DLVS habilités</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <p className="text-lg sm:text-xl font-black text-emerald-600">14</p>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Tables PostgreSQL RLS</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <p className="text-lg sm:text-xl font-black text-purple-600">100%</p>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Traçabilité &amp; Audit</p>
                </div>
              </div>
            </div>

            {/* Right Column: Integrated Login Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Espace de Connexion Agent</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Accès nominatif pour le personnel DLVS</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>

                {/* Account formula rule banner */}
                <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 space-y-1">
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Formule d&apos;accès automatique :
                  </p>
                  <p className="text-slate-600 leading-snug">
                    • Identifiant : <strong className="font-mono text-blue-700">initiale prénom + nom</strong> (ex: <span className="font-mono font-bold">jsatchivi</span>)<br />
                    • Mot de passe : <strong className="font-mono text-blue-700">nom de famille + 123</strong> (ex: <span className="font-mono font-bold">satchivi123</span>)
                  </p>
                </div>

                {loginError && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Identifiant
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="Ex: jsatchivi..."
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mot de passe..."
                        className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                  >
                    {loading ? 'Connexion en cours...' : 'Se connecter'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Quick Simulation Link */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Personnel DLVS (14 comptes)</span>
                  <Link href="/login" className="text-blue-600 hover:underline font-bold flex items-center gap-1">
                    Voir la liste des accès <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services & Modules Overview */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Les 3 Piliers Métiers de la DLVS
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Une architecture opérationnelle unifiée pour réguler et protéger la santé publique
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Service des Licences */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FolderArchive className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Service des Licences (SL)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Instruction dématérialisée des demandes d&apos;ouverture, d&apos;exploitation et de transfert d&apos;officines, dépôts et grossistes-répartiteurs. Gestion des commissions et réceptions techniques.
            </p>
            <div className="pt-2 text-[11px] font-semibold text-blue-700">
              Responsable : Dr. KINTIN Daniel (Chef SL)
            </div>
          </div>

          {/* Card 2: SVPS */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Vigilances &amp; Produits de Santé (SVPS)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Surveillance des signaux sanitaires, matériovigilance, manifestations post-vaccinales indésirables (MAPI), évaluation des PSUR/PBRER et pilotage du Comité Technique de Vigilance.
            </p>
            <div className="pt-2 text-[11px] font-semibold text-rose-700">
              Responsable : Dr. HOUNGUE Perrin (Chef SVPS)
            </div>
          </div>

          {/* Card 3: SSMUR */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Surveillance du Marché (SSMUR)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Lutte contre les produits pharmaceutiques falsifiés ou de qualité inférieure, contrôle de la publicité médicale, destruction conforme des déchets et autorisations d&apos;achat d&apos;intrants.
            </p>
            <div className="pt-2 text-[11px] font-semibold text-emerald-700">
              Responsable : Dr. ALOFA Huibert (Chef SSMUR)
            </div>
          </div>
        </div>

        {/* DLVS Personnel Table Preview */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Personnel DLVS &amp; Comptes Opérationnels ({allUsers.length} Collaborateurs)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cliquez sur un profil pour ouvrir directement la session de travail
              </p>
            </div>
            <Link
              href="/login"
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold self-start sm:self-auto transition-colors"
            >
              Écran de connexion complet →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3 text-center">N°</th>
                  <th className="py-2.5 px-4">Collaborateur</th>
                  <th className="py-2.5 px-3">Identifiant</th>
                  <th className="py-2.5 px-4">Titre &amp; Poste</th>
                  <th className="py-2.5 px-4">Service</th>
                  <th className="py-2.5 px-3">Rôle</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 text-center">
                      <span className="w-5 h-5 rounded bg-slate-100 text-slate-700 font-bold inline-flex items-center justify-center text-[10px]">
                        {u.order || 1}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">
                      {u.full_name}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-blue-700">
                      {u.username}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 max-w-xs truncate">
                      {u.title} • {u.post || u.role_label}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500">{u.department}</td>
                    <td className="py-2.5 px-3">
                      <Badge role={u.role}>{u.role === 'admin' ? 'Directrice' : u.role === 'chef_service' ? 'Chef Serv.' : u.role === 'secretariat' ? 'Secrétaire' : 'Agent'}</Badge>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => handleAgentClick(u)}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        Se connecter
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Institutional Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-bold text-white">ACTIVIA — Plateforme Réglementaire Officielle DLVS</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Direction des Licences, de la Vigilance et de la Surveillance du Marché • Ministère de la Santé, République du Bénin
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/login" className="text-slate-300 hover:text-white">Connexion Agent</Link>
            <span>•</span>
            <Link href="/dashboard" className="text-slate-300 hover:text-white">Espace DLVS</Link>
            <span>•</span>
            <span className="text-emerald-400">Version 2026.10</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
