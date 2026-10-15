import type { Level } from '../../core/types';
import { TRAFFIC_SIGNS } from './data';

export const TRAFFIC_LEVELS: Level[] = [
  { id: 'common', label: { nl: 'Herken het bord', en: 'Recognise the sign' }, example: { nl: 'Stop · Voorrang · Fietspad', en: 'Stop · Give way · Cycle path' }, autoSpeak: true },
  { id: 'cycling', label: { nl: 'Lopen en fietsen', en: 'Walking and cycling' }, example: { nl: 'Paden · Oversteken · Waarschuwingen', en: 'Paths · Crossings · Warnings' }, autoSpeak: true },
  { id: 'situations', label: { nl: 'Wat doe je?', en: 'What do you do?' }, example: { nl: 'Kies wat het bord je vertelt', en: 'Choose what the sign tells you' }, autoSpeak: false },
  { id: 'places', label: { nl: 'Herken de verkeersplek', en: 'Recognise the traffic scene' }, example: { nl: 'Haaientanden · Rotonde · Zebrapad', en: 'Give-way triangles · Roundabout · Zebra crossing' }, autoSpeak: false },
];

const common = new Set(['B1', 'B6', 'B7', 'C2', 'C14', 'C16', 'G7', 'G11', 'D2', 'D4', 'D5', 'L2']);
export const TRAFFIC_POOLS = {
  common: TRAFFIC_SIGNS.filter((s) => common.has(s.code)),
  cycling: TRAFFIC_SIGNS.filter((s) => s.code !== 'B1'),
  situations: TRAFFIC_SIGNS,
};
