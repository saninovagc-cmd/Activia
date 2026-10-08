'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { LogOut, ChevronDown, ChevronRight } from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
}

interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useApp();

  const navSections: NavSection[] = [
    {
      id: 'pilotage',
      title: '1. PILOTAGE',
      items: [
        { name: 'Tableau de Bord Général', href: '/dashboard' },
        { name: 'Dashboard Chef de Service', href: '/dashboard?view=service' },
        { name: 'Rapports & Statistiques', href: '/reporting' },
      ],
    },
    {
      id: 'operationnel',
      title: '2. SOCLE OPÉRATIONNEL',
      items: [
        { name: 'Activités du Service', href: '/activities' },
        { name: 'Tâches & Délais', href: '/tasks' },
        { name: 'Calendrier Global', href: '/calendar' },
      ],
    },
    {
      id: 'administratif',
      title: '3. GESTION ADMINISTRATIVE',
      items: [
        { name: 'Courriers Entrants / Sortants', href: '/mail' },
        { name: 'Dossiers & Demandes', href: '/folders' },
        { name: 'Documents & GED', href: '/documents' },
      ],
    },
    {
      id: 'metiers',
      title: '4. MÉTIERS & VIGILANCES',
      items: [
        { name: 'Établissements Pharmaceutiques', href: '/establishments' },
        { name: 'Signalements & Alertes', href: '/signals' },
        { name: 'Formations Points Focaux', href: '/trainings' },
      ],
    },
    {
      id: 'donnees',
      title: '5. DONNÉES & CONFIGURATION',
      items: [
        { name: 'Migration Fichiers Excel (18)', href: '/import' },
        { name: 'Journal d’Audit & Sécurité', href: '/audit' },
        { name: 'Référentiels & Paramètres', href: '/settings' },
      ],
    },
  ];

  // Detect which section matches the active path
  const getActiveSectionId = (path: string): string => {
    if (path === '/dashboard' || path.startsWith('/reporting')) return 'pilotage';
    if (path.startsWith('/activities') || path.startsWith('/tasks') || path.startsWith('/calendar')) return 'operationnel';
    if (path.startsWith('/mail') || path.startsWith('/folders') || path.startsWith('/documents')) return 'administratif';
    if (path.startsWith('/establishments') || path.startsWith('/signals') || path.startsWith('/trainings')) return 'metiers';
    if (path.startsWith('/import') || path.startsWith('/audit') || path.startsWith('/settings')) return 'donnees';
    return 'pilotage';
  };

  const [openSectionId, setOpenSectionId] = useState<string>(() => getActiveSectionId(pathname));

  useEffect(() => {
    setOpenSectionId(getActiveSectionId(pathname));
  }, [pathname]);

  const toggleSection = (id: string) => {
    setOpenSectionId(prev => (prev === id ? '' : id));
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand header */}
        <div className="h-14 flex items-center justify-between px-5 bg-slate-950 border-b border-slate-800 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-base tracking-wider shadow-xs">
              A
            </div>
            <div>
              <span className="text-base font-black tracking-wide text-white">ACTIVIA</span>
              <span className="block text-[9px] uppercase font-semibold tracking-wider text-blue-400">
                Direction Sanitaire DLVS
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Navigation Sections — Accordion Titles first, revealing Sub-titles on click */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
          {navSections.map((section) => {
            const isSectionOpen = openSectionId === section.id;
            const hasActiveItem = section.items.some(item => 
              pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            );

            return (
              <div
                key={section.id}
                className={`rounded-lg border transition-all ${
                  isSectionOpen
                    ? 'bg-slate-950/60 border-slate-700/80'
                    : hasActiveItem
                    ? 'bg-slate-800/40 border-blue-900/50'
                    : 'bg-transparent border-transparent hover:bg-slate-800/30'
                }`}
              >
                {/* Section Title Header (Clickable to expand / collapse) */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider text-left transition-colors cursor-pointer rounded-lg ${
                    isSectionOpen
                      ? 'text-white'
                      : hasActiveItem
                      ? 'text-blue-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  aria-expanded={isSectionOpen}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span
                      className={`w-1.5 h-3.5 rounded-full shrink-0 ${
                        hasActiveItem ? 'bg-blue-500' : isSectionOpen ? 'bg-slate-400' : 'bg-slate-700'
                      }`}
                    />
                    <span className="truncate">{section.title}</span>
                  </span>

                  <span className="text-slate-400 shrink-0 ml-2">
                    {isSectionOpen ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </span>
                </button>

                {/* Sub-items (Revealed on click) */}
                {isSectionOpen && (
                  <div className="px-2 pt-1 pb-2 space-y-0.5 border-t border-slate-800/60">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => {
                            if (window.innerWidth < 1024) onClose();
                          }}
                          className={`block px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                            isActive
                              ? 'bg-blue-600 text-white font-bold shadow-xs'
                              : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate">{item.name}</span>
                            {isActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Active user session card & Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 shrink-0">
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
              {currentUser.order || '1'}
            </div>
            <div className="truncate min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{currentUser.full_name}</p>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-blue-400 font-mono">ID: {currentUser.username}</span>
                <span className="text-[9px] text-slate-500 truncate">• {currentUser.role === 'admin' ? 'Directrice' : currentUser.role === 'chef_service' ? 'Chef Serv.' : currentUser.role === 'secretariat' ? 'Secrétaire' : 'Agent'}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="w-full py-1.5 px-3 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
};
