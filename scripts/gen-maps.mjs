// Generates src/games/map/data/<region>.ts: SVG path data per country for each map region.
// Source: world-atlas (Natural Earth, public domain), projected and simplified at build time.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { feature } from 'topojson-client';
import { presimplify, simplify } from 'topojson-simplify';
import * as d3 from 'd3-geo';

const require = createRequire(import.meta.url);
const OUT = new URL('../src/games/map/data/', import.meta.url);
const COUNTRIES_TS = new URL('../src/games/flags/data/countries.ts', import.meta.url);

/** ISO 3166-1 alpha-2 → numeric, for the 193 UN member states. */
const NUMERIC = {
  AF: '004', AL: '008', DZ: '012', AD: '020', AO: '024', AG: '028', AZ: '031', AR: '032', AU: '036', AT: '040',
  BS: '044', BH: '048', BD: '050', AM: '051', BB: '052', BE: '056', BT: '064', BO: '068', BA: '070', BW: '072',
  BR: '076', BZ: '084', SB: '090', BN: '096', BG: '100', MM: '104', BI: '108', BY: '112', KH: '116', CM: '120',
  CA: '124', CV: '132', CF: '140', LK: '144', TD: '148', CL: '152', CN: '156', CO: '170', KM: '174', CG: '178',
  CD: '180', CR: '188', HR: '191', CU: '192', CY: '196', CZ: '203', BJ: '204', DK: '208', DM: '212', DO: '214',
  EC: '218', SV: '222', GQ: '226', ET: '231', ER: '232', EE: '233', FJ: '242', FI: '246', FR: '250', DJ: '262',
  GA: '266', GE: '268', GM: '270', DE: '276', GH: '288', KI: '296', GR: '300', GD: '308', GT: '320', GN: '324',
  GY: '328', HT: '332', HN: '340', HU: '348', IS: '352', IN: '356', ID: '360', IR: '364', IQ: '368', IE: '372',
  IL: '376', IT: '380', CI: '384', JM: '388', JP: '392', KZ: '398', JO: '400', KE: '404', KP: '408', KR: '410',
  KW: '414', KG: '417', LA: '418', LB: '422', LS: '426', LV: '428', LR: '430', LY: '434', LI: '438', LT: '440',
  LU: '442', MG: '450', MW: '454', MY: '458', MV: '462', ML: '466', MT: '470', MR: '478', MU: '480', MX: '484',
  MC: '492', MN: '496', MD: '498', ME: '499', MA: '504', MZ: '508', OM: '512', NA: '516', NR: '520', NP: '524',
  NL: '528', VU: '548', NZ: '554', NI: '558', NE: '562', NG: '566', NO: '578', FM: '583', MH: '584', PW: '585',
  PK: '586', PA: '591', PG: '598', PY: '600', PE: '604', PH: '608', PL: '616', PT: '620', GW: '624', TL: '626',
  QA: '634', RO: '642', RU: '643', RW: '646', KN: '659', LC: '662', VC: '670', SM: '674', ST: '678', SA: '682',
  SN: '686', RS: '688', SC: '690', SL: '694', SG: '702', SK: '703', VN: '704', SI: '705', SO: '706', ZA: '710',
  ZW: '716', ES: '724', SS: '728', SD: '729', SR: '740', SZ: '748', SE: '752', CH: '756', SY: '760', TJ: '762',
  TH: '764', TG: '768', TO: '776', TT: '780', AE: '784', TN: '788', TR: '792', TM: '795', TV: '798', UG: '800',
  UA: '804', MK: '807', EG: '818', GB: '826', TZ: '834', US: '840', BF: '854', UY: '858', UZ: '860', VE: '862',
  WS: '882', YE: '887', ZM: '894',
};

const WIDTH = 1000;
/** Countries whose projected area (viewBox units², map 1000 wide) is below this are "small". */
const SMALL_AREA = 400;
/** Manual corrections to the area rule: true = force small, false = force tappable. */
const SMALL_OVERRIDES = {};
/** Topojson planar simplification weights (degrees²): bigger = fewer points. Small countries keep more detail
 *  because the inset boxes zoom in on them. */
const SIMPLIFY = 0.01;
const SIMPLIFY_SMALL = 0.0002;
/** Islands of tappable countries and background land smaller than this (viewBox units²) are dropped. */
const MIN_ISLAND = 1;

const REGIONS = {
  europe: {
    continents: ['europe'],
    projection: () => d3.geoConicConformal().rotate([-15, 0]).parallels([40, 65]),
    box: [[-25, 34], [45, 71.5]],
  },
  americas: {
    continents: ['americas'],
    projection: () => d3.geoAzimuthalEqualArea().rotate([85, -10]),
    box: [[-170, -56], [-30, 72]],
  },
  africa: {
    continents: ['africa'],
    projection: () => d3.geoMercator(),
    box: [[-26, -36], [58, 38]],
  },
  'asia-oceania': {
    continents: ['asia', 'oceania'],
    projection: () => d3.geoMercator().rotate([-110, 0]),
    box: [[25, -48], [-170, 56]],
  },
};

const continentOf = Object.fromEntries(
  [...readFileSync(COUNTRIES_TS, 'utf8').matchAll(/code: '([A-Z]{2})', continent: '(\w+)'/g)].map((m) => [m[1], m[2]]),
);
if (Object.keys(continentOf).length !== 193) throw new Error('Expected 193 countries in countries.ts');

const topo = require('world-atlas/countries-10m.json');
const pre = presimplify(topo);
const simpleTopo = simplify(pre, SIMPLIFY);

/** Natural Earth has rings wound the wrong way (e.g. the Maldives); d3 then fills the whole globe. */
function rewind(geometry) {
  const fix = (poly) =>
    d3.geoArea({ type: 'Polygon', coordinates: poly }) > 2 * Math.PI ? poly.map((ring) => ring.slice().reverse()) : poly;
  if (geometry?.type === 'Polygon') return { type: 'Polygon', coordinates: fix(geometry.coordinates) };
  if (geometry?.type === 'MultiPolygon') return { type: 'MultiPolygon', coordinates: geometry.coordinates.map(fix) };
  return geometry;
}

/** Numeric id → one MultiPolygon (Australia has two features with id 036). */
function byId(t) {
  const map = new Map();
  for (const f of feature(t, t.objects.countries).features) {
    const g = rewind(f.geometry);
    if (!g) continue;
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
    const key = f.id ?? `bg-${f.properties.name}`;
    map.set(key, [...(map.get(key) ?? []), ...polys]);
  }
  return new Map([...map].map(([k, polys]) => [k, { type: 'MultiPolygon', coordinates: polys }]));
}
const simple = byId(simpleTopo);
const detailed = byId(simplify(pre, SIMPLIFY_SMALL));
const alphaOf = Object.fromEntries(Object.entries(NUMERIC).map(([a, n]) => [n, a]));

/** d3 path context that writes compact, rounded SVG path data and drops near-duplicate points. */
function pathWriter(digits, minStep) {
  const f = 10 ** digits;
  const r = (v) => Math.round(v * f) / f;
  let d = '';
  let last;
  return {
    moveTo(x, y) { last = [r(x), r(y)]; d += `M${last[0]} ${last[1]}`; },
    lineTo(x, y) {
      const p = [r(x), r(y)];
      if (Math.abs(p[0] - last[0]) < minStep && Math.abs(p[1] - last[1]) < minStep) return;
      d += `L${p[0]} ${p[1]}`;
      last = p;
    },
    closePath() { d += 'Z'; },
    arc() {},
    result() { return d; },
  };
}

function boxPoints([[x0, y0], [x1, y1]]) {
  const span = (x1 - x0 + 360) % 360 || 360;
  const pts = [];
  for (let i = 0; i <= 40; i++) pts.push([x0 + (span * i) / 40, y0], [x0 + (span * i) / 40, y1]);
  return { type: 'MultiPoint', coordinates: pts };
}

const round1 = (v) => Math.round(v * 10) / 10;

mkdirSync(OUT, { recursive: true });
for (const [name, region] of Object.entries(REGIONS)) {
  const projection = region.projection().fitWidth(WIDTH, boxPoints(region.box));
  const height = Math.round(d3.geoPath(projection).bounds(boxPoints(region.box))[1][1]);
  projection.clipExtent([[0, 0], [WIDTH, height]]);
  const measure = d3.geoPath(projection);
  const draw = (geometry, digits, minStep) => {
    const writer = pathWriter(digits, minStep);
    d3.geoPath(projection, writer)(geometry);
    return writer.result();
  };
  const withoutSpecks = (geometry) => ({
    type: 'MultiPolygon',
    coordinates: geometry.coordinates.filter((p) => measure.area({ type: 'Polygon', coordinates: p }) >= MIN_ISLAND),
  });

  const countries = [];
  let background = '';
  for (const [id, geometry] of simple) {
    const code = alphaOf[id];
    if (code && region.continents.includes(continentOf[code])) continue;
    background += draw(withoutSpecks(geometry), 0, 1);
  }
  for (const [code, continent] of Object.entries(continentOf)) {
    if (!region.continents.includes(continent)) continue;
    const full = detailed.get(NUMERIC[code]);
    if (!full) throw new Error(`${name}: no shape for ${code}`);
    const area = measure.area(full);
    if (area === 0) throw new Error(`${name}: ${code} falls outside the map`);
    const small = SMALL_OVERRIDES[code] ?? area < SMALL_AREA;
    // Centre of the largest visible polygon, so e.g. the Dutch Caribbean doesn't pull NL's centre away.
    const largest = full.coordinates
      .map((p) => ({ type: 'Polygon', coordinates: p }))
      .reduce((a, b) => (measure.area(b) > measure.area(a) ? b : a));
    const [cx, cy] = measure.centroid(largest).map(round1);
    const [[x0, y0], [x1, y1]] = measure.bounds(full);
    const size = round1(Math.max(x1 - x0, y1 - y0));
    const d = small ? draw(full, 1, 0.2) : draw(withoutSpecks(simple.get(NUMERIC[code])), 0, 1);
    countries.push({ code, d, small, cx, cy, size });
  }

  const rows = countries
    .map((c) => `    { code: '${c.code}', small: ${c.small}, cx: ${c.cx}, cy: ${c.cy}, size: ${c.size}, d: '${c.d}' },`)
    .join('\n');
  writeFileSync(
    new URL(`${name}.ts`, OUT),
    `// Generated by scripts/gen-maps.mjs. Edit the script, not this file.\n` +
      `import type { RegionMap } from '../types';\n\n` +
      `export const MAP: RegionMap = {\n  viewBox: '0 0 ${WIDTH} ${height}',\n  countries: [\n${rows}\n  ],\n` +
      `  background: '${background}',\n};\n`,
  );
  const smallCodes = countries.filter((c) => c.small).map((c) => c.code);
  console.log(`${name}: ${countries.length} countries, ${smallCodes.length} small (${smallCodes.join(' ')})`);
}
