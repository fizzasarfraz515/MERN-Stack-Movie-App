import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bookmark, BookmarkCheck, Info } from 'lucide-react';
import RatingBadge from './RatingBadge';
import { HeroSkeleton } from './LoadingSkeleton';
import { ErrorState } from './StateMessages';
import { useWatchlist } from '../context/WatchlistContext';
import { LIST_TYPES } from '../utils/constants';
import { imageUrl } from '../utils/image';
import { formatYear } from '../utils/format';

const SLIDE_INTERVAL_MS = 8000;
const MAX_SLIDES = 5;

/**
 * Full-width cinematic banner that rotates through the given movies.
 * `getGenreNames` turns genre ids into readable names.
 */
export default function HeroBanner({ movies = [], loading, error, onRetry, getGenreNames }) {
  const { isSaved, isPending, toggle } = useWatchlist();
  const [activeIndex, setActiveIndex] = useState(0);

  // Only feature movies that actually have a backdrop image.
  const slides = movies.filter((movie) => movie.backdrop_path).slice(0, MAX_SLIDES);

  useEffect(() => {
    if (slides.length < 2) return undefined;

    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);

    // Restarting on every manual change keeps the slide from jumping right after a click.
    return () => clearInterval(timer);
  }, [slides.length, activeIndex]);

  if (loading) return <HeroSkeleton />;

  if (error) {
    return (
      <div className="container-page pt-28">
        <ErrorState message={error} onRetry={onRetry} />
      </div>
    );
  }

  if (slides.length === 0) return null;

  const movie = slides[activeIndex] ?? slides[0];
  const inWatchlist = isSaved(LIST_TYPES.WATCHLIST, movie.id);
  const genreNames = getGenreNames(movie.genre_ids).slice(0, 3);

  return (
    <section className="relative h-[78vh] min-h-[520px] w-full overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.img
          key={movie.id}
          src={imageUrl(movie.backdrop_path, 'w1280')}
          alt=""
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </AnimatePresence>

      {/* Layered gradients keep the text readable on any image. */}
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40" />

      <div className="container-page relative flex h-full items-end pb-20 sm:pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
              <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
                Trending this week
              </span>
              <RatingBadge value={movie.vote_average} size="md" />
              <span className="text-cream/70">{formatYear(movie.release_date)}</span>
              {genreNames.length > 0 && (
                <span className="text-cream/70">{genreNames.join(' · ')}</span>
              )}
            </div>

            <h1 className="text-4xl font-extrabold leading-tight sm:text-6xl">{movie.title}</h1>
            <p className="mt-4 line-clamp-3 max-w-xl text-base leading-relaxed text-cream/80 sm:text-lg">
              {movie.overview}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={`/movie/${movie.id}`} className="btn-primary px-6 py-3">
                <Info className="h-4 w-4" />
                View details
              </Link>
              <button
                type="button"
                onClick={() => toggle(LIST_TYPES.WATCHLIST, movie)}
                disabled={isPending(LIST_TYPES.WATCHLIST, movie.id)}
                className="btn-ghost px-6 py-3"
              >
                {inWatchlist ? (
                  <BookmarkCheck className="h-4 w-4 text-gold" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
                {inWatchlist ? 'In your watchlist' : 'Add to watchlist'}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {slides.length > 1 && (
        <div className="container-page absolute inset-x-0 bottom-8 flex gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show ${slide.title}`}
              aria-current={index === activeIndex}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === activeIndex ? 'w-10 bg-gold' : 'w-5 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
