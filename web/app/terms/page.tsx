import type { Metadata } from 'next';
import { SiteNav, SiteFooter } from '@/components/site/Chrome';
export const metadata: Metadata = { title: 'Terms of Service' };
export default function Terms() {
  return (<div className="site page">
    <SiteNav />
    <main id="main" className="wrap narrow prose">
      <h1 className="h2">Terms of Service</h1>
      <p className="muted">Last updated: November 17, 2026. Template: have it reviewed before launch.</p>
      <h2>Use of the service</h2><p>Photobooth is provided as is, for personal use. Do not misuse the service or attempt to disrupt it.</p>
      <h2>Your content</h2><p>You own the photos you create. Because they stay on your device, we have no access to them.</p>
      <h2>Accounts</h2><p>You are responsible for keeping your login details safe. We may suspend accounts that abuse the service.</p>
      <h2>Contact</h2><p>[your contact email]</p>
    </main><SiteFooter /></div>);
}
