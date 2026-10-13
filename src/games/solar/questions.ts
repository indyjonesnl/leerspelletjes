import type { Choice, Level, Question, Rng } from '../../core/types';
import { pickFresh } from '../../core/pick';
import { el } from '../../core/ui';
import { PLANETS, ORDER_PROBLEMS, RIDDLES, SPACE_OBJECTS } from './data';
import { imageCredit, orderDiagram, planetImage } from './visuals';

function choices(answer: Choice, pool: readonly Choice[], rng: Rng): Choice[] {
  return rng.shuffle([answer,...rng.shuffle(pool.filter(c => c.id !== answer.id)).slice(0,3)]);
}
export function makeSolarQuestion(level: Level, rng: Rng, previous: readonly Question[]): Question {
  if (level.id === 'order') {
    const problem = pickFresh(ORDER_PROBLEMS,previous,p => `order:${p.id}`,rng);
    const pool = ORDER_PROBLEMS.filter(p => p.missing.length === problem.missing.length).map(p => ({
      id:p.missing.map(i => PLANETS[i].id).join('+'),
      label:{nl:p.missing.map(i => PLANETS[i].name.nl).join(' → '),en:p.missing.map(i => PLANETS[i].name.en).join(' → ')},
    }));
    const answer = pool.find(c => c.id === problem.missing.map(i => PLANETS[i].id).join('+'))!;
    const positions = problem.missing.map(i => i+1).join(' & ');
    const prompt = problem.missing.length === 1
      ? {nl:`Welke planeet ontbreekt op plaats ${positions}?`,en:`Which planet is missing at position ${positions}?`}
      : {nl:`Welke planeten ontbreken op plaatsen ${positions}? Kies in die volgorde.`,en:`Which planets are missing at positions ${positions}? Choose them in that order.`};
    const sequence = (lang: 'nl'|'en') => PLANETS.map((p,i) => `${i+1}: ${problem.missing.includes(i) ? (lang === 'nl' ? 'vraagteken' : 'question mark') : p.name[lang]}`).join('. ');
    return {key:`order:${problem.id}`,prompt,speech:{nl:`${prompt.nl} Vanaf de zon: ${sequence('nl')}.`,en:`${prompt.en} Outward from the Sun: ${sequence('en')}.`},answerId:answer.id,choices:choices(answer,pool,rng),visual:({lang,picked}) => orderDiagram(problem.missing,lang,picked !== null)};
  }
  if (level.id === 'riddles') {
    const riddle = pickFresh(RIDDLES,previous,r => `riddles:${r.id}`,rng);
    const answer = SPACE_OBJECTS.find(c => c.id === riddle.answerId)!;
    return {key:`riddles:${riddle.id}`,prompt:{nl:'Welk hemellichaam past bij dit raadsel?',en:'Which space object matches this riddle?'},speech:riddle.clue,answerId:answer.id,choices:choices(answer,SPACE_OBJECTS,rng),visual:({lang,picked}) => {
      const root = el('div',{class:'solar-visual'},el('p',{class:'solar-clue'},riddle.clue[lang]));
      if (picked) root.append(el('p',{class:'solar-name'},answer.label[lang]));
      return root;
    }};
  }
  const planet = pickFresh(PLANETS,previous,p => `planets:${p.id}`,rng);
  const answer = {id:planet.id,label:planet.name};
  const clue = ['uranus','neptune'].includes(planet.id) ? planet.fact : planet.description;
  const prompt = {nl:'Welke planeet zie je? Gebruik ook de aanwijzing.',en:'Which planet do you see? Use the clue too.'};
  return {key:`planets:${planet.id}`,prompt,speech:{nl:`${prompt.nl} ${clue.nl}`,en:`${prompt.en} ${clue.en}`},answerId:answer.id,choices:choices(answer,SPACE_OBJECTS.slice(0,8),rng),visual:({lang,picked}) => {
    const root = el('figure',{class:'solar-visual'},planetImage(planet,lang,picked !== null),el('figcaption',{class:'solar-clue'},clue[lang]));
    if (picked) root.append(el('p',{class:'solar-name'},planet.name[lang]));
    root.append(imageCredit(planet,lang));
    return root;
  }};
}
