import type { Question, Rng } from '../../core/types';
import { pickFresh } from '../../core/pick';
import { getRegion } from './regions';
import { levelPool, type MapLevelConfig } from './levels';
import { countryName, whereIs } from './names';
import { mapView } from './MapView';

export function makeTapQuestion(config: MapLevelConfig, rng: Rng, previous: readonly Question[]): Question {
  const map = getRegion(config.region);
  const pool = levelPool(config, map);
  const answer = pickFresh(pool, previous, (c) => c.code, rng);
  const targets = new Set(pool.map((c) => c.code));
  return {
    key: answer.code,
    prompt: whereIs(answer.code),
    answerOn: 'visual',
    visual: (state) => mapView(map, { targets, state }),
    visualLabel: { hidden: { nl: 'kaart', en: 'map' }, revealed: countryName(answer.code) },
    choices: pool.map((c) => ({ id: c.code, label: countryName(c.code) })),
    answerId: answer.code,
  };
}
