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
  AlertCircle, 
  CheckCircle2, 
  Key, 
  Eye, 
  EyeOff, 
  Home, 
  ChevronRight
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export default function LoginPage() {
  const router = useRouter();
  const { allUsers, login, switchUser } = useApp();

  const [identifier, setIdentifier] = useState('jsatchivi');
  const [password, setPassword] = useState('satchivi123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      const res = login(identifier, password);
      if (res.success) {
        router.push('/dashboard');
      } else {
        setError(res.message || 'Identifiants invalides.');
        setLoading(false);
      }
    }, 300);
  };

  const handleQuickLogin = (u: typeof allUsers[0]) => {
    setIdentifier(u.username);
    setPassword(u.password || u.default_password);
    switchUser(u.id);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      {/* Container */}
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Institutional header */}
        <div className="bg-slate-950 px-8 py-6 text-center border-b border-slate-800 relative">
          <Link
            href="/"
            className="absolute left-6 top-6 text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Accueil</span>
          </Link>

          <div className="bg-white p-2 rounded-2xl mx-auto mb-3 shadow-lg max-w-[200px] flex items-center justify-center border border-slate-200">
            <Image
              src="/logo-abmed.png"
              alt="Logo ABMed"
              width={160}
              height={65}
              className="h-14 w-auto object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">ACTIVIA</h1>
          <p className="text-xs uppercase font-bold tracking-widest text-emerald-400 mt-1">
            Agence Béninoise du Médicament et des autres Produits de Santé (ABMed)
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Ministère de la Santé • République du Bénin</p>
        </div>

        {/* Login Form */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Espace d&apos;Authentification Agent</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Connectez-vous avec vos identifiants institutionnels nominatifs
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Identifiant ou Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Ex: jsatchivi ou email..."
                  style={{ textTransform: 'none' }}
                  className="auth-input keep-case w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Mot de passe
                </label>
                <span className="text-[11px] text-slate-400">
                  Par défaut : nom+123
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  style={{ textTransform: 'none' }}
                  className="auth-input keep-case w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:bg-white focus:outline-none"
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
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              {loading ? 'Connexion en cours...' : 'Se connecter à mon espace'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Access Simulator */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Personnel ABMed ({allUsers.length} Comptes Activés)
                </p>
                <p className="text-[10px] text-slate-400">Cliquez sur un compte pour vous connecter immédiatement :</p>
              </div>
            </div>
            
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {allUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleQuickLogin(user)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 text-left flex items-center justify-between text-xs transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span className="w-6 h-6 shrink-0 rounded-lg bg-slate-200 group-hover:bg-emerald-200 text-slate-700 group-hover:text-emerald-900 font-bold flex items-center justify-center text-[10px]">
                      {user.order || 1}
                    </span>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900 group-hover:text-emerald-950 truncate">
                          {user.full_name}
                        </p>
                        <span className="font-mono text-[10px] text-emerald-800 bg-emerald-100/70 px-1.5 py-0.2 rounded border border-emerald-200">
                          {user.username}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">
                        {user.title} • {user.post || user.department}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge role={user.role}>
                      {user.role === 'admin' ? 'Directrice' : user.role === 'chef_service' ? 'Chef Serv.' : user.role === 'secretariat' ? 'Secrétaire' : 'Agent'}
                    </Badge>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-3 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500 flex items-center justify-between">
          <span>Sécurité ABMed & Confidentialité</span>
          <Link href="/" className="text-emerald-700 hover:underline font-semibold">
            Portail institutionnel →
          </Link>
        </div>
      </div>
    </div>
  );
}
