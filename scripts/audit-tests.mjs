// Build-time source/route integrity gate. Does not replace browser interaction QA.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = p => readFileSync(join(root, p), 'utf8');
const source = read('lib/data.ts');
const registry = read('components/tests/registry.ts');
const core = read('lib/core.ts');

const allTests = [...source.matchAll(/^\s*id:\s*'([a-z0-9-]+-test)'/gm)].map(x => x[1]);
const registered = [...registry.matchAll(/^\s*'([a-z0-9-]+-test)':\s*[A-Z]\w*,?\s*$/gm)].map(x => x[1]);
const uniqueTests = new Set(allTests), uniqueRegistry = new Set(registered);
const aliases = new Set([...core.matchAll(/^\s*'([a-z0-9-]+-test)':\s*'([a-z0-9-]+)'/gm)].map(x => x[2]));
const errors = [];

if (allTests.length !== 35 || uniqueTests.size !== 35) errors.push('Expected exactly 35 unique test definitions, found ' + allTests.length);
if (registered.length !== 35 || uniqueRegistry.size !== 35) errors.push('Expected exactly 35 unique test registrations, found ' + registered.length);
for (const id of uniqueTests) {
  if (!uniqueRegistry.has(id)) errors.push('Missing test registry: ' + id);
  if (!existsSync(join(root, 'out', 'test', id, 'index.html'))) errors.push('Missing static test page: ' + id);
}
for (const id of uniqueRegistry) if (!uniqueTests.has(id)) errors.push('Registry entry without definition: ' + id);
const testFiles = readdirSync(join(root, 'components/tests')).filter(name => name.endsWith('Test.tsx'));
for (const name of testFiles) {
  const content = read('components/tests/' + name);
  const match = content.matchAll(/saveStat\(\s*['"`]([^'"`]+)['"`]/g);
  for (const [,savedId] of match) {
    if (!uniqueTests.has(savedId) && !aliases.has(savedId)) errors.push(name + ': unrecognized score ID ' + savedId);
  }
}

if (errors.length) {
  console.error('Test integrity gate failed:\n' + errors.map(x => ' - ' + x).join('\n'));
  process.exit(1);
}
console.log('Verified ' + uniqueTests.size + ' registered tests, export paths and recognized score identifiers.');
console.log('This check does NOT verify browser audio, touch performance, clinical accuracy or timer timing.');
