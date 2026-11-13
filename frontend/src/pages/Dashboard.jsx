import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bookmark,
  Check,
  Clock,
  Heart,
  Loader2,
  MessageSquareText,
  Pencil,
  Star,
  X,
} from 'lucide-react';
import MovieGrid from '../components/MovieGrid';
import ReviewCard from '../components/ReviewCard';
import { GridSkeleton, ReviewSkeleton } from '../components/LoadingSkeleton';
import { EmptyState, ErrorState } from '../components/StateMessages';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useWatchlist } from '../context/WatchlistContext';
import useAsync from '../hooks/useAsync';
import { getErrorMessage } from '../services/api';
import { deleteReview, getMyReviews } from '../services/reviewService';
import { getProfile, updateProfile } from '../services/userService';
import { LIST_TYPES } from '../utils/constants';
import { formatDate } from '../utils/format';
import { savedToMovie } from '../utils/movieMappers';

const TABS = [
  { key: 'watchlist', label: 'Watchlist', icon: Bookmark },
  { key: 'favorites', label: 'Favorites', icon: Heart },
  { key: 'reviews', label: 'My reviews', icon: MessageSquareText },
  { key: 'recent', label: 'Recently viewed', icon: Clock },
];

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-surface p-5">
      <Icon className="h-5 w-5 text-gold" />
      <p className="mt-3 font-display text-3xl font-bold">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}

/** Name + email + join date, with inline editing of the name. */
function ProfileHeader({ user, onSave }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const startEditing = () => {
    setName(user.name);
    setError('');
    setEditing(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    if (name.trim() === user.name) {
      setEditing(false);
      return;
    }

    setSaving(true);
    try {
      await onSave(name.trim());
      setEditing(false);
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gold font-display text-3xl font-extrabold text-ink">
        {user.name.charAt(0).toUpperCase()}
      </div>

      <div className="min-w-0 flex-1">
        {editing ? (
          <form onSubmit={handleSubmit} className="flex flex-wrap items-start gap-2">
            <div>
              <label htmlFor="profile-name" className="sr-only">
                Name
              </label>
              <input
                id="profile-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={50}
                autoFocus
                className="input py-2"
              />
              {error && <p className="mt-1 text-xs text-red-300">{error}</p>}
            </div>
            <button type="submit" disabled={saving} className="btn-primary px-4 py-2.5" aria-label="Save name">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="btn-ghost px-4 py-2.5"
              aria-label="Cancel"
            >
              <X className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-3">
            <h1 className="truncate text-3xl font-extrabold sm:text-4xl">{user.name}</h1>
            <button
              type="button"
              onClick={startEditing}
              className="text-muted transition hover:text-gold"
              aria-label="Edit name"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        )}
        <p className="mt-1 text-sm text-muted">{user.email}</p>
        {user.createdAt && (
          <p className="text-xs text-muted">Member since {formatDate(user.createdAt.slice(0, 10))}</p>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { lists, loading: listsLoading } = useWatchlist();
  const [searchParams, setSearchParams] = useSearchParams();

  const requestedTab = searchParams.get('tab');
  const activeTab = TABS.some((tab) => tab.key === requestedTab) ? requestedTab : 'watchlist';

  const profile = useAsync(() => getProfile(), []);
  const reviewsQuery = useAsync(() => getMyReviews(), []);
  const [deletedReviewIds, setDeletedReviewIds] = useState(() => new Set());

  const reviews = (reviewsQuery.data?.reviews || []).filter(
    (review) => !deletedReviewIds.has(review._id)
  );
  const averageRating = reviews.length
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '–';

  const recentlyViewed = (profile.data?.user.recentlyViewed || []).map((item) => ({
    id: item.movieId,
    title: item.title,
    poster_path: item.posterPath,
  }));

  const counts = {
    watchlist: lists[LIST_TYPES.WATCHLIST].length,
    favorites: lists[LIST_TYPES.FAVORITES].length,
    reviews: reviews.length,
    recent: recentlyViewed.length,
  };

  const handleSaveName = async (name) => {
    const { user: updatedUser } = await updateProfile(name);
    setUser(updatedUser);
    toast.success('Your name was updated.');
  };

  const handleDeleteReview = async (review) => {
    try {
      await deleteReview(review._id);
      setDeletedReviewIds((current) => new Set(current).add(review._id));
      toast.success('Review deleted.');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const renderSavedList = (listType, emptyIcon, emptyTitle, emptyMessage) => {
    if (listsLoading) {
      return (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          <GridSkeleton count={6} />
        </div>
      );
    }
    if (lists[listType].length === 0) {
      return (
        <EmptyState
          icon={emptyIcon}
          title={emptyTitle}
          message={emptyMessage}
          action={
            <Link to="/explore" className="btn-primary">
              Find movies
            </Link>
          }
        />
      );
    }
    return <MovieGrid movies={lists[listType].map(savedToMovie)} />;
  };

  return (
    <div className="container-page pb-8 pt-28 sm:pt-32">
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <ProfileHeader user={user} onSave={handleSaveName} />

        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={Bookmark} label="In watchlist" value={counts.watchlist} />
          <StatCard icon={Heart} label="Favorites" value={counts.favorites} />
          <StatCard icon={MessageSquareText} label="Reviews written" value={counts.reviews} />
          <StatCard icon={Star} label="Your average rating" value={averageRating} />
        </div>
      </motion.section>

      {/* Tabs */}
      <div
        className="no-scrollbar -mx-4 mt-12 flex gap-2 overflow-x-auto border-b border-white/10 px-4 sm:mx-0 sm:px-0"
        role="tablist"
      >
        {TABS.map(({ key, label, icon: Icon }) => {
          const active = key === activeTab;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSearchParams({ tab: key })}
              className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                active
                  ? 'border-gold text-gold'
                  : 'border-transparent text-muted hover:text-cream'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">{counts[key]}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-8" role="tabpanel">
        {activeTab === 'watchlist' &&
          renderSavedList(
            LIST_TYPES.WATCHLIST,
            Bookmark,
            'Your watchlist is empty',
            'Tap the bookmark on any movie to save it here for later.'
          )}

        {activeTab === 'favorites' &&
          renderSavedList(
            LIST_TYPES.FAVORITES,
            Heart,
            'No favorites yet',
            'Tap the heart on the movies you love and they will show up here.'
          )}

        {activeTab === 'reviews' && (
          <>
            {reviewsQuery.loading && <ReviewSkeleton />}
            {reviewsQuery.error && (
              <ErrorState message={reviewsQuery.error} onRetry={reviewsQuery.reload} />
            )}
            {!reviewsQuery.loading && !reviewsQuery.error && reviews.length === 0 && (
              <EmptyState
                icon={MessageSquareText}
                title="You have not reviewed anything yet"
                message="Open any movie and rate it to see it listed here."
                action={
                  <Link to="/explore" className="btn-primary">
                    Find a movie to rate
                  </Link>
                }
              />
            )}
            {!reviewsQuery.loading && reviews.length > 0 && (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard
                    key={review._id}
                    review={review}
                    showMovie
                    onEdit={(item) => navigate(`/movie/${item.movieId}#reviews`)}
                    onDelete={handleDeleteReview}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'recent' && (
          <>
            {profile.loading && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                <GridSkeleton count={6} />
              </div>
            )}
            {profile.error && <ErrorState message={profile.error} onRetry={profile.reload} />}
            {!profile.loading && !profile.error && recentlyViewed.length === 0 && (
              <EmptyState
                icon={Clock}
                title="Nothing here yet"
                message="Movies you open will appear here so you can find them again."
                action={
                  <Link to="/" className="btn-primary">
                    Browse movies
                  </Link>
                }
              />
            )}
            {!profile.loading && recentlyViewed.length > 0 && <MovieGrid movies={recentlyViewed} />}
          </>
        )}
      </div>
    </div>
  );
}
