/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          }, 
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://bikeeasy.org https://www.bikeeasy.org",
          },
        ],
      },
    ];
  },
}

export default nextConfig