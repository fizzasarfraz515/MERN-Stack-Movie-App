import { Link } from 'react-router-dom';
import { Clapperboard } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[80vh] flex-col items-center justify-center pt-24 text-center">
      <Clapperboard className="h-16 w-16 text-gold" />
      <h1 className="mt-6 text-6xl font-extrabold">404</h1>
      <p className="mt-3 text-lg text-muted">This scene didn&apos;t make the final cut.</p>
      <div className="mt-8 flex gap-3">
        <Link to="/" className="btn-primary">
          Back to home
        </Link>
        <Link to="/explore" className="btn-ghost">
          Explore movies
        </Link>
      </div>
    </div>
  );
}
