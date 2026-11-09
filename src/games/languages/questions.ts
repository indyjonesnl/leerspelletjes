import type { Level, Question, Rng } from '../../core/types';
import { pickFresh } from '../../core/pick';
import type { Country } from '../flags/types';
import { FLAG_CONFIG } from '../flags/levels';
import { flagUrl } from '../flags/questions';
import { countryName, countryWithArticle } from '../map/names';
import { el } from '../../core/ui';
import { LANGUAGES } from './data/languages';
import { SPOKEN } from './data/spoken';
import { languageBoard } from './board';

const MAX_CHIPS = 12;
const MIN_CHIPS = 5;
const MIN_DISTRACTORS = 3;

/** Asia and Oceania share a level, so they count as one continent for distractors. */
const group = (c: Country) => (c.continent === 'oceania' ? 'asia' : c.continent);

/** Canonical id of a set of language codes: sorted, joined with '+'. */
export function languageSetId(codes: readonly string[]): string {
  return [...codes].sort().join('+');
}

/**
 * The correct languages plus distractors, shuffled. Distractors are main languages of the other pool countries
 * (same continent only when `sameContinent`; level 1 draws from the starter countries), falling back to the whole catalog.
 */
export function chipLanguages(countryCode: string, pool: readonly Country[], rng: Rng, sameContinent = true): string[] {
  const { main, minor = [] } = SPOKEN[countryCode];
  const excluded = new Set([...main, ...minor]);
  const total = Math.min(MAX_CHIPS, Math.max(MIN_CHIPS, main.length + MIN_DISTRACTORS));
  const needed = total - main.length;

  const self = pool.find((c) => c.code === countryCode);
  const used = new Set<string>();
  for (const c of pool) {
    if (c.code === countryCode || !SPOKEN[c.code]) continue;
    if (sameContinent && self && group(c) !== group(self)) continue;
    for (const l of SPOKEN[c.code].main) if (!excluded.has(l)) used.add(l);
  }
  const picked = rng.shuffle([...used]).slice(0, needed);
  if (picked.length < needed) {
    const taken = new Set(picked);
    const rest = Object.keys(LANGUAGES).filter((l) => !excluded.has(l) && !taken.has(l));
    picked.push(...rng.shuffle(rest).slice(0, needed - picked.length));
  }
  return rng.shuffle([...main, ...picked]);
}

export function makeLanguageQuestion(level: Level, rng: Rng, previous: readonly Question[]): Question {
  const { pool, sameContinent } = FLAG_CONFIG[level.id];
  const answer = pickFresh(pool, previous, (c) => c.code, rng);
  const correct = SPOKEN[answer.code].main;
  const chips = chipLanguages(answer.code, pool, rng, sameContinent);
  const answerId = languageSetId(correct);
  const names = (lang: 'nl' | 'en') => correct.map((l) => LANGUAGES[l][lang]).join(', ');
  const country = countryWithArticle(answer.code);
  // Owned here, not in the visual: play.ts re-renders the visual (e.g. on a language switch) and ticks must survive.
  const selected = new Set<string>();
  return {
    key: answer.code,
    prompt: {
      nl: `Welke talen worden gesproken in ${country.nl}? Kies alles wat past.`,
      en: `Which languages are spoken in ${country.en}? Pick all that apply.`,
    },
    visual: (state) =>
      el(
        'div',
        { class: 'language-question' },
        el('img', { src: flagUrl(answer.code), alt: countryName(answer.code)[state.lang], class: 'flag' }),
        languageBoard({ chips, answer: correct, selected }, state),
      ),
    answerOn: 'interactive',
    autoAdvance: false,
    choices: [{ id: answerId, label: { nl: names('nl'), en: names('en') } }],
    answerId,
  };
}
