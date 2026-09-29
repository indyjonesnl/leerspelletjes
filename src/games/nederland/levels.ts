import type { Level } from '../../core/types';

export const NL_LEVELS: Level[] = [
  { id: '1', label: { nl: 'Provincies', en: 'Provinces' }, example: { nl: 'Gelderland, Zeeland, Friesland…', en: 'Gelderland, Zeeland, Friesland…' }, autoSpeak: true, roundLength: 12 },
  { id: '2', label: { nl: 'Hoofdsteden', en: 'Capitals' }, example: { nl: 'Arnhem, Middelburg, Leeuwarden…', en: 'Arnhem, Middelburg, Leeuwarden…' }, autoSpeak: false, roundLength: 12 },
  { id: '3', label: { nl: 'Hoofdsteden op de kaart', en: 'Capitals on the map' }, example: { nl: 'Waar ligt Zwolle?', en: 'Where is Zwolle?' }, autoSpeak: false, roundLength: 12 },
];
