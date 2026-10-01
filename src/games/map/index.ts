import type { Game } from '../../core/types';
import { MAP_CONFIG, MAP_LEVELS } from './levels';
import { loadRegion } from './regions';
import { makeMapQuestion } from './questions';
import { mapStudy } from './study';

export const mapGame: Game = {
  id: 'map',
  title: { nl: 'Waar ligt het?', en: 'Where is it?' },
  icon: 'icons/map.svg',
  pickerLayout: 'list',
  levels: MAP_LEVELS,
  async load(level) {
    await loadRegion(MAP_CONFIG[level.id].region);
  },
  makeQuestion: makeMapQuestion,
  study: mapStudy,
};
