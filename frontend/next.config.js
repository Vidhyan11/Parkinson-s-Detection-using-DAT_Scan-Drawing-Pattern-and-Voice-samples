/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable App Router (default in Next.js 13+)
  experimental: {
    // appDir is enabled by default in Next.js 13+
  },
  
  // Image domains for external images
  images: {
    domains: ['localhost', 'yourdomain.com'],
  },
  
  // API rewrites to proxy requests to backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
