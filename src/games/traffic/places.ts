import type { Localized, Question, Rng, StudyContext } from '../../core/types';
import { el } from '../../core/ui';
import { pickFresh } from '../../core/pick';
import { PHOTO_CREDITS } from './photo-credits';

const text = (nl: string, en: string): Localized => ({ nl, en });
const names = {
  teeth: text('Haaientanden', 'Give-way triangles'),
  roundabout: text('Rotonde', 'Roundabout'),
  zebra: text('Zebrapad', 'Zebra crossing'),
  path: text('Fietspad', 'Cycle path'),
};
const lessons = {
  teeth: text('Haaientanden zijn witte driehoeken op de weg. Als je fietst, betekenen ze: geef voorrang aan bestuurders op de kruisende weg. Kijk altijd goed uit.', 'Give-way triangles are white triangles on the road. When cycling, they mean: give way to drivers and cyclists on the crossing road. Always look carefully.'),
  roundabout: text('Op een rotonde loopt de weg rond een eiland in het midden. Kijk naar de borden en haaientanden om te zien wie moet wachten.', 'At a roundabout, the road goes around a central island. Look at the signs and give-way triangles to see who must wait.'),
  zebra: text('Een zebrapad heeft brede witte strepen. Het is een oversteekplaats voor voetgangers. Kijk goed of het verkeer je ziet en je laat oversteken.', 'A zebra crossing has broad white stripes. It is a crossing for pedestrians. Check that traffic sees you and lets you cross.'),
};
const photos = [
  { file: 'teeth-delft.jpg', kind: 'teeth', alt: text('Witte driehoeken op de weg bij een kruising in Delft.', 'White triangles on the road at a junction in Delft.') },
  { file: 'teeth-utrecht.jpg', kind: 'teeth', alt: text('Rijen witte driehoeken bij een kruising met een fietspad in Utrecht.', 'Rows of white triangles at a junction with a cycle path in Utrecht.') },
  { file: 'roundabout-petten.jpg', kind: 'roundabout', alt: text('Een weg die om een groen eiland loopt, gezien van bovenaf in Petten.', 'A road circling a green island, seen from above in Petten.') },
  { file: 'roundabout-maastricht.jpg', kind: 'roundabout', alt: text('Auto’s rijden rond een eiland met planten in Maastricht.', 'Cars travel around an island with plants in Maastricht.') },
  { file: 'zebra-overhead.png', kind: 'zebra', alt: text('Van bovenaf: brede witte strepen dwars over de weg en het fietspad.', 'Seen from above: broad white stripes across the road and cycle path.') },
  { file: 'zebra-groesbeek.jpg', kind: 'zebra', alt: text('Brede witte strepen over de weg met een vluchtheuvel in Groesbeek.', 'Broad white stripes across the road with a refuge island in Groesbeek.') },
] as const;
type Photo = typeof photos[number];

function photoFigure(photo: Photo, lang: 'nl' | 'en'): HTMLElement {
  const credit = PHOTO_CREDITS[photo.file];
  return el('figure', { class: 'traffic-place-photo' },
    el('img', { src: `traffic-places/${photo.file}`, alt: photo.alt[lang], class: 'traffic-photo', 'data-photo-id': photo.file }),
    el('figcaption', { class: 'traffic-photo-credit' },
      el('a', { href: credit.source, target: '_blank', rel: 'noopener noreferrer' }, credit.author),
      ' · ', el('a', { href: credit.licenseUrl, target: '_blank', rel: 'noopener noreferrer' }, credit.license),
    ),
  );
}

function task(photo: Photo, meaning: boolean) {
  if (!meaning) return {
    prompt: photo.kind === 'teeth' ? text('Hoe heten de witte driehoeken op de weg?', 'What are the white triangles on the road called?')
      : photo.kind === 'roundabout' ? text('Hoe heet deze ronde kruising?', 'What is this circular junction called?')
      : text('Hoe heet de oversteekplaats met brede witte strepen?', 'What is the crossing with broad white stripes called?'),
    choices: Object.entries(names).map(([id, label]) => ({ id, label })), answerId: photo.kind,
  };
  if (photo.file === 'teeth-utrecht.jpg') return {
    prompt: text('Welke vorm hebben de haaientanden?', 'What shape are the give-way markings?'),
    choices: ['triangle', 'circle', 'square', 'star'].map((id, i) => ({ id, label: [text('Driehoeken', 'Triangles'), text('Cirkels', 'Circles'), text('Vierkanten', 'Squares'), text('Sterren', 'Stars')][i] })), answerId: 'triangle',
  };
  if (photo.kind === 'teeth') return {
    prompt: text('Je fietst naar deze haaientanden. Wat betekenen ze?', 'You cycle towards these give-way triangles. What do they mean?'),
    choices: [
      { id: 'give-way', label: text('Geef bestuurders op de kruisende weg voorrang', 'Give way to drivers and cyclists on the crossing road') },
      { id: 'park', label: text('Hier mag je parkeren', 'You may park here') },
      { id: 'play', label: text('Hier mag je op de weg spelen', 'You may play on the road here') },
      { id: 'path', label: text('Hier begint een fietspad', 'A cycle path starts here') },
    ], answerId: 'give-way',
  };
  if (photo.kind === 'roundabout') return {
    prompt: text('Waar loopt de weg op deze rotonde omheen?', 'What does the road go around at this roundabout?'),
    choices: [
      { id: 'island', label: text('Een eiland in het midden', 'A central island') },
      { id: 'bridge', label: text('Een brug', 'A bridge') },
      { id: 'tunnel', label: text('Een tunnel', 'A tunnel') },
      { id: 'station', label: text('Een station', 'A railway station') },
    ], answerId: 'island',
  };
  return {
    prompt: text('Waarvoor zijn de brede witte strepen van het zebrapad?', 'What are the broad white stripes of the zebra crossing for?'),
    choices: [
      { id: 'cross', label: text('Voetgangers kunnen hier oversteken', 'Pedestrians can cross here') },
      { id: 'park', label: text('Auto’s kunnen hier parkeren', 'Cars can park here') },
      { id: 'race', label: text('Fietsers kunnen hier racen', 'Cyclists can race here') },
      { id: 'play', label: text('Kinderen kunnen hier op de weg spelen', 'Children can play on the road here') },
    ], answerId: 'cross',
  };
}

const exercises = photos.flatMap(photo => [false, true].map(meaning => ({ photo, meaning, key: `places:${photo.file}:${meaning ? 'meaning' : 'name'}` })));

export function makePlaceQuestion(rng: Rng, previous: readonly Question[]): Question {
  const lastPhoto = previous.at(-1)?.key.split(':')[1];
  const { photo, meaning, key } = pickFresh(exercises.filter(e => e.photo.file !== lastPhoto), previous, e => e.key, rng);
  const exercise = task(photo, meaning);
  return {
    key, prompt: exercise.prompt, choices: rng.shuffle(exercise.choices), answerId: exercise.answerId,
    autoAdvance: false,
    visual: ({ lang, picked }) => el('div', { class: 'traffic-place' }, photoFigure(photo, lang),
      ...(picked ? [el('p', { class: 'traffic-place-explanation' }, lessons[photo.kind][lang])] : [])),
  };
}

export function placesStudy({ lang }: StudyContext): HTMLElement {
  return el('section', { class: 'study traffic-places-study' },
    el('h2', {}, text('Herken de verkeersplek', 'Recognise the traffic scene')[lang]),
    el('p', { class: 'subtitle' }, text('Kijk naar echte plekken in Nederland.', 'Look at real places in the Netherlands.')[lang]),
    el('ul', { class: 'study-grid traffic-study-grid' }, ...photos.map(photo => el('li', { class: 'study-card' },
      photoFigure(photo, lang), el('strong', { class: 'study-name' }, names[photo.kind][lang]),
      el('p', { class: 'traffic-action' }, lessons[photo.kind][lang]),
    ))),
  );
}
