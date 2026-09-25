import type { Level } from '../../core/types';

export interface ClockLevelConfig {
  minutes: readonly number[];
  mode: '12h' | '24h';
}

export const CLOCK_LEVELS: Level[] = [
  { id: '1', label: { nl: 'Hele uren', en: 'Whole hours' }, example: { nl: 'drie uur', en: "three o'clock" }, autoSpeak: true },
  { id: '2', label: { nl: 'Halve uren', en: 'Half hours' }, example: { nl: 'half vier', en: 'half past three' }, autoSpeak: true },
  { id: '3', label: { nl: 'Kwartieren', en: 'Quarter hours' }, example: { nl: 'kwart over drie', en: 'quarter past three' }, autoSpeak: false },
  { id: '4', label: { nl: 'Per vijf minuten', en: 'Five minutes' }, example: { nl: 'vijf voor half vier', en: 'twenty-five past three' }, autoSpeak: false },
  { id: '5', label: { nl: 'Digitaal en 24 uur', en: 'Digital and 24-hour' }, example: { nl: "14:30 = half drie 's middags", en: '14:30 = half past two in the afternoon' }, autoSpeak: false },
];

export const CLOCK_CONFIG: Record<string, ClockLevelConfig> = {
  '1': { minutes: [0], mode: '12h' },
  '2': { minutes: [0, 30], mode: '12h' },
  '3': { minutes: [0, 15, 30, 45], mode: '12h' },
  '4': { minutes: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55], mode: '12h' },
  '5': { minutes: [0, 15, 30, 45], mode: '24h' },
};
