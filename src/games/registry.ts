import type { Game } from '../core/types';
import { clockGame } from './clock';
import { tablesGame } from './tables';
import { flagsGame } from './flags';

export const GAMES: readonly Game[] = [clockGame, tablesGame, flagsGame];
