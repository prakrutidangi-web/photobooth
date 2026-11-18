import type { Metadata } from 'next';
import Link from 'next/link';
import LoginForm from '@/components/LoginForm';
import LoginCard from '@/components/LoginCard';
import { Marquee } from '@/components/Sign';

export const metadata: Metadata = { title: 'Sign in', robots: { index: false } };

export default async function Login({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const sp = await searchParams;
  return (
    <>
      <header className="sign"><Marquee /></header>
      <main id="main" className="wrap narrow">
        <LoginCard>
          <h1 className="h2">Welcome to the booth</h1>
          <p className="muted">Sign in to start shooting. Free, and your photos never leave your device.</p>
          <LoginForm next={sp.next ?? '/studio'} urlError={sp.error === 'auth'} />
          <p className="fine">By continuing you agree to our <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>.</p>
        </LoginCard>
      </main>
    </>
  );
}
