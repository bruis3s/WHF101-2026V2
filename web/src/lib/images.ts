/**
 * Sanitizes image URLs to prevent data URIs and invalid strings
 * from reaching the client bundle or Next.js Image component.
 */
export function sanitizeImageUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (trimmed.startsWith('data:') || trimmed.length === 0) {
    return null;
  }
  return trimmed;
}

