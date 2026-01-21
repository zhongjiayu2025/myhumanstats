
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Required for standard Cloudflare Pages hosting
  reactStrictMode: true,
  images: {
    unoptimized: true, // Required for static export (Next.js Image Optimization needs a server)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
