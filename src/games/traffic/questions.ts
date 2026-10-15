import type { Level, Question, Rng } from '../../core/types';
import { pickFresh } from '../../core/pick';
import { TRAFFIC_POOLS } from './levels';
import { trafficSign } from './Sign';
import { makePlaceQuestion } from './places';

// Some other signs' instructions are true but incomplete for the pictured sign.
// For example STOP also requires giving way, so B6 must not be a wrong answer for B7.
const PARTIAL_ACTIONS: Record<string, string[]> = {
  B6: ['B7'], B7: ['B6'], C2: ['C14'], C14: ['C2', 'G7'], G7: ['C14'],
  J22: ['L2'], L2: ['J22'],
};

export function makeTrafficQuestion(level: Level, rng: Rng, previous: readonly Question[]): Question {
  if (level.id === 'places') return makePlaceQuestion(rng, previous);
  const pool = TRAFFIC_POOLS[level.id as keyof typeof TRAFFIC_POOLS];
  const sign = pickFresh(pool, previous, (s) => s.code, rng);
  const action = level.id === 'situations';
  const candidates = pool.filter((s) => s.code !== sign.code && (!action ||
    (s.code !== 'J37' && !(PARTIAL_ACTIONS[sign.code] ?? []).includes(s.code))));
  const options = rng.shuffle([sign, ...rng.shuffle(candidates).slice(0, 3)]);
  return {
    key: sign.code,
    prompt: action
      ? (sign.code === 'C16' || sign.code === 'G7'
        ? { nl: 'Je loopt hier. Wat vertelt dit bord je?', en: 'You are walking here. What does this sign tell you?' }
        : { nl: 'Je fietst hier. Wat vertelt dit bord je?', en: 'You are cycling here. What does this sign tell you?' })
      : { nl: 'Wat betekent dit verkeersbord?', en: 'What does this sign mean?' },
    visual: () => trafficSign(sign.code),
    visualLabel: { hidden: sign.description, revealed: sign.name },
    choices: options.map((s) => ({ id: s.code, label: action ? s.action : s.name })),
    answerId: sign.code,
  };
}
