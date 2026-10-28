'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Check, 
  X, 
  RotateCcw, 
  Save, 
  Lock, 
  Users, 
  FileText, 
  FolderArchive, 
  Building2, 
  ShieldAlert, 
  GraduationCap, 
  BarChart3, 
  Download, 
  Settings, 
  CheckSquare, 
  Square,
  Sparkles,
  Info
} from 'lucide-react';
import { UserProfile, UserRole } from '@/types';

export interface ModulePermission {
  moduleId: string;
  moduleName: string;
  moduleCategory: string;
  iconName: string;
  read: boolean;
  write: boolean;
  validate: boolean;
  delete: boolean;
  export: boolean;
}

const DEFAULT_MODULES: { id: string; name: string; category: string; icon: string }[] = [
  { id: 'mail', name: 'Courriers Entrants & Sortants', category: 'Gestion Courrier', icon: 'FileText' },
  { id: 'folders', name: 'Dossiers Réglementaires & Agréments (SL)', category: 'Réglementation', icon: 'FolderArchive' },
  { id: 'establishments', name: 'Répertoire National des Établissements', category: 'Cartographie', icon: 'Building2' },
  { id: 'surveillance', name: 'Surveillance du Marché & Échantillonnage (SSMUR)', category: 'Surveillance', icon: 'ShieldAlert' },
  { id: 'vigilance', name: 'Vigilances Sanitaires, Risques & MAPI (SVPS)', category: 'Pharmacovigilance', icon: 'Shield' },
  { id: 'trainings', name: 'Formations Continues & Points Focaux', category: 'Renforcement', icon: 'GraduationCap' },
  { id: 'dashboard', name: 'Tableau de Bord, KPIs & Pilotage', category: 'Pilotage', icon: 'BarChart3' },
  { id: 'reporting', name: 'Rapports d’Audit & Exports Officiels', category: 'Audit & Décision', icon: 'Download' },
  { id: 'settings', name: 'Administration, Utilisateurs & Référentiels', category: 'Système', icon: 'Settings' },
];

// Profils par défaut par rôle
const DEFAULT_ROLE_PERMISSIONS: Record<string, Record<string, { read: boolean; write: boolean; validate: boolean; delete: boolean; export: boolean }>> = {
  admin: {
    mail: { read: true, write: true, validate: true, delete: true, export: true },
    folders: { read: true, write: true, validate: true, delete: true, export: true },
    establishments: { read: true, write: true, validate: true, delete: true, export: true },
    surveillance: { read: true, write: true, validate: true, delete: true, export: true },
    vigilance: { read: true, write: true, validate: true, delete: true, export: true },
    trainings: { read: true, write: true, validate: true, delete: true, export: true },
    dashboard: { read: true, write: true, validate: true, delete: true, export: true },
    reporting: { read: true, write: true, validate: true, delete: true, export: true },
    settings: { read: true, write: true, validate: true, delete: true, export: true },
  },
  chef_service: {
    mail: { read: true, write: true, validate: true, delete: false, export: true },
    folders: { read: true, write: true, validate: true, delete: false, export: true },
    establishments: { read: true, write: true, validate: true, delete: false, export: true },
    surveillance: { read: true, write: true, validate: true, delete: false, export: true },
    vigilance: { read: true, write: true, validate: true, delete: false, export: true },
    trainings: { read: true, write: true, validate: true, delete: false, export: true },
    dashboard: { read: true, write: true, validate: true, delete: false, export: true },
    reporting: { read: true, write: false, validate: true, delete: false, export: true },
    settings: { read: true, write: false, validate: false, delete: false, export: false },
  },
  agent: {
    mail: { read: true, write: true, validate: false, delete: false, export: true },
    folders: { read: true, write: true, validate: false, delete: false, export: true },
    establishments: { read: true, write: true, validate: false, delete: false, export: true },
    surveillance: { read: true, write: true, validate: false, delete: false, export: true },
    vigilance: { read: true, write: true, validate: false, delete: false, export: true },
    trainings: { read: true, write: true, validate: false, delete: false, export: true },
    dashboard: { read: true, write: false, validate: false, delete: false, export: false },
    reporting: { read: true, write: false, validate: false, delete: false, export: false },
    settings: { read: false, write: false, validate: false, delete: false, export: false },
  },
  secretaire: {
    mail: { read: true, write: true, validate: false, delete: false, export: true },
    folders: { read: true, write: false, validate: false, delete: false, export: false },
    establishments: { read: true, write: false, validate: false, delete: false, export: false },
    surveillance: { read: false, write: false, validate: false, delete: false, export: false },
    vigilance: { read: true, write: true, validate: false, delete: false, export: false },
    trainings: { read: true, write: true, validate: false, delete: false, export: true },
    dashboard: { read: true, write: false, validate: false, delete: false, export: false },
    reporting: { read: false, write: false, validate: false, delete: false, export: false },
    settings: { read: false, write: false, validate: false, delete: false, export: false },
  },
};

interface RolePermissionsMatrixProps {
  users: UserProfile[];
}

export const RolePermissionsMatrix: React.FC<RolePermissionsMatrixProps> = ({ users }) => {
  const [targetType, setTargetType] = useState<'role' | 'user'>('role');
  const [selectedRole, setSelectedRole] = useState<string>('chef_service');
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || '');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Storage key
  const activeKey = targetType === 'role' ? `role_${selectedRole}` : `user_${selectedUserId}`;

  // Permissions state
  const [permissionsMap, setPermissionsMap] = useState<Record<string, Record<string, { read: boolean; write: boolean; validate: boolean; delete: boolean; export: boolean }>>>({});

  // Initialize from localStorage or defaults
  useEffect(() => {
    try {
      const stored = localStorage.getItem('activia_role_permissions_matrix');
      if (stored) {
        setPermissionsMap(JSON.parse(stored));
      } else {
        setPermissionsMap(DEFAULT_ROLE_PERMISSIONS);
      }
    } catch {
      setPermissionsMap(DEFAULT_ROLE_PERMISSIONS);
    }
  }, []);

  // Get current active permissions
  const currentPermissions: Record<string, { read: boolean; write: boolean; validate: boolean; delete: boolean; export: boolean }> = 
    permissionsMap[activeKey] || (targetType === 'role' ? DEFAULT_ROLE_PERMISSIONS[selectedRole] : DEFAULT_ROLE_PERMISSIONS['agent']) || DEFAULT_ROLE_PERMISSIONS['agent'];

  // Save to state and localStorage
  const updatePermission = (moduleId: string, permKey: 'read' | 'write' | 'validate' | 'delete' | 'export', value: boolean) => {
    setPermissionsMap(prev => {
      const currentRoleObj = prev[activeKey] || { ...currentPermissions };
      const updatedModule = {
        ...(currentRoleObj[moduleId] || { read: false, write: false, validate: false, delete: false, export: false }),
        [permKey]: value,
      };

      // Si on coche écriture ou validation, cocher automatiquement la lecture
      if ((permKey === 'write' || permKey === 'validate' || permKey === 'delete' || permKey === 'export') && value) {
        updatedModule.read = true;
      }
      // Si on décoche lecture, décocher automatiquement les autres
      if (permKey === 'read' && !value) {
        updatedModule.write = false;
        updatedModule.validate = false;
        updatedModule.delete = false;
        updatedModule.export = false;
      }

      const updated = {
        ...prev,
        [activeKey]: {
          ...currentRoleObj,
          [moduleId]: updatedModule,
        }
      };

      try {
        localStorage.setItem('activia_role_permissions_matrix', JSON.stringify(updated));
      } catch (err) {
        console.error('Erreur sauvegarde permissions', err);
      }

      return updated;
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  // Toggle all permissions for a module (Row toggle)
  const toggleRow = (moduleId: string) => {
    const mod = currentPermissions[moduleId] || { read: false, write: false, validate: false, delete: false, export: false };
    const allChecked = mod.read && mod.write && mod.validate && mod.delete && mod.export;
    const newVal = !allChecked;

    setPermissionsMap(prev => {
      const currentRoleObj = prev[activeKey] || { ...currentPermissions };
      const updated = {
        ...prev,
        [activeKey]: {
          ...currentRoleObj,
          [moduleId]: {
            read: newVal,
            write: newVal,
            validate: newVal,
            delete: newVal,
            export: newVal,
          }
        }
      };
      localStorage.setItem('activia_role_permissions_matrix', JSON.stringify(updated));
      return updated;
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  // Toggle column
  const toggleColumn = (permKey: 'read' | 'write' | 'validate' | 'delete' | 'export') => {
    const allChecked = DEFAULT_MODULES.every(m => currentPermissions[m.id]?.[permKey]);
    const newVal = !allChecked;

    setPermissionsMap(prev => {
      const currentRoleObj = prev[activeKey] || { ...currentPermissions };
      const updatedRoleObj: Record<string, any> = { ...currentRoleObj };

      DEFAULT_MODULES.forEach(m => {
        const cur = updatedRoleObj[m.id] || { read: false, write: false, validate: false, delete: false, export: false };
        updatedRoleObj[m.id] = {
          ...cur,
          [permKey]: newVal,
          read: (permKey !== 'read' && newVal) ? true : (permKey === 'read' && !newVal ? false : cur.read),
        };
      });

      const updated = {
        ...prev,
        [activeKey]: updatedRoleObj,
      };
      localStorage.setItem('activia_role_permissions_matrix', JSON.stringify(updated));
      return updated;
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  // Preset: tout autoriser
  const applyPresetAll = (value: boolean) => {
    setPermissionsMap(prev => {
      const updatedRoleObj: Record<string, any> = {};
      DEFAULT_MODULES.forEach(m => {
        updatedRoleObj[m.id] = {
          read: value,
          write: value,
          validate: value,
          delete: value,
          export: value,
        };
      });
      const updated = { ...prev, [activeKey]: updatedRoleObj };
      localStorage.setItem('activia_role_permissions_matrix', JSON.stringify(updated));
      return updated;
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  // Preset: lecture seule
  const applyPresetReadOnly = () => {
    setPermissionsMap(prev => {
      const updatedRoleObj: Record<string, any> = {};
      DEFAULT_MODULES.forEach(m => {
        updatedRoleObj[m.id] = {
          read: true,
          write: false,
          validate: false,
          delete: false,
          export: true,
        };
      });
      const updated = { ...prev, [activeKey]: updatedRoleObj };
      localStorage.setItem('activia_role_permissions_matrix', JSON.stringify(updated));
      return updated;
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  // Reset to default
  const resetToRoleDefault = () => {
    const baseDefault = targetType === 'role' ? DEFAULT_ROLE_PERMISSIONS[selectedRole] : DEFAULT_ROLE_PERMISSIONS['agent'];
    setPermissionsMap(prev => {
      const updated = { ...prev, [activeKey]: baseDefault };
      localStorage.setItem('activia_role_permissions_matrix', JSON.stringify(updated));
      return updated;
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const selectedUser = users.find(u => u.id === selectedUserId) || users[0];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
      {/* Header avec sélecteur de Rôle ou d'Utilisateur */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-5 rounded-full bg-blue-600 shrink-0" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-700" />
              Matrice Interactive des Droits d’Accès par Module
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-4">
            Cochez ou décochez les permissions pour chaque module métier en temps réel.
          </p>
        </div>

        {/* Mode switcher: Rôle vs Utilisateur */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-2xs flex items-center text-xs font-semibold">
            <button
              type="button"
              onClick={() => setTargetType('role')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                targetType === 'role'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Par Rôle ({selectedRole})
            </button>
            <button
              type="button"
              onClick={() => setTargetType('user')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                targetType === 'user'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Par Collaborateur ({users.length})
            </button>
          </div>

          {/* Sélecteur de Rôle */}
          {targetType === 'role' && (
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-white border border-blue-300 rounded-lg px-3 py-1.5 ring-1 ring-blue-400 cursor-pointer"
            >
              <option value="admin">Directeur DLVS / Administrateur Général</option>
              <option value="chef_service">Chef de Service (SVPS, SSMUR, SL)</option>
              <option value="agent">Agent Instructeur / Évaluateur Réglementaire</option>
              <option value="secretaire">Secrétariat Général & Courrier</option>
            </select>
          )}

          {/* Sélecteur de Collaborateur */}
          {targetType === 'user' && (
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-white border border-blue-300 rounded-lg px-3 py-1.5 ring-1 ring-blue-400 cursor-pointer"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.order || '•'} - {u.full_name} ({u.role_label})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Preset actions toolbar */}
      <div className="px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs bg-blue-50/40 border-b border-blue-100">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-600 font-semibold mr-1">Préréglages rapides :</span>
          <button
            type="button"
            onClick={() => applyPresetAll(true)}
            className="px-2.5 py-1 bg-white hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
            <span>Tout autoriser</span>
          </button>
          <button
            type="button"
            onClick={applyPresetReadOnly}
            className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-amber-600" />
            <span>Lecture seule</span>
          </button>
          <button
            type="button"
            onClick={() => applyPresetAll(false)}
            className="px-2.5 py-1 bg-white hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Square className="w-3.5 h-3.5 text-rose-600" />
            <span>Tout interdire</span>
          </button>
          <button
            type="button"
            onClick={resetToRoleDefault}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Rétablir par défaut</span>
          </button>
        </div>

        {/* Indicateur de sauvegarde automatique */}
        <div className="flex items-center gap-2">
          {savedSuccess ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full animate-pulse">
              <Check className="w-3.5 h-3.5" /> Enregistré !
            </span>
          ) : (
            <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
              <Save className="w-3.5 h-3.5 text-slate-400" />
              Enregistrement instantané automatique
            </span>
          )}
        </div>
      </div>

      {/* TABLEAU INTERACTIF DES DROITS PAR MODULE */}
      <div className="overflow-x-auto w-full px-4 pb-4">
        <table className="w-full text-xs text-left border-collapse table-fixed">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-3 w-[36%]">
                <span>Module Fonctionnel ACTIVIA</span>
              </th>

              {/* Colonne Lecture */}
              <th 
                onClick={() => toggleColumn('read')}
                className="py-3 px-2 text-center w-[12%] cursor-pointer hover:bg-blue-100/60 transition-colors select-none group"
                title="Cliquer pour tout cocher/décocher cette colonne"
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-slate-900 group-hover:text-blue-700 font-extrabold">👁️ Lecture</span>
                  <span className="text-[9px] font-normal text-slate-500 lowercase">consultation</span>
                </div>
              </th>

              {/* Colonne Écriture */}
              <th 
                onClick={() => toggleColumn('write')}
                className="py-3 px-2 text-center w-[13%] cursor-pointer hover:bg-blue-100/60 transition-colors select-none group"
                title="Cliquer pour tout cocher/décocher cette colonne"
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-slate-900 group-hover:text-blue-700 font-extrabold">✍️ Écriture</span>
                  <span className="text-[9px] font-normal text-slate-500 lowercase">créer / éditer</span>
                </div>
              </th>

              {/* Colonne Validation */}
              <th 
                onClick={() => toggleColumn('validate')}
                className="py-3 px-2 text-center w-[13%] cursor-pointer hover:bg-blue-100/60 transition-colors select-none group"
                title="Cliquer pour tout cocher/décocher cette colonne"
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-slate-900 group-hover:text-blue-700 font-extrabold">✅ Validation</span>
                  <span className="text-[9px] font-normal text-slate-500 lowercase">visa / décision</span>
                </div>
              </th>

              {/* Colonne Suppression */}
              <th 
                onClick={() => toggleColumn('delete')}
                className="py-3 px-2 text-center w-[13%] cursor-pointer hover:bg-blue-100/60 transition-colors select-none group"
                title="Cliquer pour tout cocher/décocher cette colonne"
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-slate-900 group-hover:text-blue-700 font-extrabold">🗑️ Suppression</span>
                  <span className="text-[9px] font-normal text-slate-500 lowercase">clôture / rejet</span>
                </div>
              </th>

              {/* Colonne Export */}
              <th 
                onClick={() => toggleColumn('export')}
                className="py-3 px-2 text-center w-[13%] cursor-pointer hover:bg-blue-100/60 transition-colors select-none group"
                title="Cliquer pour tout cocher/décocher cette colonne"
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-slate-900 group-hover:text-blue-700 font-extrabold">📥 Export</span>
                  <span className="text-[9px] font-normal text-slate-500 lowercase">Excel & PDF</span>
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {DEFAULT_MODULES.map((mod) => {
              const perms = currentPermissions[mod.id] || { read: false, write: false, validate: false, delete: false, export: false };
              const allChecked = perms.read && perms.write && perms.validate && perms.delete && perms.export;

              return (
                <tr key={mod.id} className="hover:bg-blue-50/30 transition-colors group">
                  {/* Intitulé du module avec clic pour basculer toute la ligne */}
                  <td className="py-3 px-3 align-middle">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm leading-snug break-words">
                          {mod.name}
                        </div>
                        <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">
                          Périmètre : {mod.category}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleRow(mod.id)}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border transition-colors shrink-0 ${
                          allChecked
                            ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                        title="Basculer tous les droits pour ce module"
                      >
                        {allChecked ? 'Tout décocher' : 'Tout cocher'}
                      </button>
                    </div>
                  </td>

                  {/* Checkbox Lecture */}
                  <td className="py-3 px-2 text-center align-middle">
                    <label className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={perms.read}
                        onChange={(e) => updatePermission(mod.id, 'read', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                    </label>
                  </td>

                  {/* Checkbox Écriture */}
                  <td className="py-3 px-2 text-center align-middle">
                    <label className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={perms.write}
                        onChange={(e) => updatePermission(mod.id, 'write', e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                      />
                    </label>
                  </td>

                  {/* Checkbox Validation */}
                  <td className="py-3 px-2 text-center align-middle">
                    <label className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={perms.validate}
                        onChange={(e) => updatePermission(mod.id, 'validate', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                    </label>
                  </td>

                  {/* Checkbox Suppression */}
                  <td className="py-3 px-2 text-center align-middle">
                    <label className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={perms.delete}
                        onChange={(e) => updatePermission(mod.id, 'delete', e.target.checked)}
                        className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
                      />
                    </label>
                  </td>

                  {/* Checkbox Export */}
                  <td className="py-3 px-2 text-center align-middle">
                    <label className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={perms.export}
                        onChange={(e) => updatePermission(mod.id, 'export', e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                      />
                    </label>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Résumé de configuration pour le rôle ou l'utilisateur actif */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            Configuration en vigueur pour : <strong className="text-slate-900 font-bold">
              {targetType === 'role' ? `Rôle « ${selectedRole} »` : `${selectedUser?.full_name} (${selectedUser?.role_label})`}
            </strong>
          </span>
        </div>
        <span className="text-[11px] text-slate-500">
          Les modifications sont appliquées immédiatement sur l’ensemble de la plateforme.
        </span>
      </div>
    </div>
  );
};
