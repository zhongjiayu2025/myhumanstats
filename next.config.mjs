
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 关键：告诉 Next.js 生成静态 HTML 文件
  reactStrictMode: true,
  images: {
    unoptimized: true, // 关键：Cloudflare Pages 不支持 Next.js 的默认图片优化服务器，必须关闭
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
