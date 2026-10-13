import type { Level, StudyContext } from '../../core/types';
import { el } from '../../core/ui';
import { HISTORY_EVENTS, chronologicalEvents, formatHistoryYear } from './data';

export function historyStudy(level: Level, { lang, speak }: StudyContext): HTMLElement {
  const events = HISTORY_EVENTS[level.id as keyof typeof HISTORY_EVENTS];
  const title = level.id === 'dutch'
    ? (lang === 'nl' ? 'Nederlandse geschiedenis' : 'Dutch history')
    : (lang === 'nl' ? 'Wereldgeschiedenis' : 'World history');
  const cards = chronologicalEvents(events).map((event) => {
    const card = el('li', { class: 'history-study-event', 'data-year': String(event.year) },
      el('span', { class: 'history-event-year' }, formatHistoryYear(event.year, event.approximate, lang)),
      el('strong', {}, event.title[lang]),
      el('p', {}, event.description[lang]),
      el('a', { href: event.source, target: '_blank', rel: 'noreferrer' }, lang === 'nl' ? 'Bron' : 'Source'),
    );
    if (speak) {
      const button = el('button', { type: 'button', class: 'icon-button', 'aria-label': `${lang === 'nl' ? 'Lees voor' : 'Read aloud'}: ${event.title[lang]}` }, '🔈');
      button.addEventListener('click', () => speak(`${formatHistoryYear(event.year, event.approximate, lang)}. ${event.title[lang]}. ${event.description[lang]}`));
      card.append(button);
    }
    return card;
  });
  return el('section', { class: 'study history-study' },
    el('h2', {}, title),
    el('p', { class: 'subtitle' }, `${level.example[lang]} ${lang === 'nl'
      ? 'Bekijk de gebeurtenissen van vroeger naar later. Sommige oude jaartallen zijn ongeveer.'
      : 'Explore events from earlier to later. Some ancient dates are approximate.'}`),
    el('ol', { class: 'history-study-list' }, ...cards),
  );
}
