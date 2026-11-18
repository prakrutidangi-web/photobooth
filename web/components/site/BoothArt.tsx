import PoseImage from '../PoseImage';
import { Photo, Polaroid, Strip } from './Art';
import { POSES } from '@/lib/poses';
import type { BoothId } from '@/lib/booths';

/** Small original illustration for each booth card. */
export default function BoothArt({ id }: { id: BoothId }) {
  if (id === 'filter') return (
    <div className="ba ba-filter"><Photo i={0} css="saturate(1.4) contrast(1.1)" /><Photo i={2} css="grayscale(1) contrast(1.2)" /><Photo i={4} css="sepia(.5)" /></div>
  );
  if (id === 'instant') return <div className="ba ba-instant"><Polaroid i={4} caption="first date" /></div>;
  if (id === 'photo') return <div className="ba ba-photo"><Strip start={1} n={3} date={false} /></div>;
  if (id === 'pose') return (
    <div className="ba ba-pose">
      {[0, 3, 5].map((p, k) => <div key={p} className="pp"><Photo i={k + 2} /><span><PoseImage pose={POSES[p]} color="#2a0810" size={22} /></span></div>)}
    </div>
  );
  return <div className="ba ba-frames"><Strip start={3} n={3} date={false} paper="transparent" /></div>;
}
