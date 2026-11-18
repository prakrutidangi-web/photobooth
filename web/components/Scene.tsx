// A simple illustrated portrait scene used for the marketing previews (CSS filters make the "looks").
export function Scene({ shift = 0 }: { shift?: number }) {
  const skies = ['#7fb7e6', '#e8a35b', '#9ec9a0', '#c993c6'];
  return (
    <svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustrated portrait" width="100%" height="100%">
      <rect width="160" height="120" fill={skies[shift % 4]} />
      <circle cx={30 + shift * 30} cy="28" r="14" fill="#ffe08a" />
      <path d="M0 90 Q40 60 80 84 T160 76 V120 H0Z" fill="#3f7a4a" />
      <circle cx="82" cy="58" r="17" fill="#f1c8a0" /><path d="M64 56 Q82 30 100 56 Q92 44 82 44 Q70 44 64 56Z" fill="#3a2418" />
      <rect x="62" y="74" width="40" height="40" rx="14" fill="#c9503c" />
      <circle cx="76" cy="60" r="2" fill="#2a1a12" /><circle cx="88" cy="60" r="2" fill="#2a1a12" /><path d="M76 67 Q82 72 88 67" stroke="#2a1a12" strokeWidth="2" fill="none" />
    </svg>
  );
}
