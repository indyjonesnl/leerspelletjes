import type { Level, Question, Rng } from '../../core/types';
import { pickFresh } from '../../core/pick';
import { el } from '../../core/ui';
import type { Country } from '../flags/types';
import { FLAG_CONFIG } from '../flags/levels';
import { flagUrl } from '../flags/questions';
import { countryName, countryWithArticle } from '../map/names';
import { CAPITALS } from './data/capitals';

/** Asia and Oceania share a level, so they count as one continent for wrong answers. */
const group = (c: Country) => (c.continent === 'oceania' ? 'asia' : c.continent);

export function makeCapitalQuestion(level: Level, rng: Rng, previous: readonly Question[]): Question {
  const { pool, sameContinent } = FLAG_CONFIG[level.id];
  const answer = pickFresh(pool, previous, (c) => c.code, rng);
  const others = pool.filter((c) => c.code !== answer.code && (!sameContinent || group(c) === group(answer)));
  const options = rng.shuffle([answer, ...rng.shuffle(others).slice(0, 3)]);
  const country = countryWithArticle(answer.code);
  return {
    key: answer.code,
    prompt: { nl: `Wat is de hoofdstad van ${country.nl}?`, en: `What is the capital of ${country.en}?` },
    visual: () => el('img', { src: flagUrl(answer.code), alt: '', class: 'flag' }),
    visualLabel: { hidden: { nl: 'vlag', en: 'flag' }, revealed: countryName(answer.code) },
    choices: options.map((c) => ({ id: c.code, label: CAPITALS[c.code] })),
    answerId: answer.code,
  };
}
