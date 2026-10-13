import type { Localized } from '../../core/types';

export interface InitialPicture { id: string; picture: string; word: Localized }
const entry = (id: string, picture: string, nl: string, en: string): InitialPicture => ({ id, picture, word: { nl, en } });

/** Familiar nouns. The spoken name clarifies which word to use for each picture. */
export const INITIAL_PICTURES: InitialPicture[] = [
  entry('cat', '🐱', 'kat', 'cat'), entry('dog', '🐶', 'hond', 'dog'),
  entry('sun', '☀️', 'zon', 'sun'), entry('bus', '🚌', 'bus', 'bus'),
  entry('fox', '🦊', 'vos', 'fox'), entry('owl', '🦉', 'uil', 'owl'),
  entry('cow', '🐮', 'koe', 'cow'), entry('egg', '🥚', 'ei', 'egg'),
  entry('bee', '🐝', 'bij', 'bee'), entry('fish', '🐟', 'vis', 'fish'),
  entry('bike', '🚲', 'fiets', 'bike'), entry('apple', '🍎', 'appel', 'apple'),
  entry('horse', '🐴', 'paard', 'horse'), entry('train', '🚂', 'trein', 'train'),
  entry('duck', '🦆', 'eend', 'duck'), entry('book', '📖', 'boek', 'book'),
  entry('boat', '⛵', 'boot', 'boat'), entry('star', '⭐', 'ster', 'star'),
  entry('moon', '🌙', 'maan', 'moon'), entry('tree', '🌳', 'boom', 'tree'),
  entry('door', '🚪', 'deur', 'door'), entry('bear', '🐻', 'beer', 'bear'),
  entry('banana', '🍌', 'banaan', 'banana'), entry('carrot', '🥕', 'wortel', 'carrot'),
  entry('rabbit', '🐰', 'konijn', 'rabbit'), entry('lion', '🦁', 'leeuw', 'lion'),
  entry('pencil', '✏️', 'potlood', 'pencil'), entry('guitar', '🎸', 'gitaar', 'guitar'),
  entry('turtle', '🐢', 'schildpad', 'turtle'), entry('dolphin', '🐬', 'dolfijn', 'dolphin'),
  entry('elephant', '🐘', 'olifant', 'elephant'), entry('airplane', '✈️', 'vliegtuig', 'airplane'),
  entry('butterfly', '🦋', 'vlinder', 'butterfly'), entry('tomato', '🍅', 'tomaat', 'tomato'),
  entry('house', '🏠', 'huis', 'house'), entry('balloon', '🎈', 'ballon', 'balloon'),
];
