import type { Game } from '../core/types';
import { clockGame } from './clock';
import { tablesGame } from './tables';
import { flagsGame } from './flags';
import { mapGame } from './map';
import { capitalsGame } from './capitals';

export const GAMES: readonly Game[] = [clockGame, tablesGame, flagsGame, mapGame, capitalsGame];
