import type { Level, StudyContext } from '../../core/types';
import { el } from '../../core/ui';
import { PLANETS, RIDDLES, SPACE_OBJECTS } from './data';
import { imageCredit, orderDiagram, planetImage } from './visuals';

export function solarStudy(level: Level, {lang,speak}: StudyContext): HTMLElement {
  const root = el('div',{class:'solar-study'});
  root.append(el('p',{},lang === 'nl' ? 'Ons zonnestelsel heeft acht planeten. De zon is een ster, de maan draait om de aarde en Pluto is een dwergplaneet.' : 'Our solar system has eight planets. The Sun is a star, the Moon orbits Earth and Pluto is a dwarf planet.'));
  if (level.id === 'order') root.append(orderDiagram([],lang,true));
  const grid = el('div',{class:'study-grid solar-study-grid'});
  PLANETS.forEach((planet,i) => {
    const title = level.id === 'order' ? `${i+1}. ${planet.name[lang]}` : planet.name[lang];
    const text = `${title}. ${planet.description[lang]} ${planet.fact[lang]}`;
    const card = el('article',{class:'study-card'},el('h2',{},title),planetImage(planet,lang,true),el('p',{},planet.description[lang]),el('p',{},planet.fact[lang]),imageCredit(planet,lang));
    if (speak) {
      const button = el('button',{type:'button',class:'btn btn-small','aria-label':`${lang === 'nl' ? 'Lees voor' : 'Read aloud'}: ${planet.name[lang]}`},lang === 'nl' ? 'Lees voor' : 'Read aloud');
      button.addEventListener('click',() => speak(text)); card.append(button);
    }
    grid.append(card);
  });
  if (level.id === 'riddles') RIDDLES.slice(8).forEach(riddle => {
    const name = SPACE_OBJECTS.find(o => o.id === riddle.answerId)!.label[lang];
    const card = el('article',{class:'study-card'},el('h2',{},name),el('p',{},riddle.clue[lang]));
    if (speak) {
      const button = el('button',{type:'button',class:'btn btn-small','aria-label':`${lang === 'nl' ? 'Lees voor' : 'Read aloud'}: ${name}`},lang === 'nl' ? 'Lees voor' : 'Read aloud');
      button.addEventListener('click',() => speak(`${name}. ${riddle.clue[lang]}`));card.append(button);
    }
    grid.append(card);
  });
  root.append(grid,el('p',{class:'solar-fact-source'},lang === 'nl' ? 'Feiten: ' : 'Facts: ',el('a',{href:'https://science.nasa.gov/solar-system/planets/'},'NASA Science')));
  return root;
}
