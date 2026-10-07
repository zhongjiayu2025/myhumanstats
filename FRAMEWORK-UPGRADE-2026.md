# Framework security and compatibility policy

Updated: 2026-10-07.

- Next.js 14.1.0 was end of life and lacked supported security fixes. Upgrade to the supported Next.js 16.3.8 and React 19.2.8 versions.
- Preserve Cloudflare Pages static output export, 35 indexed test slugs, six utility slugs, metadata/canonicals/sitemap and zero-backend architecture.
- Next.js 16 requires asynchronously resolved route params. Five dynamic pages and associated metadata functions now await params.
- Use next build --webpack to minimize bundler migration risks in this security release.
- Do not use --force or --legacy-peer-deps to mask dependency conflicts. Verify security and peer dependency versions through CI.
- CI and Cloudflare checks gate merge. Real device audio/permissions, mobile Safari and performance data still require separate acceptance.
- Confirm the production deployment is the merged main SHA, not only that a preview succeeded.
