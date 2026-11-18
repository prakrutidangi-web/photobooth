'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Consent() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_ADSENSE_CLIENT) return;
    try { setShow(!localStorage.getItem('pb-consent')); } catch { /* ignore */ }
  }, []);
  if (!show) return null;
  const choose = (v: 'yes' | 'no') => { try { localStorage.setItem('pb-consent', v); } catch { /* ignore */ } if (v === 'yes') window.dispatchEvent(new Event('pb-consent')); setShow(false); };
  return (
    <div className="consent" role="dialog" aria-label="Cookie consent">
      <p>We show ads on our public pages to keep Photobooth free. Ads may use cookies. Your photos are never shared. <Link href="/privacy">Privacy</Link></p>
      <div><button className="btn" onClick={() => choose('no')}>No ads</button> <button className="btn primary" onClick={() => choose('yes')}>Accept</button></div>
    </div>
  );
}
