import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Film, Pencil, Trash2 } from 'lucide-react';
import StarRating from './StarRating';
import { imageUrl } from '../utils/image';
import { formatShortDate } from '../utils/format';

/**
 * One review. Shows edit / delete controls only when callbacks are passed
 * (i.e. when the viewer owns the review). With `showMovie`, the movie poster
 * and title are shown too, which is how the dashboard lists them.
 */
export default function ReviewCard({ review, showMovie = false, onEdit, onDelete }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const poster = imageUrl(review.moviePosterPath, 'w185');
  const authorName = review.user?.name || 'Anonymous';
  const wasEdited = review.updatedAt && review.updatedAt !== review.createdAt;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(review);
    } finally {
      // The card usually unmounts after a successful delete; this covers failures.
      setDeleting(false);
      setConfirmingDelete(false);
    }
  };

  return (
    <article className="flex gap-4 rounded-2xl border border-white/5 bg-surface p-5">
      {showMovie && (
        <Link to={`/movie/${review.movieId}`} className="hidden w-20 shrink-0 sm:block">
          {poster ? (
            <img src={poster} alt={`${review.movieTitle} poster`} className="rounded-lg" />
          ) : (
            <div className="flex aspect-[2/3] items-center justify-center rounded-lg bg-surface-raised text-muted">
              <Film className="h-6 w-6" />
            </div>
          )}
        </Link>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {!showMovie && (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 font-display font-bold text-gold">
                {authorName.charAt(0).toUpperCase()}
              </span>
            )}
            <div>
              {showMovie ? (
                <Link
                  to={`/movie/${review.movieId}`}
                  className="font-semibold transition hover:text-gold"
                >
                  {review.movieTitle}
                </Link>
              ) : (
                <p className="font-semibold">{authorName}</p>
              )}
              <p className="text-xs text-muted">
                {formatShortDate(review.createdAt)}
                {wasEdited && ' · edited'}
              </p>
            </div>
          </div>
          <StarRating value={review.rating} />
        </div>

        {review.content && (
          <p className="mt-3 whitespace-pre-line break-words text-sm leading-relaxed text-cream/85">
            {review.content}
          </p>
        )}

        {(onEdit || onDelete) && (
          <div className="mt-4 flex items-center gap-4 text-sm">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(review)}
                className="flex items-center gap-1.5 text-muted transition hover:text-gold"
              >
                <Pencil className="h-4 w-4" /> Edit
              </button>
            )}

            {onDelete && !confirmingDelete && (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="flex items-center gap-1.5 text-muted transition hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            )}

            {onDelete && confirmingDelete && (
              <span className="flex items-center gap-3">
                <span className="text-red-300">Delete this review?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="font-semibold text-red-300 hover:underline disabled:opacity-60"
                >
                  {deleting ? 'Deleting...' : 'Yes, delete'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  className="text-muted hover:text-cream"
                >
                  Cancel
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
