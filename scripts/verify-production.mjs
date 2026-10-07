// Live Cloudflare production check: wait until the deployed build-info.json
// SHA matches this GitHub push, then smoke-check actual HTTP/SEO responses.
const sha = process.env.GITHUB_SHA;
const origin = 'https://myhumanstats.org';
const routes = [
  '/', '/test/cps-test/', '/test/number-memory-test/',
  '/test/perfect-pitch-test/', '/test/rhythm-test/', '/tools/mic-test/',
  '/tools/hz-test/', '/sitemap.xml', '/robots.txt'
];
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const get = async path => {
  const response = await fetch(origin + path, {
    redirect: 'follow',
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache', 'User-Agent': 'MyHumanStats-release-verification/1.0' }
  });
  if (!response.ok) throw Error(path + ' -> HTTP ' + response.status);
  return await response.text();
};

if (!sha || !/^[0-9a-f]{40}$/i.test(sha)) throw Error('Expected full GITHUB_SHA');
let deployed = false;
for (let attempt = 1; attempt <= 50; attempt++) {
  try {
    const info = JSON.parse(await get('/build-info.json?check=' + attempt));
    if (info.commit === sha) { deployed = true; break; }
    console.log('Waiting for production commit; current=' + info.commit + ', expected=' + sha);
  } catch (error) {
    console.log('Waiting for build-info.json: ' + String(error));
  }
  await sleep(10000);
}
if (!deployed) throw Error('Timed out waiting for Cloudflare production to serve ' + sha);
for (const route of routes) {
  const html = await get(route + (route.includes('?') ? '&' : '?') + 'verify=' + Date.now());
  if (route.startsWith('/test/') || route.startsWith('/tools/')) {
    const expected = origin + route.replace(/\/$/, '');
    if (!html.includes('rel="canonical"') || !html.includes(expected)) {
      throw Error('Live canonical missing or unexpected at ' + route);
    }
  }
  if (route.endsWith('.xml') && !html.includes('<urlset')) throw Error('Invalid live XML sitemap');
  console.log('Verified live HTTP 200: ' + route);
}
console.log('Verified production sha=' + sha + ' and ' + routes.length + ' live URLs.');
