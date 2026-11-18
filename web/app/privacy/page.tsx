import type { Metadata } from 'next';
import { Footer, Marquee } from '@/components/Sign';
export const metadata: Metadata = { title: 'Privacy Policy' };
export default function Privacy() {
  return (<>
    <header className="sign"><Marquee /></header>
    <main id="main" className="wrap narrow prose">
      <h1 className="h2">Privacy Policy</h1>
      <p className="muted">Last updated: November 17, 2026. Template: have it reviewed for your jurisdiction before launch.</p>
      <h2>Your photos</h2><p>Photos are captured, filtered and assembled entirely in your browser. They are never uploaded to our servers or shared with third parties, including advertisers. Ads and third-party scripts are never loaded on the camera (Studio) or sign-in pages.</p>
      <h2>Account data</h2><p>We store your email address and a securely hashed password (or your Google account identifier) with our authentication provider, Supabase, to let you sign in.</p>
      <h2>Advertising</h2><p>Our public pages may show ads from Google AdSense, which may use cookies. We only load ads after you accept. You can change your choice by clearing this site's data.</p>
      <h2>Your rights</h2><p>You can ask us to delete your account at any time by contacting us at the address below.</p>
      <h2>Contact</h2><p>[your contact email]</p>
    </main><Footer /></>);
}
