'use client';

import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { ExportModal } from './ExportModal';
import { ExportConfig } from '@/lib/exportUtils';

interface ExportButtonProps {
  getConfig: () => ExportConfig;
  className?: string;
  label?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  getConfig,
  className = "px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer",
  label = "Exporter",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<ExportConfig | null>(null);

  const handleClick = () => {
    setCurrentConfig(getConfig());
    setIsOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={className}
        title="Exporter les données au format Excel ou PDF"
      >
        <Download className="w-3.5 h-3.5" />
        <span>{label}</span>
      </button>

      {currentConfig && (
        <ExportModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          config={currentConfig}
        />
      )}
    </>
  );
};
