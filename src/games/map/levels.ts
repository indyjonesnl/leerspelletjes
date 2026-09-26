import type { Level } from '../../core/types';
import type { MapCountry, RegionId, RegionMap } from './types';

export const STARTER_MAP_CODES: readonly string[] = ['NL', 'BE', 'DE', 'FR', 'GB', 'ES', 'IT', 'PL', 'PT', 'AT', 'CH', 'DK', 'SE', 'NO', 'IE'];

export interface MapLevelConfig {
  region: RegionId;
  /** 'tap': tap the country on the map. 'small': drag the name onto one of four boxes. */
  kind: 'tap' | 'small';
  /** Limits a tap level to these countries (the starter level). */
  codes?: readonly string[];
}

export const MAP_LEVELS: Level[] = [
  { id: '1', label: { nl: 'Bekende landen', en: 'Well-known countries' }, example: { nl: 'Nederland, Duitsland, Frankrijk…', en: 'Netherlands, Germany, France…' }, autoSpeak: true },
  { id: '2', label: { nl: 'Europa', en: 'Europe' }, example: { nl: 'Polen, Zweden, Griekenland…', en: 'Poland, Sweden, Greece…' }, autoSpeak: false },
  { id: '3', label: { nl: 'Europa – kleine landen', en: 'Europe – small countries' }, example: { nl: 'Monaco, Malta, Andorra…', en: 'Monaco, Malta, Andorra…' }, autoSpeak: false, roundLength: 5 },
  { id: '4', label: { nl: 'Amerika', en: 'The Americas' }, example: { nl: 'Canada, Mexico, Brazilië…', en: 'Canada, Mexico, Brazil…' }, autoSpeak: false },
  { id: '5', label: { nl: 'Amerika – kleine landen', en: 'The Americas – small countries' }, example: { nl: 'Jamaica, Barbados, Grenada…', en: 'Jamaica, Barbados, Grenada…' }, autoSpeak: false, roundLength: 5 },
  { id: '6', label: { nl: 'Afrika', en: 'Africa' }, example: { nl: 'Egypte, Kenia, Nigeria…', en: 'Egypt, Kenya, Nigeria…' }, autoSpeak: false },
  { id: '7', label: { nl: 'Afrika – kleine landen', en: 'Africa – small countries' }, example: { nl: 'Rwanda, Gambia, Seychellen…', en: 'Rwanda, Gambia, Seychelles…' }, autoSpeak: false, roundLength: 5 },
  { id: '8', label: { nl: 'Azië en Oceanië', en: 'Asia and Oceania' }, example: { nl: 'China, India, Australië…', en: 'China, India, Australia…' }, autoSpeak: false },
  { id: '9', label: { nl: 'Azië en Oceanië – eilanden en kleine landen', en: 'Asia and Oceania – islands and small country' }, example: { nl: 'Singapore, Fiji, Qatar…', en: 'Singapore, Fiji, Qatar…' }, autoSpeak: false, roundLength: 5 },
];

export const MAP_CONFIG: Record<string, MapLevelConfig> = {
  '1': { region: 'europe', kind: 'tap', codes: STARTER_MAP_CODES },
  '2': { region: 'europe', kind: 'tap' },
  '3': { region: 'europe', kind: 'small' },
  '4': { region: 'americas', kind: 'tap' },
  '5': { region: 'americas', kind: 'small' },
  '6': { region: 'africa', kind: 'tap' },
  '7': { region: 'africa', kind: 'small' },
  '8': { region: 'asia-oceania', kind: 'tap' },
  '9': { region: 'asia-oceania', kind: 'small' },
};

/** The countries a level asks about. */
export function levelPool(config: MapLevelConfig, map: RegionMap): MapCountry[] {
  return map.countries.filter((c) =>
    config.kind === 'small' ? c.small : !c.small && (!config.codes || config.codes.includes(c.code)),
  );
}
