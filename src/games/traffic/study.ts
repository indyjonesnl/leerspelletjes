import type { Level, StudyContext } from '../../core/types';
import { el } from '../../core/ui';
import { t } from '../../core/i18n';
import { TRAFFIC_POOLS } from './levels';
import { trafficSign } from './Sign';
import { placesStudy } from './places';

export function trafficStudy(level: Level, { lang, speak }: StudyContext): HTMLElement {
  if (level.id === 'places') return placesStudy({ lang, speak });
  const pool = TRAFFIC_POOLS[level.id as keyof typeof TRAFFIC_POOLS];
  return el('section', { class: 'study traffic-study' },
    el('h2', {}, level.label[lang]),
    el('p', { class: 'subtitle' }, lang === 'nl' ? 'Nederlandse verkeersborden voor onderweg.' : 'Dutch road signs for walking and cycling.'),
    el('ul', { class: 'study-grid traffic-study-grid' }, ...pool.map((sign) => {
      const image = trafficSign(sign.code);
      image.setAttribute('aria-hidden', 'true');
      const card = el('li', { class: 'study-card' },
        el('span', { class: 'study-frame' }, image),
        el('strong', { class: 'study-name' }, sign.name[lang]),
        el('p', { class: 'traffic-action' }, sign.action[lang]),
      );
      if (speak) {
        const button = el('button', { type: 'button', class: 'icon-button', 'aria-label': `${t(lang, 'speak')}: ${sign.name[lang]}` }, '🔈');
        button.addEventListener('click', () => speak(`${sign.name[lang]}. ${sign.action[lang]}`));
        card.append(button);
      }
      return card;
    })),
  );
}
