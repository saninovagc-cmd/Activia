'use client';

import React, { Suspense } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { DocumentBrowser } from '@/components/documents/DocumentBrowser';
import { FileText } from 'lucide-react';

function DocumentsPageContent() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Gestion Électronique des Documents (GED)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Espace centralisé de stockage, indexation et prévisualisation des pièces officielles (Supabase Storage)
          </p>
        </div>

        <DocumentBrowser />
      </div>
    </AppLayout>
  );
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-slate-500">Chargement de la GED...</div>}>
      <DocumentsPageContent />
    </Suspense>
  );
}
