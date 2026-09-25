import type { Level, Localized, Question, Rng } from '../../core/types';
import { pickFresh } from '../../core/pick';
import { el } from '../../core/ui';
import type { Country } from './types';
import { FLAG_CONFIG } from './levels';
import { LOOK_ALIKES } from './lookalikes';

export const flagUrl = (code: string) => `flags/${code.toLowerCase()}.svg`;

const name = (c: Country): Localized => ({ nl: c.nl, en: c.en });

/** Three wrong countries: look-alike flags first, then others from the same continent. */
export function flagDistractors(answer: Country, pool: readonly Country[], sameContinent: boolean, rng: Rng): Country[] {
  const similar = LOOK_ALIKES[answer.code] ?? [];
  const candidates = pool.filter(
    (c) => c.code !== answer.code && (!sameContinent || c.continent === answer.continent),
  );
  const looks = rng.shuffle(candidates.filter((c) => similar.includes(c.code)));
  const others = rng.shuffle(candidates.filter((c) => !similar.includes(c.code)));
  return [...looks, ...others].slice(0, 3);
}

export function makeFlagQuestion(level: Level, rng: Rng, previous: readonly Question[]): Question {
  const { pool, sameContinent } = FLAG_CONFIG[level.id];
  const answer = pickFresh(pool, previous, (c) => c.code, rng);
  const options = rng.shuffle([answer, ...flagDistractors(answer, pool, sameContinent, rng)]);
  return {
    key: answer.code,
    prompt: { nl: 'Van welk land is deze vlag?', en: 'Which country has this flag?' },
    visual: () => el('img', { src: flagUrl(answer.code), alt: '', class: 'flag' }),
    visualLabel: { hidden: { nl: 'vlag', en: 'flag' }, revealed: name(answer) },
    choices: options.map((c) => ({ id: c.code, label: name(c) })),
    answerId: answer.code,
  };
}
