import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import { Hanken_Grotesk, Gloock, DM_Mono, Instrument_Serif, Caveat } from 'next/font/google';
import './globals.css';
import './site.css';
import { CurtainOverlay } from '@/components/site/Curtain';

const sans = Hanken_Grotesk({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const serif = Gloock({ subsets: ['latin'], weight: '400', variable: '--font-serif', display: 'swap' });
const italic = Instrument_Serif({ subsets: ['latin'], weight: '400', style: 'italic', variable: '--font-italic', display: 'swap' });
const hand = Caveat({ subsets: ['latin'], weight: ['500', '600'], variable: '--font-hand', display: 'swap' });
const mono = DM_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Photobooth: vintage photo strips in your browser', template: '%s | Photobooth' },
  description: 'Retro photobooth in your browser. Four photos, six vintage looks. Private: your photos never leave your device.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  openGraph: { title: 'Photobooth', description: 'Four frames. One take. Vintage strips in your browser.', type: 'website' },
  icons: { icon: [{ url: '/favicon-32.png', sizes: '32x32', type: 'image/png' }, { url: '/icon-512.png', sizes: '512x512', type: 'image/png' }], apple: '/apple-touch-icon.png' },
};
export const viewport: Viewport = { themeColor: '#2A0810' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await headers(); // opts into dynamic rendering so the per-request CSP nonce is applied
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${mono.variable} ${italic.variable} ${hand.variable}`}>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        {children}
        <CurtainOverlay />
      </body>
    </html>
  );
}
