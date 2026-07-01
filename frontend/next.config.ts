import type { NextConfig } from 'next'

// Resolve the backend ORIGIN (scheme + host, no trailing /api) that all
// same-origin traffic is reverse-proxied to. Everything the browser sends to
// this app's own domain under /api, /socket.io and /uploads is forwarded here,
// so the backend never appears as a separate public URL.
//
// In a deployed (production) build we refuse any localhost value so a stale
// env var can never break the single-URL proxy; locally you can point it at a
// local backend via BACKEND_URL (e.g. http://localhost:5000).
const BACKEND_ORIGIN = (() => {
  const raw = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || ''
  const origin = raw.replace(/\/api\/?$/, '').replace(/\/$/, '')
  const isLocal = /localhost|127\.0\.0\.1/.test(origin)
  if (!origin || (process.env.NODE_ENV === 'production' && isLocal)) {
    return 'https://hometown-hub-backend-un1i.onrender.com'
  }
  return origin
})()

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'randomuser.me' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
    ],
  },
  async rewrites() {
    return [
      // REST API — same-origin, no CORS.
      { source: '/api/:path*', destination: `${BACKEND_ORIGIN}/api/:path*` },
      // Socket.io realtime channel.
      { source: '/socket.io/:path*', destination: `${BACKEND_ORIGIN}/socket.io/:path*` },
      // User-uploaded static files served by the backend.
      { source: '/uploads/:path*', destination: `${BACKEND_ORIGIN}/uploads/:path*` },
    ]
  },
}

export default nextConfig
