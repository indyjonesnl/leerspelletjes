import type { Lang, Level, Localized, Question, Rng } from '../../core/types';
import { el } from '../../core/ui';
import { pickFresh } from '../../core/pick';
import { WORDS } from './data';

/** Shuffle once per question, with a guaranteed change even when letters repeat. */
function scrambled(word: string, rng: Rng): string {
  const shuffled = rng.shuffle([...word]).join('');
  return shuffled !== word ? shuffled : word.slice(1) + word[0];
}

function misspellings(word: string, rng: Rng): string[] {
  const wrong = new Set<string>();
  // Swapping nearby letters makes useful distractors rather than unrelated nouns.
  for (const i of rng.shuffle(Array.from({ length: word.length - 1 }, (_, i) => i))) {
    const letters = [...word];
    [letters[i], letters[i + 1]] = [letters[i + 1], letters[i]];
    const candidate = letters.join('');
    if (candidate !== word && wrong.size < 3) wrong.add(candidate);
  }
  // Two-letter words and repeated letters can have fewer than three permutations.
  for (const letter of 'aeioubcdfghjklmnpqrstvwxyz') {
    if (wrong.size === 3) break;
    const candidate = letter + word.slice(1);
    if (candidate !== word) wrong.add(candidate);
  }
  return [...wrong];
}

export function makeWordQuestion(level: Level, rng: Rng, previous: readonly Question[]): Question {
  const entry = pickFresh(WORDS[level.id], previous, (w) => w.id, rng);
  const letters: Localized = { nl: scrambled(entry.word.nl, rng), en: scrambled(entry.word.en, rng) };
  const wrong = { nl: misspellings(entry.word.nl, rng), en: misspellings(entry.word.en, rng) };
  const speechFor = (lang: Lang) => lang === 'nl'
    ? `${entry.clue.nl}. De letters zijn: ${[...letters.nl].join(', ')}. Kies het juiste woord.`
    : `${entry.clue.en}. The letters are: ${[...letters.en].join(', ')}. Which word matches the picture?`;
  return {
    key: entry.id,
    prompt: { nl: 'Welk woord past bij het plaatje?', en: 'Which word matches the picture?' },
    speech: { nl: speechFor('nl'), en: speechFor('en') },
    visual: ({ lang, picked }) => el('div', { class: 'word-builder' },
      // Before answering, emoji names must not let a screen reader reveal the spelling.
      el('span', { class: 'word-picture', role: 'img', 'aria-label': picked ? entry.word[lang] : entry.clue[lang] }, entry.picture),
      el('div', { class: 'word-letters', role: 'group', 'aria-label': [...letters[lang]].join(', ') },
        ...[...letters[lang]].map((letter) => el('span', { class: 'word-letter', 'aria-hidden': 'true' }, letter.toUpperCase())),
      ),
    ),
    choices: rng.shuffle([
      { id: 'correct', label: entry.word },
      ...wrong.nl.map((_, i) => ({ id: `wrong-${i}`, label: { nl: wrong.nl[i], en: wrong.en[i] } })),
    ]),
    answerId: 'correct',
  };
}
