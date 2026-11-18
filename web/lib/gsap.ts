'use client';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Draggable } from 'gsap/Draggable';
import Lenis from 'lenis';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger, Draggable);

/** Shared smooth-scroll instance so the intro can pause/resume scrolling. */
export const lenisRef: { current: Lenis | null } = { current: null };
export const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export { gsap, ScrollTrigger, Draggable, Lenis };
