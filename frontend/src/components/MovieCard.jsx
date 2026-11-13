import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bookmark, BookmarkCheck, Film, Heart } from 'lucide-react';
import RatingBadge from './RatingBadge';
import { useWatchlist } from '../context/WatchlistContext';
import { LIST_TYPES } from '../utils/constants';
import { imageUrl } from '../utils/image';
import { formatYear } from '../utils/format';

/** Round icon button used for the quick actions on a poster. */
function QuickAction({ active, pending, label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur transition disabled:opacity-60 ${
        active
          ? 'border-gold bg-gold text-ink'
          : 'border-white/20 bg-ink/70 text-cream hover:border-gold hover:text-gold'
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Poster card. `movie` uses TMDB field names (id, title, poster_path,
 * release_date, vote_average). Hover reveals the quick-save buttons.
 */
export default function MovieCard({ movie, index = 0 }) {
  const { isSaved, isPending, toggle } = useWatchlist();

  const poster = imageUrl(movie.poster_path, 'w342');
  const year = formatYear(movie.release_date);
  const inWatchlist = isSaved(LIST_TYPES.WATCHLIST, movie.id);
  const inFavorites = isSaved(LIST_TYPES.FAVORITES, movie.id);

  // Stop the click from also following the card's link.
  const handleToggle = (listType) => (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggle(listType, movie);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.04 }}
      className="group relative"
    >
      <Link to={`/movie/${movie.id}`} className="block rounded-xl" aria-label={movie.title}>
        <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-surface ring-1 ring-white/5 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_18px_40px_-12px_rgba(217,164,65,0.35)] group-hover:ring-gold/40">
          {poster ? (
            <img
              src={poster}
              alt={`${movie.title} poster`}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-surface to-surface-raised p-4 text-center text-muted">
              <Film className="h-8 w-8" />
              <span className="text-xs">{movie.title}</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />

          <RatingBadge value={movie.vote_average} className="absolute left-2 top-2" />
        </div>
      </Link>

      {/* Always visible on touch screens, revealed on hover for mouse users. */}
      <div className="absolute right-2 top-2 flex flex-col gap-2 opacity-100 transition duration-200 pointer-fine:opacity-0 pointer-fine:group-focus-within:opacity-100 pointer-fine:group-hover:opacity-100">
        <QuickAction
          active={inWatchlist}
          pending={isPending(LIST_TYPES.WATCHLIST, movie.id)}
          label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
          onClick={handleToggle(LIST_TYPES.WATCHLIST)}
        >
          {inWatchlist ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        </QuickAction>
        <QuickAction
          active={inFavorites}
          pending={isPending(LIST_TYPES.FAVORITES, movie.id)}
          label={inFavorites ? 'Remove from favorites' : 'Add to favorites'}
          onClick={handleToggle(LIST_TYPES.FAVORITES)}
        >
          <Heart className="h-4 w-4" fill={inFavorites ? 'currentColor' : 'none'} />
        </QuickAction>
      </div>

      <div className="mt-3 px-0.5">
        <h3 className="line-clamp-1 text-sm font-semibold transition group-hover:text-gold">
          {movie.title}
        </h3>
        {year && <p className="mt-0.5 text-xs text-muted">{year}</p>}
      </div>
    </motion.article>
  );
}
