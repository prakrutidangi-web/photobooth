/** The app icon: a camera on stage between velvet curtains. 192px source, shown at ~40px (sharp on retina). */
export default function LogoMark({ className = '' }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={className} src="/logo.png" alt="" width={192} height={192} aria-hidden />;
}
