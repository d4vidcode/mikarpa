import type { Metadata, Viewport } from 'next';
import React from 'react';
import { Familjen_Grotesk, IBM_Plex_Mono } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

const display = Familjen_Grotesk({
  subsets: ['latin'],
  variable: '--font-grotesk',
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
});

const SpeedInsightsSafe = SpeedInsights as unknown as React.ComponentType<Record<string, never>>;

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  applicationName: 'mikarpa',
  title: {
    default: 'mikarpa — tu tienda virtual, lista en minutos',
    template: '%s · mikarpa',
  },
  description:
    'Crea tu tienda virtual, personaliza tu catálogo y recibe pedidos por WhatsApp o con pagos online. Hecho para Perú.',
  keywords: ['tienda virtual', 'ecommerce', 'Perú', 'WhatsApp', 'catálogo'],
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es-PE"
      data-type="software"
      data-radius="soft"
      data-ground="sand"
      data-buttons="arrow"
      data-motion
      className={`${display.variable} ${mono.variable}`}
    >
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-[var(--r-btn)] focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
        >
          Saltar al contenido
        </a>
        {children}
        {process.env.VERCEL === '1' ? <SpeedInsightsSafe /> : null}
      </body>
    </html>
  );
}
