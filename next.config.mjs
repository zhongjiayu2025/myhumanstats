
/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Removed to enable Image Optimization and dynamic server features
  reactStrictMode: true,
  images: {
    // unoptimized: true, // Removed to allow Next.js to optimize images (WebP/AVIF/Resizing)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
