import type { Rng } from '../core/types';

/** Four distinct, non-negative whole-number answers, with nearby mistakes. */
export function numberOptions(answer: number, step: number, rng: Rng): number[] {
  const wrong = new Set<number>();
  for (const offset of rng.shuffle([-step, step, -2 * step, 2 * step, -3 * step, 3 * step])) {
    const value = answer + offset;
    if (value >= 0 && value !== answer && wrong.size < 3) wrong.add(value);
  }
  for (let offset = 1; wrong.size < 3; offset++) wrong.add(answer + offset * step);
  return rng.shuffle([answer, ...wrong]);
}
