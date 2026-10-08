'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  ArrowRight, 
  AlertTriangle, 
  LogOut, 
  Eye, 
  EyeOff 
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { currentUser, isAuthenticated, login, logout } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setLoginError('Veuillez renseigner votre identifiant et votre mot de passe.');
      return;
    }

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
          <div className="flex items-center gap-3.5">
            <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-xs flex items-center justify-center">
              <Image
                src="/logo-abmed.png"
                alt="Logo ABMed"
                width={120}
                height={50}
                className="h-11 w-auto object-contain"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-slate-900 tracking-tight">ACTIVIA</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider border border-emerald-200">
                  ABMed
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold hidden sm:block">
                Agence Béninoise du Médicament et des autres Produits de Santé
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && currentUser ? (
              <div className="flex items-center gap-2.5">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-900 leading-tight">{currentUser.full_name}</p>
                  <p className="text-[10px] text-emerald-700 font-mono font-semibold">@{currentUser.username}</p>
                </div>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Mon Espace de Travail</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => {
                    logout();
                    router.push('/login');
                  }}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Déconnexion"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Se connecter</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white via-slate-50 to-emerald-50/20 border-b border-slate-200 py-12 sm:py-16 grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Presentation */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                Système Officiel de Pilotage Réglementaire ABMed
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Agence Béninoise du Médicament et des autres Produits de Santé
              </h1>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                ACTIVIA centralise et sécurise l&apos;ensemble des procédures de l&apos;<strong>ABMed</strong> : instruction des dossiers réglementaires, contrôle des établissements pharmaceutiques, matériovigilance &amp; pharmacovigilance (MAPI), gestion des activités de service et traçabilité intégrale des courriers.
              </p>

              {/* Status Pills */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <p className="text-lg sm:text-xl font-black text-emerald-700">14</p>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Agents ABMed habilités</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <p className="text-lg sm:text-xl font-black text-slate-900">14</p>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Tables PostgreSQL RLS</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <p className="text-lg sm:text-xl font-black text-amber-600">100%</p>
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
                    <p className="text-xs text-slate-500 mt-0.5">Accès nominatif pour le personnel ABMed</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <Lock className="w-4 h-4" />
                  </div>
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
                        className="keep-case w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:bg-white focus:outline-none"
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
                        className="keep-case w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:bg-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                  >
                    {loading ? 'Connexion en cours...' : 'Se connecter'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Footer */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-bold text-white">ACTIVIA — Agence Béninoise du Médicament et des autres Produits de Santé (ABMed)</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Direction des Licences, de la Vigilance et de la Surveillance du Marché • Ministère de la Santé, République du Bénin
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/login" className="text-slate-300 hover:text-white">Connexion Agent</Link>
            <span>•</span>
            <Link href="/dashboard" className="text-slate-300 hover:text-white">Espace ABMed</Link>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">Version ABMed 2026.10</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
