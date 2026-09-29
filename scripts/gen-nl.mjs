// Generates src/games/nederland/data/nl.ts: the 12 provinces, Belgium and Germany as background, and the
// provincial capitals as points. Provinces: CBS / Kadaster via PDOK, CC BY 4.0 ("Kaart: CBS, Kadaster").
// Background: world-atlas (Natural Earth, public domain). Run by hand (`npm run gen:nl`); the output is committed.
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { feature } from 'topojson-client';
import * as d3 from 'd3-geo';

const require = createRequire(import.meta.url);
const OUT = new URL('../src/games/nederland/data/', import.meta.url);
const YEAR = 2026;
const SOURCE = `https://api.pdok.nl/cbs/gebiedsindelingen/ogc/v1/collections/provincie_gegeneraliseerd/items?f=json&limit=100&jaarcode=${YEAR}`;
const WIDTH = 1000;
/** Map extent, lon/lat: the Netherlands with a margin of Belgium and Germany. */
const BOX = [[3.2, 50.7], [7.3, 53.6]];
/** CBS statcode → our province code. */
const CODES = {
  PV20: 'GR', PV21: 'FR', PV22: 'DR', PV23: 'OV', PV24: 'FL', PV25: 'GE',
  PV26: 'UT', PV27: 'NH', PV28: 'ZH', PV29: 'ZE', PV30: 'NB', PV31: 'LI',
};
/** Provincial capitals, [lon, lat]. */
const CAPITALS = {
  GR: [6.5665, 53.2194], FR: [5.7999, 53.2012], DR: [6.5649, 52.9925], OV: [6.083, 52.5168],
  FL: [5.4714, 52.5185], GE: [5.8987, 51.9851], UT: [5.1214, 52.0907], NH: [4.6462, 52.3874],
  ZH: [4.3007, 52.0705], ZE: [3.6136, 51.4988], NB: [5.3037, 51.6978], LI: [5.691, 50.8514],
};
/** Points that must be water, [lon, lat]: the map must look like a school atlas. */
const WATER = {
  IJsselmeer: [5.3, 52.75], Markermeer: [5.25, 52.5], Waddenzee: [5.3, 53.3],
  Oosterschelde: [3.95, 51.58], Westerschelde: [3.62, 51.42],
};
/** world-atlas numeric ids of the grey neighbours. */
const NEIGHBOURS = ['056', '276'];

/** Rings wound the wrong way make d3 fill the whole globe (see gen-maps.mjs). */
function rewind(geometry) {
  const fix = (poly) =>
    d3.geoArea({ type: 'Polygon', coordinates: poly }) > 2 * Math.PI ? poly.map((ring) => ring.slice().reverse()) : poly;
  if (geometry.type === 'Polygon') return { type: 'MultiPolygon', coordinates: [fix(geometry.coordinates)] };
  return { type: 'MultiPolygon', coordinates: geometry.coordinates.map(fix) };
}

/** d3 path context writing integer coordinates and dropping repeated points. Rounding is per point, so a border
 *  shared by two provinces comes out identical on both sides. */
function pathWriter() {
  let d = '';
  let last = '';
  return {
    moveTo(x, y) { last = `${Math.round(x)} ${Math.round(y)}`; d += `M${last}`; },
    lineTo(x, y) {
      const p = `${Math.round(x)} ${Math.round(y)}`;
      if (p === last) return;
      d += `L${p}`;
      last = p;
    },
    closePath() { d += 'Z'; },
    arc() {},
    result() { return d; },
  };
}

const round1 = (v) => Math.round(v * 10) / 10;

const response = await fetch(SOURCE);
if (!response.ok) throw new Error(`PDOK: HTTP ${response.status} for ${SOURCE}`);
const { features } = await response.json();
if (features.length !== 12) throw new Error(`PDOK: expected 12 provinces for ${YEAR}, got ${features.length}`);
const provinces = features.map((f) => {
  const code = CODES[f.properties.statcode];
  if (!code) throw new Error(`Unknown statcode ${f.properties.statcode} (${f.properties.statnaam})`);
  return { code, geometry: rewind(f.geometry) };
});

for (const [name, point] of Object.entries(WATER)) {
  const covering = provinces.find((p) => d3.geoContains(p.geometry, point));
  if (covering) throw new Error(`${name} ${point} lies inside ${covering.code}: this boundary set covers water; use a land-only set`);
}

const boxOutline = {
  type: 'MultiPoint',
  coordinates: Array.from({ length: 41 }, (_, i) => BOX[0][0] + ((BOX[1][0] - BOX[0][0]) * i) / 40)
    .flatMap((lon) => [[lon, BOX[0][1]], [lon, BOX[1][1]]]),
};
const projection = d3.geoConicConformal().rotate([-5.3, 0]).parallels([51, 53]).fitWidth(WIDTH, boxOutline);
const height = Math.round(d3.geoPath(projection).bounds(boxOutline)[1][1]);
projection.clipExtent([[0, 0], [WIDTH, height]]);
const measure = d3.geoPath(projection);
const draw = (geometry) => {
  const writer = pathWriter();
  d3.geoPath(projection, writer)(geometry);
  return writer.result();
};

const topo = require('world-atlas/countries-10m.json');
const background = feature(topo, topo.objects.countries).features
  .filter((f) => NEIGHBOURS.includes(f.id))
  .map((f) => draw(rewind(f.geometry)))
  .join('');

const rows = provinces
  .sort((a, b) => a.code.localeCompare(b.code))
  .map(({ code, geometry }) => {
    const largest = geometry.coordinates
      .map((p) => ({ type: 'Polygon', coordinates: p }))
      .reduce((a, b) => (measure.area(b) > measure.area(a) ? b : a));
    const [cx, cy] = measure.centroid(largest).map(round1);
    const [[x0, y0], [x1, y1]] = measure.bounds(geometry);
    const size = round1(Math.max(x1 - x0, y1 - y0));
    return `    { code: '${code}', small: false, cx: ${cx}, cy: ${cy}, size: ${size}, d: '${draw(geometry)}' },`;
  });

const points = Object.entries(CAPITALS).map(([code, lonLat]) => {
  const province = provinces.find((p) => p.code === code);
  if (!d3.geoContains(province.geometry, lonLat)) throw new Error(`Capital of ${code} ${lonLat} is not inside ${code}`);
  const [x, y] = projection(lonLat).map(round1);
  return `  { code: '${code}', x: ${x}, y: ${y} },`;
});

mkdirSync(OUT, { recursive: true });
writeFileSync(
  new URL('nl.ts', OUT),
  `// Generated by scripts/gen-nl.mjs. Edit the script, not this file.\n` +
    `// Provinces: CBS / Kadaster (PDOK), CC BY 4.0. Background: Natural Earth via world-atlas.\n` +
    `import type { RegionMap } from '../../map/types';\n\n` +
    `export const MAP: RegionMap = {\n  viewBox: '0 0 ${WIDTH} ${height}',\n  countries: [\n${rows.join('\n')}\n  ],\n` +
    `  background: '${background}',\n};\n\n` +
    `export const CAPITAL_POINTS: readonly { code: string; x: number; y: number }[] = [\n${points.join('\n')}\n];\n`,
);
console.log(`nl: viewBox 0 0 ${WIDTH} ${height}, ${rows.length} provinces, ${points.length} capitals`);
