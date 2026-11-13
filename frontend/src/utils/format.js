export function formatYear(dateString) {
  return dateString ? dateString.slice(0, 4) : '';
}

// Dates from TMDB are plain "YYYY-MM-DD"; format in UTC so the day never shifts.
export function formatDate(dateString) {
  if (!dateString) return 'Unknown';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatShortDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatRuntime(minutes) {
  if (!minutes) return null;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (hours === 0) return `${remaining}m`;
  return remaining === 0 ? `${hours}h` : `${hours}h ${remaining}m`;
}

export function formatScore(voteAverage) {
  return voteAverage ? Number(voteAverage).toFixed(1) : null;
}

export function formatMoney(amount) {
  return amount ? `$${amount.toLocaleString('en-US')}` : 'Not available';
}

export function formatLanguage(code) {
  if (!code) return 'Unknown';
  try {
    return new Intl.DisplayNames(['en'], { type: 'language' }).of(code) || code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}
