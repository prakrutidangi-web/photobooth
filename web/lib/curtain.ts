'use client';
import { gsap } from './gsap';

/** Global velvet-curtain page transition. close() covers the screen, open() reveals it. */
const KEY = 'pb-curtain-closed';
const panels = () => document.querySelectorAll<HTMLElement>('.cv-panel');

export function closeCurtain(): Promise<void> {
  return new Promise((resolve) => {
    const root = document.querySelector<HTMLElement>('.cv');
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return resolve();
    root.style.visibility = 'visible';
    try { sessionStorage.setItem(KEY, '1'); } catch { /* ignore */ }
    gsap.fromTo(panels(), { x: 0, xPercent: (i) => (i ? 101 : -101) }, { x: 0, xPercent: 0, duration: 0.7, ease: 'power3.inOut', onComplete: () => resolve() });
  });
}

export function openCurtain() {
  const root = document.querySelector<HTMLElement>('.cv');
  let closed = false;
  try { closed = sessionStorage.getItem(KEY) === '1'; sessionStorage.removeItem(KEY); } catch { /* ignore */ }
  if (!root || !closed) return;
  root.style.visibility = 'visible';
  gsap.fromTo(panels(), { x: 0, xPercent: 0 }, { x: 0, xPercent: (i) => (i ? 101 : -101), duration: 1.1, delay: 0.15, ease: 'expo.inOut', onComplete: () => { root.style.visibility = 'hidden'; } });
}
