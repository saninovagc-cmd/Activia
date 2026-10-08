import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: LucideIcon;
  colorScheme?: 'blue' | 'emerald' | 'amber' | 'rose' | 'slate' | 'indigo';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  colorScheme = 'blue',
  onClick,
}) => {
  const schemeStyles = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-500' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-500' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-500' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-500' },
    slate: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-500' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-500' },
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
      <div className="pt-1">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">{title}</p>
        <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight font-mono">{value}</h3>
        {subtitle && (
          <p className={`text-[11px] mt-1.5 font-semibold ${style.text} truncate`}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
