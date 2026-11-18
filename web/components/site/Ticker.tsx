'use client';
import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap';

const PHRASES = ['photo strips', '36 film looks', 'pose ideas', 'instant prints', 'beauty filter', 'free', 'photos stay on your device'];

/** Infinite ticker. Scrolling speeds it up and flips its direction with the scroll. */
export default function Ticker() {
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const tween = gsap.to(track.current, { xPercent: -50, repeat: -1, duration: 34, ease: 'none' });
      ScrollTrigger.create({
        start: 0, end: 'max',
        onUpdate(self) {
          const boost = 1 + Math.min(7, Math.abs(self.getVelocity()) / 280);
          tween.timeScale(self.direction * boost);
          gsap.to(tween, { timeScale: self.direction, duration: 0.9, ease: 'power2.out', overwrite: true });
        },
      });
    });
    return () => ctx.revert();
  }, []);
  const row = (k: string) => <ul key={k} aria-hidden={k === 'b'}>{PHRASES.map((p) => <li key={p}>{p}<i>&#10022;</i></li>)}</ul>;
  return <div className="ticker" aria-label={PHRASES.join(', ')}><div className="ticker-track" ref={track}>{row('a')}{row('b')}</div></div>;
}
