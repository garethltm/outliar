import './globals.css';
import type { Metadata, Viewport } from 'next';

function siteUrl() {
  try { return new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'); } catch { return new URL('http://localhost:3000'); }
}

const description = 'outLIAR is a social deduction party game. Everyone gets a secret word — except the liar, whose word is just a little off. Blend in, bluff, and spot the liar.';

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: { default: 'outLIAR — Blend in. Spot the liar.', template: '%s · outLIAR' },
  description,
  applicationName: 'outLIAR',
  authors: [{ name: '@garethltm' }],
  creator: '@garethltm',
  openGraph: { title: 'outLIAR — Blend in. Spot the liar.', description, siteName: 'outLIAR', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'outLIAR — Blend in. Spot the liar.', description },
  appleWebApp: { capable: true, title: 'outLIAR', statusBarStyle: 'black-translucent' },
};

export const viewport: Viewport = {
  themeColor: '#07070d',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
