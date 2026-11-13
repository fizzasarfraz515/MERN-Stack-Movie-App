import { Link, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bookmark, Clapperboard, MessageSquareText, Sparkles } from 'lucide-react';

const HIGHLIGHTS = [
  { icon: Sparkles, text: 'Discover trending, top rated and upcoming films' },
  { icon: Bookmark, text: 'Build a watchlist that follows you everywhere' },
  { icon: MessageSquareText, text: 'Rate and review everything you watch' },
];

/** Split-screen layout shared by the login and register pages. */
export default function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden border-r border-white/5 bg-surface lg:block">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-gold/20 blur-3xl" />
        <div className="absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />

        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2">
            <Clapperboard className="h-8 w-8 text-gold" />
            <span className="font-display text-2xl font-extrabold tracking-wide">
              CINE<span className="text-gold">VERSE</span>
            </span>
          </Link>

          <div>
            <h2 className="max-w-md text-5xl font-extrabold leading-tight">
              Your next favorite movie is <span className="text-gold">waiting.</span>
            </h2>
            <ul className="mt-10 space-y-5">
              {HIGHLIGHTS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-4 text-cream/80">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 text-gold">
                    <Icon className="h-5 w-5" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-muted">Powered by The Movie Database (TMDB).</p>
        </div>
      </aside>

      <main className="flex items-center justify-center px-4 py-12 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="mb-10 flex items-center gap-2 lg:hidden">
            <Clapperboard className="h-7 w-7 text-gold" />
            <span className="font-display text-xl font-extrabold tracking-wide">
              CINE<span className="text-gold">VERSE</span>
            </span>
          </Link>
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
