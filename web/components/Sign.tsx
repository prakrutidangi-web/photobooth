import Link from 'next/link';
export function Marquee() {
  return (
    <Link href="/" className="marquee" aria-label="Photobooth home"><span>Photo</span><i aria-hidden /><span>Booth</span></Link>
  );
}
export function Footer() {
  return (
    <footer className="foot">
      <p>&copy; {new Date().getFullYear()} Photobooth &middot; <Link href="/privacy">Privacy</Link> &middot; <Link href="/terms">Terms</Link></p>
      <p>Photos are processed in your browser and never uploaded.</p>
    </footer>
  );
}
