'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { closeCurtain, openCurtain } from '@/lib/curtain';

/** Fixed overlay rendered once in the root layout. */
export function CurtainOverlay() {
  const path = usePathname();
  useEffect(() => { openCurtain(); }, [path]);
  return (
    <div className="cv" aria-hidden>
      <div className="cv-panel velvet" /><div className="cv-panel velvet" />
    </div>
  );
}

/** A link that draws the curtain closed before navigating ("stepping inside"). */
export function EnterLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  const router = useRouter();
  return (
    <Link href={href} className={className} onClick={async (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault(); router.prefetch(href); await closeCurtain(); router.push(href);
    }}>{children}</Link>
  );
}
