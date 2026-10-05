'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuditLogTable } from '@/components/audit/AuditLogTable';
import { History, ShieldCheck } from 'lucide-react';

export default function AuditPage() {
  return (
    <AppLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-blue-600" />
            Journal d’Audit & Traçabilité Réglementaire
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Historique infalsifiable des créations, modifications, changements de statut et affectations
          </p>
        </div>

        <AuditLogTable />
      </div>
    </AppLayout>
  );
}
