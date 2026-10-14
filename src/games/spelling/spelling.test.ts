import { describe, expect, it } from 'vitest';
import { createRng } from '../../core/rng';
import { spellingGame } from './index';
import { SPELLING_ENTRIES } from './data';
import type { Question } from '../../core/types';

describe('Spelling Detective', () => {
  it('offers four Dutch categories with curated distinct spellings', () => {
    expect(spellingGame.levels.map(l => l.id)).toEqual(['ng-nk', 'eer-oor-eur', 'diminutives', 'vowels']);
    for (const level of spellingGame.levels) {
      expect(level.autoSpeak).toBe(false);
      expect(level.roundLength).toBe(10);
      const entries = SPELLING_ENTRIES[level.id];
      expect(entries.length).toBeGreaterThanOrEqual(12);
      for (const entry of entries) {
        expect(entry.category).toBe(level.id);
        expect(new Set([entry.word, ...entry.wrong]).size).toBe(4);
        expect(entry.wrong).toHaveLength(3);
        expect(entry.clue.toLowerCase()).not.toContain(entry.word);
        expect(entry.rule.nl.length).toBeGreaterThan(12);
        expect(entry.rule.en.length).toBeGreaterThan(12);
        if (level.id === 'ng-nk') expect(entry.word).toMatch(/ng|nk/);
        if (level.id === 'eer-oor-eur') expect(entry.word).toMatch(/eer|oor|eur/);
        if (level.id === 'diminutives') expect(entry.word).toMatch(/je$/);
      }
    }
  });

  it('makes ten fresh questions with stable Dutch answers, Dutch speech, and deliberate feedback', () => {
    for (const level of spellingGame.levels) {
      const previous: Question[] = [];
      const rng = createRng(34);
      for (let i = 0; i < 10; i++) {
        const q = spellingGame.makeQuestion(level, rng, previous);
        expect(previous.map(p => p.key)).not.toContain(q.key);
        expect(q.choices).toHaveLength(4);
        expect(new Set(q.choices.map(c => c.id)).size).toBe(4);
        expect(q.choices.filter(c => c.id === q.answerId)).toHaveLength(1);
        expect(q.autoAdvance).toBe(false);
        expect(q.speechLang).toBe('nl');
        expect(q.speech?.nl).toBe(q.speech?.en);
        const answer = q.choices.find(c => c.id === q.answerId)!;
        expect(q.speech?.en).toContain(answer.label.nl);
        expect(q.prompt.nl).not.toBe(q.prompt.en);
        q.choices.forEach(c => {
          expect(c.label.nl).toBe(c.label.en);
          expect(c.lang).toBe('nl');
        });
        for (const lang of ['nl', 'en'] as const) {
          const hidden = q.visual!({ lang, picked: null });
          expect(hidden.textContent?.toLowerCase()).not.toContain(answer.label.nl);
          expect(hidden.querySelector('.spelling-clue')?.getAttribute('lang')).toBe('nl');
          expect(hidden.querySelector('.spelling-feedback')).toBeNull();
          const shown = q.visual!({ lang, picked: { id: 'wrong-0', answerId: q.answerId } });
          expect(shown.querySelector('.spelling-feedback')?.textContent).toContain(answer.label.nl);
          const correct = q.visual!({ lang, picked: { id: q.answerId, answerId: q.answerId } });
          expect(correct.querySelector('.spelling-feedback')?.textContent).toBe(shown.querySelector('.spelling-feedback')?.textContent);
        }
        previous.push(q);
      }
    }
  });

  it('teaches each category in both interface languages using Dutch examples', () => {
    for (const level of spellingGame.levels) {
      for (const lang of ['nl', 'en'] as const) {
        const view = spellingGame.study!(level, { lang });
        expect(view.matches('.study')).toBe(true);
        expect(view.querySelector('h2')?.textContent).toBe(level.label[lang]);
        expect(view.querySelectorAll('.study-card').length).toBeGreaterThanOrEqual(3);
        expect(view.querySelector('[lang="nl"]')).not.toBeNull();
        expect(view.querySelector('.spelling-note')?.textContent).toContain(lang === 'nl' ? 'Nederlandse' : 'Dutch');
      }
    }
  });

  it('offers study speech only with an available Dutch voice', () => {
    const level = spellingGame.levels[0];
    const spoken: string[] = [];
    const dutch = spellingGame.study!(level, { lang: 'nl', speak: text => spoken.push(text) });
    dutch.querySelector('button')!.click();
    expect(spoken).toHaveLength(1);
    expect(spoken[0]).toContain('ring');
    expect(spellingGame.study!(level, { lang: 'en', speak: text => spoken.push(text) }).querySelector('button')).toBeNull();
    expect(spellingGame.study!(level, { lang: 'nl' }).querySelector('button')).toBeNull();
  });

  it('avoids real-word distractors in common spelling confusions and explains the actual pattern', () => {
    const entries = Object.values(SPELLING_ENTRIES).flat();
    const realConfusions = ['bang', 'bank', 'boer', 'oer', 'kor', 'balen', 'bommen', 'botten', 'rammen', 'botje', 'boetje'];
    for (const entry of entries) {
      entry.wrong.forEach(word => expect(realConfusions, `${entry.word}: ${word}`).not.toContain(word));
      expect(entry.clue.split('...')).toHaveLength(2);
    }
    for (const entry of SPELLING_ENTRIES['ng-nk']) {
      expect(entry.rule.nl).toContain(entry.word.includes('nk') ? 'Schrijf nk, zonder g' : 'n en g samen');
    }
    for (const word of ['bomen', 'boten', 'ramen', 'muren', 'benen', 'weken']) {
      expect(entries.find(e => e.word === word)!.rule.nl).toContain('één klinker');
    }
    for (const word of ['katten', 'kippen', 'sokken', 'vissen', 'ballen', 'pannen']) {
      expect(entries.find(e => e.word === word)!.rule.nl).toContain('twee dezelfde medeklinkers');
    }
    expect(entries.find(e => e.word === 'oor')!.clue).toContain('luister');
    expect(entries.find(e => e.word === 'boor')!.clue).toContain('gat');
    expect(entries.find(e => e.word === 'boompje')!.rule.nl).toContain('-pje');
    expect(entries.find(e => e.word === 'stoeltje')!.rule.nl).toContain('-tje');
  });
});
