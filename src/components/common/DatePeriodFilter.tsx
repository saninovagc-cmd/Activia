'use client';

import React from 'react';
import { Calendar, Filter, X, ChevronDown } from 'lucide-react';

export interface DatePeriodFilterProps {
  selectedYear: string;
  onYearChange: (year: string) => void;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onReset?: () => void;
  years?: string[];
  className?: string;
}

const MONTHS = [
  { value: 'all', label: 'Tous les mois' },
  { value: '01', label: 'Janvier' },
  { value: '02', label: 'Février' },
  { value: '03', label: 'Mars' },
  { value: '04', label: 'Avril' },
  { value: '05', label: 'Mai' },
  { value: '06', label: 'Juin' },
  { value: '07', label: 'Juillet' },
  { value: '08', label: 'Août' },
  { value: '09', label: 'Septembre' },
  { value: '10', label: 'Octobre' },
  { value: '11', label: 'Novembre' },
  { value: '12', label: 'Décembre' },
];

export const DatePeriodFilter: React.FC<DatePeriodFilterProps> = ({
  selectedYear,
  onYearChange,
  selectedMonth,
  onMonthChange,
  selectedDate,
  onDateChange,
  onReset,
  years = ['2026', '2025', '2024', '2023', '2022', '2021', '2020'],
  className = '',
}) => {
  const isFiltered = selectedYear !== 'all' || selectedMonth !== 'all' || Boolean(selectedDate);

  const handleReset = () => {
    onYearChange('all');
    onMonthChange('all');
    onDateChange('');
    if (onReset) onReset();
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 text-xs ${className}`}>
      {/* Label indicateur */}
      <div className="flex items-center gap-1.5 text-slate-600 font-semibold shrink-0">
        <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        <span className="hidden sm:inline">Filtres temporels :</span>
      </div>

      {/* Sélecteur Année */}
      <div className="relative">
        <select
          value={selectedYear}
          onChange={(e) => onYearChange(e.target.value)}
          className={`appearance-none text-xs font-semibold rounded-lg px-2.5 py-1.5 pr-7 border transition-colors cursor-pointer ${
            selectedYear !== 'all'
              ? 'bg-blue-50 text-blue-800 border-blue-300 ring-1 ring-blue-400'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
          title="Filtrer par Année"
        >
          <option value="all">Toutes années</option>
          {years.map((y) => (
            <option key={y} value={y}>
              Année {y}
            </option>
          ))}
        </select>
        <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* Sélecteur Mois */}
      <div className="relative">
        <select
          value={selectedMonth}
          onChange={(e) => onMonthChange(e.target.value)}
          className={`appearance-none text-xs font-semibold rounded-lg px-2.5 py-1.5 pr-7 border transition-colors cursor-pointer ${
            selectedMonth !== 'all'
              ? 'bg-blue-50 text-blue-800 border-blue-300 ring-1 ring-blue-400'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
          title="Filtrer par Mois"
        >
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* Sélecteur Jour spécifique */}
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
        <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">Jour :</span>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="text-xs bg-transparent border-0 p-0 text-slate-800 focus:outline-none cursor-pointer"
          title="Sélectionner une date précise"
        />
        {selectedDate && (
          <button
            type="button"
            onClick={() => onDateChange('')}
            className="p-0.5 text-slate-400 hover:text-slate-600 rounded transition-colors"
            title="Effacer la date précise"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Bouton reset si au moins un filtre temporel est actif */}
      {isFiltered && (
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer"
          title="Réinitialiser les filtres de période"
        >
          <X className="w-3 h-3 text-slate-500" />
          <span>Effacer filtres</span>
        </button>
      )}
    </div>
  );
};
