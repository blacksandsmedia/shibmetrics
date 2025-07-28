/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize for Netlify deployment
  output: 'standalone',
  trailingSlash: true,
  
  env: {
    NEXT_PUBLIC_ETHERSCAN_API_KEY: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY,
    NEXT_PUBLIC_COINGECKO_API_KEY: process.env.NEXT_PUBLIC_COINGECKO_API_KEY,
  },
  images: {
    domains: ['images.unsplash.com', 'assets.coingecko.com'],
    unoptimized: true, // Required for static export
  },
  
  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
