import type { Level, Localized, Question, Rng } from '../../core/types';
import { pickFresh } from '../../core/pick';
import { CLOCK_CONFIG, type ClockLevelConfig } from './levels';
import { formatDigital, timeToWords, timeToWords24 } from './words';
import { clockFace, digitalClock } from './ClockFace';

export interface Time {
  h: number;
  m: number;
}

export const timeKey = (t: Time) => `${t.h}:${t.m}`;

export function timePool(cfg: ClockLevelConfig): Time[] {
  const hours = cfg.mode === '12h' ? range(1, 12) : range(0, 23);
  return hours.flatMap((h) => cfg.minutes.map((m) => ({ h, m })));
}

export function shiftMinutes(t: Time, delta: number, mode: ClockLevelConfig['mode']): Time {
  const hoursInCycle = mode === '12h' ? 12 : 24;
  const cycle = hoursInCycle * 60;
  const total = ((((t.h % hoursInCycle) * 60 + t.m + delta) % cycle) + cycle) % cycle;
  const h = Math.floor(total / 60);
  return { h: mode === '12h' && h === 0 ? 12 : h, m: total % 60 };
}

/** Three wrong answers built from the mistakes children really make. */
export function clockDistractors(answer: Time, cfg: ClockLevelConfig, rng: Rng): Time[] {
  const pool = timePool(cfg);
  const valid = new Set(pool.map(timeKey));
  const step = cfg.minutes.length > 1 ? cfg.minutes[1] - cfg.minutes[0] : 60;
  const candidates: Time[] = [
    shiftMinutes(answer, -60, cfg.mode), // one hour off: "half twee" vs "half drie"
    shiftMinutes(answer, 60, cfg.mode),
    shiftMinutes(answer, -step, cfg.mode), // neighbouring step
    shiftMinutes(answer, step, cfg.mode),
    { h: answer.h, m: (60 - answer.m) % 60 }, // "kwart over" vs "kwart voor"
    cfg.mode === '12h'
      ? { h: answer.m === 0 ? 12 : answer.m / 5, m: (answer.h % 12) * 5 } // hands swapped
      : shiftMinutes(answer, 720, cfg.mode), // wrong part of day
  ];

  const picked: Time[] = [];
  const seen = new Set([timeKey(answer)]);
  const take = (t: Time) => {
    const key = timeKey(t);
    if (picked.length < 3 && valid.has(key) && !seen.has(key)) {
      seen.add(key);
      picked.push(t);
    }
  };
  rng.shuffle(candidates).forEach(take);
  rng.shuffle(pool).forEach(take);
  return picked;
}

export function makeClockQuestion(level: Level, rng: Rng, previous: readonly Question[]): Question {
  const cfg = CLOCK_CONFIG[level.id];
  const answer = pickFresh(timePool(cfg), previous, timeKey, rng);
  const words = cfg.mode === '12h' ? timeToWords : timeToWords24;
  const label = (t: Time): Localized => ({ nl: words(t.h, t.m, 'nl'), en: words(t.h, t.m, 'en') });
  const options = rng.shuffle([answer, ...clockDistractors(answer, cfg, rng)]);
  const digital = formatDigital(answer.h, answer.m);

  return {
    key: timeKey(answer),
    prompt: cfg.mode === '12h'
      ? { nl: 'Hoe laat is het?', en: 'What time is it?' }
      : { nl: 'Hoe zeg je deze tijd?', en: 'How do you say this time?' },
    speech: cfg.mode === '12h'
      ? undefined
      : { nl: `Hoe zeg je deze tijd? ${digital}`, en: `How do you say this time? ${digital}` },
    visual: () => (cfg.mode === '12h' ? clockFace(answer.h, answer.m) : digitalClock(answer.h, answer.m)),
    visualLabel: cfg.mode === '12h' ? { hidden: { nl: 'klok', en: 'clock' }, revealed: label(answer) } : undefined,
    choices: options.map((t) => ({ id: timeKey(t), label: label(t) })),
    answerId: timeKey(answer),
  };
}

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}
