import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';

export const metadata: Metadata = {
  title: 'ACTIVIA — Plateforme de Gestion des Activités, Dossiers et Courriers',
  description: 'Plateforme moderne, centralisée et sécurisée pour le pilotage et le suivi réglementaire du service.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased min-h-screen">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
