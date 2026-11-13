/**
 * Tiny in-memory TTL cache. TMDB data changes slowly, so caching it
 * keeps the app fast and well below TMDB's rate limits.
 */
const MAX_ENTRIES = 500;
const store = new Map();

function get(key) {
  const entry = store.get(key);
  if (!entry) return undefined;

  if (entry.expiresAt < Date.now()) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
}

function set(key, value, ttlSeconds) {
  // Drop the oldest entry when full (Map keeps insertion order).
  if (store.size >= MAX_ENTRIES) {
    store.delete(store.keys().next().value);
  }
  store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

module.exports = { get, set };
