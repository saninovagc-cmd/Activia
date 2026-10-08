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
  AlertCircle, 
  CheckCircle2, 
  Key, 
  Eye, 
  EyeOff, 
  Home, 
  Sparkles,
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

          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-black text-3xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-600/30">
            A
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">ACTIVIA</h1>
          <p className="text-xs uppercase font-bold tracking-widest text-blue-400 mt-1">
            Direction des Licences, de la Vigilance et de la Surveillance du Marché (DLVS)
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

          {/* Institutional formula notice */}
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Format officiel des identifiants DLVS :</span>
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              • <strong>Identifiant</strong> : Initiale du prénom + Nom de famille (ex: <code className="bg-white px-1.5 py-0.5 rounded text-blue-700 font-mono font-bold">jsatchivi</code>)<br />
              • <strong>Mot de passe</strong> : Nom de famille + 123 (ex: <code className="bg-white px-1.5 py-0.5 rounded text-blue-700 font-mono font-bold">satchivi123</code>)
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
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
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
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
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
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
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
                  Personnel DLVS ({allUsers.length} Comptes Activés)
                </p>
                <p className="text-[10px] text-slate-400">Cliquez sur un compte pour vous connecter immédiatement :</p>
              </div>
            </div>
            
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {allUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleQuickLogin(user)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 text-left flex items-center justify-between text-xs transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span className="w-6 h-6 shrink-0 rounded-lg bg-slate-200 group-hover:bg-blue-200 text-slate-700 group-hover:text-blue-800 font-bold flex items-center justify-center text-[10px]">
                      {user.order || 1}
                    </span>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900 group-hover:text-blue-900 truncate">
                          {user.full_name}
                        </p>
                        <span className="font-mono text-[10px] text-blue-700 bg-blue-100/60 px-1.5 py-0.2 rounded border border-blue-200">
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
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-3 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500 flex items-center justify-between">
          <span>Sécurité ministérielle & Audit RGPD</span>
          <Link href="/" className="text-blue-600 hover:underline font-semibold">
            Portail institutionnel →
          </Link>
        </div>
      </div>
    </div>
  );
}
