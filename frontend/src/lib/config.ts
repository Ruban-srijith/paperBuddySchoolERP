const DEFAULT_PRODUCTION_BACKEND = "https://paperbuddy-backend-rjtq.onrender.com/api/v1";

export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocalhost = host === 'localhost' || host === '127.0.0.1';

    // When running in browser on hosted domain (Vercel / Netlify / Custom Domain)
    if (!isLocalhost) {
      const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
      // Use envUrl if explicitly set to a remote server (not localhost)
      if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
        return envUrl;
      }
      // Fallback to live Render backend service
      return DEFAULT_PRODUCTION_BACKEND;
    }
  }

  return process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
};
