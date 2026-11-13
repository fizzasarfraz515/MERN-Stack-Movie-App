/**
 * Row of genre chips. `selectedId` is the active genre (or null for all).
 * Set `showAll={false}` for places where "All" makes no sense.
 */
export default function GenreFilter({ genres, selectedId = null, onSelect, showAll = true }) {
  const chipClass = (active) =>
    `shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
      active
        ? 'border-gold bg-gold text-ink'
        : 'border-white/10 bg-surface text-cream/80 hover:border-gold/50 hover:text-gold'
    }`;

  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      {showAll && (
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={chipClass(selectedId === null)}
          aria-pressed={selectedId === null}
        >
          All
        </button>
      )}
      {genres.map((genre) => (
        <button
          key={genre.id}
          type="button"
          onClick={() => onSelect(genre.id)}
          className={chipClass(selectedId === genre.id)}
          aria-pressed={selectedId === genre.id}
        >
          {genre.name}
        </button>
      ))}
    </div>
  );
}
