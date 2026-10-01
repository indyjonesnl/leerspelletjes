import type { Lang, Level, Localized, StudyContext } from '../../core/types';
import { t } from '../../core/i18n';
import { el, svgEl } from '../../core/ui';
import { infoCard, sortedBy, studyGrid, type InfoContent, type StudyItem } from '../../screens/StudyCards';
import { mapView } from '../map/MapView';
import { markSelected, wireTargets } from '../map/studyTargets';
import { provinceFlagUrl } from './flags';
import { getNl } from './load';
import { PROVINCES, provinceByCode } from './provinces';
import { withCredit } from './questions';
import { layoutLabels } from './studyLabels';

const HEADING: Localized = { nl: 'Provincies en hoofdsteden', en: 'Provinces and capitals' };
const HINT: Localized = { nl: 'Tik op een provincie', en: 'Tap a province' };
const ALL = new Set(PROVINCES.map((p) => p.code));
/** The map is tall and carries 24 labels, so it gets more of the screen than the 45vh of the other study maps, but the info card must still fit under it on a tablet (the e2e test checks). */
const MAP_VH = 50;
const DOT_RADIUS = 10;

function provinceInfo(code: string, lang: Lang): InfoContent {
  const p = provinceByCode(code);
  const name = p.name[lang];
  const capital = p.capital[lang];
  return { flag: provinceFlagUrl(code), name, capital, speech: `${name}. ${t(lang, 'capitalIs', { city: capital })}` };
}

function mapStudy({ lang, speak }: StudyContext): HTMLElement {
  const { map, capitals } = getNl();
  const svg = mapView(map, {
    targets: ALL,
    state: { lang, picked: null },
    labelOf: (code) => provinceByCode(code).name,
    untargeted: 'plain',
    maxHeightVh: MAP_VH,
  });
  for (const c of capitals) {
    svg.append(svgEl('circle', { class: 'cap-dot', cx: c.x, cy: c.y, r: DOT_RADIUS, 'data-choice-id': c.code, 'aria-hidden': 'true' }));
  }
  for (const label of layoutLabels(lang, PROVINCES, map, capitals)) {
    const text = svgEl('text', {
      class: `study-label ${label.kind}`, x: label.x, y: label.y,
      'text-anchor': label.anchor, 'font-size': label.size, 'aria-hidden': 'true',
    });
    text.textContent = label.text;
    svg.append(text);
  }
  const card = infoCard(lang, HINT[lang], speak);
  markSelected(svg, '');
  wireTargets(svg, (code) => {
    markSelected(svg, code);
    card.show(provinceInfo(code, lang));
  });
  return el('section', { class: 'study study-map' },
    el('h2', {}, HEADING[lang]),
    el('div', { class: 'visual' }, withCredit(svg, lang)),
    card.el,
  );
}

function flagsStudy(level: Level, lang: Lang): HTMLElement {
  const items = sortedBy(PROVINCES, (p) => p.name[lang], lang).map((p): StudyItem => ({
    key: p.code, flag: provinceFlagUrl(p.code), name: p.name[lang], detail: p.capital[lang],
  }));
  return el('section', { class: 'study' }, el('h2', {}, level.label[lang]), studyGrid(items));
}

/** "Leer eerst" for Nederland: levels 1–3 share the labelled map, level 4 shows the province flags. */
export function nederlandStudy(level: Level, study: StudyContext): HTMLElement {
  return level.id === '4' ? flagsStudy(level, study.lang) : mapStudy(study);
}
