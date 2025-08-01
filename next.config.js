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
      {
        protocol: 'https',
        hostname: 'pub-3b0f941c513a84f3fae53faec5de8b7e9.r2.dev',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
