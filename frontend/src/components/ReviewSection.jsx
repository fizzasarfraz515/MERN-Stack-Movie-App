import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Loader2, MessageSquareText, Star } from 'lucide-react';
import ReviewCard from './ReviewCard';
import StarRating from './StarRating';
import { ReviewSkeleton } from './LoadingSkeleton';
import { EmptyState, ErrorState } from './StateMessages';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../services/api';
import * as reviewService from '../services/reviewService';

const MAX_REVIEW_LENGTH = 2000;

/**
 * Community ratings + reviews for one movie, plus the form where the
 * logged-in user rates, writes, edits or deletes their own review.
 * Render it with `key={movie.id}` so its state resets between movies.
 */
export default function ReviewSection({ movie }) {
  const { user } = useAuth();
  const toast = useToast();
  const location = useLocation();

  // Everyone's reviews
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ average: 0, count: 0 });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [loadError, setLoadError] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // The current user's own review and the form
  const [myReview, setMyReview] = useState(null);
  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadFirstPage = useCallback(async () => {
    try {
      const data = await reviewService.getMovieReviews(movie.id, 1);
      setReviews(data.reviews);
      setStats(data.stats);
      setPage(1);
      setTotalPages(data.totalPages);
      setStatus('ready');
    } catch (error) {
      setLoadError(getErrorMessage(error));
      setStatus('error');
    }
  }, [movie.id]);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  const userId = user?._id;

  useEffect(() => {
    if (!userId) {
      setMyReview(null);
      return undefined;
    }

    let cancelled = false;
    reviewService
      .getMyReviewForMovie(movie.id)
      .then(({ review }) => {
        if (!cancelled) setMyReview(review);
      })
      .catch(() => {
        /* The form still works; saving will report any real problem. */
      });

    return () => {
      cancelled = true;
    };
  }, [userId, movie.id]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const data = await reviewService.getMovieReviews(movie.id, page + 1);
      setReviews((current) => [...current, ...data.reviews]);
      setPage(page + 1);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoadingMore(false);
    }
  };

  const startEditing = (review) => {
    setRating(review.rating);
    setContent(review.content || '');
    setFormError('');
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setFormError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (rating < 1) {
      setFormError('Please choose a star rating first.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      const payload = { rating, content: content.trim() };
      const { review } = myReview
        ? await reviewService.updateReview(myReview._id, payload)
        : await reviewService.createReview({
            ...payload,
            movieId: movie.id,
            movieTitle: movie.title,
            moviePosterPath: movie.poster_path || null,
          });

      setMyReview(review);
      setEditing(false);
      setRating(0);
      setContent('');
      toast.success(myReview ? 'Your review was updated.' : 'Thanks for sharing your review!');
      loadFirstPage(); // refresh the list and the community average
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (review) => {
    try {
      await reviewService.deleteReview(review._id);
      setMyReview(null);
      setRating(0);
      setContent('');
      toast.success('Your review was deleted.');
      loadFirstPage();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  // The user's own review has its own card above, so leave it out of the list.
  const otherReviews = reviews.filter((review) => review._id !== myReview?._id);
  const showForm = user && (!myReview || editing);

  return (
    <section id="reviews" className="container-page scroll-mt-28 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-2xl font-bold sm:text-3xl">Reviews</h2>

        {stats.count > 0 && (
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-surface px-4 py-2">
            <Star className="h-5 w-5 text-gold" fill="currentColor" />
            <span className="font-display text-lg font-bold">{stats.average.toFixed(1)}</span>
            <span className="text-sm text-muted">
              from {stats.count} {stats.count === 1 ? 'rating' : 'ratings'} on CineVerse
            </span>
          </div>
        )}
      </div>

      {/* Your review, or the form to write one */}
      {!user && (
        <div className="mb-8 rounded-2xl border border-white/10 bg-surface p-6 text-center">
          <p className="text-sm text-cream/80">Log in to rate this movie and write a review.</p>
          <Link to="/login" state={{ from: location }} className="btn-primary mt-4">
            Log in
          </Link>
        </div>
      )}

      {user && myReview && !editing && (
        <div className="mb-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-gold">
            Your review
          </p>
          <ReviewCard review={myReview} onEdit={startEditing} onDelete={handleDelete} />
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-2xl border border-gold/20 bg-surface p-6"
          noValidate
        >
          <h3 className="text-lg font-semibold">
            {myReview ? 'Edit your review' : `What did you think of ${movie.title}?`}
          </h3>

          <div className="mt-4">
            <StarRating value={rating} onChange={setRating} size="lg" />
          </div>

          <label htmlFor="review-content" className="sr-only">
            Your review
          </label>
          <textarea
            id="review-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            maxLength={MAX_REVIEW_LENGTH}
            rows={4}
            placeholder="Write your thoughts (optional)..."
            className="input mt-4 resize-y"
          />
          <p className="mt-1 text-right text-xs text-muted">
            {content.length}/{MAX_REVIEW_LENGTH}
          </p>

          {formError && (
            <p className="mt-2 text-sm text-red-300" role="alert">
              {formError}
            </p>
          )}

          <div className="mt-4 flex gap-3">
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {myReview ? 'Save changes' : 'Post review'}
            </button>
            {editing && (
              <button type="button" onClick={cancelEditing} className="btn-ghost">
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {/* Everyone else's reviews */}
      {status === 'loading' && <ReviewSkeleton />}

      {status === 'error' && <ErrorState message={loadError} onRetry={loadFirstPage} compact />}

      {status === 'ready' && otherReviews.length === 0 && !myReview && (
        <EmptyState
          icon={MessageSquareText}
          title="No reviews yet"
          message="Be the first to share what you thought about this movie."
        />
      )}

      {status === 'ready' && otherReviews.length > 0 && (
        <div className="space-y-4">
          {otherReviews.map((review) => (
            <ReviewCard key={review._id} review={review} />
          ))}
        </div>
      )}

      {status === 'ready' && page < totalPages && (
        <div className="mt-6 text-center">
          <button type="button" onClick={loadMore} disabled={loadingMore} className="btn-ghost">
            {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
            Load more reviews
          </button>
        </div>
      )}
    </section>
  );
}
