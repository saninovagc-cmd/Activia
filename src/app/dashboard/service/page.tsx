'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { ChefServiceView } from '@/components/dashboard/ChefServiceView';
import { 
  LayoutDashboard,
  ShieldCheck,
  Download
} from 'lucide-react';

export default function ChefServiceDashboardPage() {
  const router = useRouter();

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Title & View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Tableau de Bord Chef de Service
              </h1>
              <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                Supervision
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Pilotage par département, charge des agents, indicateurs de performance et délais
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-200/80 p-1 rounded-xl flex items-center gap-1 text-xs">
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all text-slate-600 hover:text-slate-900"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Vue Générale
              </Link>
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all bg-emerald-700 text-white shadow-xs cursor-default"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Vue Chef de Service
              </button>
            </div>

            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              title="Exporter ou imprimer le tableau de bord"
            >
              <Download className="w-3.5 h-3.5" />
              Exporter
            </button>
          </div>
        </div>

        {/* Supervision Chef de Service */}
        <ChefServiceView />
      </div>
    </AppLayout>
  );
}
