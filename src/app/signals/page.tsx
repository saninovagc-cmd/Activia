'use client';

import React, { useState } from 'react';
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

export default function SignalsPage() {
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Signalements Sanitaires, Vigilances & Gestion des MAPI
            </h1>
            <span className="text-[10px] font-bold uppercase bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full border border-rose-200">
              Phase 3 • Vigilances
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enregistrement des alertes, enquêtes sur le terrain, prévalidation MAPI, analyses de laboratoire et imputabilité OMS
          </p>
        </div>

        {canManage && mainView === 'signals' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Signalement</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">Total Notifiés</span>
            <span className="text-lg font-black text-slate-900">{totalSignals}</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
            <Syringe className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">Cas MAPI</span>
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
            <span className="text-[11px] font-medium text-slate-500 block">Prélèvements Labo</span>
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
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            mainView === 'signals'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Registre des Signalements & MAPI ({signals.length})</span>
        </button>

        <button
          onClick={() => setMainView('alerts')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
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
  );
}
