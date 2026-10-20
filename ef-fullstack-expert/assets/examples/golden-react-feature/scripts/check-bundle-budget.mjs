// Fails the build when the JavaScript needed for first render exceeds the budget.
// Budget = gzip size of the entry chunk and its static imports (modulepreload), not lazy routes.
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';

const BUDGET_KB = Number(process.env.INITIAL_JS_BUDGET_KB ?? 150);
const dist = 'dist';
const html = readFileSync(join(dist, 'index.html'), 'utf8');
const files = [...html.matchAll(/(?:src|href)="\/(assets\/[^"]+\.js)"/g)].map((m) => m[1]);
let total = 0;
for (const file of new Set(files)) {
  const kb = gzipSync(readFileSync(join(dist, file))).length / 1024;
  total += kb;
  console.log(`${file.padEnd(40)} ${kb.toFixed(1)} KB gzip`);
}
console.log(`initial JS: ${total.toFixed(1)} KB gzip (budget ${BUDGET_KB} KB)`);
if (total > BUDGET_KB) {
  console.error('Initial JS budget exceeded: analyze the bundle before raising the budget.');
  process.exit(1);
}
