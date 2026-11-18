import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Booth from '@/components/Booth';
import SignOut from '@/components/SignOut';
import { Marquee } from '@/components/Sign';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Studio', robots: { index: false } };

export default async function Studio() {
  // Defence in depth: proxy.ts already redirects, but always re-verify on the server.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/studio');
  return (
    <>
      <header className="sign"><Marquee />
        <nav className="nav" aria-label="Account"><span className="muted who">{user.email}</span><SignOut /></nav>
      </header>
      <main id="main" className="wrap"><Booth /></main>
    </>
  );
}
