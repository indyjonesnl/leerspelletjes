import type { Game, Level, Question, Rng, StudyContext } from '../../core/types';
import { pickFresh } from '../../core/pick';
import { el } from '../../core/ui';
import { BONES, ORGANS } from './data';
import { bodyDiagram } from './diagram';

export function makeBodyQuestion(level: Level, rng: Rng, previous: readonly Question[]): Question {
  const skeleton = level.id === 'bones';
  const functions = level.id === 'functions';
  const pool = skeleton ? BONES : ORGANS;
  const target = pickFresh(pool, previous, p => p.id, rng);
  const options = rng.shuffle([target, ...rng.shuffle(pool.filter(p => p.id !== target.id)).slice(0,3)]);
  const prompt = functions
    ? {nl:`Wat doen de ${target.name.nl.toLowerCase()}?`,en:`What is the function of the ${target.name.en.toLowerCase()}?`}
    : skeleton ? {nl:'Welk deel van het skelet is oranje?',en:'Which part of the skeleton is orange?'}
      : {nl:'Welk orgaan is oranje?',en:'Which organ is orange?'};
  // Neutral Dutch wording works with both singular organs and plural paired organs.
  if (functions) prompt.nl = `Welke functie hoort bij: ${target.name.nl.toLowerCase()}?`;
  const location = {nl:`Oranje: ${target.location.nl}`,en:`Orange: ${target.location.en}`};
  return {
    key:target.id, prompt,
    speech:{nl:`${prompt.nl} ${location.nl}`,en:`${prompt.en} ${location.en}`},
    visual: ({lang,picked}) => bodyDiagram(target,skeleton,lang,functions || picked !== null),
    visualLabel:{hidden:functions ? {nl:`${target.name.nl}. ${location.nl}`,en:`${target.name.en}. ${location.en}`} : location,
      revealed:{nl:`${target.name.nl}. ${location.nl}`,en:`${target.name.en}. ${location.en}`}},
    choices:options.map(p=>({id:p.id,label:functions ? p.function : p.name})), answerId:target.id,
  };
}

export function bodyStudy(level: Level, {lang,speak}:StudyContext): HTMLElement {
  const skeleton = level.id === 'bones';
  const root = el('section',{class:'body-study'},el('h2',{},lang === 'nl' ? (skeleton ? 'Leer de delen van het skelet' : 'Leer de organen en hun functies') : (skeleton ? 'Learn the parts of the skeleton' : 'Learn the organs and their functions')));
  root.append(el('p',{},lang === 'nl' ? 'Je ziet het lichaam van voren. Links op het plaatje is de rechterkant van de persoon. Delen die achter andere organen liggen zijn zichtbaar gemaakt. Oranje toont het deel dat je leert.' : 'You see the body from the front. Picture left is the person’s right. Parts behind other organs are made visible. Orange shows the part you are learning.'));
  const grid = el('div',{class:'body-study-grid'});
  for (const p of skeleton ? BONES : ORGANS) {
    const card = el('article',{class:'study-card body-study-card'},el('h3',{},p.name[lang]),bodyDiagram(p,skeleton,lang),el('p',{},p.function[lang]),el('p',{class:'body-location'},p.location[lang]));
    if (speak) {
      const button = el('button',{type:'button',class:'btn secondary'},lang === 'nl' ? 'Lees voor' : 'Read aloud');
      button.addEventListener('click',()=>speak(`${p.name[lang]}. ${p.function[lang]} ${p.location[lang]}`));
      card.append(button);
    }
    grid.append(card);
  }
  root.append(grid);
  return root;
}

export const bodyGame: Game = {
  id:'body', title:{nl:'Lichaamsverkenner',en:'Body Explorer'}, icon:'icons/body.svg', pickerLayout:'list',
  levels:[
    {id:'organs',label:{nl:'Organen herkennen',en:'Recognize organs'},example:{nl:'Welk orgaan is oranje?',en:'Which organ is orange?'},autoSpeak:false},
    {id:'functions',label:{nl:'Functies van organen',en:'Organ functions'},example:{nl:'Het hart pompt bloed',en:'The heart pumps blood'},autoSpeak:false},
    {id:'bones',label:{nl:'Delen van het skelet',en:'Parts of the skeleton'},example:{nl:'Herken botten en groepen botten',en:'Recognize bones and groups of bones'},autoSpeak:false},
  ],
  makeQuestion:makeBodyQuestion,study:bodyStudy,
};
