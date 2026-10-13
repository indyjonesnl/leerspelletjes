import type { Localized } from '../../core/types';

export interface WordEntry { id: string; picture: string; word: Localized; clue: Localized }
// Describe the picture for read-aloud and screen readers without spelling the answer.
const CLUES = {
  cat: ['Een huisdier dat miauwt', 'A pet that meows'],
  sun: ['Geeft overdag licht aan de hemel', 'Shines in the sky during the day'],
  pen: ['Hiermee schrijf je met inkt', 'You write with ink using this'],
  bus: ['Een groot voertuig voor veel passagiers', 'A large vehicle for many passengers'],
  fox: ['Een dier met een roodbruine vacht en een pluimstaart', 'An animal with reddish fur and a bushy tail'],
  owl: ['Een vogel die vaak ’s nachts jaagt', 'A bird that often hunts at night'],
  hen: ['Een boerderijdier dat eieren legt', 'A farm bird that lays eggs'],
  cow: ['Een groot boerderijdier dat melk geeft', 'A large farm animal that gives milk'],
  egg: ['Heeft een schaal met een dooier erin', 'Has a shell with a yolk inside'],
  bee: ['Een zoemend insect dat honing maakt', 'A buzzing insect that makes honey'],
  hat: ['Dit draag je op je hoofd tegen de zon', 'You wear this on your head against the sun'],
  cup: ['Hieruit drink je koffie of thee', 'You drink coffee or tea from this'],
  bike: ['Een voertuig met twee wielen en trappers', 'A vehicle with two wheels and pedals'],
  apple: ['Een ronde vrucht die rood of groen kan zijn', 'A round fruit that can be red or green'],
  horse: ['Een dier waarop je kunt rijden', 'An animal you can ride'],
  train: ['Een voertuig dat op rails rijdt', 'A vehicle that travels on rails'],
  duck: ['Een watervogel die kwaakt', 'A water bird that quacks'],
  book: ['Heeft bladzijden om te lezen', 'Has pages for you to read'],
  boat: ['Hiermee vaar je over het water', 'You sail on the water in this'],
  star: ['Een lichtpunt aan de nachtelijke hemel', 'A tiny point of light in the night sky'],
  moon: ['Draait om de aarde en schijnt ’s nachts', 'Orbits the Earth and shines at night'],
  tree: ['Een grote plant met een stam en takken', 'A large plant with a trunk and branches'],
  door: ['Deze doe je open om een kamer binnen te gaan', 'You open this to enter a room'],
  bear: ['Een groot dier met een dikke vacht en sterke klauwen', 'A large animal with thick fur and strong claws'],
  banana: ['Een lange, kromme, gele vrucht', 'A long, curved, yellow fruit'],
  carrot: ['Een oranje groente die onder de grond groeit', 'An orange vegetable that grows underground'],
  rabbit: ['Een dier met lange oren dat huppelt', 'An animal with long ears that hops'],
  pirate: ['Een zeerover met een schip en een schat', 'A sea robber with a ship and treasure'],
  pencil: ['Hiermee schrijf je, en je kunt het uitgummen', 'You write with this and can erase the marks'],
  guitar: ['Een muziekinstrument met zes snaren', 'A musical instrument with six strings'],
  turtle: ['Een dier dat zijn huis als een schild meedraagt', 'An animal that carries a protective shell'],
  dolphin: ['Een zeezoogdier dat uit het water kan springen', 'A sea mammal that can leap out of the water'],
  elephant: ['Een groot dier met een slurf', 'A large animal with a trunk'],
  airplane: ['Een voertuig met vleugels dat door de lucht reist', 'A vehicle with wings that travels through the sky'],
  butterfly: ['Een insect met grote, kleurrijke vleugels', 'An insect with large, colourful wings'],
  tomato: ['Een ronde, rode vrucht die vaak in een salade zit', 'A round, red fruit often used in salads'],
} satisfies Record<string, [string, string]>;

const entry = (id: keyof typeof CLUES, picture: string, nl: string, en: string): WordEntry => ({
  id, picture, word: { nl, en }, clue: { nl: CLUES[id][0], en: CLUES[id][1] },
});

/** Familiar, pictured nouns; each language has at least ten words per length band. */
export const WORDS: Record<string, WordEntry[]> = {
  short: [
    entry('cat', '🐱', 'kat', 'cat'), entry('sun', '☀️', 'zon', 'sun'),
    entry('pen', '🖊️', 'pen', 'pen'), entry('bus', '🚌', 'bus', 'bus'),
    entry('fox', '🦊', 'vos', 'fox'), entry('owl', '🦉', 'uil', 'owl'),
    entry('hen', '🐔', 'kip', 'hen'), entry('cow', '🐮', 'koe', 'cow'),
    entry('egg', '🥚', 'ei', 'egg'), entry('bee', '🐝', 'bij', 'bee'),
    entry('hat', '🧢', 'pet', 'hat'), entry('cup', '☕', 'kop', 'cup'),
  ],
  medium: [
    entry('bike', '🚲', 'fiets', 'bike'), entry('apple', '🍎', 'appel', 'apple'),
    entry('horse', '🐴', 'paard', 'horse'), entry('train', '🚂', 'trein', 'train'),
    entry('duck', '🦆', 'eend', 'duck'), entry('book', '📖', 'boek', 'book'),
    entry('boat', '⛵', 'boot', 'boat'), entry('star', '⭐', 'ster', 'star'),
    entry('moon', '🌙', 'maan', 'moon'), entry('tree', '🌳', 'boom', 'tree'),
    entry('door', '🚪', 'deur', 'door'), entry('bear', '🐻', 'beer', 'bear'),
  ],
  long: [
    entry('banana', '🍌', 'banaan', 'banana'), entry('carrot', '🥕', 'wortel', 'carrot'),
    entry('rabbit', '🐰', 'konijn', 'rabbit'), entry('pirate', '🏴‍☠️', 'piraat', 'pirate'),
    entry('pencil', '✏️', 'potlood', 'pencil'), entry('guitar', '🎸', 'gitaar', 'guitar'),
    entry('turtle', '🐢', 'schildpad', 'turtle'), entry('dolphin', '🐬', 'dolfijn', 'dolphin'),
    entry('elephant', '🐘', 'olifant', 'elephant'), entry('airplane', '✈️', 'vliegtuig', 'airplane'),
    entry('butterfly', '🦋', 'vlinder', 'butterfly'), entry('tomato', '🍅', 'tomaat', 'tomato'),
  ],
};
