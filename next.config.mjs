
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  trailingSlash: true, // Point 5: URL Normalization
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
