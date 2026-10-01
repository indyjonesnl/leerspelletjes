import type { Lang, Level, Localized, Question, Rng } from '../../core/types';
import { pickFresh } from '../../core/pick';
import { el } from '../../core/ui';
import { mapView, type MapPoint } from '../map/MapView';
import { hitRadii } from '../map/points';
import type { RegionMap } from '../map/types';
import { provinceFlagUrl } from './flags';
import { getNl } from './load';
import { PROVINCES, provinceByCode, type Province } from './provinces';

const PROVINCE_LABEL: Localized = { nl: 'provincie', en: 'province' };
const CITY_LABEL: Localized = { nl: 'stad', en: 'city' };
const MAP_LABEL: Localized = { nl: 'kaart', en: 'map' };
const CREDIT: Localized = { nl: 'Kaart: CBS, Kadaster (CC BY 4.0)', en: 'Map: CBS, Kadaster (CC BY 4.0)' };
/** Capitals with the same name as their province: "Waar ligt de stad Groningen?". */
const SAME_NAME = new Set(['GR', 'UT']);
const ALL = new Set(PROVINCES.map((p) => p.code));
/** Level 2 has four answer buttons under the map, so the map gets less of the screen than the 64vh default. */
const CHOICE_MAP_VH = 25;
const NONE: ReadonlySet<string> = new Set();

/** The map with the CC BY credit underneath (outside the SVG, so it does not change the map's aspect ratio). */
function withCredit(map: SVGSVGElement, lang: Lang): HTMLElement {
  return el('figure', { class: 'nl-map' }, map, el('figcaption', { class: 'map-credit' }, CREDIT[lang]));
}

/** Codes of the `count` provinces whose centres are nearest to `code`'s, nearest first. */
export function nearestProvinces(code: string, map: RegionMap, count = 3): string[] {
  const from = map.countries.find((c) => c.code === code)!;
  const dist = (c: { cx: number; cy: number }) => Math.hypot(c.cx - from.cx, c.cy - from.cy);
  return map.countries.filter((c) => c.code !== code).sort((a, b) => dist(a) - dist(b)).slice(0, count).map((c) => c.code);
}

function pick(rng: Rng, previous: readonly Question[]): Province {
  return pickFresh(PROVINCES, previous, (p) => p.code, rng);
}

function provinceQuestion(rng: Rng, previous: readonly Question[]): Question {
  const { map } = getNl();
  const answer = pick(rng, previous);
  return {
    key: answer.code,
    prompt: { nl: `Waar ligt ${answer.name.nl}?`, en: `Where is ${answer.name.en}?` },
    answerOn: 'visual',
    visual: (state) => withCredit(mapView(map, { targets: ALL, state, targetLabel: PROVINCE_LABEL }), state.lang),
    visualLabel: { hidden: MAP_LABEL, revealed: answer.name },
    choices: PROVINCES.map((p) => ({ id: p.code, label: p.name })),
    answerId: answer.code,
  };
}

function capitalNameQuestion(rng: Rng, previous: readonly Question[]): Question {
  const { map } = getNl();
  const answer = pick(rng, previous);
  const options = rng.shuffle([answer.code, ...nearestProvinces(answer.code, map)]);
  return {
    key: answer.code,
    prompt: { nl: `Wat is de hoofdstad van ${answer.name.nl}?`, en: `What is the capital of ${answer.name.en}?` },
    visual: (state) => withCredit(mapView(map, { targets: NONE, state, highlight: answer.code, untargeted: 'plain', maxHeightVh: CHOICE_MAP_VH }), state.lang),
    visualLabel: { hidden: MAP_LABEL, revealed: answer.name },
    choices: options.map((code) => ({ id: code, label: provinceByCode(code).capital })),
    answerId: answer.code,
  };
}

function capitalMapQuestion(rng: Rng, previous: readonly Question[]): Question {
  const { map, capitals } = getNl();
  const answer = pick(rng, previous);
  const radii = hitRadii(capitals);
  const points: MapPoint[] = capitals.map((c, i) => ({ id: c.code, x: c.x, y: c.y, r: radii[i] }));
  const city = answer.capital;
  const prompt = SAME_NAME.has(answer.code)
    ? { nl: `Waar ligt de stad ${city.nl}?`, en: `Where is the city of ${city.en}?` }
    : { nl: `Waar ligt ${city.nl}?`, en: `Where is ${city.en}?` };
  return {
    key: answer.code,
    prompt,
    answerOn: 'visual',
    visual: (state) =>
      withCredit(mapView(map, { targets: NONE, state, points, pointLabel: CITY_LABEL, untargeted: 'plain' }), state.lang),
    visualLabel: { hidden: MAP_LABEL, revealed: city },
    choices: PROVINCES.map((p) => ({ id: p.code, label: p.capital })),
    answerId: answer.code,
  };
}

const FLAG_LABEL: Localized = { nl: 'vlag', en: 'flag' };

function flagQuestion(rng: Rng, previous: readonly Question[]): Question {
  const answer = pick(rng, previous);
  const others = rng.shuffle(PROVINCES.filter((p) => p.code !== answer.code)).slice(0, 3);
  const options = rng.shuffle([answer, ...others]);
  return {
    key: answer.code,
    prompt: { nl: 'Van welke provincie is deze vlag?', en: 'Which province has this flag?' },
    visual: () => el('img', { src: provinceFlagUrl(answer.code), alt: '', class: 'flag flag-province' }),
    visualLabel: { hidden: FLAG_LABEL, revealed: answer.name },
    choices: options.map((p) => ({ id: p.code, label: p.name })),
    answerId: answer.code,
  };
}

export function makeNlQuestion(level: Level, rng: Rng, previous: readonly Question[]): Question {
  if (level.id === '1') return provinceQuestion(rng, previous);
  if (level.id === '2') return capitalNameQuestion(rng, previous);
  if (level.id === '4') return flagQuestion(rng, previous);
  return capitalMapQuestion(rng, previous);
}
