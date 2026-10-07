/**
 * Website-Starter-Standard L1/L2: detect broken crawlable internal links,
 * missing static sitemap destinations and missing local image assets after export.
 * Checks actual generated HTML, not source-code guesses about route existence.
 * External HTTP assets, runtime navigation, redirects and field performance
 * require independent production/browser validation.
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, posix } from 'node:path';

const out = join(process.cwd(), 'out');
const domain = 'https://myhumanstats.org';
if (!existsSync(join(out, 'index.html'))) {
  console.error('Missing static export; run npm run build first.');
  process.exit(1);
}
const htmlFiles = [];
function visit(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) visit(path);
    else if (entry.name.endsWith('.html')) htmlFiles.push(path);
  }
}
visit(out);
const problems = [];
const referencedRoutes = new Set();
const foundSitemapRoutes = new Set();
const allowHost = new URL(domain).host;

function decodeEntities(value) {
  return value.replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&#x27;/gi, "'");
}
function toInternalPath(input, fromUrl) {
  const href = decodeEntities(input.trim());
  if (!href || href.startsWith('#') || /^(mailto:|tel:|javascript:|data:|blob:)/i.test(href)) return null;
  let url;
  try { url = new URL(href, domain + fromUrl); } catch { return null; }
  if (url.host !== allowHost || (url.protocol !== 'https:' && url.protocol !== 'http:')) return null;
  let path;
  try { path = decodeURIComponent(url.pathname); } catch { return null; }
  if (!path.startsWith('/') || path.includes('\\0')) return null;
  return posix.normalize(path);
}
function existsRoute(path) {
  const relative = path.replace(/^\/+/, '');
  const names = path === '/' ? ['index.html'] : [
    relative, posix.join(relative, 'index.html'),
    relative.replace(/\/$/, '') + '.html',
  ];
  return names.some(name => {
    const file = join(out, name);
    return existsSync(file) && statSync(file).isFile();
  });
}
function routeOfHtml(path) {
  const relative = path.slice(out.length).replaceAll('\\', '/');
  if (relative === '/index.html') return '/';
  if (relative.endsWith('/index.html')) return relative.slice(0, -'index.html'.length);
  return relative.replace(/\.html$/, '/');
}
function attributes(html, tag, attr) {
  const tags = [...html.matchAll(new RegExp('<' + tag + '\\b[^>]*>', 'gi'))];
  const rx = new RegExp('\\b' + attr + '="([^"]*)"', 'i');
  return tags.map(match => match[0].match(rx)?.[1]).filter(Boolean);
}
const registered = new Set(htmlFiles.map(routeOfHtml));
for (const file of htmlFiles) {
  const from = routeOfHtml(file);
  const html = readFileSync(file, 'utf8');
  for (const href of attributes(html, 'a', 'href')) {
    const local = toInternalPath(href, from);
    if (local === null) continue;
    if (!existsRoute(local)) problems.push(`Broken internal link: ${from} -> ${href}`);
    else referencedRoutes.add(local);
  }
  // Local file assets loaded by <img>; remote and inline data images are excluded.
  for (const src of attributes(html, 'img', 'src')) {
    const local = toInternalPath(src, from);
    if (local !== null && !existsRoute(local))
      problems.push(`Missing local image: ${from} -> ${src}`);
  }
}
const sitemapFile = join(out, 'sitemap.xml');
if (!existsSync(sitemapFile)) problems.push('Missing sitemap.xml');
else {
  const xml = readFileSync(sitemapFile, 'utf8');
  for (const [, href] of xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)) {
    const url = toInternalPath(href, '/');
    if (url === null) { problems.push(`Unexpected external sitemap URL: ${href}`); continue; }
    if (!existsRoute(url)) problems.push(`Sitemap points at unexported route: ${href}`);
    if (foundSitemapRoutes.has(url)) problems.push(`Duplicate sitemap URL: ${href}`);
    foundSitemapRoutes.add(url);
  }
}
if (htmlFiles.length < 45) problems.push(`Export has unexpectedly few HTML pages: ${htmlFiles.length}`);
if (problems.length) {
  console.error('Crawlable route/assets gate failed:\n' + problems.slice(0, 80).map(p => ' - ' + p).join('\n'));
  if (problems.length > 80) console.error(`... plus ${problems.length - 80} more`);
  process.exit(1);
}
console.log(`Validated ${htmlFiles.length} exported HTML files; ${referencedRoutes.size} unique linked internal routes and ${foundSitemapRoutes.size} sitemap locations.`);
console.log('Not a production redirect test, external image monitor, Lighthouse or GSC verification.');
