import type { Game } from '../core/types';
import { clockGame } from './clock';
import { tablesGame } from './tables';
import { flagsGame } from './flags';
import { mapGame } from './map';
import { capitalsGame } from './capitals';
import { nederlandGame } from './nederland';
import { moneyGame } from './money';
import { wordsGame } from './words';
import { patternsGame } from './patterns';
import { initialsGame } from './initials';

export const GAMES: readonly Game[] = [clockGame, tablesGame, flagsGame, mapGame, capitalsGame, nederlandGame, moneyGame, wordsGame, patternsGame, initialsGame];
