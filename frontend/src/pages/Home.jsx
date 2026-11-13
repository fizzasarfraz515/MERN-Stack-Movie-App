import { useNavigate } from 'react-router-dom';
import HeroBanner from '../components/HeroBanner';
import MovieCarousel from '../components/MovieCarousel';
import GenreFilter from '../components/GenreFilter';
import useAsync from '../hooks/useAsync';
import useGenres from '../hooks/useGenres';
import { getCategory } from '../services/movieService';

/** One horizontally scrolling row that loads its own TMDB category. */
function CategoryRow({ category, title, subtitle }) {
  const { data, loading, error, reload } = useAsync(() => getCategory(category), [category]);

  return (
    <MovieCarousel
      title={title}
      subtitle={subtitle}
      movies={data?.results}
      loading={loading}
      error={error}
      onRetry={reload}
      viewAllTo={`/explore?category=${category}`}
    />
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { genres, getGenreNames } = useGenres();
  const trending = useAsync(() => getCategory('trending'), []);

  return (
    <div className="pb-8">
      <HeroBanner
        movies={trending.data?.results}
        loading={trending.loading}
        error={trending.error}
        onRetry={trending.reload}
        getGenreNames={getGenreNames}
      />

      {genres.length > 0 && (
        <section className="container-page pb-2 pt-10">
          <h2 className="mb-4 text-2xl font-bold sm:text-3xl">Browse by genre</h2>
          <GenreFilter
            genres={genres}
            showAll={false}
            onSelect={(genreId) => navigate(`/explore?genre=${genreId}`)}
          />
        </section>
      )}

      <MovieCarousel
        title="Trending this week"
        subtitle="What everyone is watching right now"
        movies={trending.data?.results}
        loading={trending.loading}
        error={trending.error}
        onRetry={trending.reload}
        viewAllTo="/explore?category=trending"
      />
      <CategoryRow category="popular" title="Popular" subtitle="Crowd favorites today" />
      <CategoryRow category="top_rated" title="Top rated" subtitle="Critically loved, all time" />
      <CategoryRow category="upcoming" title="Upcoming" subtitle="Coming soon to theaters" />
      <CategoryRow category="now_playing" title="Now playing" subtitle="In theaters right now" />
    </div>
  );
}
