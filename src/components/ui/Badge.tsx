import React from 'react';
import { ActivityStatus, PriorityLevel, UserRole } from '@/types';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'default' | 'outline' | 'status' | 'priority' | 'role';
  status?: ActivityStatus;
  priority?: PriorityLevel;
  role?: UserRole;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  status,
  priority,
  role,
  className = '',
}) => {
  if (status) {
    const statusConfig: Record<ActivityStatus, { label: string; bg: string; text: string; dot: string }> = {
      termine: { label: 'Terminé / Conforme', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
      en_cours: { label: 'En cours', bg: 'bg-blue-50 text-blue-800 border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
      en_attente: { label: 'En attente', bg: 'bg-amber-50 text-amber-800 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
      en_retard: { label: 'En retard / Non conforme', bg: 'bg-rose-50 text-rose-800 border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' },
      a_faire: { label: 'À faire', bg: 'bg-slate-100 text-slate-800 border-slate-200', text: 'text-slate-700', dot: 'bg-slate-400' },
      annule: { label: 'Annulé', bg: 'bg-gray-100 text-gray-500 border-gray-200', text: 'text-gray-500', dot: 'bg-gray-400' },
    };

    const conf = statusConfig[status] || statusConfig.a_faire;

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${conf.bg} ${className}`}>
        {children || conf.label}
      </span>
    );
  }

  if (priority) {
    const priorityConfig: Record<PriorityLevel, { label: string; bg: string }> = {
      urgente: { label: 'Urgente', bg: 'bg-red-100 text-red-800 border-red-200 font-semibold' },
      haute: { label: 'Haute', bg: 'bg-orange-100 text-orange-800 border-orange-200' },
      moyenne: { label: 'Moyenne', bg: 'bg-sky-100 text-sky-800 border-sky-200' },
      basse: { label: 'Basse', bg: 'bg-slate-100 text-slate-700 border-slate-200' },
    };
    const pConf = priorityConfig[priority] || priorityConfig.moyenne;
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${pConf.bg} ${className}`}>
        {children || pConf.label}
      </span>
    );
  }

  if (role) {
    const roleConfig: Record<UserRole, { label: string; bg: string }> = {
      admin: { label: 'Administrateur', bg: 'bg-purple-100 text-purple-800 border-purple-200' },
      chef_service: { label: 'Chef de Service', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
      agent: { label: 'Agent / Collaborateur', bg: 'bg-blue-100 text-blue-800 border-blue-200' },
      secretariat: { label: 'Secrétariat / Réception', bg: 'bg-teal-100 text-teal-800 border-teal-200' },
      consultation: { label: 'Consultation', bg: 'bg-gray-100 text-gray-700 border-gray-200' },
    };
    const rConf = roleConfig[role] || roleConfig.agent;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${rConf.bg} ${className}`}>
        {children || rConf.label}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200 ${className}`}>
      {children}
    </span>
  );
};
