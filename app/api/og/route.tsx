
// Dynamic API routes are not supported in Next.js static export ('output: export').
// This file is temporarily disabled to ensure successful deployment to Cloudflare Pages.
// To enable dynamic Open Graph images, you would need to use '@cloudflare/next-on-pages' or Vercel.

export function GET() {
  return new Response('Dynamic OG generation disabled in static mode.', { status: 200 });
}
