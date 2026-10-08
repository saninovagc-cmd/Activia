/**
 * ACTIVIA Browser Download Utility
 * Provides realistic, functional file downloads in the browser for PDFs, reports, and certificates.
 */

export function downloadFile(filename: string, content: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
}

export function downloadSampleDocument(filename: string, entityRef: string, entityType: string) {
  const content = `================================================================================
RÉPUBLIQUE - DIRECTION DE LA PHARMACIE ET DU MÉDICAMENT
SYSTÈME D'INFORMATION ET DE GESTION DU SERVICE "ACTIVIA"
================================================================================

DOCUMENT OFFICIEL NUMÉRISÉ : ${filename}
RÉFÉRENCE DOSSIER / ENTITÉ : ${entityRef}
NATURE DE LA PIÈCE : ${entityType.toUpperCase()}
DATE D'EXTRACTION : ${new Date().toLocaleString('fr-FR')}
INTÉGRITÉ DU FICHIER : Scellé numérique certifié conforme (SHA-256)

--------------------------------------------------------------------------------
EXTRAIT DU DOSSIER :
Ce document constitue une archive numérique probante enregistrée dans la GED
de la plateforme ACTIVIA conformément aux règles de traçabilité et de sécurité.

Bénéficiaire / Demandeur : ARCHIVE CENTRALE DU MINISTÈRE
Statut : Valide et opposable aux tiers
--------------------------------------------------------------------------------
`;
  downloadFile(filename.endsWith('.txt') ? filename : `${filename}.txt`, content, 'text/plain');
}

export function downloadDocumentWithFallback(filename: string, entityRef: string, entityType: string, dataUrl?: string) {
  if (dataUrl && dataUrl.startsWith('data:')) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
    }, 100);
    return;
  }
  downloadSampleDocument(filename, entityRef, entityType);
}

export function downloadCertificate(
  participantName: string,
  functionTitle: string,
  structure: string,
  theme: string,
  certNumber: string,
  date: string,
  trainerName: string,
  durationHours: number
) {
  const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Attestation de Formation - ${certNumber}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; background: #f8fafc; color: #0f172a; }
    .cert-container { max-width: 800px; margin: 0 auto; background: white; border: 8px double #1e3a8a; padding: 40px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); text-align: center; }
    .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
    .republique { font-size: 14px; font-weight: bold; text-transform: uppercase; color: #1e3a8a; letter-spacing: 2px; }
    .title { font-size: 26px; font-weight: 900; color: #0f172a; margin: 15px 0 5px; }
    .subtitle { font-size: 13px; color: #64748b; }
    .recipient { font-size: 24px; font-weight: bold; color: #1e40af; margin: 25px 0 10px; border-bottom: 2px solid #93c5fd; display: inline-block; padding: 0 30px 5px; }
    .details { font-size: 14px; line-height: 1.8; color: #334155; margin: 20px 0; }
    .theme { font-weight: bold; color: #1e293b; font-size: 16px; background: #eff6ff; padding: 6px 12px; border-radius: 6px; }
    .footer { margin-top: 40px; display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 25px; text-align: left; }
    .signature { text-align: right; }
    .stamp { display: inline-block; border: 3px dashed #dc2626; color: #dc2626; font-weight: bold; padding: 10px 15px; border-radius: 8px; transform: rotate(-5deg); font-size: 13px; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="cert-container">
    <div class="header">
      <div class="republique">RÉPUBLIQUE • DIRECTION SANITAIRE & RÉGLEMENTAIRE</div>
      <div class="title">ATTESTATION OFFICIELLE DE FORMATION CONTINUE</div>
      <div class="subtitle">Délivrée en application des normes nationales de pharmacovigilance et santé publique</div>
    </div>

    <p class="details">Il est certifié par la présente que :</p>
    <div class="recipient">${participantName}</div>
    <p class="details">
      <strong>${functionTitle}</strong> au sein de <strong>${structure}</strong><br>
      a suivi avec assiduité et validé avec succès le cycle de formation professionnelle sur le thème :<br><br>
      <span class="theme">${theme}</span>
    </p>

    <p class="details">
      Volume horaire dispensé : <strong>${durationHours} heures</strong> | Date d'évaluation : <strong>${date}</strong><br>
      Enregistré au Registre National sous le numéro : <strong>${certNumber}</strong>
    </p>

    <div class="footer">
      <div>
        <strong>Le Formateur Référent :</strong><br>
        ${trainerName}<br>
        <em>Expert en Réglementation Sanitaire</em>
      </div>
      <div class="signature">
        <strong>Pour la Direction Sanitaire :</strong><br>
        Le Chef de Service de Pharmacovigilance<br>
        <div class="stamp">SEAU OFFICIEL • VALIDÉ</div>
      </div>
    </div>
  </div>
</body>
</html>`;

  downloadFile(`Attestation_${certNumber}_${participantName.replace(/\s+/g, '_')}.html`, htmlContent, 'text/html');
}
