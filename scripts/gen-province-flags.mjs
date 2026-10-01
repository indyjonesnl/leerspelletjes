// Downloads the 12 Dutch province flags from Wikimedia Commons into public/flags-nl/ and records where each
// came from in src/games/nederland/data/flags-licences.json. Run by hand (needs network): npm run gen:province-flags.
// The output is committed; nothing is fetched at runtime. A file whose licence is not public domain / CC0 stops the run.
import { mkdirSync, writeFileSync } from 'node:fs';

/** Our province code (see src/games/nederland/provinces.ts) → file title on Wikimedia Commons. */
const FILES = {
  GR: 'Flag of Groningen (province).svg',
  FR: 'Flag of Friesland.svg',
  DR: 'Flag of Drenthe.svg',
  OV: 'Flag of Overijssel.svg',
  FL: 'Flag of Flevoland.svg',
  GE: 'Flag of Gelderland.svg',
  UT: 'Flag of Utrecht (province).svg',
  NH: 'Flag of North Holland.svg',
  ZH: 'Flag of South Holland.svg',
  ZE: 'Flag of Zeeland.svg',
  NB: 'Flag of North Brabant.svg',
  LI: 'Flag of Limburg (Netherlands).svg',
};

const ALLOWED_LICENCES = new Set(['Public domain', 'CC0']);
const USER_AGENT = 'leerspelletjes-flag-generator/1.0 (https://github.com/indyjonesnl/leerspelletjes)';
const MAX_BYTES = 400 * 1024;
const outDir = new URL('../public/flags-nl/', import.meta.url);
const licencesFile = new URL('../src/games/nederland/data/flags-licences.json', import.meta.url);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** fetch with a descriptive User-Agent; waits and retries when Wikimedia answers 429 (too many requests). */
async function get(url) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (res.status !== 429 || attempt === 5) {
      if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
      return res;
    }
    await sleep(5000 * attempt);
  }
}

async function fileInfo(title) {
  const query = new URLSearchParams({
    action: 'query', titles: `File:${title}`, redirects: '1', prop: 'imageinfo',
    iiprop: 'url|extmetadata', iiextmetadatafilter: 'LicenseShortName', format: 'json',
  });
  const json = await (await get(`https://commons.wikimedia.org/w/api.php?${query}`)).json();
  const page = Object.values(json.query.pages)[0];
  const info = page.imageinfo?.[0];
  if (!info) throw new Error(`${title}: not found on Commons`);
  return { page: page.title, url: info.url.split('?')[0], licence: info.extmetadata?.LicenseShortName?.value ?? '' };
}

mkdirSync(outDir, { recursive: true });
const licences = {};
for (const [code, title] of Object.entries(FILES)) {
  const info = await fileInfo(title);
  if (!ALLOWED_LICENCES.has(info.licence)) {
    throw new Error(`${code} ${info.page}: licence "${info.licence}" is not public domain or CC0. Not using it.`);
  }
  await sleep(1500);
  const svg = await (await get(info.url)).text();
  if (!/^\s*(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)?(<!DOCTYPE[^>]*>\s*)?<svg[\s>]/i.test(svg)) throw new Error(`${code}: not an SVG`);
  if (/<script|<foreignObject|\son\w+\s*=/i.test(svg)) throw new Error(`${code}: SVG contains script or event handlers`);
  if (Buffer.byteLength(svg) > MAX_BYTES) throw new Error(`${code}: SVG is ${Buffer.byteLength(svg)} bytes, over ${MAX_BYTES}`);
  writeFileSync(new URL(`${code.toLowerCase()}.svg`, outDir), svg);
  licences[code] = {
    file: info.page,
    source: encodeURI(`https://commons.wikimedia.org/wiki/${info.page.replaceAll(' ', '_')}`),
    licence: info.licence,
  };
  console.log(`${code}  ${info.page}  ${info.licence}  ${Buffer.byteLength(svg)} bytes`);
  await sleep(1500);
}
writeFileSync(licencesFile, `${JSON.stringify(licences, null, 2)}\n`);
console.log(`Wrote ${Object.keys(licences).length} flags to public/flags-nl/`);
