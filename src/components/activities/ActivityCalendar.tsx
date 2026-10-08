'use client';

import React, { useState } from 'react';
import { Activity } from '@/types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface ActivityCalendarProps {
  activities: Activity[];
  onSelect: (activity: Activity) => void;
}

export const ActivityCalendar: React.FC<ActivityCalendarProps> = ({
  activities,
  onSelect,
}) => {
  // Current calendar view date: October 2026 (matching system timeline)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1)); // October 2026

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Adjust so Monday is 0
  const startOffset = (firstDayOfMonth + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const resetToCurrent = () => {
    setCurrentDate(new Date(2026, 9, 1));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {monthNames[month]} {year}
            </h3>
            <p className="text-xs text-slate-500">
              Vue planning des échéances et activités réglementaires
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetToCurrent}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Aujourd'hui
          </button>
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={prevMonth}
              className="p-1.5 hover:bg-slate-100 text-slate-600 border-r border-slate-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 hover:bg-slate-100 text-slate-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Calendar Grid Container */}
      <div className="overflow-x-auto w-full max-w-full pb-2">
        <div className="min-w-[560px] sm:min-w-0">
          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-t-xl overflow-hidden mt-4 text-center">
            {daysOfWeek.map((day) => (
              <div key={day} className="bg-slate-50 py-2 text-xs font-bold text-slate-600">
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-b-xl overflow-hidden text-xs">
        {/* Leading empty days */}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-slate-50/50 min-h-[105px] p-2 text-slate-300" />
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
          
          // Match activities where due date is this day OR date is within start and due
          const dayActivities = activities.filter((act) => act.due_date === dateString);
          const isToday = dateString === '2026-10-03';

          return (
            <div
              key={dayNum}
              className={`bg-white min-h-[105px] p-1.5 sm:p-2 transition-colors flex flex-col justify-between ${
                isToday ? 'bg-blue-50/30 ring-2 ring-blue-600 ring-inset' : 'hover:bg-slate-50/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    isToday ? 'bg-blue-600 text-white' : 'text-slate-700'
                  }`}
                >
                  {dayNum}
                </span>
                {dayActivities.length > 0 && (
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded-full">
                    {dayActivities.length}
                  </span>
                )}
              </div>

              {/* Badges for activities on this date */}
              <div className="mt-1 space-y-1 overflow-y-auto max-h-16">
                {dayActivities.map((act) => {
                  const isDelayed = act.status === 'en_retard' || (act.status !== 'termine' && new Date(act.due_date).getTime() < Date.now());
                  return (
                    <div
                      key={act.id}
                      onClick={() => onSelect(act)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold truncate cursor-pointer transition-all border ${
                        act.status === 'termine'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : isDelayed
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-blue-50 text-blue-800 border-blue-200'
                      }`}
                      title={`${act.code}: ${act.title}`}
                    >
                      {act.code}: {act.title}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
          </div>
        </div>
      </div>
    </div>
  );
};
