'use client';
import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';

/** Pulls its child toward the pointer. Fine pointers only. */
export default function Magnetic({ children, strength = 0.35 }: { children: React.ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current!;
    if (prefersReducedMotion() || !window.matchMedia('(pointer: fine)').matches) return;
    const x = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' }), y = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
    const move = (e: PointerEvent) => { const r = el.getBoundingClientRect(); x((e.clientX - (r.left + r.width / 2)) * strength); y((e.clientY - (r.top + r.height / 2)) * strength); };
    const leave = () => { x(0); y(0); };
    el.addEventListener('pointermove', move); el.addEventListener('pointerleave', leave);
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); };
  }, [strength]);
  return <span ref={ref} className="mag">{children}</span>;
}
