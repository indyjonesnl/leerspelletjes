import type { Level, Question, Rng } from '../../core/types';
import { pickFresh } from '../../core/pick';
import { getRegion } from './regions';
import { MAP_CONFIG, levelPool, type MapLevelConfig } from './levels';
import { countryName, whereIs } from './names';
import { mapView } from './MapView';
import { calloutsView } from './Callouts';
import type { MapCountry } from './types';

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

/** The other countries of the pool nearest to `answer`, closest first. */
export function nearestSmall(answer: MapCountry, pool: readonly MapCountry[], count = 3): MapCountry[] {
  const dist = (c: MapCountry) => Math.hypot(c.cx - answer.cx, c.cy - answer.cy);
  return pool.filter((c) => c.code !== answer.code).sort((a, b) => dist(a) - dist(b)).slice(0, count);
}

export function makeSmallQuestion(config: MapLevelConfig, rng: Rng, previous: readonly Question[]): Question {
  const map = getRegion(config.region);
  const pool = levelPool(config, map);
  const answer = pickFresh(pool, previous, (c) => c.code, rng);
  const shown = [answer, ...nearestSmall(answer, pool)];
  const name = countryName(answer.code);
  return {
    key: answer.code,
    prompt: whereIs(answer.code),
    answerOn: 'visual',
    visual: (state) => calloutsView(map, { countries: shown, name, state }),
    visualLabel: { hidden: { nl: 'kaart met vier vakken', en: 'map with four boxes' }, revealed: name },
    choices: shown.map((c) => ({ id: c.code, label: countryName(c.code) })),
    answerId: answer.code,
  };
}

export function makeMapQuestion(level: Level, rng: Rng, previous: readonly Question[]): Question {
  const config = MAP_CONFIG[level.id];
  return config.kind === 'small' ? makeSmallQuestion(config, rng, previous) : makeTapQuestion(config, rng, previous);
}
