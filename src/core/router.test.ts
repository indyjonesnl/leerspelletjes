import { describe, it, expect } from 'vitest';
import { resolveRoute, gameHref, levelHref, learnHref } from './router';
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

describe('learn route', () => {
  const studyGame: Game = { ...game, study: () => document.createElement('div') };

  it('resolves #/<game>/<level>/learn for games with study screens', () => {
    expect(resolveRoute('#/clock/3/learn', [studyGame])).toEqual({ name: 'learn', game: studyGame, level });
  });

  it('sends everything else that mentions learn home', () => {
    expect(resolveRoute('#/clock/3/learn', games)).toBeNull(); // the game has no study screen
    expect(resolveRoute('#/clock/9/learn', [studyGame])).toBeNull(); // unknown level
    expect(resolveRoute('#/clock/learn', [studyGame])).toBeNull();
    expect(resolveRoute('#/clock/3/learn/x', [studyGame])).toBeNull();
    expect(resolveRoute('#/nope/3/learn', [studyGame])).toBeNull();
  });

  it('builds the learn link', () => {
    expect(learnHref(game, level)).toBe('#/clock/3/learn');
  });
});
