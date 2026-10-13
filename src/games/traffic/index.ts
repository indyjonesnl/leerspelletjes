import type { Game } from '../../core/types';
import { TRAFFIC_LEVELS } from './levels';
import { makeTrafficQuestion } from './questions';
import { trafficStudy } from './study';

export const trafficGame: Game = {
  id: 'traffic', title: { nl: 'Verkeersborden', en: 'Traffic Signs' }, icon: 'icons/traffic.svg',
  pickerLayout: 'list', levels: TRAFFIC_LEVELS, makeQuestion: makeTrafficQuestion, study: trafficStudy,
};
