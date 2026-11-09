import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.activiaabmed.org'),
  title: {
    default: 'ACTIVIA — Système Intégré de Pilotage Réglementaire | ABMed Bénin',
    template: '%s | ACTIVIA — ABMed Bénin',
  },
  description: "Plateforme officielle de pilotage administratif, technique et réglementaire de l'Agence béninoise du Médicament et des autres produits de Santé (ABMed) — Direction des Licences, de la Vigilance et de la Surveillance du Marché (DLVS).",
  applicationName: 'ACTIVIA ABMed',
  authors: [{ name: 'SANINOVA GLOBAL CONSULTING', url: 'https://www.saninova.org' }],
  generator: 'Next.js',
  keywords: [
    'ABMed',
    'Bénin',
    'ACTIVIA',
    'DLVS',
    'Pharmacie',
    'Médicament',
    'Santé',
    'Licences',
    'Vigilance',
    'Surveillance du Marché',
    'CNAECP',
    'CNAIAPS',
  ],
  alternates: {
    canonical: 'https://www.activiaabmed.org',
  },
  openGraph: {
    title: 'ACTIVIA — ABMed Bénin (Direction DLVS)',
    description: "Système Intégré de Pilotage Réglementaire et Administratif de l'Agence béninoise du Médicament et des autres produits de Santé.",
    url: 'https://www.activiaabmed.org',
    siteName: 'ACTIVIA ABMed Bénin',
    images: [
      {
        url: '/logo-abmed.png',
        width: 800,
        height: 600,
        alt: 'Logo ABMed Bénin - ACTIVIA',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  icons: {
    icon: '/logo-abmed.png',
    shortcut: '/logo-abmed.png',
    apple: '/logo-abmed.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#15803d',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
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
