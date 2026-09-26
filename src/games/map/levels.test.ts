import { describe, it, expect, beforeAll } from 'vitest';
import { getRegion, loadRegion } from './regions';
import { MAP_CONFIG, MAP_LEVELS, STARTER_MAP_CODES, levelPool } from './levels';

beforeAll(async () => {
  await Promise.all((['europe', 'americas', 'africa', 'asia-oceania'] as const).map(loadRegion));
});

describe('map levels', () => {
  it('has nine levels; small-country levels have 5 questions, only level 1 speaks', () => {
    expect(MAP_LEVELS.map((l) => l.id)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9']);
    expect(MAP_LEVELS.filter((l) => l.roundLength === 5).map((l) => l.id)).toEqual(['3', '5', '7', '9']);
    expect(MAP_LEVELS.filter((l) => l.autoSpeak).map((l) => l.id)).toEqual(['1']);
    for (const l of MAP_LEVELS) expect(MAP_CONFIG[l.id], l.id).toBeDefined();
  });

  it('asks the starter countries in level 1', () => {
    const pool = levelPool(MAP_CONFIG['1'], getRegion('europe'));
    expect(pool.map((c) => c.code).sort()).toEqual([...STARTER_MAP_CODES].sort());
  });

  it('splits each region into tappable and small countries', () => {
    const sizes = MAP_LEVELS.map((l) => levelPool(MAP_CONFIG[l.id], getRegion(MAP_CONFIG[l.id].region)).length);
    expect(sizes).toEqual([15, 36, 8, 22, 13, 42, 12, 34, 26]);
    for (const l of MAP_LEVELS) {
      const config = MAP_CONFIG[l.id];
      for (const c of levelPool(config, getRegion(config.region))) expect(c.small, `${l.id} ${c.code}`).toBe(config.kind === 'small');
    }
  });
});
