import { useState } from 'react';
import { Star } from 'lucide-react';

const SIZES = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' };

/**
 * 1-5 star rating. Pass `onChange` to make it interactive; leave it out
 * for a read-only display.
 */
export default function StarRating({ value = 0, onChange, size = 'sm' }) {
  const [hovered, setHovered] = useState(0);
  const interactive = typeof onChange === 'function';
  const shown = hovered || value;

  return (
    <div
      className="inline-flex items-center gap-0.5"
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={interactive ? 'Your rating' : `Rated ${value} out of 5`}
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= shown;
        const icon = (
          <Star
            className={`${SIZES[size]} transition ${
              filled ? 'text-gold' : 'text-white/20'
            } ${interactive ? 'hover:scale-110' : ''}`}
            fill={filled ? 'currentColor' : 'none'}
          />
        );

        if (!interactive) return <span key={star}>{icon}</span>;

        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            className="rounded p-0.5"
          >
            {icon}
          </button>
        );
      })}
    </div>
  );
}
