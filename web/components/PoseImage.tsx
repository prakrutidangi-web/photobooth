import Figure from './Figure';
import { posePhotos, posePhotosGroup } from '@/lib/photos';
import type { Pose } from '@/lib/poses';

/** The AI pose-guide photo for a pose (squad version when pose.group), falling back to the stick figure. */
export default function PoseImage({ pose, size = 64, color, className = '' }: { pose: Pose; size?: number; color?: string; className?: string }) {
  const src = (pose.group && posePhotosGroup[pose.id]) || posePhotos[pose.id];
  if (!src) return <Figure pose={pose} size={size} color={color} />;
  const who = pose.group ? 'a group of friends' : 'a woman';
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={`Sample: ${who} doing the "${pose.name}" pose`} width={size} height={size} loading="lazy" decoding="async" className={`pose-img ${className}`} />;
}
