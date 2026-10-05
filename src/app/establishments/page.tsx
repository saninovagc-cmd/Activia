'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Establishment } from '@/types';
import { EstablishmentTable } from '@/components/establishments/EstablishmentTable';
import { EstablishmentModal } from '@/components/establishments/EstablishmentModal';
import { EstablishmentDetailModal } from '@/components/establishments/EstablishmentDetailModal';
import { 
  Building2, 
  Plus, 
  Store, 
  Truck, 
  FlaskConical, 
  AlertCircle,
  FileCheck2,
  CheckCircle2
} from 'lucide-react';

export default function EstablishmentsPage() {
  const { establishments, addEstablishment, updateEstablishment, currentUser } = useApp();
  const [selectedEtab, setSelectedEtab] = useState<Establishment | null>(null);
  const [editingEtab, setEditingEtab] = useState<Establishment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const canManage = currentUser.role === 'admin' || currentUser.role === 'chef_service' || currentUser.role === 'secretariat';

  // Stats calculation
  const totalEtabs = establishments.length;
  const officines = establishments.filter(e => e.establishment_type === 'Officine').length;
  const grossistes = establishments.filter(e => e.establishment_type === 'Grossiste-Répartiteur' || e.establishment_type === 'Dépôt Pharmaceutique').length;
  const labos = establishments.filter(e => e.establishment_type === 'Laboratoire Fabricant' || e.establishment_type === 'Structure Hospitalière').length;
  const pendingOrSuspended = establishments.filter(e => e.status === 'En attente' || e.status === 'Suspendu').length;

  const handleCreate = (data: Partial<Establishment>) => {
    addEstablishment(data);
  };

  const handleUpdate = (data: Partial<Establishment>) => {
    if (editingEtab) {
      updateEstablishment(editingEtab.id, data);
      setEditingEtab(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Répertoire National des Établissements Pharmaceutiques
            </h1>
            <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
              Phase 3 • Métiers
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Centralisation, cartographie, suivi des arrêtés d’agrément et contrôle de conformité des structures de santé
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => {
              setEditingEtab(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Enregistrer un Établissement</span>
          </button>
        )}
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">Total Répertorié</span>
            <span className="text-lg font-black text-slate-900">{totalEtabs}</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">Officines</span>
            <span className="text-lg font-black text-emerald-700">{officines}</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">Grossistes & Dépôts</span>
            <span className="text-lg font-black text-indigo-700">{grossistes}</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">Labos & Hôpitaux</span>
            <span className="text-lg font-black text-purple-700">{labos}</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">En attente / Suspendus</span>
            <span className="text-lg font-black text-amber-700">{pendingOrSuspended}</span>
          </div>
        </div>
      </div>

      {/* Main Table view */}
      <EstablishmentTable
        establishments={establishments}
        onSelect={(etab) => setSelectedEtab(etab)}
        onEdit={(etab) => {
          setEditingEtab(etab);
          setIsModalOpen(true);
        }}
        onNew={() => {
          setEditingEtab(null);
          setIsModalOpen(true);
        }}
        canManage={canManage}
      />

      {/* Modals */}
      <EstablishmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEtab(null);
        }}
        onSave={editingEtab ? handleUpdate : handleCreate}
        establishment={editingEtab}
      />

      <EstablishmentDetailModal
        establishment={selectedEtab}
        onClose={() => setSelectedEtab(null)}
        onEdit={(etab) => {
          setSelectedEtab(null);
          setEditingEtab(etab);
          setIsModalOpen(true);
        }}
      />
    </div>
  );
}
