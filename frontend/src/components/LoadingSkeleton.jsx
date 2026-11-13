/** Shimmering placeholders shown while real data is loading. */

export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function MovieCardSkeleton({ className = '' }) {
  return (
    <div className={className}>
      <Skeleton className="aspect-[2/3] w-full rounded-xl" />
      <Skeleton className="mt-3 h-4 w-3/4" />
      <Skeleton className="mt-2 h-3 w-1/3" />
    </div>
  );
}

export function GridSkeleton({ count = 12 }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <MovieCardSkeleton key={index} />
      ))}
    </>
  );
}

export function CarouselSkeleton({ count = 8 }) {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: count }, (_, index) => (
        <MovieCardSkeleton key={index} className="w-36 shrink-0 sm:w-44 lg:w-48" />
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative h-[70vh] min-h-[480px] w-full bg-surface">
      <div className="container-page flex h-full flex-col justify-end pb-20">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-4 h-12 w-full max-w-xl" />
        <Skeleton className="mt-5 h-4 w-full max-w-lg" />
        <Skeleton className="mt-2 h-4 w-2/3 max-w-md" />
        <div className="mt-8 flex gap-3">
          <Skeleton className="h-11 w-36 rounded-full" />
          <Skeleton className="h-11 w-44 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function DetailsSkeleton() {
  return (
    <div>
      <Skeleton className="h-[50vh] min-h-[360px] w-full rounded-none" />
      <div className="container-page -mt-40 flex flex-col gap-8 md:flex-row">
        <Skeleton className="aspect-[2/3] w-56 shrink-0 self-center rounded-2xl md:self-start" />
        <div className="flex-1 pt-4 md:pt-24">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="mt-4 h-4 w-1/2" />
          <div className="mt-6 flex gap-2">
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-16 rounded-full" />
          </div>
          <Skeleton className="mt-8 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}

export function ReviewSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="rounded-2xl border border-white/5 bg-surface p-5">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-2 h-3 w-24" />
            </div>
          </div>
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}
