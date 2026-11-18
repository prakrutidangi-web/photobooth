'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { gsap, ScrollTrigger, Lenis, lenisRef, prefersReducedMotion } from '@/lib/gsap';

const IntroCtx = createContext(false);
export const useIntroDone = () => useContext(IntroCtx);

/** Wraps the page: smooth scroll (Lenis), and the print-out intro. */
export default function Shell({ children }: { children: React.ReactNode }) {
  const [done] = useState(true);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95 });
    lenisRef.current = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); lenis.destroy(); lenisRef.current = null; };
  }, []);

  return (
    <IntroCtx.Provider value={done}>
      {children}
    </IntroCtx.Provider>
  );
}
