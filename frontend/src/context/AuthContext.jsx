import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService';
import { tokenStorage } from '../services/tokenStorage';
import { AUTH_EXPIRED_EVENT } from '../utils/constants';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const toast = useToast();
  const [user, setUser] = useState(null);

  // If a token is stored we must verify it before deciding who is logged in.
  const [loading, setLoading] = useState(() => Boolean(tokenStorage.get()));

  // Restore the session after a page refresh.
  useEffect(() => {
    if (!tokenStorage.get()) return undefined;

    let cancelled = false;
    authService
      .getCurrentUser()
      .then(({ user: currentUser }) => {
        if (!cancelled) setUser(currentUser);
      })
      .catch((error) => {
        // Only discard the token if the server rejected it. If the API was just
        // unreachable, keep the token so the next refresh can try again.
        if (error.response?.status === 401) tokenStorage.remove();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const startSession = useCallback(({ user: loggedInUser, token }) => {
    tokenStorage.set(token);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const login = useCallback(
    async (credentials) => startSession(await authService.login(credentials)),
    [startSession]
  );

  const register = useCallback(
    async (details) => startSession(await authService.register(details)),
    [startSession]
  );

  const logout = useCallback(() => {
    tokenStorage.remove();
    setUser(null);
  }, []);

  // The API client fires this event when the server rejects our token.
  useEffect(() => {
    const handleExpired = () => {
      logout();
      toast.info('Your session expired. Please log in again.');
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpired);
  }, [logout, toast]);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, setUser }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
