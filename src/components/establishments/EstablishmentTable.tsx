'use client';

import React, { useState } from 'react';
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
  AlertTriangle,
  FileCheck2,
  Calendar
} from 'lucide-react';

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

    return matchesSearch && matchesType && matchesStatus && matchesDept;
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

  const exportCSV = () => {
    const headers = ['Code,Nom,Type,Proprietaire,Pharmacien Responsable,Ville,Departement,Telephone,Email,Statut,Autorisation,Date Autorisation,Expiration\n'];
    const rows = filtered.map(e => 
      `"${e.code}","${e.name}","${e.establishment_type}","${e.owner}","${e.responsible_pharmacist}","${e.city}","${e.department}","${e.phone}","${e.email}","${e.status}","${e.authorization_number}","${e.auth_date}","${e.expiry_date || ''}"`
    );
    const blob = new Blob([headers.concat(rows.join('\n')).join('')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `repertoire_etablissements_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
            <option value="all">Tous les types</option>
            <option value="Officine">Officine</option>
            <option value="Grossiste-Répartiteur">Grossiste-Répartiteur</option>
            <option value="Dépôt Pharmaceutique">Dépôt Pharmaceutique</option>
            <option value="Laboratoire Fabricant">Laboratoire Fabricant</option>
            <option value="Structure Hospitalière">Structure Hospitalière</option>
            <option value="Autre">Autre</option>
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
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
            title="Exporter en fichier CSV conforme"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {canManage && (
            <button
              onClick={onNew}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvel Établissement</span>
            </button>
          )}
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
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Code / N° Agrément</th>
                <th className="py-3 px-4">Établissement & Type</th>
                <th className="py-3 px-4">Pharmacien Responsable</th>
                <th className="py-3 px-4">Localisation</th>
                <th className="py-3 px-4">Date Agrément</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
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
                    <td className="py-3 px-4 font-mono font-medium">
                      <div className="text-blue-900 font-bold">{etab.code}</div>
                      <div className="text-[11px] text-slate-500 font-normal">{etab.authorization_number}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {etab.name}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <span className="font-medium text-slate-600">{etab.establishment_type}</span>
                        {etab.owner && <span>• {etab.owner}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{etab.responsible_pharmacist}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{etab.phone}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-slate-800 font-medium">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{etab.city}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 pl-4">{etab.department}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{etab.auth_date}</span>
                      </div>
                      {etab.expiry_date && (
                        <div className="text-[10px] text-slate-500">Exp: {etab.expiry_date}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(etab.status)}
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelect(etab)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Consulter la fiche complète"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canManage && (
                          <button
                            onClick={() => onEdit(etab)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                            title="Modifier les informations"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
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
