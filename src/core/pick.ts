import type { Rng } from './types';

/** Picks a random item whose key was not used earlier in the round; falls back to the whole pool. */
export function pickFresh<T>(
  pool: readonly T[],
  previous: readonly { key: string }[],
  keyOf: (item: T) => string,
  rng: Rng,
): T {
  const used = new Set(previous.map((q) => q.key));
  const fresh = pool.filter((item) => !used.has(keyOf(item)));
  return rng.pick(fresh.length > 0 ? fresh : pool);
}
