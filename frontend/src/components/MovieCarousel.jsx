import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import { CarouselSkeleton } from './LoadingSkeleton';
import { ErrorState } from './StateMessages';

/**
 * Titled, horizontally scrollable row of movies with arrow buttons and an
 * optional "View all" link.
 */
export default function MovieCarousel({
  title,
  subtitle,
  movies = [],
  loading = false,
  error = null,
  onRetry,
  viewAllTo,
}) {
  const scroller = useRef(null);

  // Scroll by roughly one screen's worth of cards.
  const scrollByPage = (direction) => {
    const node = scroller.current;
    if (!node) return;
    node.scrollBy({ left: direction * node.clientWidth * 0.85, behavior: 'smooth' });
  };

  return (
    <section className="container-page py-6">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          {viewAllTo && (
            <Link
              to={viewAllTo}
              className="group mr-2 flex items-center gap-1 text-sm font-medium text-gold transition hover:text-gold-soft"
            >
              View all
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
          )}
          <button
            type="button"
            onClick={() => scrollByPage(-1)}
            aria-label={`Scroll ${title} left`}
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-surface transition hover:border-gold/60 hover:text-gold sm:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollByPage(1)}
            aria-label={`Scroll ${title} right`}
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-surface transition hover:border-gold/60 hover:text-gold sm:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {loading && <CarouselSkeleton />}

      {!loading && error && <ErrorState message={error} onRetry={onRetry} compact />}

      {!loading && !error && (
        <div
          ref={scroller}
          className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0"
        >
          {movies.map((movie, index) => (
            <div key={movie.id} className="w-36 shrink-0 snap-start sm:w-44 lg:w-48">
              <MovieCard movie={movie} index={index} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
