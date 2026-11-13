import MovieCard from './MovieCard';
import { GridSkeleton } from './LoadingSkeleton';

/**
 * Responsive grid of movie cards. While `loading` is true, skeletons are
 * appended after any movies already on screen (useful for infinite scroll).
 */
export default function MovieGrid({ movies, loading = false, skeletonCount = 12 }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {movies.map((movie, index) => (
        <MovieCard key={movie.id} movie={movie} index={index % 20} />
      ))}
      {loading && <GridSkeleton count={skeletonCount} />}
    </div>
  );
}
