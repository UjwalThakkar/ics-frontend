/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable TypeScript and ESLint checking during build for faster deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {},
  basePath: "",
  assetPrefix: "",
  // Override type checking in production
  env: {
    SKIP_ENV_VALIDATION: "true",
  },
  // ✨ ADD THIS: Configure headers to allow API requests
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              // ✨ IMPORTANT: Add your PHP backend URL here
              "connect-src 'self' http://localhost:8000 https://api.whatsapp.com",
              "frame-ancestors 'none'",
              "base-uri 'self'"
            ].join('; ')
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig;
