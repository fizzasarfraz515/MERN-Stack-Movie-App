import { Star } from 'lucide-react';
import { formatScore } from '../utils/format';

/** TMDB's 0-10 community score, colored by how good it is. */
function getTone(score) {
  if (score >= 7.5) return 'text-emerald-300 border-emerald-400/30';
  if (score >= 6) return 'text-gold border-gold/30';
  return 'text-orange-300 border-orange-400/30';
}

const SIZES = {
  sm: 'gap-1 px-2 py-0.5 text-xs',
  md: 'gap-1.5 px-3 py-1 text-sm',
};

export default function RatingBadge({ value, size = 'sm', className = '' }) {
  const score = formatScore(value);
  if (!score) return null;

  return (
    <span
      className={`inline-flex items-center rounded-full border bg-ink/80 font-semibold backdrop-blur ${getTone(
        value
      )} ${SIZES[size]} ${className}`}
      title="TMDB user score"
    >
      <Star className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} fill="currentColor" />
      {score}
    </span>
  );
}
