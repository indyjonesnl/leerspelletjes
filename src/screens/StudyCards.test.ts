import { describe, it, expect, vi } from 'vitest';
import { flagImage, infoCard, sortedBy, studyGrid } from './StudyCards';

describe('sortedBy', () => {
  it('sorts by name for the language without changing the input', () => {
    const input = ['Zweden', 'Albanië', 'Oostenrijk', 'Ierland'];
    expect(sortedBy(input, (n) => n, 'nl')).toEqual(['Albanië', 'Ierland', 'Oostenrijk', 'Zweden']);
    expect(input[0]).toBe('Zweden');
  });
});

describe('flagImage', () => {
  it('is a lazy, decorative image that becomes an empty frame when it fails to load', () => {
    const img = flagImage('flags/nl.svg');
    expect(img.getAttribute('src')).toBe('flags/nl.svg');
    expect(img.getAttribute('alt')).toBe('');
    expect(img.getAttribute('loading')).toBe('lazy');
    img.dispatchEvent(new Event('error'));
    expect(img.classList.contains('missing')).toBe(true);
    expect(flagImage('x.svg', false).hasAttribute('loading')).toBe(false);
  });
});

describe('studyGrid', () => {
  it('makes one card per item with flag, name and the optional detail', () => {
    const grid = studyGrid([
      { key: 'FR', flag: 'flags/fr.svg', name: 'Frankrijk', detail: 'Parijs' },
      { key: 'NL', flag: 'flags/nl.svg', name: 'Nederland' },
    ]);
    const cards = [...grid.querySelectorAll('.study-card')];
    expect(cards).toHaveLength(2);
    expect(cards[0].querySelector('img')!.getAttribute('src')).toBe('flags/fr.svg');
    expect(cards[0].querySelector('.study-name')!.textContent).toBe('Frankrijk');
    expect(cards[0].querySelector('.study-detail')!.textContent).toBe('Parijs');
    expect(cards[1].querySelector('.study-detail')).toBeNull();
  });
});

describe('infoCard', () => {
  const content = { flag: 'flags/fr.svg', name: 'Frankrijk', capital: 'Parijs', speech: 'Frankrijk. De hoofdstad is Parijs.' };

  it('starts with the hint in a polite live region', () => {
    const card = infoCard('nl', 'Tik op een land');
    expect(card.el.getAttribute('aria-live')).toBe('polite');
    expect(card.el.querySelector('.info-hint')!.textContent).toBe('Tik op een land');
    expect(card.el.querySelector('img')).toBeNull();
  });

  it('shows flag, name and capital, in the card language', () => {
    const nl = infoCard('nl', 'hint');
    nl.show(content);
    expect(nl.el.querySelector('img')!.getAttribute('src')).toBe('flags/fr.svg');
    expect(nl.el.querySelector('.info-name')!.textContent).toBe('Frankrijk');
    expect(nl.el.querySelector('.info-capital')!.textContent).toBe('Hoofdstad: Parijs');
    expect(nl.el.querySelector('.info-hint')).toBeNull();
    const en = infoCard('en', 'hint');
    en.show({ ...content, name: 'France', capital: 'Paris' });
    expect(en.el.querySelector('.info-capital')!.textContent).toBe('Capital: Paris');
  });

  it('shows the hint again for null', () => {
    const card = infoCard('nl', 'Tik op een land');
    card.show(content);
    card.show(null);
    expect(card.el.querySelector('.info-hint')!.textContent).toBe('Tik op een land');
  });

  it('has a speaker button only when it can speak, and reads the speech text', () => {
    expect(infoCard('nl', 'hint').el.querySelector('button.speak')).toBeNull();
    const speak = vi.fn();
    const card = infoCard('nl', 'hint', speak);
    expect(card.el.querySelector('button.speak')).toBeNull(); // nothing selected yet
    card.show(content);
    const button = card.el.querySelector<HTMLButtonElement>('button.speak')!;
    expect(button.getAttribute('aria-label')).toBe('Lees voor');
    button.click();
    expect(speak).toHaveBeenCalledWith('Frankrijk. De hoofdstad is Parijs.');
  });
});
