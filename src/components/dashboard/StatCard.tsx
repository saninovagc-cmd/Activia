import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  colorScheme?: 'blue' | 'emerald' | 'amber' | 'rose' | 'slate' | 'indigo';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme = 'blue',
  onClick,
}) => {
  const schemeStyles = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-500', iconBg: 'bg-blue-600 text-white' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-500', iconBg: 'bg-emerald-600 text-white' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-500', iconBg: 'bg-amber-500 text-white' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-500', iconBg: 'bg-rose-600 text-white' },
    slate: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-500', iconBg: 'bg-slate-700 text-white' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-500', iconBg: 'bg-indigo-600 text-white' },
  };

  const style = schemeStyles[colorScheme];

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-4 border border-slate-200/90 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden ${
        onClick ? 'cursor-pointer hover:border-slate-300' : ''
      }`}
    >
      <div className={`absolute top-0 left-0 right-0 h-1 ${style.border}`} />
      <div className="flex items-start justify-between gap-2 pt-1">
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">{title}</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight font-mono">{value}</h3>
          {subtitle && (
            <p className={`text-[11px] mt-1.5 font-semibold ${style.text} truncate`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-2 rounded-xl ${style.iconBg} shadow-xs shrink-0 ring-1 ring-black/5`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
