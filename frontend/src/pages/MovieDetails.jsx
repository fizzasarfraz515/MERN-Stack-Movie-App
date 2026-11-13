import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Bookmark, BookmarkCheck, ExternalLink, Heart, Play, User } from 'lucide-react';
import RatingBadge from '../components/RatingBadge';
import MovieCarousel from '../components/MovieCarousel';
import ReviewSection from '../components/ReviewSection';
import TrailerModal from '../components/TrailerModal';
import { DetailsSkeleton } from '../components/LoadingSkeleton';
import { ErrorState } from '../components/StateMessages';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import useAsync from '../hooks/useAsync';
import { getMovieDetails } from '../services/movieService';
import { addRecentlyViewed } from '../services/userService';
import { LIST_TYPES } from '../utils/constants';
import { imageUrl } from '../utils/image';
import {
  formatDate,
  formatLanguage,
  formatMoney,
  formatRuntime,
  formatYear,
} from '../utils/format';

function Fact({ label, value }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-widest text-muted">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}

function CastCard({ person }) {
  const photo = imageUrl(person.profile_path, 'w185');
  return (
    <div className="w-32 shrink-0 snap-start sm:w-36">
      {photo ? (
        <img
          src={photo}
          alt={person.name}
          loading="lazy"
          className="aspect-[2/3] w-full rounded-xl object-cover ring-1 ring-white/5"
        />
      ) : (
        <div className="flex aspect-[2/3] w-full items-center justify-center rounded-xl bg-surface text-muted ring-1 ring-white/5">
          <User className="h-8 w-8" />
        </div>
      )}
      <p className="mt-2 line-clamp-1 text-sm font-semibold">{person.name}</p>
      <p className="line-clamp-1 text-xs text-muted">{person.character}</p>
    </div>
  );
}

export default function MovieDetails() {
  const { id } = useParams();
  const { hash } = useLocation();
  const { user } = useAuth();
  const { isSaved, isPending, toggle } = useWatchlist();
  const { data: movie, loading, error, reload } = useAsync(() => getMovieDetails(id), [id]);
  const [trailerOpen, setTrailerOpen] = useState(false);

  const userId = user?._id;
  const movieId = movie?.id;

  // Browser tab title
  useEffect(() => {
    if (!movie) return undefined;
    document.title = `${movie.title} - CineVerse`;
    return () => {
      document.title = 'CineVerse - Discover your next favorite movie';
    };
  }, [movie]);

  // Remember this visit for the dashboard's "Recently viewed" tab.
  useEffect(() => {
    if (!movie || !userId) return;
    addRecentlyViewed(movie).catch(() => {
      /* Not worth interrupting the user if tracking fails. */
    });
    // Only re-run for a different movie or user, not for every object change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieId, userId]);

  // Links like /movie/123#reviews jump straight to the reviews.
  useEffect(() => {
    if (!movieId || hash !== '#reviews') return undefined;
    const timer = setTimeout(
      () => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' }),
      150
    );
    return () => clearTimeout(timer);
  }, [movieId, hash]);

  // Make sure a trailer never stays open when moving to another movie.
  useEffect(() => setTrailerOpen(false), [id]);

  if (loading) return <DetailsSkeleton />;

  if (error) {
    return (
      <div className="container-page pb-8 pt-32">
        <ErrorState message={error} onRetry={reload} />
        <div className="mt-6 text-center">
          <Link to="/" className="btn-ghost">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const poster = imageUrl(movie.poster_path, 'w500');
  const backdrop = imageUrl(movie.backdrop_path, 'w1280');
  const runtime = formatRuntime(movie.runtime);
  const inWatchlist = isSaved(LIST_TYPES.WATCHLIST, movie.id);
  const inFavorites = isSaved(LIST_TYPES.FAVORITES, movie.id);
  const companies = movie.production_companies || [];

  return (
    <article>
      {/* Backdrop */}
      <div className="relative h-[50vh] min-h-[340px] w-full overflow-hidden bg-surface">
        {backdrop && (
          <img src={backdrop} alt="" className="h-full w-full object-cover opacity-70" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/30" />
      </div>

      {/* Poster + main info */}
      <div className="container-page relative -mt-44 flex flex-col gap-8 md:-mt-56 md:flex-row">
        <div className="w-52 shrink-0 self-center md:w-72 md:self-start">
          {poster ? (
            <img
              src={poster}
              alt={`${movie.title} poster`}
              className="w-full rounded-2xl shadow-2xl ring-1 ring-white/10"
            />
          ) : (
            <div className="flex aspect-[2/3] w-full items-center justify-center rounded-2xl bg-surface text-muted">
              No poster
            </div>
          )}
        </div>

        <div className="flex-1 md:pt-24">
          <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl">
            {movie.title}
            {movie.release_date && (
              <span className="ml-3 text-2xl font-medium text-muted sm:text-3xl">
                ({formatYear(movie.release_date)})
              </span>
            )}
          </h1>

          {movie.tagline && <p className="mt-3 text-lg italic text-gold-soft">{movie.tagline}</p>}

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3 text-sm text-cream/80">
            <RatingBadge value={movie.vote_average} size="md" />
            {movie.vote_count > 0 && (
              <span className="text-muted">{movie.vote_count.toLocaleString()} TMDB votes</span>
            )}
            {runtime && <span>{runtime}</span>}
            {movie.release_date && <span>{formatDate(movie.release_date)}</span>}
          </div>

          {movie.genres?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {movie.genres.map((genre) => (
                <Link
                  key={genre.id}
                  to={`/explore?genre=${genre.id}`}
                  className="rounded-full border border-white/15 px-3 py-1 text-xs font-medium transition hover:border-gold hover:text-gold"
                >
                  {genre.name}
                </Link>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="mt-7 flex flex-wrap gap-3">
            {movie.trailer && (
              <button type="button" onClick={() => setTrailerOpen(true)} className="btn-primary">
                <Play className="h-4 w-4" fill="currentColor" />
                Watch trailer
              </button>
            )}
            <button
              type="button"
              onClick={() => toggle(LIST_TYPES.WATCHLIST, movie)}
              disabled={isPending(LIST_TYPES.WATCHLIST, movie.id)}
              className={inWatchlist ? 'btn border border-gold bg-gold/10 text-gold' : 'btn-ghost'}
            >
              {inWatchlist ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
              {inWatchlist ? 'In watchlist' : 'Add to watchlist'}
            </button>
            <button
              type="button"
              onClick={() => toggle(LIST_TYPES.FAVORITES, movie)}
              disabled={isPending(LIST_TYPES.FAVORITES, movie.id)}
              className={inFavorites ? 'btn border border-gold bg-gold/10 text-gold' : 'btn-ghost'}
              aria-pressed={inFavorites}
            >
              <Heart className="h-4 w-4" fill={inFavorites ? 'currentColor' : 'none'} />
              {inFavorites ? 'Favorited' : 'Favorite'}
            </button>
            {movie.imdb_id && (
              <a
                href={`https://www.imdb.com/title/${movie.imdb_id}`}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost"
              >
                IMDb <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>

          <h2 className="mt-9 text-xl font-semibold">Overview</h2>
          <p className="mt-2 max-w-3xl leading-relaxed text-cream/80">
            {movie.overview || 'No overview is available for this movie yet.'}
          </p>

          {movie.crew?.length > 0 && (
            <dl className="mt-8 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-3">
              {movie.crew.slice(0, 6).map((person) => (
                <Fact key={person.id} label={person.jobs.join(' / ')} value={person.name} />
              ))}
            </dl>
          )}
        </div>
      </div>

      {/* Facts */}
      <section className="container-page py-10">
        <h2 className="mb-5 text-2xl font-bold sm:text-3xl">Details</h2>
        <dl className="grid grid-cols-2 gap-6 rounded-2xl border border-white/5 bg-surface p-6 sm:grid-cols-3 lg:grid-cols-5">
          <Fact label="Status" value={movie.status || 'Unknown'} />
          <Fact label="Original language" value={formatLanguage(movie.original_language)} />
          <Fact label="Budget" value={formatMoney(movie.budget)} />
          <Fact label="Revenue" value={formatMoney(movie.revenue)} />
          <Fact
            label="Original title"
            value={movie.original_title || movie.title}
          />
        </dl>
      </section>

      {/* Cast */}
      {movie.cast?.length > 0 && (
        <section className="container-page py-6">
          <h2 className="mb-5 text-2xl font-bold sm:text-3xl">Top cast</h2>
          <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
            {movie.cast.map((person) => (
              <CastCard key={person.credit_id || person.id} person={person} />
            ))}
          </div>
        </section>
      )}

      {/* Production companies */}
      {companies.length > 0 && (
        <section className="container-page py-6">
          <h2 className="mb-5 text-2xl font-bold sm:text-3xl">Production companies</h2>
          <div className="flex flex-wrap gap-3">
            {companies.map((company) => {
              const logo = imageUrl(company.logo_path, 'w185');
              return logo ? (
                <div
                  key={company.id}
                  className="flex h-14 items-center rounded-xl bg-white/90 px-4"
                  title={company.name}
                >
                  <img src={logo} alt={company.name} className="max-h-8 max-w-[7rem] object-contain" />
                </div>
              ) : (
                <span
                  key={company.id}
                  className="rounded-xl border border-white/10 bg-surface px-4 py-3 text-sm"
                >
                  {company.name}
                </span>
              );
            })}
          </div>
        </section>
      )}

      {/* Similar movies */}
      {movie.similar?.length > 0 && (
        <MovieCarousel title="Similar movies" subtitle="More like this" movies={movie.similar} />
      )}

      <ReviewSection key={movie.id} movie={movie} />

      <TrailerModal
        open={trailerOpen}
        videoKey={movie.trailer?.key}
        title={movie.title}
        onClose={() => setTrailerOpen(false)}
      />
    </article>
  );
}
