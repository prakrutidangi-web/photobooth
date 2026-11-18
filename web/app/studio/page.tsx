import type { Metadata } from 'next';
import Link from 'next/link';
import Booth from '@/components/Booth';
import SignOut from '@/components/SignOut';
import { SiteNav, SiteFooter } from '@/components/site/Chrome';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'The booth', description: 'Pick a booth, strike four poses and take home a vintage photo strip. Nothing is uploaded.' };

export default async function Studio() {
  // Login is optional: guests can use the booth. A verified user just sees their email.
  let email: string | undefined;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try { const supabase = await createClient(); email = (await supabase.auth.getUser()).data.user?.email ?? undefined; } catch { /* treat as guest */ }
  }
  return (
    <div className="site interior">
      <div className="int-curtain l velvet" aria-hidden /><div className="int-curtain r velvet" aria-hidden /><div className="int-light" aria-hidden />
      <SiteNav right={email ? <><span className="who">{email}</span><SignOut /></> : <Link href="/login" className="nav-link">sign in</Link>} />
      <main id="main" className="int-main"><Booth /></main>
      <SiteFooter />
    </div>
  );
}
