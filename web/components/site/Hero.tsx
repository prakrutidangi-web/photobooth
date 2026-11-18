'use client';
import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';
import { EnterLink } from './Curtain';
import Magnetic from './Magnetic';
import { STYLES } from '@/lib/filters';
import BoothScene from './BoothScene';

const Split = ({ text }: { text: string }) => (
  <>{text.split(' ').map((w, i) => <span key={i} aria-hidden><span className="w"><span className="wi">{w}</span></span>{' '}</span>)}</>
);

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const t = gsap.timeline({ defaults: { ease: 'expo.out' } });
      t.from('.wi', { yPercent: 118, rotate: 5, duration: 1.4, stagger: 0.08 }, 0.1)
        .from('.h-fade', { opacity: 0, y: 24, duration: 1.1, stagger: 0.1 }, 0.5)
        .from('.cab', { opacity: 0, y: 70, duration: 1.6 }, 0)
        .from('.cs-bulbs i', { opacity: 0.1, duration: 0.2, stagger: { each: 0.04, from: 'center' }, ease: 'none' }, 0.6);

      gsap.to('.cab', { yPercent: -6, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.6 } });
      gsap.to('.h-copy', { yPercent: -16, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.6 } });
    }, root);

    // the cabinet turns gently toward the mouse
    const door = root.current!.querySelector<HTMLElement>('.cab')!;
    const rx = gsap.quickTo(door, 'rotateX', { duration: 1, ease: 'power3.out' }), ry = gsap.quickTo(door, 'rotateY', { duration: 1, ease: 'power3.out' });
    const move = (e: PointerEvent) => { if (e.pointerType !== 'mouse') return; ry((e.clientX / innerWidth - 0.5) * 8); rx(-(e.clientY / innerHeight - 0.5) * 4); };
    window.addEventListener('pointermove', move);
    return () => { window.removeEventListener('pointermove', move); ctx.revert(); };
  }, []);

  return (
    <section className="hero" ref={root}>
      <div className="h-dust" aria-hidden>{Array.from({ length: 22 }, (_, i) => <i key={i} style={{ ['--i' as string]: i, left: `${48 + ((i * 37) % 50)}%`, top: `${(i * 53) % 100}%` }} />)}</div>
      <div className="h-beam" aria-hidden />
      <div className="h-copy">
        <h1 aria-label="step into the booth.">
          <span className="hl1"><Split text="step into" /></span>
          <span className="hl2"><Split text="the booth." /></span>
        </h1>
        <p className="h-sub h-fade">a photobooth in your browser. take a strip, pick from {STYLES.length} film looks, download it. your photos stay on your device.</p>
        <div className="h-cta h-fade">
          <Magnetic><EnterLink href="/studio" className="btn-enter">step inside <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></EnterLink></Magnetic>
          <a href="#booths" className="h-link">see the booths</a>
        </div>
      </div>

      <div className="cab-wrap"><BoothScene /></div>
    </section>
  );
}
