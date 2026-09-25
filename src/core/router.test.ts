import { describe, it, expect } from 'vitest';
import { resolveRoute, gameHref, levelHref } from './router';
import type { Game, Level } from './types';

const level: Level = { id: '3', label: { nl: '', en: '' }, example: { nl: '', en: '' }, autoSpeak: false };
const game: Game = {
  id: 'clock', title: { nl: '', en: '' }, icon: '', pickerLayout: 'list', levels: [level],
  makeQuestion: () => { throw new Error('unused'); },
};
const games = [game];

describe('resolveRoute', () => {
  it('resolves home for empty hashes', () => {
    for (const hash of ['', '#', '#/']) expect(resolveRoute(hash, games)).toEqual({ name: 'home' });
  });

  it('resolves privacy, level picker and play screen', () => {
    expect(resolveRoute('#/privacy', games)).toEqual({ name: 'privacy' });
    expect(resolveRoute('#/clock', games)).toEqual({ name: 'levels', game });
    expect(resolveRoute('#/clock/3', games)).toEqual({ name: 'play', game, level });
  });

  it('returns null for unknown games, levels or extra parts', () => {
    expect(resolveRoute('#/nope', games)).toBeNull();
    expect(resolveRoute('#/clock/9', games)).toBeNull();
    expect(resolveRoute('#/clock/3/x', games)).toBeNull();
  });
});

describe('hrefs', () => {
  it('builds hash links', () => {
    expect(gameHref(game)).toBe('#/clock');
    expect(levelHref(game, level)).toBe('#/clock/3');
  });
});
