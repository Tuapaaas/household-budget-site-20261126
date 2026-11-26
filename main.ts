// Hearth & Ledger — the program that hands the site in (Node stdlib only).
// It copies app/ and screenshots/ from beside this file to /output and writes
// /output/dossier.json with the vendored make.fun library, as the kit asks.
// It refuses to hand in a half-built entry: app/index.html and at least three
// screenshots must be present, or it exits non-zero before writing anything.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function fail(message) {
  console.error('main.ts: ' + message);
  process.exit(1);
}

if (!existsSync(join(here, 'app', 'index.html'))) fail('app/index.html is missing — nothing to hand in.');
const shots = existsSync(join(here, 'screenshots'))
  ? readdirSync(join(here, 'screenshots')).filter((f) => statSync(join(here, 'screenshots', f)).isFile())
  : [];
if (shots.length < 3) fail(`only ${shots.length} screenshot(s) in screenshots/ — need at least 3.`);

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 16777216 }),
);
console.log(`Hearth & Ledger handed in to ${out} (${shots.length} screenshots, dossier written)`);
