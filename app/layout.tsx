import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/instrument-sans';
import '@fontsource/ibm-plex-mono/400.css';
import { PWARegistrar } from '@/components/pwa/PWARegistrar';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'KRONOS — Time, made physical',
    template: '%s — KRONOS',
  },
  description: 'A cinematic productivity world where days, tasks, focus, and memory become living material.',
  applicationName: 'KRONOS',
  category: 'productivity',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [{ url: '/apple-touch-icon.png', type: 'image/png', sizes: '180x180' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'KRONOS',
  },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'KRONOS — Time, made physical',
    description: 'Time is not spent. Time is designed.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#020306',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to experience</a>
        {children}
        <PWARegistrar />
      </body>
    </html>
  );
}
