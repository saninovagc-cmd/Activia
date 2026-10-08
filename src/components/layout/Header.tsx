'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/ui/Badge';
import { 
  Bell, 
  Search, 
  UserCheck, 
  Check, 
  ChevronDown, 
  ExternalLink,
  ShieldAlert,
  Calendar,
  ClipboardList,
  LogOut,
  Info,
  FolderArchive,
  Mail,
  Building2,
  AlertTriangle,
  GraduationCap,
  Activity as ActivityIcon,
  X,
  Key,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';

export const Header: React.FC<{ onToggleSidebar?: () => void }> = ({ onToggleSidebar }) => {
  const { 
    currentUser, 
    allUsers, 
    switchUser, 
    logout,
    updateUserPassword,
    notifications, 
    unreadNotificationCount, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    activities,
    folders,
    incomingMails,
    establishments,
    signals,
    trainings
  } = useApp();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserSwitcher, setShowUserSwitcher] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Change password modal state
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserSwitcher(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchFocused(false);
      router.push(`/activities?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Real-time matched items across all modules
  const q = searchQuery.toLowerCase().trim();
  const hasQuery = q.length >= 2;

  const matchedActivities = hasQuery
    ? activities.filter(a => a.code.toLowerCase().includes(q) || a.title.toLowerCase().includes(q)).slice(0, 3)
    : [];

  const matchedFolders = hasQuery
    ? folders.filter(f => f.folder_number.toLowerCase().includes(q) || f.structure.toLowerCase().includes(q) || f.applicant.toLowerCase().includes(q)).slice(0, 3)
    : [];

  const matchedMails = hasQuery
    ? incomingMails.filter(m => m.register_number.toLowerCase().includes(q) || m.sender.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q)).slice(0, 3)
    : [];

  const matchedEtabs = hasQuery
    ? establishments.filter(e => e.code.toLowerCase().includes(q) || e.name.toLowerCase().includes(q) || e.responsible_pharmacist.toLowerCase().includes(q) || e.city.toLowerCase().includes(q)).slice(0, 3)
    : [];

  const matchedSignals = hasQuery
    ? signals.filter(s => s.signal_number.toLowerCase().includes(q) || s.product_name.toLowerCase().includes(q) || s.batch_number.toLowerCase().includes(q)).slice(0, 3)
    : [];

  const matchedTrainings = hasQuery
    ? trainings.filter(t => t.participant_name.toLowerCase().includes(q) || t.structure.toLowerCase().includes(q) || t.theme.toLowerCase().includes(q)).slice(0, 3)
    : [];

  const totalMatches = matchedActivities.length + matchedFolders.length + matchedMails.length + matchedEtabs.length + matchedSignals.length + matchedTrainings.length;

  return (
    <header className="sticky top-0 z-40 bg-[#15803d] border-b border-emerald-900/40 h-20 px-4 md:px-6 flex items-center justify-between shadow-md text-white">
      {/* Left section: mobile hamburger + Universal Omni-Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl" ref={searchRef}>
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-white hover:bg-emerald-800 focus:outline-none transition-colors cursor-pointer"
          title="Menu de navigation"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="relative w-full hidden sm:block">
          <form onSubmit={handleSearchSubmit}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Recherche globale : dossier, courrier, établissement, MAPI, activité..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              onFocus={() => setIsSearchFocused(true)}
              className="w-full pl-9 pr-14 py-2.5 text-xs bg-white border border-emerald-700/40 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:bg-white transition-all shadow-xs"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-medium text-slate-400 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded pointer-events-none">
                Ctrl K
              </span>
            )}
          </form>

          {/* Omni-search live results dropdown */}
          {isSearchFocused && hasQuery && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 py-3 z-50 max-h-[70vh] overflow-y-auto text-xs animate-in fade-in slide-in-from-top-2">
              <div className="px-3 pb-2 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Résultats pour &laquo; <strong>{searchQuery}</strong> &raquo;</span>
                <span className="font-semibold text-blue-600">{totalMatches} trouvé(s)</span>
              </div>

              {totalMatches === 0 ? (
                <div className="p-4 text-center text-slate-400 text-xs">
                  Aucun résultat correspondant dans l'ensemble des modules.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {/* Folders */}
                  {matchedFolders.length > 0 && (
                    <div className="p-2 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Dossiers Réglementaires</span>
                      {matchedFolders.map(f => (
                        <div
                          key={f.id}
                          onClick={() => {
                            setIsSearchFocused(false);
                            router.push(`/folders`);
                          }}
                          className="px-2.5 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <FolderArchive className="w-4 h-4 text-blue-600" />
                            <div>
                              <strong className="text-slate-800">{f.folder_number}</strong> — {f.structure}
                              <span className="text-[10px] text-slate-400 block">{f.folder_type} • {f.applicant}</span>
                            </div>
                          </div>
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 font-semibold">{f.status}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Mail */}
                  {matchedMails.length > 0 && (
                    <div className="p-2 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Courriers</span>
                      {matchedMails.map(m => (
                        <div
                          key={m.id}
                          onClick={() => {
                            setIsSearchFocused(false);
                            router.push(`/mail`);
                          }}
                          className="px-2.5 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-indigo-600" />
                            <div>
                              <strong className="text-slate-800">{m.register_number}</strong> : {m.subject}
                              <span className="text-[10px] text-slate-400 block">De : {m.sender}</span>
                            </div>
                          </div>
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600">{m.status}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Establishments */}
                  {matchedEtabs.length > 0 && (
                    <div className="p-2 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Établissements</span>
                      {matchedEtabs.map(e => (
                        <div
                          key={e.id}
                          onClick={() => {
                            setIsSearchFocused(false);
                            router.push(`/establishments`);
                          }}
                          className="px-2.5 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-emerald-600" />
                            <div>
                              <strong className="text-slate-800">{e.name}</strong> ({e.code})
                              <span className="text-[10px] text-slate-400 block">{e.responsible_pharmacist} • {e.city}</span>
                            </div>
                          </div>
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 font-semibold">{e.status}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Signals */}
                  {matchedSignals.length > 0 && (
                    <div className="p-2 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Vigilances & MAPI</span>
                      {matchedSignals.map(s => (
                        <div
                          key={s.id}
                          onClick={() => {
                            setIsSearchFocused(false);
                            router.push(`/signals`);
                          }}
                          className="px-2.5 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-rose-600" />
                            <div>
                              <strong className="text-slate-800">{s.signal_number}</strong> : {s.product_name}
                              <span className="text-[10px] text-slate-400 block">Lot {s.batch_number} • {s.signal_type}</span>
                            </div>
                          </div>
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-50 text-rose-700 font-semibold">{s.severity}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Activities */}
                  {matchedActivities.length > 0 && (
                    <div className="p-2 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Activités du Service</span>
                      {matchedActivities.map(a => (
                        <div
                          key={a.id}
                          onClick={() => {
                            setIsSearchFocused(false);
                            router.push(`/activities`);
                          }}
                          className="px-2.5 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <ActivityIcon className="w-4 h-4 text-teal-600" />
                            <div>
                              <strong className="text-slate-800">{a.code}</strong> — {a.title}
                              <span className="text-[10px] text-slate-400 block">Resp: {a.manager_name}</span>
                            </div>
                          </div>
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600">{a.status}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Trainings */}
                  {matchedTrainings.length > 0 && (
                    <div className="p-2 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Formations</span>
                      {matchedTrainings.map(t => (
                        <div
                          key={t.id}
                          onClick={() => {
                            setIsSearchFocused(false);
                            router.push(`/trainings`);
                          }}
                          className="px-2.5 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-purple-600" />
                            <div>
                              <strong className="text-slate-800">{t.participant_name}</strong>
                              <span className="text-[10px] text-slate-400 block">{t.theme} • {t.structure}</span>
                            </div>
                          </div>
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-50 text-purple-700 font-semibold">{t.result}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right section: Role switcher + Notifications + Déconnexion */}
      <div className="flex items-center gap-2.5">
        {/* Role & User Switcher with Account Info */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserSwitcher(!showUserSwitcher)}
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl bg-transparent hover:bg-emerald-850/60 border border-transparent hover:border-emerald-600/40 transition-colors cursor-pointer text-left"
            title="Mon compte et changement d'utilisateur"
          >
            <div className="w-6 h-6 rounded-full bg-white text-emerald-800 font-black flex items-center justify-center text-[11px] shadow-xs shrink-0">
              {currentUser.order || '1'}
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-xs leading-tight">{currentUser.full_name}</span>
                <span className="text-[10px] font-mono font-bold text-emerald-100 bg-emerald-900/60 px-1.5 py-0.2 rounded border border-emerald-400/40">
                  {currentUser.username}
                </span>
              </div>
              <span className="text-[10.5px] text-emerald-100/90 block font-medium leading-tight mt-0.5">
                {currentUser.title} • {currentUser.role === 'admin' ? 'Directrice' : currentUser.role === 'chef_service' ? 'Chef Serv.' : currentUser.role === 'secretariat' ? 'Secrétaire' : 'Agent'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-emerald-200 shrink-0 ml-0.5" />
          </button>

          {showUserSwitcher && (
            <div className="absolute right-0 mt-2 w-92 bg-white rounded-xl shadow-2xl border border-slate-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden">
              {/* Active user header card */}
              <div className="p-3 bg-slate-50/90 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Session Active</span>
                  <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-200">
                    ID: {currentUser.username}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900 mt-1">{currentUser.full_name}</p>
                <p className="text-[10px] text-slate-500">{currentUser.title} • {currentUser.post || currentUser.department}</p>
                
                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserSwitcher(false);
                      setShowChangePasswordModal(true);
                      setPasswordError('');
                      setNewPasswordInput('');
                      setConfirmPasswordInput('');
                    }}
                    className="py-1.5 px-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Key className="w-3.5 h-3.5 text-emerald-700" />
                    Mot de passe
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserSwitcher(false);
                      logout();
                      router.push('/login');
                    }}
                    className="py-1.5 px-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Déconnexion
                  </button>
                </div>
              </div>

              {/* Simulation Switcher list */}
              <div className="px-3.5 py-1.5 border-b border-slate-100 bg-slate-100/60 flex items-center justify-between">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Bascule rapide ({allUsers.length} Collaborateurs DLVS)
                </p>
                <span className="text-[9px] text-slate-400">Simulation RBAC</span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                {allUsers.map((u) => {
                  const isSelected = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        setShowUserSwitcher(false);
                      }}
                      className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                        isSelected ? 'bg-blue-50/80 border-l-3 border-blue-600' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <span className="w-6 h-6 shrink-0 rounded bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[11px] border border-slate-200">
                          {u.order || 1}
                        </span>
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <span className={`font-semibold truncate ${isSelected ? 'text-blue-900 font-bold' : 'text-slate-800'}`}>
                              {u.full_name}
                            </span>
                            <span className="text-[9px] font-mono text-slate-400">
                              @{u.username}
                            </span>
                          </div>
                          <p className="text-[10px] text-blue-700 truncate font-medium">{u.title} • {u.post || u.role_label}</p>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl text-white hover:bg-emerald-800 transition-colors cursor-pointer"
            title="Notifications du service"
          >
            <Bell className="w-5 h-5 text-white" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Centre de Notifications</h4>
                  <p className="text-[11px] text-slate-500">{unreadNotificationCount} nouvelle(s) notification(s)</p>
                </div>
                {unreadNotificationCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Tout marquer comme lu
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    Aucune notification pour le moment.
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const iconMap = {
                      deadline: <ShieldAlert className="w-4 h-4 text-rose-500" />,
                      alert: <ShieldAlert className="w-4 h-4 text-amber-500" />,
                      assignment: <ClipboardList className="w-4 h-4 text-blue-500" />,
                      status_change: <Calendar className="w-4 h-4 text-emerald-500" />,
                      system: <Info className="w-4 h-4 text-slate-500" />,
                    };
                    return (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markNotificationAsRead(notif.id);
                          if (notif.link) {
                            setShowNotifications(false);
                            router.push(notif.link);
                          }
                        }}
                        className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${
                          !notif.is_read ? 'bg-blue-50/40 border-l-2 border-blue-600' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5">{iconMap[notif.type]}</div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-900">{notif.title}</span>
                              <span className="text-[10px] text-slate-400">{notif.created_at}</span>
                            </div>
                            <p className="text-slate-600 mt-0.5 leading-snug">{notif.message}</p>
                            {notif.link && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline mt-1 font-medium">
                                Consulter <ExternalLink className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bouton Déconnexion Direct */}
        <button
          onClick={() => {
            logout();
            router.push('/login');
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 text-rose-700 bg-white hover:bg-rose-50 hover:border-rose-300 transition-colors text-xs font-bold cursor-pointer shadow-sm"
          title="Se déconnecter de la plateforme et retourner à l'accueil"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-600" />
          <span className="hidden sm:inline">Déconnexion</span>
        </button>
      </div>

      {/* Modal Modification du Mot de Passe */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-600 text-white">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Modifier mon mot de passe</h3>
                  <p className="text-[11px] text-slate-300">{currentUser.full_name} ({currentUser.username})</p>
                </div>
              </div>
              <button
                onClick={() => setShowChangePasswordModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPasswordError('');
                if (newPasswordInput.trim().length < 4) {
                  setPasswordError('Le nouveau mot de passe doit comporter au moins 4 caractères.');
                  return;
                }
                if (newPasswordInput !== confirmPasswordInput) {
                  setPasswordError('Les deux mots de passe saisis ne sont pas identiques.');
                  return;
                }
                const ok = updateUserPassword(currentUser.id, newPasswordInput);
                if (ok) {
                  setShowChangePasswordModal(false);
                  setNewPasswordInput('');
                  setConfirmPasswordInput('');
                  setPasswordError('');
                }
              }}
              className="p-5 space-y-4"
            >
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-emerald-700" /> Format initial par défaut :
                </p>
                <p className="text-[11px] text-slate-600">
                  Votre mot de passe par défaut est : <strong className="font-mono text-emerald-800">{currentUser.default_password}</strong> (nom de famille + 123). Vous pouvez le remplacer librement par un mot de passe de votre choix.
                </p>
              </div>

              {passwordError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPasswordText ? "text" : "password"}
                    required
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Saisissez votre nouveau mot de passe"
                    className="keep-case w-full pl-9 pr-10 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordText(!showPasswordText)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirmer le nouveau mot de passe
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPasswordText ? "text" : "password"}
                    required
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    placeholder="Répétez le nouveau mot de passe"
                    className="keep-case w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(false)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Enregistrer mon mot de passe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
