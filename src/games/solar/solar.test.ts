import { describe, expect, it, vi } from 'vitest';
import { existsSync, statSync } from 'node:fs';
import { solarGame } from './index';
import { PLANETS, ORDER_PROBLEMS, RIDDLES } from './data';
import { createRng } from '../../core/rng';
import { Round } from '../../core/round';
import type { Question } from '../../core/types';

describe('Solar System', () => {
  it('keeps exactly the eight planets in Sun-outward order', () => {
    expect(PLANETS.map(p => p.id)).toEqual(['mercury','venus','earth','mars','jupiter','saturn','uranus','neptune']);
    expect(solarGame.levels.map(l => l.id)).toEqual(['planets','order','riddles']);
    expect(solarGame.levels[0].roundLength).toBe(8);
    expect(RIDDLES.map(r => r.answerId)).toEqual(['mercury','venus','earth','mars','jupiter','saturn','uranus','neptune','sun','moon','pluto']);
    expect(RIDDLES.find(r => r.answerId === 'pluto')!.clue.en).toContain('dwarf planet');
    expect(RIDDLES.find(r => r.answerId === 'venus')!.clue.en).toContain('hottest');
    expect(RIDDLES.find(r => r.answerId === 'jupiter')!.clue.en).toContain('largest');
  });
  it('makes unique rounds with four distinct bilingual choices and exactly one correct answer', () => {
    for (const level of solarGame.levels) for (let seed = 0; seed < 20; seed++) {
      const round = new Round(solarGame,level,createRng(seed));
      const keys = new Set<string>();
      do {
        const q = round.current;
        expect(keys.has(q.key)).toBe(false); keys.add(q.key);
        expect(q.choices).toHaveLength(4);
        expect(new Set(q.choices.map(c => c.id)).size).toBe(4);
        expect(q.choices.filter(c => c.id === q.answerId)).toHaveLength(1);
        for (const lang of ['nl','en'] as const) {
          expect(new Set(q.choices.map(c => c.label[lang])).size).toBe(4);
          expect(q.speech?.[lang]).toBeTruthy();
        }
        round.answer(q.answerId);
      } while (round.next());
      expect(keys.size).toBe(level.id === 'planets' ? 8 : 10);
    }
  });
  it('covers every missing slot and adjacent pair without leaking their names', () => {
    expect(ORDER_PROBLEMS.map(p => p.missing)).toEqual([
      [0],[1],[2],[3],[4],[5],[6],[7],[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],
    ]);
    const history: Question[] = [];
    for (let n = 0; n < ORDER_PROBLEMS.length; n++) {
      const q = solarGame.makeQuestion(solarGame.levels[1],createRng(n),history); history.push(q);
      const problem = ORDER_PROBLEMS.find(p => q.key === `order:${p.id}`)!;
      expect(q.answerId).toBe(problem.missing.map(i => PLANETS[i].id).join('+'));
      for (const lang of ['nl','en'] as const) {
        const root = q.visual!({lang,picked:null});
        const slots = root.querySelectorAll('.solar-slot');
        expect(slots).toHaveLength(8);
        expect(root.textContent).toContain(lang === 'en' ? 'Not to scale' : 'Niet op schaal');
        problem.missing.forEach(i => {
          expect(slots[i].textContent).toContain('?');
          expect(slots[i].querySelector('img')).toBeNull();
          expect(root.textContent).not.toContain(PLANETS[i].name[lang]);
          expect(q.speech![lang]).not.toContain(PLANETS[i].name[lang]);
        });
        const revealed = q.visual!({lang,picked:{id:q.answerId,answerId:q.answerId}});
        problem.missing.forEach(i => expect(revealed.textContent).toContain(PLANETS[i].name[lang]));
      }
    }
  });
  it('uses small local NASA images, meaningful alt text and accessible credits', () => {
    for (const p of PLANETS) {
      expect(existsSync(`public/${p.image}`)).toBe(true);
      expect(statSync(`public/${p.image}`).size).toBeLessThan(150000);
    }
    const history: Question[] = [];
    for (let n = 0; n < 8; n++) {
      const q = solarGame.makeQuestion(solarGame.levels[0],createRng(n),history); history.push(q);
      const p = PLANETS.find(p => p.id === q.answerId)!;
      for (const lang of ['nl','en'] as const) {
        const root = q.visual!({lang,picked:null});
        expect(q.visualLabel).toBeUndefined();
        expect(root.querySelector('img')!.getAttribute('src')).toBe(p.image);
        expect(root.querySelector('img')!.getAttribute('alt')).toBe(p.description[lang]);
        expect(root.querySelector('a')!.closest('[aria-hidden="true"]')).toBeNull();
        expect(root.textContent).toContain(p.credit);
        expect(root.textContent).not.toContain(p.name[lang]);
        if (['uranus','neptune'].includes(p.id)) expect(q.speech![lang]).toContain(p.fact[lang]);
      }
    }
  });
  it('provides bilingual study cards and optional read aloud for every level', () => {
    for (const level of solarGame.levels) for (const lang of ['nl','en'] as const) {
      const speak = vi.fn(); const study = solarGame.study!(level,{lang,speak});
      expect(study.querySelectorAll('.study-card').length).toBeGreaterThanOrEqual(8);
      expect(study.textContent).toContain(PLANETS[0].name[lang]);
      study.querySelector<HTMLButtonElement>('button')!.click();
      expect(speak).toHaveBeenCalledOnce();
      expect(speak.mock.calls[0][0]).toContain(PLANETS[0].name[lang]);
      expect(solarGame.study!(level,{lang}).querySelector('button')).toBeNull();
    }
  });
});
