// Website-Starter-Standard L1: raw HTML schema parity + SEO drift manifest.
// Avoid claiming performance/GSC/visual results from static build artifacts.
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const read = file => readFileSync(join(process.cwd(), file), 'utf8');
const source = read('lib/data.ts');
const ids = [...source.matchAll(/^\s*id:\s*'([a-z0-9-]+-test)'/gm)].map(match => match[1]);
const paths = ['/', ...ids.map(id => '/test/' + id + '/'),
  ...['tone-generator','bpm-counter','dead-pixel-test','stereo-test','hz-test','mic-test'].map(id => '/tools/' + id + '/')];
const failures = [];
const records = [];
const findAttr = (tag, attr) => tag.match(new RegExp('\\b' + attr + '="([^"]*)"'))?.[1] ?? '';

for (const pathname of paths) {
  const file = pathname === '/' ? 'out/index.html' : 'out' + pathname + 'index.html';
  if (!existsSync(join(process.cwd(), file))) { failures.push('Missing ' + file); continue; }
  const html = read(file);
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1] ?? '';
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g,' ').trim() ?? '';
  const tags = [...html.matchAll(/<(?:link|meta)\b[^>]*>/gi)].map(x => x[0]);
  const canonical = tags.filter(x => x.startsWith('<link')).find(x => findAttr(x, 'rel') === 'canonical');
  const description = tags.filter(x => x.startsWith('<meta')).find(x => findAttr(x, 'name') === 'description');
  const hrefs = [...html.matchAll(/<a\b[^>]*href="([^"]+)"/gi)].map(x => x[1]);
  const schema = [];
  for (const script of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const value = JSON.parse(script[1]);
      schema.push(value);
    } catch (err) {
      failures.push('Invalid JSON-LD: ' + pathname + ' ' + String(err));
    }
  }
  if (!schema.length) failures.push('Missing JSON-LD in initial HTML: ' + pathname);
  if (!h1) failures.push('Missing H1 in initial HTML: ' + pathname);
  if (pathname.startsWith('/test/')) {
    const software = schema.find(x => x['@type'] === 'SoftwareApplication');
    if (!software) failures.push('Missing SoftwareApplication: ' + pathname);
    else {
      const expected = 'https://myhumanstats.org' + pathname + '#software';
      if (software['@id'] !== expected) failures.push('SoftwareApplication @id mismatch: ' + pathname);
      if (software.isPartOf?.['@id'] !== 'https://myhumanstats.org/#website') failures.push('Wrong WebSite link: ' + pathname);
    }
    if (schema.some(x => x['@type'] === 'HowTo')) failures.push('HowTo without visible step list: ' + pathname);
  }
  records.push({
    path: pathname, title, h1,
    description: description ? findAttr(description, 'content') : '',
    canonical: canonical ? findAttr(canonical, 'href') : '',
    types: schema.map(x => x['@type'] ?? x['@graph']?.map(y => y['@type']).join(',') ?? 'unknown'),
    crawlableInternalLinks: hrefs.filter(h => h.startsWith('/')).length,
    sha256: createHash('sha256').update(html).digest('hex'),
  });
}
if (records.length !== paths.length) failures.push('Route count mismatch');
if (failures.length) {
  console.error('SEO schema/source gate failed:\n' + failures.map(s => '- ' + s).join('\n'));
  process.exit(1);
}
mkdirSync(join(process.cwd(), 'reports'), { recursive: true });
writeFileSync(join(process.cwd(), 'reports/seo-baseline.json'), JSON.stringify({
  source: 'Static-export HTML snapshot (not GSC, CrUX or visual QA)',
  total: records.length,
  pages: records,
}, null, 2));
console.log('Raw HTML drift snapshot and JSON-LD gate passed for ' + records.length + ' pages.');
