import type { Level, Question, Rng } from '../../core/types';
import { el } from '../../core/ui';
import { pickFresh } from '../../core/pick';
import { INITIAL_PICTURES } from './data';

const ALPHABET = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];

export function makeInitialQuestion(_level: Level, rng: Rng, previous: readonly Question[]): Question {
  // After many language changes the pool may be exhausted; still never repeat the current picture.
  const pool = INITIAL_PICTURES.filter((p) => p.id !== previous.at(-1)?.key);
  const picture = pickFresh(pool, previous, (p) => p.id, rng);
  const first = { nl: picture.word.nl[0].toUpperCase(), en: picture.word.en[0].toUpperCase() };
  const wrong = {
    nl: rng.shuffle(ALPHABET.filter((letter) => letter !== first.nl)).slice(0, 3),
    en: rng.shuffle(ALPHABET.filter((letter) => letter !== first.en)).slice(0, 3),
  };
  return {
    key: picture.id,
    prompt: { nl: 'Wat is de eerste letter?', en: 'What is the first letter?' },
    speech: { nl: `Met welke letter begint ${picture.word.nl}?`, en: `What letter does ${picture.word.en} start with?` },
    visual: ({ lang, picked }) => el('figure', { class: 'initial-visual' },
      el('span', { class: 'initial-picture', role: 'img', 'aria-label': picture.word[lang] }, picture.picture),
      ...(picked ? [el('figcaption', { class: 'initial-word' }, `${picture.word[lang]} → ${first[lang]}`)] : []),
    ),
    choices: rng.shuffle([
      { id: 'correct', label: first },
      ...wrong.nl.map((_, i) => ({ id: `wrong-${i}`, label: { nl: wrong.nl[i], en: wrong.en[i] } })),
    ]),
    answerId: 'correct',
  };
}
