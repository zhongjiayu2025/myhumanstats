// Generated-HTML checks after static export. This is not a live SERP/GSC audit.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const read = path => readFileSync(join(process.cwd(), path), 'utf8');
const source = read('lib/data.ts');
const ids = [...source.matchAll(/^\s*id:\s*'([a-z0-9-]+-test)'/gm)].map(m => m[1]);
const xml = read('out/sitemap.xml');
const issues = [];
const seenTitles = new Set();

const tags = (html, tag) => [...html.matchAll(new RegExp('<' + tag + '\\b[^>]*>', 'gi'))].map(x => x[0]);
const attr = (tag, name) => tag.match(new RegExp('\\b' + name + '="([^"]*)"'))?.[1] ?? '';

for (const id of ids) {
  const file = 'out/test/' + id + '/index.html';
  if (!existsSync(join(process.cwd(), file))) {
    issues.push('Missing HTML: ' + id);
    continue;
  }
  const html = read(file);
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1] ?? '';
  if (!title || title.length < 10) issues.push('Missing title: ' + id);
  if (seenTitles.has(title)) issues.push('Duplicate title: ' + id);
  seenTitles.add(title);

  const descriptionTag = tags(html, 'meta').find(t => attr(t, 'name') === 'description') ?? '';
  const description = attr(descriptionTag, 'content');
  if (description.length < 45) issues.push('Missing/thin description: ' + id);

  const canonicalTag = tags(html, 'link').find(t => attr(t, 'rel') === 'canonical') ?? '';
  const canonical = attr(canonicalTag, 'href').replace(/\/$/, '');
  if (canonical !== 'https://myhumanstats.org/test/' + id) issues.push('Canonical mismatch: ' + id + ' -> ' + canonical);

  if (!/<h1(?:\s|>)/i.test(html)) issues.push('Missing visible H1: ' + id);
  if (!html.includes('About This Test')) issues.push('Missing educational explanation: ' + id);
  if (!html.includes('SoftwareApplication')) issues.push('Missing software schema: ' + id);
  if (tags(html, 'meta').some(t => attr(t, 'name') === 'robots' && /noindex/.test(attr(t, 'content'))))
    issues.push('Core tool accidentally noindex: ' + id);

  if (!xml.includes('https://myhumanstats.org/test/' + id)) issues.push('Not in sitemap: ' + id);
}

for (const id of ['tone-generator','bpm-counter','dead-pixel-test','stereo-test','hz-test','mic-test']) {
  const file = 'out/tools/' + id + '/index.html';
  if (!existsSync(join(process.cwd(), file))) { issues.push('Missing utility HTML: ' + id); continue; }
  const html = read(file);
  const tag = tags(html, 'link').find(t => attr(t, 'rel') === 'canonical') ?? '';
  const canonical = attr(tag, 'href').replace(/\/$/, '');
  if (canonical !== 'https://myhumanstats.org/tools/' + id) issues.push('Tool canonical mismatch: ' + id);
}
if (/https:\/\/myhumanstats\.org\/statistics\//.test(xml)) issues.push('Noindex statistics pages found in sitemap');
if (issues.length) {
  console.error('Static SEO quality gate failed:\n' + issues.map(x => ' - ' + x).join('\n'));
  process.exit(1);
}
console.log('SEO export audited: ' + ids.length + ' tests + six utility pages; canonical, title, description, H1, content and sitemap passed.');
console.log('Rankings, page speed and interactive browser functionality require independent measurement.');
