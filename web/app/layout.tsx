import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Photobooth: vintage photo strips in your browser', template: '%s | Photobooth' },
  description: 'Retro photobooth in your browser. Four photos, six vintage looks. Private: your photos never leave your device.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  openGraph: { title: 'Photobooth', description: 'Four frames. One take. Vintage strips in your browser.', type: 'website' },
  icons: { icon: '/icon.svg' },
};
export const viewport: Viewport = { themeColor: '#17100d' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await headers(); // opts into dynamic rendering so the per-request CSP nonce is applied
  return (
    <html lang="en">
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <div className="curtain left" aria-hidden /><div className="curtain right" aria-hidden /><div className="valance" aria-hidden />
        {children}
      </body>
    </html>
  );
}
