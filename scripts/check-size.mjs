// Fails when the first-load assets (HTML, JS, CSS, Latin font files) exceed 200 KB gzipped.
// Flag SVGs and map region chunks are excluded: they load per question or per map level.
import { readdirSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const LIMIT = 200 * 1024;
const dist = new URL('../dist/', import.meta.url);
const assets = new URL('assets/', dist);

/** Map chunks (src/games/map/data/ regions and the Netherlands map), loaded when a map level opens. */
const REGION_CHUNK = /^(europe|americas|africa|asia-oceania|nl)-[\w-]+\.js$/;

const isFirstLoad = (file) =>
  !REGION_CHUNK.test(file) && (/\.(js|css)$/.test(file) || (/\.woff2$/.test(file) && /-latin-\d+-/.test(file)));

const files = [
  new URL('index.html', dist),
  ...readdirSync(assets).filter(isFirstLoad).map((f) => new URL(f, assets)),
];

let total = 0;
for (const file of files) {
  const size = gzipSync(readFileSync(file)).length;
  total += size;
  console.log(`${(size / 1024).toFixed(1).padStart(7)} KB  ${file.pathname.split('/dist/')[1]}`);
}
console.log(`${(total / 1024).toFixed(1).padStart(7)} KB  total (limit ${LIMIT / 1024} KB)`);
if (total > LIMIT) {
  console.error('Size budget exceeded');
  process.exit(1);
}
