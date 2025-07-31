/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack handles CSS files natively in Next.js 15
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'e9538249533828c89615595ffd58bb91.r2.cloudflarestorage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig