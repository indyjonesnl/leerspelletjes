import type { Level, Question, Rng } from '../../core/types';
import { pickFresh } from '../../core/pick';
import { el } from '../../core/ui';
import { SPELLING_ENTRIES } from './data';

export const exerciseNote = { nl: 'Je oefent Nederlandse spelling.', en: 'These exercises practise Dutch words.' };

export function makeSpellingQuestion(level: Level, rng: Rng, previous: readonly Question[]): Question {
  const entry = pickFresh(SPELLING_ENTRIES[level.id], previous, e => `${level.id}:${e.word}`, rng);
  const spoken = `${entry.word}. ${entry.clue.replace('...', entry.word)} Kies de juiste spelling.`;
  return {
    key: `${level.id}:${entry.word}`,
    prompt: { nl: 'Welke spelling past in de zin?', en: 'Which spelling fits the Dutch sentence?' },
    speech: { nl: spoken, en: spoken },
    speechLang: 'nl',
    autoAdvance: false,
    visual: ({ lang, picked }) => el('div', { class: 'spelling-question' },
      el('p', { class: 'spelling-note' }, exerciseNote[lang]),
      el('p', { class: 'spelling-clue', lang: 'nl' }, entry.clue),
      ...(picked ? [el('div', { class: 'spelling-feedback' },
        el('p', {}, lang === 'nl' ? 'Zo schrijf je het: ' : 'The correct Dutch spelling is: ',
          el('strong', { lang: 'nl' }, entry.word)),
        el('p', {}, entry.rule[lang]),
      )] : []),
    ),
    choices: rng.shuffle([
      { id: 'correct', lang: 'nl' as const, label: { nl: entry.word, en: entry.word } },
      ...entry.wrong.map((word, i) => ({ id: `wrong-${i}`, lang: 'nl' as const, label: { nl: word, en: word } })),
    ]),
    answerId: 'correct',
  };
}
