/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove standalone for Netlify - use default serverless
  trailingSlash: false,
  
  env: {
    NEXT_PUBLIC_ETHERSCAN_API_KEY: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY,
    NEXT_PUBLIC_COINGECKO_API_KEY: process.env.NEXT_PUBLIC_COINGECKO_API_KEY,
  },
  images: {
    domains: ['images.unsplash.com', 'assets.coingecko.com'],
    unoptimized: true, // Required for static export
  },
  
  // Configure for Netlify deployment
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

export default nextConfig;
