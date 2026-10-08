'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  Eye, 
  EyeOff 
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError('Veuillez saisir votre identifiant et votre mot de passe.');
      return;
    }

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

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      {/* Container */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Institutional header */}
        <div className="bg-slate-950 px-8 py-6 text-center border-b border-slate-800">

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
        </div>

        {/* Footer */}
        <div className="px-8 py-3 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500 flex items-center justify-center">
          <span>Sécurité ABMed & Confidentialité</span>
        </div>
      </div>
    </div>
  );
}
