export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocalhost = host === 'localhost' || host === '127.0.0.1';

    // When running in browser on hosted domain (Vercel / Render / Netlify / Custom Domain)
    if (!isLocalhost) {
      const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
      // Use envUrl only if it points to an explicit remote server URL (not localhost)
      if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
        return envUrl;
      }
      // Fallback to relative /api/v1 path so Next.js proxies request to backend
      return '/api/v1';
    }
  }

  return process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
};
