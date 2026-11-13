import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bookmark, ChevronDown, Clapperboard, LayoutDashboard, LogOut, Menu, Search, X } from 'lucide-react';
import SearchBar from './SearchBar';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/explore', label: 'Explore' },
  { to: '/dashboard?tab=watchlist', label: 'Watchlist', requiresAuth: true },
];

const linkClass = ({ isActive }) =>
  `text-sm font-medium transition hover:text-gold ${isActive ? 'text-gold' : 'text-cream/80'}`;

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const close = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-2 rounded-full border border-white/10 bg-surface/80 py-1 pl-1 pr-3 transition hover:border-gold/50"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold font-display text-sm font-bold text-ink">
          {user.name.charAt(0).toUpperCase()}
        </span>
        <span className="hidden max-w-[7rem] truncate text-sm font-medium sm:block">
          {user.name.split(' ')[0]}
        </span>
        <ChevronDown className={`h-4 w-4 text-muted transition ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            role="menu"
            className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-white/10 bg-surface-raised shadow-2xl"
          >
            <div className="border-b border-white/10 px-4 py-3">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
            <Link
              to="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm transition hover:bg-white/5"
              role="menuitem"
            >
              <LayoutDashboard className="h-4 w-4 text-gold" /> Dashboard
            </Link>
            <Link
              to="/dashboard?tab=watchlist"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm transition hover:bg-white/5"
              role="menuitem"
            >
              <Bookmark className="h-4 w-4 text-gold" /> My watchlist
            </Link>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="flex w-full items-center gap-3 border-t border-white/10 px-4 py-3 text-left text-sm text-red-300 transition hover:bg-white/5"
              role="menuitem"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Become solid once the page scrolls so text never fights with the hero image.
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close the mobile panels after navigating.
  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const visibleLinks = NAV_LINKS.filter((link) => !link.requiresAuth || user);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition duration-300 ${
        scrolled || mobileOpen
          ? 'border-b border-white/5 bg-ink/90 backdrop-blur-xl'
          : 'bg-gradient-to-b from-ink/90 to-transparent'
      }`}
    >
      <div className="container-page flex h-16 items-center gap-6 sm:h-20">
        <Link to="/" className="flex items-center gap-2" aria-label="CineVerse home">
          <Clapperboard className="h-7 w-7 text-gold" />
          <span className="font-display text-xl font-extrabold tracking-wide">
            CINE<span className="text-gold">VERSE</span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-6 md:flex" aria-label="Main">
          {visibleLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto hidden w-full max-w-xs lg:block xl:max-w-sm">
          <SearchBar />
        </div>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <button
            type="button"
            onClick={() => setSearchOpen((current) => !current)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-cream/80 transition hover:bg-white/10 lg:hidden"
            aria-label="Toggle search"
          >
            {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </button>

          {user ? (
            <UserMenu user={user} onLogout={handleLogout} />
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link to="/login" className="btn-ghost py-2">
                Log in
              </Link>
              <Link to="/register" className="btn-primary py-2">
                Sign up
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((current) => !current)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-cream/80 transition hover:bg-white/10 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="container-page lg:hidden"
          >
            <div className="pb-4">
              <SearchBar autoFocus onNavigate={() => setSearchOpen(false)} />
            </div>
          </motion.div>
        )}

        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden md:hidden"
            aria-label="Mobile"
          >
            <div className="container-page flex flex-col gap-1 pb-5">
              {visibleLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `rounded-xl px-3 py-3 text-base font-medium ${
                      isActive ? 'bg-white/5 text-gold' : 'text-cream/80'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              {!user && (
                <div className="mt-3 flex gap-3 sm:hidden">
                  <Link to="/login" className="btn-ghost flex-1">
                    Log in
                  </Link>
                  <Link to="/register" className="btn-primary flex-1">
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
