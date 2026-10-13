import type { Game } from '../../core/types';
import { makeSolarQuestion } from './questions';
import { solarStudy } from './study';
export const solarGame: Game = {
  id:'solar',title:{nl:'Zonnestelsel',en:'Solar System'},icon:'icons/solar.svg',pickerLayout:'list',
  levels:[
    {id:'planets',label:{nl:'Planeten herkennen',en:'Recognize planets'},example:{nl:'Herken de acht planeten op NASA-afbeeldingen',en:'Recognize the eight planets in NASA images'},autoSpeak:false,roundLength:8},
    {id:'order',label:{nl:'Welke planeet ontbreekt?',en:'Which planet is missing?'},example:{nl:'Vul de volgorde vanaf de zon aan',en:'Complete the order outward from the Sun'},autoSpeak:false},
    {id:'riddles',label:{nl:'Ruimteraadsels',en:'Space riddles'},example:{nl:'Raad het hemellichaam met een aanwijzing',en:'Guess the space object from a clue'},autoSpeak:false},
  ],study:solarStudy,makeQuestion:makeSolarQuestion,
};
