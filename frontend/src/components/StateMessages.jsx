import { AlertTriangle, RefreshCw } from 'lucide-react';

/** Friendly "nothing here" panel. `icon` is a lucide component, `action` any node. */
export function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-surface/40 px-6 py-16 text-center">
      {Icon && (
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 text-gold">
          <Icon className="h-8 w-8" />
        </div>
      )}
      <h3 className="text-xl font-semibold">{title}</h3>
      {message && <p className="mt-2 max-w-md text-sm text-muted">{message}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/** Error panel with an optional retry button. */
export function ErrorState({ message, onRetry, compact = false }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-3xl border border-red-400/20 bg-red-500/5 text-center ${
        compact ? 'px-4 py-8' : 'px-6 py-16'
      }`}
      role="alert"
    >
      <AlertTriangle className="mb-3 h-8 w-8 text-red-300" />
      <p className="max-w-md text-sm text-cream/90">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-ghost mt-5">
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      )}
    </div>
  );
}
