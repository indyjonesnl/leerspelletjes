import { describe, it, expect } from 'vitest';
import { nederlandGame } from './index';
import { getNl } from './load';

describe('nederlandGame.load', () => {
  it('needs no map for the flag level, and loads it for the map levels', async () => {
    await nederlandGame.load!(nederlandGame.levels[3]);
    expect(() => getNl()).toThrow();
    await nederlandGame.load!(nederlandGame.levels[0]);
    expect(getNl().map.countries).toHaveLength(12);
  });
});
