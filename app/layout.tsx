import type { Metadata, Viewport } from 'next';
import React from 'react';
import { Fraunces, Inter } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
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
  themeColor: '#111827',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-PE" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
        >
          Saltar al contenido
        </a>
        {children}
        <SpeedInsightsSafe />
      </body>
    </html>
  );
}
