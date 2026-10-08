'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Layers, 
  CheckSquare, 
  Calendar, 
  Mail, 
  FolderArchive, 
  Building2, 
  AlertTriangle, 
  FileText, 
  GraduationCap, 
  History, 
  Settings, 
  ShieldCheck,
  Activity as ActivityIcon,
  ChevronRight,
  Database,
  BarChart3,
  FileSpreadsheet,
  LogOut
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | null;
  phase?: string;
}

interface NavSection {
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
  const { 
    currentUser,
    logout,
    activities, 
    tasks, 
    incomingMails, 
    folders, 
    documents,
    establishments,
    signals,
    trainings,
    alerts 
  } = useApp();

  const inProgressActivities = activities.filter(a => a.status === 'en_cours').length;
  const delayedActivities = activities.filter(a => a.status === 'en_retard').length;
  const pendingTasks = tasks.filter(t => t.status === 'en_cours' || t.status === 'a_faire').length;
  const pendingMails = incomingMails.filter(m => m.status !== 'cloture').length;
  const inProgressFolders = folders.filter(f => f.status !== 'cloture' && f.status !== 'rejete').length;
  const activeAlertsCount = alerts.filter(a => a.status === 'active').length;

  const navSections: NavSection[] = [
    {
      title: 'PILOTAGE',
      items: [
        {
          name: 'Tableau de Bord',
          href: '/dashboard',
          icon: LayoutDashboard,
          badge: null
        },
        {
          name: 'Dashboard Chef de Service',
          href: '/dashboard?view=service',
          icon: ShieldCheck,
          badge: 'Supervision'
        },
        {
          name: 'Rapports & Statistiques',
          href: '/reporting',
          icon: BarChart3,
          badge: 'Analyses'
        }
      ]
    },
    {
      title: 'SOCLE OPÉRATIONNEL',
      items: [
        {
          name: 'Activités du Service',
          href: '/activities',
          icon: ActivityIcon,
          badge: delayedActivities > 0 ? `${delayedActivities} retard` : `${inProgressActivities}`
        },
        {
          name: 'Tâches & Délais',
          href: '/tasks',
          icon: CheckSquare,
          badge: pendingTasks > 0 ? `${pendingTasks}` : null
        },
        {
          name: 'Calendrier Global',
          href: '/calendar',
          icon: Calendar,
          badge: null
        }
      ]
    },
    {
      title: 'GESTION ADMINISTRATIVE',
      items: [
        {
          name: 'Courriers Entrants / Sortants',
          href: '/mail',
          icon: Mail,
          badge: `${pendingMails} en cours`
        },
        {
          name: 'Dossiers & Demandes',
          href: '/folders',
          icon: FolderArchive,
          badge: `${inProgressFolders} dossiers`
        },
        {
          name: 'Documents & GED',
          href: '/documents',
          icon: FileText,
          badge: `${documents.length} docs`
        }
      ]
    },
    {
      title: 'MÉTIERS & VIGILANCES',
      items: [
        {
          name: 'Établissements Pharmaceutiques',
          href: '/establishments',
          icon: Building2,
          badge: `${establishments.length} étab.`
        },
        {
          name: 'Signalements & Alertes',
          href: '/signals',
          icon: AlertTriangle,
          badge: activeAlertsCount > 0 ? `${activeAlertsCount} alertes` : `${signals.length} sig.`
        },
        {
          name: 'Formations Points Focaux',
          href: '/trainings',
          icon: GraduationCap,
          badge: `${trainings.length} formés`
        }
      ]
    },
    {
      title: 'DONNÉES & INTÉGRATION',
      items: [
        {
          name: 'Migration Fichiers Excel (18)',
          href: '/import',
          icon: FileSpreadsheet,
          badge: '18 registres'
        },
        {
          name: 'Journal d’Audit',
          href: '/audit',
          icon: History,
          badge: 'Traçabilité'
        },
        {
          name: 'Référentiels & Paramètres',
          href: '/settings',
          icon: Settings,
          badge: null
        }
      ]
    }
  ];

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
        <div className="h-16 flex items-center justify-between px-6 bg-slate-950 border-b border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-lg tracking-wider shadow-md">
              A
            </div>
            <div>
              <span className="text-lg font-black tracking-wide text-white">ACTIVIA</span>
              <span className="block text-[10px] uppercase font-semibold tracking-wider text-blue-400">
                Direction Sanitaire
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

        {/* Scrollable nav menu */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1.5">
              <p className="px-3 text-[11px] font-bold text-slate-400 tracking-wider">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => {
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold shadow-xs'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                            item.badge.includes('retard')
                              ? 'bg-rose-500 text-white'
                              : isActive
                              ? 'bg-blue-700 text-blue-100'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {item.phase && (
                        <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-slate-800/90 text-slate-400 border border-slate-700">
                          {item.phase}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Active user session card & Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
              {currentUser.order || '1'}
            </div>
            <div className="truncate min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{currentUser.full_name}</p>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-blue-400 font-mono">ID: {currentUser.username}</span>
                <span className="text-[9px] text-slate-500">• {currentUser.role === 'admin' ? 'Directrice' : currentUser.role === 'chef_service' ? 'Chef Serv.' : currentUser.role === 'secretariat' ? 'Secrétaire' : 'Agent'}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="w-full py-1.5 px-3 rounded-lg bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/40 text-rose-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Déconnexion</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 border-t border-slate-800 bg-slate-950 text-[10px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>ACTIVIA DLVS</span>
          </div>
          <span>PostgreSQL</span>
        </div>
      </aside>
    </>
  );
};
