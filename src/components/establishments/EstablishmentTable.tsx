'use client';

import React, { useState, useMemo } from 'react';
import { Establishment, EstablishmentType, EstablishmentStatus } from '@/types';
import { 
  Building2, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Eye, 
  Edit3, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  FileCheck2,
  Calendar
} from 'lucide-react';
import { ExportButton } from '@/components/common/ExportButton';
import { ExportConfig } from '@/lib/exportUtils';
import { DatePeriodFilter } from '@/components/common/DatePeriodFilter';
import { matchesDateFilter, extractUniqueYears } from '@/lib/dateFilterUtils';

interface EstablishmentTableProps {
  establishments: Establishment[];
  onSelect: (etab: Establishment) => void;
  onEdit: (etab: Establishment) => void;
  onNew: () => void;
  canManage: boolean;
}

export const EstablishmentTable: React.FC<EstablishmentTableProps> = ({
  establishments,
  onSelect,
  onEdit,
  onNew,
  canManage
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');

  // Filtres temporels (Date d'agrément)
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  const availableYears = useMemo(() => {
    return extractUniqueYears(
      establishments,
      (e) => e.auth_date,
      ['2026', '2025', '2024', '2023', '2022', '2021', '2020']
    );
  }, [establishments]);

  // Filter list
  const filtered = establishments.filter(e => {
    const matchesSearch = 
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.responsible_pharmacist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.authorization_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || e.establishment_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    const matchesDept = deptFilter === 'all' || e.department.toLowerCase().includes(deptFilter.toLowerCase());

    const matchesDate = matchesDateFilter(e.auth_date, {
      year: yearFilter,
      month: monthFilter,
      exactDate: dateFilter
    });

    return matchesSearch && matchesType && matchesStatus && matchesDept && matchesDate;
  });

  // Unique departments for filter
  const departments = Array.from(new Set(establishments.map(e => e.department))).filter(Boolean);

  // Status badge styling
  const getStatusBadge = (status: EstablishmentStatus) => {
    switch (status) {
      case 'Actif':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">Actif</span>;
      case 'En attente':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">En attente</span>;
      case 'Suspendu':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">Suspendu</span>;
      case 'Fermé':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">Fermé</span>;
      default:
        return <span>{status}</span>;
    }
  };

  const getExportConfig = (): ExportConfig => ({
    title: 'Répertoire National des Établissements Pharmaceutiques',
    subtitle: 'Direction de la Pharmacie et du Médicament — Données d’agrément et d’inspection',
    filename: `repertoire_etablissements_${new Date().toISOString().split('T')[0]}`,
    headers: ['Code', 'Nom / Dénomination', 'Type', 'Pharmacien Responsable', 'Ville', 'Département', 'Téléphone', 'Agrément', 'Statut'],
    rows: filtered.map(e => [
      e.code,
      e.name,
      e.establishment_type,
      e.responsible_pharmacist,
      e.city,
      e.department,
      e.phone,
      e.authorization_number,
      e.status
    ]),
    summaryKpis: [
      { label: 'Total Établissements', value: filtered.length },
      { label: 'Actifs / Agréés', value: filtered.filter(e => e.status === 'Actif').length },
      { label: 'Sous Surveillance / Suspendus', value: filtered.filter(e => e.status !== 'Actif').length }
    ]
  });

  return (
    <div className="space-y-4">
      {/* Controls & Filter toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="flex-1 flex flex-col sm:flex-row gap-2.5">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par nom, code, pharmacien, n° agrément, ville..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les types d'établissements</option>
            <option value="Officine de Pharmacie">Officines de Pharmacie</option>
            <option value="Grossiste-Répartiteur">Grossistes-Répartiteurs</option>
            <option value="Dépôt Pharmaceutique">Dépôts Pharmaceutiques</option>
            <option value="Industrie Pharmaceutique / Fabricant">Industries Pharmaceutiques</option>
            <option value="Établissement Cosmétique">Établissements Cosmétiques</option>
            <option value="Compléments Nutritionnels">Compléments Nutritionnels</option>
            <option value="Matériel Médical">Matériel Médical</option>
            <option value="Produits Chimiques & Réactifs (PCRL)">Produits Chimiques & Réactifs (PCRL)</option>
            <option value="Établissement de Représentation (ERP)">Établissements de Représentation (ERP)</option>
            <option value="Officine en Gérance (Décès/Succession)">Officines en Gérance</option>
            <option value="Structure Hospitalière">Pharmacies Hospitalières</option>
            <option value="Autre">Autres structures</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="Actif">Actif</option>
            <option value="En attente">En attente</option>
            <option value="Suspendu">Suspendu</option>
            <option value="Fermé">Fermé</option>
          </select>

          {/* Department filter */}
          {departments.length > 0 && (
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous départements</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <ExportButton getConfig={getExportConfig} />

          {canManage && (
            <button
              onClick={onNew}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvel Établissement</span>
            </button>
          )}
        </div>
      </div>

      {/* Ligne des filtres temporels (Agrément : Jour, Mois, Année) */}
      <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <DatePeriodFilter
          selectedYear={yearFilter}
          onYearChange={setYearFilter}
          selectedMonth={monthFilter}
          onMonthChange={setMonthFilter}
          selectedDate={dateFilter}
          onDateChange={setDateFilter}
          years={availableYears}
        />
        <div className="text-xs text-slate-500 font-medium">
          Affichage : <strong className="text-emerald-800 font-bold">{filtered.length}</strong> établissement(s) filtré(s)
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-4 rounded-full bg-emerald-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Répertoire National des Établissements Pharmaceutiques</h3>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">{filtered.length} établissement(s)</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {establishments.filter(e => e.status === 'Actif').length} actifs
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {establishments.filter(e => e.status === 'En attente').length} en attente
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              {establishments.filter(e => e.status === 'Suspendu' || e.status === 'Fermé').length} suspendus / fermés
            </span>
          </div>
        </div>
      {/* =========================================================================
          VUE MOBILE & TABLETTE (< 1024px) : Cartes fluides 100% SANS défilement
          ========================================================================= */}
      <div className="block lg:hidden divide-y divide-slate-100 p-3 bg-slate-50/40 space-y-2.5">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            Aucun établissement ne correspond aux critères de recherche.
          </div>
        ) : (
          filtered.map((etab) => (
            <div
              key={etab.id}
              onClick={() => onSelect(etab)}
              className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5 cursor-pointer hover:border-emerald-400 transition-all"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <span className="font-mono font-bold text-xs text-blue-900">{etab.code}</span>
                  <span className="text-[10px] text-slate-500 block">{etab.authorization_number}</span>
                </div>
                {getStatusBadge(etab.status)}
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                  {etab.name}
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {etab.establishment_type} {etab.owner ? `• ${etab.owner}` : ''}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Pharmacien</span>
                  <span className="font-semibold text-slate-800 truncate block">{etab.responsible_pharmacist}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Localisation</span>
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    {etab.city} ({etab.department})
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onSelect(etab)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Consulter</span>
                </button>
                {canManage && (
                  <button
                    onClick={() => onEdit(etab)}
                    className="px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Modifier</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* =========================================================================
          VUE DESKTOP (>= 1024px) : Tableau fluide 100% SANS barre de défilement
          ========================================================================= */}
      <div className="hidden lg:block w-full max-w-full">
        <table className="w-full text-left border-collapse text-xs table-fixed">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-2.5 w-[15%]">N° Agrément</th>
              <th className="py-3 px-2.5 w-[27%]">Établissement & Type</th>
              <th className="py-3 px-2.5 w-[19%]">Pharmacien Responsable</th>
              <th className="py-3 px-2.5 w-[16%]">Localisation</th>
              <th className="py-3 px-2 w-[11%]">Date Agrément</th>
              <th className="py-3 px-1.5 w-[8%] text-center">Statut</th>
              <th className="py-3 px-1.5 text-center w-[4%]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    Aucun établissement ne correspond aux critères de recherche.
                  </td>
                </tr>
              ) : (
                filtered.map((etab) => (
                  <tr 
                    key={etab.id} 
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => onSelect(etab)}
                  >
                    <td className="py-3 px-2 font-mono font-medium align-top">
                      <div className="text-blue-900 font-bold break-all text-xs">{etab.code}</div>
                      <div className="text-[11px] text-slate-500 font-normal break-all">{etab.authorization_number}</div>
                    </td>
                    <td className="py-3 px-2.5 align-top">
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug break-words whitespace-normal">
                        {etab.name}
                      </div>
                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-1 mt-0.5 leading-snug break-words whitespace-normal">
                        <span className="font-semibold text-slate-700">{etab.establishment_type}</span>
                        {etab.owner && <span>• {etab.owner}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-2.5 align-top">
                      <div className="font-semibold text-slate-900 leading-snug break-words whitespace-normal">{etab.responsible_pharmacist}</div>
                      {etab.phone && (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{etab.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-2.5 align-top">
                      <div className="flex items-start gap-1 text-slate-800 font-medium leading-snug break-words whitespace-normal">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                        <span>{etab.city}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 pl-4">{etab.department}</div>
                    </td>
                    <td className="py-3 px-2 text-slate-600 align-top">
                      <div className="flex items-center gap-1 whitespace-nowrap text-xs">
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="font-semibold">{etab.auth_date}</span>
                      </div>
                      {etab.expiry_date && (
                        <div className="text-[10px] text-slate-500">Exp: {etab.expiry_date}</div>
                      )}
                    </td>
                    <td className="py-3 px-1.5 align-top text-center">
                      {getStatusBadge(etab.status)}
                    </td>
                    <td className="py-3 px-1.5 text-center align-top" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelect(etab)}
                        className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded transition-colors"
                        title="Consulter l'établissement"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-200 text-slate-500 text-xs flex items-center justify-between">
        <span>Affichage de <strong>{filtered.length}</strong> sur <strong>{establishments.length}</strong> établissements répertoriés</span>
        <span className="text-[11px] text-slate-400">Dernière mise à jour du registre : Aujourd’hui</span>
      </div>
      </div>
    </div>
  );
};

