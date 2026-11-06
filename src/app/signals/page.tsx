'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { useApp } from '@/context/AppContext';
import { SignalItem } from '@/types';
import { SignalTable } from '@/components/signals/SignalTable';
import { SignalModal } from '@/components/signals/SignalModal';
import { SignalDetailModal } from '@/components/signals/SignalDetailModal';
import { AlertsList } from '@/components/signals/AlertsList';
import { 
  AlertTriangle, 
  Plus, 
  FlaskConical, 
  ShieldAlert, 
  Activity, 
  FileWarning, 
  CheckCircle2,
  Syringe
} from 'lucide-react';

function SignalsContent() {
  const searchParams = useSearchParams();
  const domainParam = searchParams.get('domain') || 'all';

  const { signals, alerts, addSignal, currentUser } = useApp();
  const [selectedSignal, setSelectedSignal] = useState<SignalItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mainView, setMainView] = useState<'signals' | 'alerts'>('signals');

  const canManage = currentUser.role === 'admin' || currentUser.role === 'chef_service' || currentUser.role === 'agent';

  // Stats
  const totalSignals = signals.length;
  const mapiCount = signals.filter(s => s.signal_type === 'MAPI').length;
  const activeAlerts = alerts.filter(a => a.status === 'active').length;
  const samplesTaken = signals.filter(s => s.sample_taken).length;
  const closedCount = signals.filter(s => s.status === 'cloture').length;

  const handleCreateSignal = (data: Partial<SignalItem>) => {
    addSignal(data);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
      {/* Page Header */}
      {domainParam !== 'all' ? (
        <div className="bg-gradient-to-r from-[#0b1120] to-[#151f38] text-white p-5 rounded-2xl border border-slate-700/80 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                Module 04 MÉTIERS
              </span>
              <span className="text-xs font-semibold text-slate-300">
                • {domainParam === 'signalement' ? 'Service de la Surveillance du Marché (SSMUR)' : 'Service Vigilance des Produits de Santé (SVPS)'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 mt-1">
              <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
              <span>
                {domainParam === 'signalement'
                  ? 'Signalements Sanitaires, Défauts Qualité & Falsifications (SSMUR)'
                  : 'Notifications d’Événements Indésirables & Cas MAPI (SVPS)'}
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              {domainParam === 'signalement'
                ? 'Surveillance active du marché pharmaceutique, traçabilité des lots suspects et retraits'
                : 'Pharmacovigilance et matériovigilance : suivi des cas MAPI et campagnes nationales'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <a
              href="/signals"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <span>← Voir toutes les vigilances</span>
            </a>
            {canManage && mainView === 'signals' && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau Signalement</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Signalements Sanitaires (SSMUR) & Notifications (SVPS)
              </h1>
              <span className="text-[10px] font-bold uppercase bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full border border-rose-200">
                DLVS • Surveillance & Vigilances
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Enregistrement des signalements de qualité/ruptures (SSMUR) et notifications d'effets indésirables / MAPI (SVPS)
            </p>
          </div>

          {canManage && mainView === 'signals' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors self-start md:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Signalement / Notification</span>
            </button>
          )}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">Total Dossiers</span>
            <span className="text-lg font-black text-slate-900">{totalSignals}</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
            <Syringe className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">Cas MAPI (SVPS)</span>
            <span className="text-lg font-black text-blue-700">{mapiCount}</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 shrink-0">
            <FileWarning className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">Alertes Actives</span>
            <span className="text-lg font-black text-rose-700">{activeAlerts}</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">Prélèvements LNCM</span>
            <span className="text-lg font-black text-purple-700">{samplesTaken}</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">Dossiers Clôturés</span>
            <span className="text-lg font-black text-emerald-700">{closedCount}</span>
          </div>
        </div>
      </div>

      {/* View Switcher: Signalements vs Alertes de Vigilance */}
      <div className="flex border-b border-slate-200 space-x-6 text-xs font-semibold">
        <button
          onClick={() => setMainView('signals')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            mainView === 'signals'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Registre Signalements & Notifications ({signals.length})</span>
        </button>

        <button
          onClick={() => setMainView('alerts')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            mainView === 'alerts'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileWarning className="w-4 h-4" />
          <span>Alertes Sanitaires & Crises ({alerts.length})</span>
          {activeAlerts > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-600 text-white font-bold">
              {activeAlerts} actives
            </span>
          )}
        </button>
      </div>

      {/* Main Content Area */}
      {mainView === 'signals' ? (
        <SignalTable
          signals={signals}
          onSelect={(sig) => setSelectedSignal(sig)}
          onNew={() => setIsModalOpen(true)}
          canManage={canManage}
          initialDomain={domainParam}
        />
      ) : (
        <AlertsList alerts={alerts} canManage={canManage} />
      )}

      {/* Modals */}
      <SignalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateSignal}
      />

      <SignalDetailModal
        signal={selectedSignal}
        onClose={() => setSelectedSignal(null)}
      />
      </div>
    </AppLayout>
  );
}

export default function SignalsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-500">Chargement des flux...</div>}>
      <SignalsContent />
    </Suspense>
  );
}
