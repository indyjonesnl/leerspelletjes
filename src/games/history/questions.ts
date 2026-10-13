import type { Level, Localized, Question, Rng } from '../../core/types';
import { el } from '../../core/ui';
import { HISTORY_EVENTS, chronologicalEvents, formatHistoryYear, type HistoryEvent } from './data';

function eventSetKey(levelId: string, events: readonly HistoryEvent[]): string {
  return `${levelId}:${events.map((event) => event.id).sort().join('|')}`;
}

export function makeHistoryQuestion(level: Level, rng: Rng, previous: readonly Question[]): Question {
  const pool = HISTORY_EVENTS[level.id as keyof typeof HISTORY_EVENTS];
  if (!pool) throw new Error(`Unknown History Timeline level: ${level.id}`);
  // Question keys identify sets, so filter combinations below to avoid repeating a four-event set.
  const previousSets = new Set(previous.map((question) => question.key));
  const candidates: HistoryEvent[][] = [];
  for (let a = 0; a < pool.length; a++) for (let b = a + 1; b < pool.length; b++)
    for (let c = b + 1; c < pool.length; c++) for (let d = c + 1; d < pool.length; d++) {
      const set = [pool[a], pool[b], pool[c], pool[d]];
      if (!previousSets.has(eventSetKey(level.id, set))) candidates.push(set);
    }
  const selected = rng.shuffle(rng.pick(candidates.length ? candidates : [rng.shuffle(pool).slice(0, 4)]));
  const events = selected;
  const earliest = chronologicalEvents(events)[0];
  const choices = rng.shuffle(events).map((event) => ({ id: event.id, label: event.title }));
  const levelLabel: Localized = level.id === 'dutch'
    ? { nl: 'Nederlandse geschiedenis', en: 'Dutch history' }
    : { nl: 'Wereldgeschiedenis', en: 'World history' };
  return {
    key: eventSetKey(level.id, events),
    prompt: {
      nl: `Welk van deze gebeurtenissen gebeurde het eerst in de ${levelLabel.nl.toLowerCase()}?`,
      en: `Which of these events happened first in ${levelLabel.en.toLowerCase()}?`,
    },
    speech: {
      nl: `Welke gebeurtenis gebeurde het eerst? ${choices.map((choice, index) => `${index + 1}. ${choice.label.nl}`).join('. ')}`,
      en: `Which event happened first? ${choices.map((choice, index) => `${index + 1}. ${choice.label.en}`).join('. ')}`,
    },
    choices,
    answerId: earliest.id,
    visual: ({ lang, picked }) => {
      const root = el('section', { class: 'history-timeline', 'aria-live': 'polite' });
      if (!picked) {
        root.append(el('p', {}, lang === 'nl' ? 'Kies de gebeurtenis die het eerst gebeurde.' : 'Choose the event that happened first.'));
        return root;
      }
      for (const event of chronologicalEvents(events)) {
        const card = el('article', { class: 'history-event' },
          el('span', { class: 'history-event-year' }, formatHistoryYear(event.year, event.approximate, lang)),
          el('h3', {}, event.title[lang]),
          el('p', {}, event.description[lang]),
          el('a', { href: event.source, target: '_blank', rel: 'noreferrer' }, lang === 'nl' ? 'Bron' : 'Source'),
        );
        root.append(card);
      }
      return root;
    },
  };
}
