'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { LogOut, ChevronDown, ChevronRight } from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
}

interface NavSection {
  id: string;
  number: string;
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
      number: '01',
      title: 'PILOTAGE',
      items: [
        { name: 'Tableau de Bord Général', href: '/dashboard' },
        { name: 'Dashboard Chef de Service', href: '/dashboard?view=service' },
        { name: 'Rapports & Statistiques', href: '/reporting' },
      ],
    },
    {
      id: 'operationnel',
      number: '02',
      title: 'GESTION DES ACTIVITÉS',
      items: [
        { name: 'Activités du Service', href: '/activities' },
        { name: 'Tâches & Délais', href: '/tasks' },
        { name: 'Calendrier Global', href: '/calendar' },
      ],
    },
    {
      id: 'administratif',
      number: '03',
      title: 'GESTION ADMINISTRATIVE',
      items: [
        { name: 'Courriers Entrants / Sortants', href: '/mail' },
        { name: 'Dossiers & Demandes', href: '/folders' },
        { name: 'Documents & GED', href: '/documents' },
      ],
    },
    {
      id: 'metiers',
      number: '04',
      title: 'MÉTIERS & VIGILANCES',
      items: [
        { name: 'Établissements Pharmaceutiques', href: '/establishments' },
        { name: 'Signalements & Alertes', href: '/signals' },
        { name: 'Formations Points Focaux', href: '/trainings' },
      ],
    },
    {
      id: 'donnees',
      number: '05',
      title: 'PARAMÈTRE & CONFIGURATION',
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
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0b1120] text-slate-300 flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800/80 shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* National subtle color ribbon at very top */}
        <div className="h-[2px] w-full flex shrink-0">
          <span className="w-1/3 bg-emerald-500" />
          <span className="w-1/3 bg-amber-400" />
          <span className="w-1/3 bg-rose-500" />
        </div>

        {/* Brand header with ABMed Official Identity */}
        <div className="h-20 flex items-center justify-between px-4 bg-[#070b14] border-b border-slate-800/80 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="bg-white rounded-lg p-1.5 shadow-md flex items-center justify-center shrink-0 border border-slate-200">
              <Image
                src="/logo-abmed.png"
                alt="Logo ABMed"
                width={72}
                height={30}
                className="h-8 w-auto object-contain"
                priority
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-wide text-white">ACTIVIA</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ABMed
                </span>
              </div>
              <span className="block text-[8.5px] uppercase font-bold tracking-wider text-slate-400 leading-tight">
                Agence Béninoise du Médicament
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Navigation Sections — Accordion Titles first, revealing Sub-titles on click */}
        <div className="flex-1 overflow-y-auto px-3 py-3.5 space-y-1.5">
          {navSections.map((section) => {
            const isSectionOpen = openSectionId === section.id;
            const hasActiveItem = section.items.some(item => 
              pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            );

            return (
              <div
                key={section.id}
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  isSectionOpen
                    ? 'bg-[#0e1628] border-slate-700 shadow-sm'
                    : hasActiveItem
                    ? 'bg-slate-900/60 border-emerald-900/60'
                    : 'bg-transparent border-transparent hover:bg-slate-850/40 hover:border-slate-800/60'
                }`}
              >
                {/* Section Title Header (Clickable to expand / collapse) */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-left transition-colors cursor-pointer select-none ${
                    isSectionOpen
                      ? 'text-white'
                      : hasActiveItem
                      ? 'text-emerald-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  aria-expanded={isSectionOpen}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <span
                      className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                        hasActiveItem
                          ? 'bg-emerald-700 text-white border-emerald-600'
                          : isSectionOpen
                          ? 'bg-slate-800 text-emerald-300 border-slate-700'
                          : 'bg-slate-900 text-slate-500 border-slate-800'
                      }`}
                    >
                      {section.number}
                    </span>
                    <span className="truncate text-[11px]">{section.title}</span>
                  </span>

                  <span className="text-slate-400 shrink-0 ml-2">
                    {isSectionOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 text-emerald-400 transition-transform duration-200" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 transition-transform duration-200" />
                    )}
                  </span>
                </button>

                {/* Sub-items (Revealed on click) */}
                {isSectionOpen && (
                  <div className="px-2 pt-1 pb-2 space-y-0.5 border-t border-slate-800/80 bg-[#080d19]/60">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => {
                            if (window.innerWidth < 1024) onClose();
                          }}
                          className={`block px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-emerald-700 text-white font-bold shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500/30'
                              : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate">{item.name}</span>
                            {isActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs shrink-0" />
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
        <div className="p-3.5 border-t border-slate-800/90 bg-[#070b14] shrink-0">
          <div className="flex items-center gap-2.5 mb-2.5 px-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-700 to-green-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-md ring-1 ring-white/10">
              {currentUser.order || '1'}
            </div>
            <div className="truncate min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate leading-tight">{currentUser.full_name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-emerald-400 font-mono font-semibold">ID: {currentUser.username}</span>
                <span className="text-[9px] text-slate-500 truncate">
                  • {currentUser.role === 'admin' ? 'Directrice' : currentUser.role === 'chef_service' ? 'Chef Serv.' : currentUser.role === 'secretariat' ? 'Secrétaire' : 'Agent'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="w-full py-1.5 px-3 rounded-lg bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/40 text-rose-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-[0.99]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
};
