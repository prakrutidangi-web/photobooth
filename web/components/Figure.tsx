import { figure, type Pose } from '@/lib/poses';

/** Simple stick-figure pose illustration (original artwork). */
export default function Figure({ pose, color = 'currentColor', size = 90 }: { pose: Pose; color?: string; size?: number }) {
  const f = figure(pose), s = 40, c = 50;
  const pt = ([x, y]: [number, number]) => `${c + x * s},${58 + y * s}`;
  return (
    <svg viewBox="0 0 100 120" width={size} height={size * 1.2} role="img" aria-label={`${pose.name} pose`}>
      <g stroke={color} strokeWidth={s * 0.14} strokeLinecap="round" strokeLinejoin="round" fill="none">
        {f.lines.map((ln, i) => <polyline key={i} points={ln.map(pt).join(' ')} />)}
      </g>
      <circle cx={c + f.head.cx * s} cy={58 + f.head.cy * s} r={f.head.r * s} fill={color} />
    </svg>
  );
}
