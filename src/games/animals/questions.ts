import type { Level, Localized, Question, Rng } from '../../core/types';
import { pickFresh } from '../../core/pick';
import { el } from '../../core/ui';
import { ANIMALS } from './data';

export function makeAnimalQuestion(level: Level, rng: Rng, previous: readonly Question[]): Question {
  const animal = pickFresh(ANIMALS, previous, (a) => `${level.id}:${a.id}`, rng);
  const prompt: Localized = level.id === 'pictures'
    ? { nl: 'Welk dier zie je?', en: 'Which animal do you see?' }
    : level.id === 'silhouettes'
      ? { nl: 'Welk dier is deze schaduw? Gebruik de aanwijzing.', en: 'Which animal is this silhouette? Use the clue.' }
      : { nl: 'Raad het dier met dit raadsel.', en: 'Which animal matches this riddle?' };
  const distractors = rng.shuffle(ANIMALS.filter((a) => a.id !== animal.id)).slice(0, 3);
  return {
    key: `${level.id}:${animal.id}`,
    prompt,
    speech: { nl: `${prompt.nl} ${animal.clue.nl}`, en: `${prompt.en} ${animal.clue.en}` },
    answerId: animal.id,
    choices: rng.shuffle([animal, ...distractors]).map((a) => ({ id: a.id, label: a.name })),
    visual: ({ lang, picked }) => {
      const revealed = picked !== null;
      const root = el('div', { class: 'animal-visual' });
      if (level.id !== 'clues' || revealed) {
        root.append(el('img', {
          class: `animal-picture${level.id === 'silhouettes' && !revealed ? ' animal-silhouette' : ''}`,
          src: `animals/${animal.codepoint}.svg`,
          alt: revealed ? animal.name[lang] : animal.clue[lang],
          width: '216', height: '216',
        }));
      } else {
        root.append(el('span', { class: 'animal-mystery', 'aria-hidden': 'true' }, '?'));
      }
      if (level.id !== 'pictures') root.append(el('p', { class: 'animal-clue' }, animal.clue[lang]));
      if (revealed) root.append(el('p', { class: 'animal-name' }, animal.name[lang]));
      root.append(el('small', { class: 'animal-credit' },
        el('a', { href: 'https://openmoji.org/' }, 'OpenMoji'), ' · ',
        el('a', { href: 'https://creativecommons.org/licenses/by-sa/4.0/' }, 'CC BY-SA 4.0'),
      ));
      return root;
    },
  };
}
