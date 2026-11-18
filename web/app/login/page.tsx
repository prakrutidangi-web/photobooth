import type { Metadata } from 'next';
import Link from 'next/link';
import LoginForm from '@/components/LoginForm';
import LoginCard from '@/components/LoginCard';
import { SiteNav, SiteFooter } from '@/components/site/Chrome';

export const metadata: Metadata = { title: 'Sign in', robots: { index: false } };

export default async function Login({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const sp = await searchParams;
  return (
    <div className="site page">
      <SiteNav />
      <main id="main" className="wrap narrow">
        <LoginCard>
          <h1 className="h2">Your booth account</h1>
          <p className="muted">Optional: an account lets us save your preferences. You can use the booth without one. Your photos never leave your device.</p>
          <LoginForm next={sp.next ?? '/studio'} urlError={sp.error === 'auth'} />
          <p className="fine">By continuing you agree to our <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>.</p>
        </LoginCard>
      </main>
      <SiteFooter />
    </div>
  );
}
