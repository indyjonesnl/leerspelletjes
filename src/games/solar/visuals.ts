import type { Lang } from '../../core/types';
import { el } from '../../core/ui';
import { PLANETS, type Planet } from './data';

export function planetImage(planet: Planet, lang: Lang, revealed: boolean): HTMLImageElement {
  return el('img',{class:'solar-picture',src:planet.image,alt:revealed ? planet.name[lang] : planet.description[lang],width:'400',height:planet.id === 'saturn' ? '133' : ['jupiter','mars'].includes(planet.id) ? '400' : '225',loading:'lazy'});
}
export function imageCredit(planet: Planet, lang: Lang): HTMLElement {
  return el('small',{class:'solar-credit'},`${lang === 'nl' ? 'Afbeelding' : 'Image'}: ${planet.credit} · `,
    el('a',{href:planet.source},lang === 'nl' ? 'Bron' : 'Source'));
}
export function orderDiagram(missing: readonly number[], lang: Lang, revealed: boolean): HTMLElement {
  const root = el('div',{class:'solar-order'});
  root.append(el('p',{class:'solar-direction'},lang === 'nl' ? 'Zon → lees plaats 1 tot en met 8, steeds verder van de zon.' : 'Sun → read positions 1 to 8, moving farther from the Sun.'));
  const list = el('ol',{class:'solar-slots','aria-label':lang === 'nl' ? 'Planeten vanaf de zon' : 'Planets outward from the Sun'});
  PLANETS.forEach((planet,i) => {
    const hidden = missing.includes(i) && !revealed;
    const slot = el('li',{class:`solar-slot${hidden ? ' solar-gap' : ''}`});
    slot.append(el('span',{class:'solar-position'},`${i+1}`));
    if (hidden) slot.append(el('span',{class:'solar-missing','aria-label':lang === 'nl' ? `Ontbrekende planeet op plaats ${i+1}` : `Missing planet at position ${i+1}`},'?'));
    else slot.append(planetImage(planet,lang,true),el('span',{class:'solar-name'},planet.name[lang]));
    list.append(slot);
  });
  root.append(list,el('p',{class:'solar-scale'},lang === 'nl' ? 'Niet op schaal: afstanden en groottes zijn niet echt.' : 'Not to scale: distances and sizes are not realistic.'));
  const credits = el('div',{class:'solar-order-credits'});
  PLANETS.forEach((p,i) => {if (revealed || !missing.includes(i)) credits.append(imageCredit(p,lang));});
  root.append(credits);
  return root;
}
