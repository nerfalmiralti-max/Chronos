import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'KRONOS — Time, made physical',
    short_name: 'KRONOS',
    description: 'Plan your day, protect your focus, and see where your time goes.',
    start_url: '/today',
    display: 'standalone',
    background_color: '#020306',
    theme_color: '#020306',
    orientation: 'any',
    categories: ['productivity', 'lifestyle'],
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
