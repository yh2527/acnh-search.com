/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
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
