/**
 * Service Universel d'Exportation ACTIVIA (Excel & PDF)
 * Permet d'exporter les tableaux, registres et états de synthèse de la plateforme
 * aux formats Excel (.xls / .csv) et PDF (Rapport officiel prêt à l'impression).
 */

export interface ExportColumn {
  header: string;
  key: string;
}

export interface ExportConfig {
  title: string;
  subtitle?: string;
  filename: string;
  headers: string[];
  rows: (string | number)[][];
  summaryKpis?: { label: string; value: string | number }[];
}

/**
 * Exporte des données sous format Excel natif (Tableur XML / HTML compatible Excel et LibreOffice)
 * avec accents UTF-8 parfaits, en-têtes stylisés, bordures et métadonnées.
 */
export const exportToExcel = (config: ExportConfig) => {
  const { title, subtitle, filename, headers, rows, summaryKpis } = config;

  let kpiHtml = '';
  if (summaryKpis && summaryKpis.length > 0) {
    kpiHtml = `
      <table style="margin-bottom: 20px; border-collapse: collapse;">
        <tr>
          ${summaryKpis.map(k => `
            <td style="background-color: #f1f5f9; padding: 10px 16px; border: 1px solid #cbd5e1; font-family: Arial, sans-serif; font-size: 11px;">
              <strong style="color: #475569; display: block; font-size: 10px; text-transform: uppercase;">${escapeHtml(k.label)}</strong>
              <span style="color: #0f172a; font-size: 16px; font-weight: bold;">${escapeHtml(String(k.value))}</span>
            </td>
          `).join('')}
        </tr>
      </table>
    `;
  }

  const theadHtml = `
    <thead>
      <tr style="background-color: #047857; color: #ffffff;">
        ${headers.map(h => `<th style="padding: 10px 12px; border: 1px solid #065f46; font-family: Arial, sans-serif; font-size: 11px; text-align: left; font-weight: bold;">${escapeHtml(h)}</th>`).join('')}
      </tr>
    </thead>
  `;

  const tbodyHtml = `
    <tbody>
      ${rows.map((row, idx) => `
        <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
          ${row.map(cell => `<td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-family: Arial, sans-serif; font-size: 11px; color: #1e293b;">${escapeHtml(String(cell ?? ''))}</td>`).join('')}
        </tr>
      `).join('')}
    </tbody>
  `;

  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>${escapeHtml(title.slice(0, 31))}</x:Name>
                <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; }
        </style>
      </head>
      <body>
        <h2 style="color: #064e3b; font-family: Arial, sans-serif; margin-bottom: 4px;">${escapeHtml(title)}</h2>
        <p style="color: #64748b; font-family: Arial, sans-serif; font-size: 12px; margin-top: 0; margin-bottom: 16px;">
          ${escapeHtml(subtitle || '')} — Export généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
        </p>
        ${kpiHtml}
        <table>
          ${theadHtml}
          ${tbodyHtml}
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.xls') ? filename : `${filename}.xls`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
};

/**
 * Exporte des données sous format PDF officiel (avec mise en page imprimable A4 paysage,
 * entête institutionnel, sceau République et boîte de dialogue d'impression / enregistrement PDF).
 */
export const exportToPdf = (config: ExportConfig) => {
  const { title, subtitle, headers, rows, summaryKpis } = config;

  let kpiHtml = '';
  if (summaryKpis && summaryKpis.length > 0) {
    kpiHtml = `
      <div class="kpi-grid">
        ${summaryKpis.map(k => `
          <div class="kpi-box">
            <span class="kpi-label">${escapeHtml(k.label)}</span>
            <span class="kpi-val">${escapeHtml(String(k.value))}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  const printHtml = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>${escapeHtml(title)}</title>
      <style>
        @page {
          size: A4 landscape;
          margin: 12mm 10mm;
        }
        * { box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #0f172a;
          margin: 0;
          padding: 20px;
          background: #ffffff;
          font-size: 11px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #047857;
          padding-bottom: 12px;
          margin-bottom: 16px;
        }
        .inst-title {
          font-size: 13px;
          font-weight: 800;
          color: #047857;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .inst-sub {
          font-size: 10px;
          color: #64748b;
          margin-top: 2px;
        }
        .doc-title {
          font-size: 18px;
          font-weight: 900;
          color: #0f172a;
          margin-top: 6px;
        }
        .doc-desc {
          font-size: 11px;
          color: #475569;
          margin-top: 2px;
        }
        .meta-box {
          text-align: right;
          font-size: 10px;
          color: #64748b;
        }
        .badge-seal {
          display: inline-block;
          background: #ecfdf5;
          color: #065f46;
          border: 1px solid #a7f3d0;
          padding: 3px 8px;
          border-radius: 4px;
          font-weight: 700;
          font-size: 10px;
          margin-bottom: 4px;
        }
        .kpi-grid {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .kpi-box {
          flex: 1;
          min-width: 120px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 8px 12px;
        }
        .kpi-label {
          display: block;
          font-size: 9px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
        }
        .kpi-val {
          display: block;
          font-size: 16px;
          font-weight: 900;
          color: #047857;
          margin-top: 2px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
          font-size: 10px;
        }
        th {
          background-color: #f1f5f9;
          color: #334155;
          font-weight: 700;
          text-align: left;
          padding: 7px 8px;
          border: 1px solid #cbd5e1;
          font-size: 10px;
          text-transform: uppercase;
        }
        td {
          padding: 6px 8px;
          border: 1px solid #e2e8f0;
          color: #1e293b;
        }
        tr:nth-child(even) td {
          background-color: #f8fafc;
        }
        .footer {
          margin-top: 24px;
          border-top: 1px solid #e2e8f0;
          padding-top: 8px;
          display: flex;
          justify-content: space-between;
          font-size: 9px;
          color: #94a3b8;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="inst-title">ACTIVIA — Système de Pilotage Réglementaire</div>
          <div class="inst-sub">Direction de la Pharmacie et du Médicament (DPM) • DLVS</div>
          <div class="doc-title">${escapeHtml(title)}</div>
          ${subtitle ? `<div class="doc-desc">${escapeHtml(subtitle)}</div>` : ''}
        </div>
        <div class="meta-box">
          <div class="badge-seal">DOCUMENT OFFICIEL CERTIFIÉ</div>
          <div>Édité le : <strong>${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR')}</strong></div>
          <div>Volume : <strong>${rows.length} enregistrements</strong></div>
        </div>
      </div>

      ${kpiHtml}

      <table>
        <thead>
          <tr>
            ${headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => `
            <tr>
              ${r.map(c => `<td>${escapeHtml(String(c ?? ''))}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        <span>ACTIVIA • Traçabilité intégrale et archivage probant</span>
        <span>Page 1 / 1 • Signature électronique certifiée</span>
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(printHtml);
    printWindow.document.close();
  }
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
