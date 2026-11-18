'use client';
import { useEffect, useRef, useState } from 'react';

const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT;

/** Shows an ad only if AdSense is configured AND the visitor accepted. Never rendered on /studio or /login. */
export default function AdSlot() {
  const [ok, setOk] = useState(false);
  const pushed = useRef(false);
  useEffect(() => {
    if (!CLIENT || !SLOT) return;
    try { setOk(localStorage.getItem('pb-consent') === 'yes'); } catch { /* ignore */ }
    const on = () => setOk(true);
    window.addEventListener('pb-consent', on); return () => window.removeEventListener('pb-consent', on);
  }, []);
  useEffect(() => {
    if (!ok || pushed.current) return;
    pushed.current = true;
    const id = 'adsense-js';
    if (!document.getElementById(id)) {
      const s = document.createElement('script');
      s.id = id; s.async = true; s.crossOrigin = 'anonymous';
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT}`;
      document.head.append(s);
    }
    try { ((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle ||= []).push({}); } catch { /* ignore */ }
  }, [ok]);
  if (!ok) return null;
  return (
    <aside className="ad" aria-label="Advertisement">
      <small>Advertisement</small>
      <ins className="adsbygoogle" style={{ display: 'block' }} data-ad-client={CLIENT} data-ad-slot={SLOT} data-ad-format="auto" data-full-width-responsive="true" />
    </aside>
  );
}
