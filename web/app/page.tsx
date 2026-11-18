import Link from 'next/link';
import Hero from '@/components/Hero';
import Looks from '@/components/Looks';
import Reveal from '@/components/Reveal';
import AdSlot from '@/components/AdSlot';
import Consent from '@/components/Consent';
import { Footer, Marquee } from '@/components/Sign';

const features = [
  ['Private by design', 'Photos are processed entirely in your browser. We never upload, store or see them.'],
  ['Six film looks', 'Golden hour, noir, hi-con black & white, Polaroid, antique sepia and faded 70s.'],
  ['Real photobooth feel', '3-2-1 countdown, a bright flash, four frames and a date-stamped strip.'],
  ['Ready to share', 'Download a crisp 600x1800 PNG, perfect for stories, scrapbooks and prints.'],
];
const faq = [
  ['Do you store my photos?', 'No. Capture, filtering and strip-building all happen on your device. Only your account details (email) are stored.'],
  ['Why do I need an account?', 'It keeps Photobooth free and abuse-free, and lets us remember your preferences. It takes ten seconds.'],
  ['Which browsers work?', 'Current Chrome, Safari, Edge and Firefox on a device with a camera.'],
];

export default function Home() {
  return (
    <>
      <header className="sign"><Marquee />
        <nav className="nav" aria-label="Main"><a href="#looks">Looks</a><a href="#faq">FAQ</a><Link href="/login" className="btn small">Sign in</Link></nav>
      </header>
      <main id="main" className="wrap">
        <Hero />
        <Reveal><section className="section" aria-labelledby="f"><h2 id="f" className="h2">Why you'll love it</h2>
          <div className="features">{features.map(([t, d]) => <article key={t} className="card"><h3>{t}</h3><p>{d}</p></article>)}</div></section></Reveal>
        <section id="looks" className="section" aria-labelledby="l"><Reveal><h2 id="l" className="h2">Pick your look</h2><p className="muted">Every strip is rendered in all six. Choose your favourite after the shoot.</p></Reveal><Looks /></section>
        <Reveal><section className="section" aria-labelledby="h"><h2 id="h" className="h2">How it works</h2>
          <ol className="steps big-steps"><li><strong>1</strong>Sign in & allow camera</li><li><strong>2</strong>Hit the button. 3-2-1, flash</li><li><strong>3</strong>Pick a look & download</li></ol></section></Reveal>
        <AdSlot />
        <Reveal><section id="faq" className="section" aria-labelledby="q"><h2 id="q" className="h2">Questions</h2>
          {faq.map(([q, a]) => <details key={q} className="faq"><summary>{q}</summary><p>{a}</p></details>)}</section></Reveal>
        <Reveal><section className="section cta-band"><h2 className="h2">Ready for your close-up?</h2><Link href="/login?next=/studio" className="btn primary big">Enter the booth</Link></section></Reveal>
      </main>
      <Footer /><Consent />
    </>
  );
}
