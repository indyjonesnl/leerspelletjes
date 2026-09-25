import { describe, it, expect } from 'vitest';
import { createRng } from './rng';
import { pickFresh } from './pick';

const keyOf = (n: number) => String(n);

describe('pickFresh', () => {
  it('never returns an item that was already asked while fresh items remain', () => {
    const rng = createRng(5);
    const previous = [1, 2, 3, 4].map((n) => ({ key: String(n) }));
    for (let i = 0; i < 50; i++) {
      expect(pickFresh([1, 2, 3, 4, 5], previous, keyOf, rng)).toBe(5);
    }
  });

  it('falls back to the whole pool when everything was asked', () => {
    const previous = [1, 2].map((n) => ({ key: String(n) }));
    expect([1, 2]).toContain(pickFresh([1, 2], previous, keyOf, createRng(1)));
  });
});
