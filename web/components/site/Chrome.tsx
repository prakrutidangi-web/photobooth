import Link from 'next/link';
import LogoMark from './LogoMark';
import { EnterLink } from './Curtain';

export function Logo() {
  return <Link href="/" className="logo" aria-label="Photobooth home"><LogoMark className="logo-mark" /><span className="logo-word">photo<em>booth</em></span></Link>;
}

export function SiteNav({ right }: { right?: React.ReactNode }) {
  return (
    <header className="nav">
      <Logo />
      <nav aria-label="Main">
        <a href="/#booths">booths</a><a href="/#wall">samples</a><a href="/#looks">looks</a><a href="/#faq">faq</a>
      </nav>
      <div className="nav-r">{right ?? <><Link href="/login" className="nav-link">sign in</Link><EnterLink href="/studio" className="btn-pill">step inside</EnterLink></>}</div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="foot2">
      <div className="f-big" aria-hidden>photo<em>booth</em></div>
      <div className="f-row">
        <p>made in your browser. photos never uploaded.</p>
        <p><Link href="/privacy">privacy</Link> &middot; <Link href="/terms">terms</Link> &middot; <Link href="/login">account</Link></p>
      </div>
    </footer>
  );
}
