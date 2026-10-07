import { writeFileSync } from 'node:fs';

// Build metadata provides a reliable, public proof of which commit Cloudflare
// actually serves. Only a commit SHA and branch are exported; no secrets.
const buildSha = process.env.CF_PAGES_COMMIT_SHA || process.env.GITHUB_SHA;
if (buildSha && /^[0-9a-f]{40}$/i.test(buildSha)) {
  writeFileSync(new URL('./public/build-info.json', import.meta.url), JSON.stringify({
    commit: buildSha,
    branch: process.env.CF_PAGES_BRANCH || process.env.GITHUB_REF_NAME || 'unknown'
  }));
}


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
