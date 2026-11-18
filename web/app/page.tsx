import Link from 'next/link';
import Shell from '@/components/site/Shell';
import Hero from '@/components/site/Hero';
import Ticker from '@/components/site/Ticker';
import Magnetic from '@/components/site/Magnetic';
import { EnterLink } from '@/components/site/Curtain';
import { LooksGrid, PickBooth, PoseRail, Steps, Wall } from '@/components/site/Sections';
import AdSlot from '@/components/AdSlot';
import Consent from '@/components/Consent';
import { SiteNav, SiteFooter } from '@/components/site/Chrome';

const faq = [
  ['do you keep my photos?', 'no. capture, filters and the strip itself are all made on your device. nothing is uploaded, so there is nothing for us to keep.'],
  ['do i need an account?', 'no. an account is optional and only saves your preferences.'],
  ['does it work on my phone?', 'yes, in current safari and chrome on iphone and android, plus any laptop with a camera. you can upload photos too.'],
  ['is it actually free?', 'yes. the site is supported by a few ads on the public pages. there are no ads inside the booth.'],
];

export default function Home() {
  return (
    <div className="site home">
      <Shell>
        <SiteNav />
        <main id="main">
          <Hero />
          <Ticker />
          <PickBooth />
          <Steps />
          <Wall />
          <LooksGrid />
          <PoseRail />
          <AdSlot />
          <section id="faq" className="sec faq">
            <div className="faq-l"><h2><em>questions.</em></h2></div>
            <div className="faq-r">{faq.map(([q, a]) => <details key={q}><summary>{q}<i aria-hidden>+</i></summary><p>{a}</p></details>)}</div>
          </section>
          <section className="last-call">
            <div className="lc-curtain velvet" aria-hidden />
            <div className="lc-in">
              <h2>your turn <em>in the booth.</em></h2>
              <Magnetic><EnterLink href="/studio" className="btn-enter light">step inside</EnterLink></Magnetic>
            </div>
          </section>
        </main>
        <SiteFooter />
        <Consent />
      </Shell>
    </div>
  );
}
