'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { LogOut, ChevronDown, ChevronRight, FolderCheck, ShieldAlert, BookOpen } from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
}

interface MetierSubService {
  key: string;
  name: string;
  items: NavItem[];
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

export const SidebarContent: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentUser, logout } = useApp();

  // Définition hiérarchique des Services et de leurs Métiers pour le Module 04
  const metierServices: MetierSubService[] = [
    {
      key: 'SL',
      name: 'Service des Licences (SL)',
      items: [
        { name: 'Établissements Pharmaceutiques', href: '/establishments' },
        { name: 'Cartes Visiteurs Médicaux', href: '/folders?type=Carte+Visiteur+M%C3%A9dical' },
        { name: "Notifications d'Absence", href: "/folders?type=Notification+d'absence" },
        { name: 'Agréments CNAECP', href: '/folders?type=Agr%C3%A9ment+CNAECP' },
        { name: 'Autorisations CNAIAPS-EM', href: '/folders?type=Autorisation+Installation+CNAIAPS-EM' },
        { name: "Quitus d'Ouverture d'Officine", href: '/folders?type=Quitus+d%E2%80%99Ouverture' },
      ],
    },
    {
      key: 'SSMUR',
      name: 'Surveillance du Marché (SSMUR)',
      items: [
        { name: "Autorisations d'Achat", href: "/folders?type=Autorisation+d'achat" },
        { name: 'Autorisations de Transit & AOI', href: '/folders?type=Autorisation+de+transit' },
        { name: 'Publicité & Promotion AMM', href: '/folders?type=Publicit%C3%A9' },
        { name: 'Destruction de Produits', href: '/folders?type=Destruction' },
        { name: 'Signalements & Falsifications', href: '/signals?domain=signalement' },
      ],
    },
    {
      key: 'SVPS',
      name: 'Vigilance des Produits (SVPS)',
      items: [
        { name: 'Revue PSUR / PBRER / DSUR', href: '/folders?type=PSUR+%2F+PBRER+%2F+DSUR' },
        { name: 'Essais Cliniques & EIG', href: '/folders?type=Essais+Cliniques+%26+EIG' },
        { name: 'Notifications EI & MAPI', href: '/signals?domain=notification' },
        { name: 'Formations Points Focaux', href: '/trainings' },
      ],
    },
  ];

  const navSections: NavSection[] = [
    {
      id: 'pilotage',
      number: '01',
      title: 'PILOTAGE',
      items: [
        { name: 'Tableau de Bord Général', href: '/dashboard' },
        { name: 'Dashboard Chef de Service', href: '/dashboard/service' },
        { name: 'Rapports & Statistiques', href: '/reporting' },
      ],
    },
    {
      id: 'operationnel',
      number: '02',
      title: 'ACTIVITÉS DE LA DIRECTION',
      items: [
        { name: 'Activités de la Direction', href: '/activities' },
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
        { name: 'Documents & Numérisation GED', href: '/documents' },
      ],
    },
    {
      id: 'metiers',
      number: '04',
      title: 'MÉTIERS',
      items: [
        { name: 'Tous les Dossiers DLVS (Vue Globale)', href: '/folders' },
        ...metierServices.flatMap(s => s.items)
      ],
    },
    {
      id: 'donnees',
      number: '05',
      title: 'PARAMÈTRE & CONFIGURATION',
      items: [
        { name: 'Journal d’Audit & Sécurité', href: '/audit' },
        { name: 'Référentiels & Paramètres', href: '/settings' },
      ],
    },
  ];

  // Helper pour vérifier si un élément de navigation est actif
  const isItemActive = (href: string): boolean => {
    if (href.includes('?')) {
      const [targetPath, queryStr] = href.split('?');
      if (pathname !== targetPath) return false;
      const targetParams = new URLSearchParams(queryStr);
      let match = true;
      targetParams.forEach((val, key) => {
        if (searchParams.get(key) !== val) {
          match = false;
        }
      });
      return match;
    }
    // Si la route courante a des query params métiers, ne pas surligner le lien générique
    if (href === '/folders' && searchParams.get('type')) return false;
    if (href === '/signals' && searchParams.get('domain')) return false;
    return pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'));
  };

  // Detect which section matches the active path
  const getActiveSectionId = (path: string): string => {
    if (path.startsWith('/dashboard') || path.startsWith('/reporting')) return 'pilotage';
    if (path.startsWith('/activities') || path.startsWith('/tasks') || path.startsWith('/calendar')) return 'operationnel';
    if (path.startsWith('/mail') || path.startsWith('/documents')) return 'administratif';
    if (path.startsWith('/folders') || path.startsWith('/establishments') || path.startsWith('/signals') || path.startsWith('/trainings')) return 'metiers';
    if (path.startsWith('/audit') || path.startsWith('/settings')) return 'donnees';
    return 'metiers';
  };

  // Dépliement des modules au clic uniquement (tous les modules sont fermés par défaut)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    pilotage: false,
    operationnel: false,
    administratif: false,
    metiers: false,
    donnees: false,
  });

  // Dépliement des sous-modules métiers par service (tous fermés par défaut)
  const [openServices, setOpenServices] = useState<Record<string, boolean>>({
    SL: false,
    SSMUR: false,
    SVPS: false,
  });

  // Bascule du dépliement au clic : clique sur un module = affiche ses sous-modules et replie les autres
  const toggleSection = (id: string) => {
    setOpenSections(prev => {
      const willBeOpen = !prev[id];
      if (willBeOpen) {
        return {
          pilotage: id === 'pilotage',
          operationnel: id === 'operationnel',
          administratif: id === 'administratif',
          metiers: id === 'metiers',
          donnees: id === 'donnees',
        };
      }
      return {
        ...prev,
        [id]: false,
      };
    });
  };

  // Bascule du dépliement d'un Service du Module 04 au clic
  const toggleService = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenServices(prev => {
      const willBeOpen = !prev[key];
      if (willBeOpen) {
        return {
          SL: key === 'SL',
          SSMUR: key === 'SSMUR',
          SVPS: key === 'SVPS',
        };
      }
      return {
        ...prev,
        [key]: false,
      };
    });
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

        {/* Brand header with White background, Blue ACTIVIA and Pilotage Centralisé */}
        <div className="h-20 flex items-center justify-between px-4 bg-white border-b border-slate-200 shrink-0 shadow-xs">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex items-center justify-center shrink-0">
              <Image
                src="/logo-abmed.png"
                alt="Logo ABMed"
                width={76}
                height={34}
                className="h-9 w-auto object-contain"
                priority
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-blue-600">ACTIVIA</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-300">
                  ABMed
                </span>
              </div>
              <span className="block text-[8.5px] uppercase font-bold tracking-wider text-slate-600 leading-tight">
                PILOTAGE ADMINISTRATIF CENTRALISÉ
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Navigation Sections — Accordion Titles first, revealing Sub-titles on click */}
        <div className="flex-1 overflow-y-auto px-3 py-3.5 space-y-1.5">
          {navSections.map((section) => {
            const isSectionOpen = !!openSections[section.id];
            const hasActiveItem = section.items.some(item => isItemActive(item.href));

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
                  <div className="px-2 pt-1 pb-2 space-y-1 border-t border-slate-800/80 bg-[#080d19]/60">
                    {section.id === 'metiers' ? (
                      // Rendu spécifique Module 04 MÉTIERS : Accordéons interactifs par Service (SL, SSMUR, SVPS)
                      <div className="space-y-1.5">
                        {/* 1. Vue Globale de tous les dossiers réglementaires DLVS */}
                        <Link
                          href="/folders"
                          onClick={() => {
                            if (window.innerWidth < 1024) onClose();
                          }}
                          className={`block px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                            pathname === '/folders' && !searchParams.get('type')
                              ? 'bg-emerald-700 text-white font-bold border-emerald-600 shadow-sm'
                              : 'bg-slate-900/40 text-slate-300 hover:text-white hover:bg-slate-800/60 border-slate-800/80'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 truncate">
                              <span className="text-[11px]">📁</span>
                              <span className="truncate">Tous les Dossiers DLVS (Vue Globale)</span>
                            </span>
                            {pathname === '/folders' && !searchParams.get('type') && (
                              <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs shrink-0" />
                            )}
                          </div>
                        </Link>

                        {/* 2. Accordéons interactifs par Service (SL, SSMUR, SVPS) */}
                        {metierServices.map((service) => {
                          const isServiceOpen = !!openServices[service.key];
                          const hasActiveServiceItem = service.items.some(it => isItemActive(it.href));

                          return (
                            <div key={service.key} className="rounded-lg bg-slate-900/50 border border-slate-800/60 overflow-hidden">
                              {/* En-tête du service clickable */}
                              <button
                                type="button"
                                onClick={(e) => toggleService(service.key, e)}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-bold transition-colors cursor-pointer select-none ${
                                  hasActiveServiceItem
                                    ? 'text-emerald-300 bg-emerald-950/30'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                                }`}
                              >
                                <span className="flex items-center gap-1.5 truncate">
                                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${hasActiveServiceItem ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                                  <span className="truncate">{service.name}</span>
                                </span>
                                <span className="text-slate-500 shrink-0 ml-1.5">
                                  {isServiceOpen ? (
                                    <ChevronDown className="w-3 h-3 text-slate-400" />
                                  ) : (
                                    <ChevronRight className="w-3 h-3 text-slate-500" />
                                  )}
                                </span>
                              </button>

                              {/* Liste des sous-modules métier du service */}
                              {isServiceOpen && (
                                <div className="px-1.5 pb-1.5 pt-0.5 space-y-0.5 border-t border-slate-800/40">
                                  {service.items.map((item) => {
                                    const active = isItemActive(item.href);
                                    return (
                                      <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => {
                                          if (window.innerWidth < 1024) onClose();
                                        }}
                                        className={`block px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                                          active
                                            ? 'bg-emerald-700 text-white font-bold shadow-xs shadow-emerald-950/40 ring-1 ring-emerald-500/30'
                                            : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                                        }`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="truncate">{item.name}</span>
                                          {active && (
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
                    ) : (
                      // Rendu standard pour les autres modules (01, 02, 03, 05)
                      section.items.map((item) => {
                        const active = isItemActive(item.href);

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => {
                              if (window.innerWidth < 1024) onClose();
                            }}
                            className={`block px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                              active
                                ? 'bg-emerald-700 text-white font-bold shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500/30'
                                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="truncate">{item.name}</span>
                              {active && (
                                <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs shrink-0" />
                              )}
                            </div>
                          </Link>
                        );
                      })
                    )}
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
              {currentUser.username?.toLowerCase() === 'saninovagc' ? 'SA' : (currentUser.order || '1')}
            </div>
            <div className="truncate min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate leading-tight">{currentUser.full_name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-emerald-400 font-mono font-semibold">ID: {currentUser.username}</span>
                <span className="text-[9px] text-slate-500 truncate">
                  • {currentUser.username?.toLowerCase() === 'saninovagc' ? 'Super Admin' : (currentUser.role === 'admin' ? 'Directrice' : currentUser.role === 'chef_service' ? 'Chef Serv.' : currentUser.role === 'secretariat' ? 'Secrétaire' : 'Agent')}
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

export const Sidebar: React.FC<SidebarProps> = (props) => {
  return (
    <React.Suspense fallback={<div className="hidden lg:block w-72 shrink-0 bg-[#090d1a]" />}>
      <SidebarContent {...props} />
    </React.Suspense>
  );
};
