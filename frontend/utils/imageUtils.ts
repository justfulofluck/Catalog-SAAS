/**
 * Utility to normalize image URLs for canvas and browser display.
 * 
 * - Rewrites backend media URLs (e.g. http://127.0.0.1:8000/media/... or http://localhost:8000/media/...)
 *   to relative paths (/media/...) so requests use the same-origin Vite proxy without CORS issues.
 * - Replaces deprecated / 404 remote placeholder URLs with reliable working images.
 */
export function normalizeImageUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return trimmed;

  // Handle broken / deprecated Unsplash image from old demo data
  if (trimmed.includes('photo-1540518614846-7ede433c4ef5')) {
    return 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=600';
  }

  // If URL points to backend media on localhost/127.0.0.1 or LAN IP, strip host to make it relative
  const mediaIdx = trimmed.indexOf('/media/');
  if (mediaIdx !== -1) {
    return trimmed.substring(mediaIdx);
  }

  return trimmed;
}
