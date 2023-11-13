/** @type {import('next').NextConfig} */
const nextConfig = {
    output:'export',
  reactStrictMode: true,
  distDir: '_static',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'acnhcdn.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
