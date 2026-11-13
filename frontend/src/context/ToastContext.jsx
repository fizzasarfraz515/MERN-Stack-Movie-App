import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const TOAST_DURATION_MS = 4000;
const MAX_VISIBLE_TOASTS = 3;

const TOAST_STYLES = {
  success: { icon: CheckCircle2, color: 'text-emerald-400' },
  error: { icon: AlertCircle, color: 'text-red-400' },
  info: { icon: Info, color: 'text-gold' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (type, message) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((current) => [...current.slice(-(MAX_VISIBLE_TOASTS - 1)), { id, type, message }]);
      setTimeout(() => dismiss(id), TOAST_DURATION_MS);
    },
    [dismiss]
  );

  // Stable object so components can safely use it in effect dependencies.
  const toast = useMemo(
    () => ({
      success: (message) => show('success', message),
      error: (message) => show('error', message),
      info: (message) => show('info', message),
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}

      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6"
        aria-live="polite"
      >
        <AnimatePresence>
          {toasts.map(({ id, type, message }) => {
            const { icon: Icon, color } = TOAST_STYLES[type];
            return (
              <motion.div
                key={id}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.2 }}
                className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-white/10 bg-surface-raised/95 p-4 shadow-2xl backdrop-blur"
                role="status"
              >
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${color}`} />
                <p className="flex-1 text-sm leading-snug">{message}</p>
                <button
                  type="button"
                  onClick={() => dismiss(id)}
                  className="text-muted transition hover:text-cream"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside <ToastProvider>');
  return context;
}
