import type { MetadataRoute } from 'next';

// Lets players "Add to Home Screen" so the game opens full-screen, without browser bars.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'outLIAR',
    short_name: 'outLIAR',
    description: 'The social deduction party game. Blend in. Spot the liar.',
    start_url: '/',
    display: 'standalone',
    background_color: '#07070d',
    theme_color: '#07070d',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  };
}
