/** @type {import('next').NextConfig} */
const rawBackend = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://paperbuddy-backend-rjtq.onrender.com';
const BACKEND_URL = rawBackend.replace(/\/api\/v1\/?$/, '');

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    minimumCacheTTL: 86400,
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${BACKEND_URL}/api/v1/:path*`,
      },
    ];
  },
};

let withPWA = (config) => config;
try {
  const pwaInit = require("@ducanh2912/next-pwa");
  const pwaFunc = pwaInit.default || pwaInit;
  if (typeof pwaFunc === 'function') {
    withPWA = pwaFunc({
      dest: "public",
      disable: process.env.NODE_ENV === "development",
      register: true,
      skipWaiting: true,
      workboxOptions: {
        disableDevLogs: true,
      },
    });
  }
} catch (e) {
  console.warn("Notice: @ducanh2912/next-pwa package not found, proceeding with standard next config.");
}

module.exports = withPWA(nextConfig);

