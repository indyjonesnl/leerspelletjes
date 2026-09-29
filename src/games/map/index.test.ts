import { describe, it, expect } from 'vitest';
import { createRng } from '../../core/rng';
import { GAMES } from '../registry';
import { mapGame } from './index';

describe('mapGame', () => {
  it('is registered after flags and loads its region before asking', async () => {
    expect(GAMES.map((g) => g.id)).toEqual(['clock', 'tables', 'flags', 'map', 'capitals', 'nederland']);
    const level = mapGame.levels[5];
    await mapGame.load!(level);
    const q = mapGame.makeQuestion(level, createRng(1), []);
    expect(q.answerOn).toBe('visual');
  });
});
