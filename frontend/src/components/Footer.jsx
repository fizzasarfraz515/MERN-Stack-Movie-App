import { Link } from 'react-router-dom';
import { Clapperboard } from 'lucide-react';
import { CATEGORIES } from '../utils/constants';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/5 bg-surface/40">
      <div className="container-page grid gap-10 py-12 md:grid-cols-3">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <Clapperboard className="h-6 w-6 text-gold" />
            <span className="font-display text-lg font-extrabold tracking-wide">
              CINE<span className="text-gold">VERSE</span>
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            Discover what to watch next, keep a watchlist, and share what you think about the
            films you love.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-gold">Browse</h4>
          <ul className="mt-4 space-y-2 text-sm text-cream/80">
            {CATEGORIES.map((category) => (
              <li key={category.key}>
                <Link
                  to={`/explore?category=${category.key}`}
                  className="transition hover:text-gold"
                >
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-widest text-gold">Account</h4>
          <ul className="mt-4 space-y-2 text-sm text-cream/80">
            <li>
              <Link to="/dashboard" className="transition hover:text-gold">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/dashboard?tab=watchlist" className="transition hover:text-gold">
                Watchlist
              </Link>
            </li>
            <li>
              <Link to="/login" className="transition hover:text-gold">
                Log in
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5 py-6">
        <p className="container-page text-xs leading-relaxed text-muted">
          This product uses the TMDB API but is not endorsed or certified by TMDB. All movie data
          and images are provided by{' '}
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noreferrer"
            className="text-gold hover:underline"
          >
            The Movie Database
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
