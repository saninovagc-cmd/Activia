'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ShieldCheck, Lock, Mail, ArrowRight, UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export default function LoginPage() {
  const router = useRouter();
  const { allUsers, switchUser } = useApp();

  const [email, setEmail] = useState('jocelyne.satchivi@activia.sante.gouv');
  const [password, setPassword] = useState('••••••••••••');
  const [error, setError] = useState('');
  const [resetNotice, setResetNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check credentials against our users
    const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    setTimeout(() => {
      if (user) {
        switchUser(user.id);
        router.push('/dashboard');
      } else {
        setError('Identifiants non reconnus. Veuillez utiliser un des comptes institutionnels répertoriés ci-dessous.');
        setLoading(false);
      }
    }, 400);
  };

  const handleQuickLogin = (userId: string) => {
    switchUser(userId);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      {/* Container */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Institutional header */}
        <div className="bg-slate-950 px-8 py-6 text-center border-b border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            A
          </div>
          <h1 className="text-xl font-black text-white tracking-wide">ACTIVIA</h1>
          <p className="text-xs uppercase font-bold tracking-widest text-blue-400 mt-1">
            Direction des Licences, de la Vigilance et de la Surveillance du Marché (DLVS)
          </p>
        </div>

        {/* Login Form */}
        <div className="p-8">
          <div className="mb-6">
            <h2 className="text-base font-bold text-slate-900">Connexion sécurisée</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Accédez à votre espace selon votre habilitation ministérielle
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {resetNotice && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{resetNotice}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Adresse email institutionnelle
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="prenom.nom@activia.sante.gouv"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Mot de passe
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (!email) {
                      setError("Veuillez saisir votre adresse email institutionnelle pour recevoir les instructions de réinitialisation.");
                      setResetNotice(null);
                    } else {
                      setError('');
                      setResetNotice(`Procédure de réinitialisation ministérielle : un lien de confirmation sécurisé a été transmis à ${email}.`);
                    }
                  }}
                  className="text-[11px] text-blue-600 hover:underline font-medium"
                >
                  Mot de passe oublié ?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Personnel DLVS ({allUsers.length} Collaborateurs) :
              </p>
              <span className="text-[10px] text-slate-400">Cliquez pour vous connecter</span>
            </div>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {allUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleQuickLogin(user.id)}
                  className="w-full p-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-left flex items-center justify-between text-xs transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="w-5 h-5 shrink-0 rounded bg-slate-200 group-hover:bg-blue-200 text-slate-700 group-hover:text-blue-800 font-bold flex items-center justify-center text-[10px]">
                      {user.order || user.id.replace('usr-0', '')}
                    </span>
                    <div className="truncate">
                      <p className="font-semibold text-slate-800 group-hover:text-blue-900 truncate">
                        {user.full_name}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {user.title} • {user.post || user.department}
                      </p>
                    </div>
                  </div>
                  <Badge role={user.role}>{user.role === 'admin' ? 'Directrice' : user.role === 'chef_service' ? 'Chef Serv.' : user.role === 'secretariat' ? 'Secrétaire' : 'Agent'}</Badge>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-3 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500">
          Système sécurisé • Traçabilité intégrale des accès • ACTIVIA 2026
        </div>
      </div>
    </div>
  );
}
