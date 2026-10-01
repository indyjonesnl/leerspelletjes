import type { Lang, Level, Localized, StudyContext } from '../../core/types';
import { t } from '../../core/i18n';
import { el, svgEl } from '../../core/ui';
import { flagImage, infoCard, sortedBy, type InfoContent } from '../../screens/StudyCards';
import { CAPITALS } from '../capitals/data/capitals';
import { flagUrl } from '../flags/questions';
import { insetViewBox } from './Callouts';
import { MAP_CONFIG, levelPool } from './levels';
import { mapView } from './MapView';
import { countryName } from './names';
import { getRegion } from './regions';
import { markSelected, wireTargets } from './studyTargets';
import type { MapCountry, RegionMap } from './types';

const TAP_HINT: Localized = { nl: 'Tik op een land', en: 'Tap a country' };
const CHOOSE_HINT: Localized = { nl: 'Kies een land', en: 'Choose a country' };
/** The info card sits under the map, so the map gets less of the screen than the quiz's 64vh. */
const STUDY_MAP_VH = 45;

/** What the card shows for a country, and what the speaker reads. */
export function countryInfo(code: string, lang: Lang): InfoContent {
  const name = countryName(code)[lang];
  const capital = CAPITALS[code][lang];
  return { flag: flagUrl(code), name, capital, speech: `${name}. ${t(lang, 'capitalIs', { city: capital })}` };
}

/** The quiz's zoomed-in box, bigger: the area around one country with the country marked. */
export function insetMap(map: RegionMap, country: MapCountry): SVGSVGElement {
  const viewBox = insetViewBox(country);
  const [x, y, size] = viewBox.split(' ').map(Number);
  const svg = svgEl('svg', { class: 'map study-inset', viewBox, 'aria-hidden': 'true', style: 'max-width: min(340px, 40vh)' });
  svg.append(svgEl('rect', { class: 'inset-sea', x, y, width: size, height: size }), svgEl('path', { class: 'map-bg', d: map.background }));
  for (const c of map.countries) svg.append(svgEl('path', { class: 'country other', d: c.d }));
  svg.append(
    svgEl('path', { class: 'inset-country', d: country.d }),
    svgEl('circle', { class: 'inset-ring', cx: country.cx, cy: country.cy, r: size * 0.3 }),
  );
  return svg;
}

function tapStudy(level: Level, map: RegionMap, pool: readonly MapCountry[], { lang, speak }: StudyContext): HTMLElement {
  const svg = mapView(map, {
    targets: new Set(pool.map((c) => c.code)),
    state: { lang, picked: null },
    labelOf: countryName,
    maxHeightVh: STUDY_MAP_VH,
  });
  const card = infoCard(lang, TAP_HINT[lang], speak);
  markSelected(svg, '');
  wireTargets(svg, (code) => {
    markSelected(svg, code);
    card.show(countryInfo(code, lang));
  });
  return el('section', { class: 'study study-map' },
    el('h2', {}, level.label[lang]),
    el('div', { class: 'visual' }, svg),
    card.el,
  );
}

function smallStudy(level: Level, map: RegionMap, pool: readonly MapCountry[], { lang, speak }: StudyContext): HTMLElement {
  const stage = el('div', { class: 'inset-stage' });
  const card = infoCard(lang, CHOOSE_HINT[lang], speak);
  const chips = el('div', { class: 'chips', role: 'group', 'aria-label': level.label[lang] });
  const buttons: HTMLButtonElement[] = [];
  for (const c of sortedBy(pool, (country) => countryName(country.code)[lang], lang)) {
    const chip = el('button', { type: 'button', class: 'chip', 'aria-pressed': 'false' },
      flagImage(flagUrl(c.code)),
      el('span', {}, countryName(c.code)[lang]),
    );
    chip.addEventListener('click', () => {
      for (const b of buttons) b.setAttribute('aria-pressed', String(b === chip));
      stage.replaceChildren(insetMap(map, c));
      card.show(countryInfo(c.code, lang));
    });
    buttons.push(chip);
    chips.append(chip);
  }
  return el('section', { class: 'study study-map' }, el('h2', {}, level.label[lang]), chips, stage, card.el);
}

/** "Leer eerst" for the map game: tap a country to see its flag, name and capital; small countries as chips. */
export function mapStudy(level: Level, study: StudyContext): HTMLElement {
  const config = MAP_CONFIG[level.id];
  const map = getRegion(config.region);
  const pool = levelPool(config, map);
  return config.kind === 'small' ? smallStudy(level, map, pool, study) : tapStudy(level, map, pool, study);
}
