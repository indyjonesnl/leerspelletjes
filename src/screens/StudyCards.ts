import type { Lang } from '../core/types';
import { t } from '../core/i18n';
import { el } from '../core/ui';

export interface StudyItem {
  key: string;
  /** Relative URL of the flag image. */
  flag: string;
  name: string;
  /** Second line under the name, e.g. the capital. */
  detail?: string;
}

export interface InfoContent {
  flag: string;
  name: string;
  capital: string;
  /** Read aloud by the speaker button. */
  speech: string;
}

export interface InfoCard {
  el: HTMLElement;
  /** Shows the details, or the hint again for null. */
  show(content: InfoContent | null): void;
}

/** Items sorted by name in the language's own order (accents and "ë" sort with their letter). */
export function sortedBy<T>(items: readonly T[], nameOf: (item: T) => string, lang: Lang): T[] {
  return [...items].sort((a, b) => nameOf(a).localeCompare(nameOf(b), lang));
}

/** A flag picture. Decorative (the name is written next to it); stays an empty frame if the file does not load. */
export function flagImage(src: string, lazy = true): HTMLImageElement {
  const img = el('img', { class: 'study-flag', src, alt: '', loading: lazy ? 'lazy' : undefined });
  img.addEventListener('error', () => img.classList.add('missing'));
  return img;
}

/** A grid of cards: flag, name and an optional detail line. */
export function studyGrid(items: readonly StudyItem[]): HTMLUListElement {
  return el('ul', { class: 'study-grid' },
    ...items.map((item) =>
      el('li', { class: 'study-card' },
        el('span', { class: 'study-frame' }, flagImage(item.flag)),
        el('span', { class: 'study-name' }, item.name),
        ...(item.detail ? [el('span', { class: 'study-detail' }, item.detail)] : []),
      ),
    ),
  );
}

/** The card under a study map: a hint first, then flag, name and capital of what was tapped. */
export function infoCard(lang: Lang, hint: string, speak?: (text: string) => void): InfoCard {
  const root = el('div', { class: 'info-card', 'aria-live': 'polite' });

  function show(content: InfoContent | null): void {
    if (!content) {
      root.replaceChildren(el('p', { class: 'info-hint' }, hint));
      return;
    }
    root.replaceChildren(
      el('span', { class: 'study-frame info-frame' }, flagImage(content.flag, false)),
      el('div', { class: 'info-text' },
        el('strong', { class: 'info-name' }, content.name),
        el('span', { class: 'info-capital' }, `${t(lang, 'capital')}: ${content.capital}`),
      ),
    );
    if (speak) {
      const button = el('button', { type: 'button', class: 'icon-button speak', 'aria-label': t(lang, 'speak') }, '🔈');
      button.addEventListener('click', () => speak(content.speech));
      root.append(button);
    }
  }

  show(null);
  return { el: root, show };
}
