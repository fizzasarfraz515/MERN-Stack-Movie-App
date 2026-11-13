import axios from 'axios';
import { API_URL, AUTH_EXPIRED_EVENT } from '../utils/constants';
import { tokenStorage } from './tokenStorage';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// Attach the JWT to every request when the user is logged in.
api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the server says our token is no longer valid, tell the auth context so it
// can log the user out. Login/register failures are normal and are skipped.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthAttempt = /^\/auth\/(login|register)/.test(error.config?.url || '');
    const hadToken = Boolean(tokenStorage.get());

    if (error.response?.status === 401 && hadToken && !isAuthAttempt) {
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
    return Promise.reject(error);
  }
);

/** Turns any Axios failure into a message that is safe to show the user. */
export function getErrorMessage(error) {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.code === 'ECONNABORTED') return 'The request took too long. Please try again.';
  if (error.request) return 'Cannot reach the server. Check your connection and try again.';
  return error.message || 'Something went wrong. Please try again.';
}

export default api;
