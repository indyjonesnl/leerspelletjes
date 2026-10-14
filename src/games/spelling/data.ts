import type { Localized } from '../../core/types';

export interface SpellingEntry {
  word: string;
  wrong: [string, string, string];
  clue: string;
  category: string;
  rule: Localized;
}
const ng: Localized = { nl: 'Je hoort de ng-klank. Schrijf n en g samen: ng.', en: 'The Dutch ng sound is written with n and g together: ng.' };
const nk: Localized = { nl: 'Je hoort de ng-klank met een k erachter. Schrijf nk, zonder g.', en: 'For the Dutch ng sound followed by k, write nk, without g.' };
const eer: Localized = { nl: 'Dit is een eer-woord. Schrijf de letters eer bij elkaar.', en: 'This Dutch word uses eer. Keep the letters eer together.' };
const oor: Localized = { nl: 'Dit is een oor-woord. Schrijf de letters oor bij elkaar.', en: 'This Dutch word uses oor. Keep the letters oor together.' };
const eur: Localized = { nl: 'Dit is een eur-woord. Schrijf de letters eur bij elkaar.', en: 'This Dutch word uses eur. Keep the letters eur together.' };
const diminutive = (base: string, ending: string): Localized => ({
  nl: `Maak ${base} klein met -${ending}. Het kleine woord eindigt op ${ending}.`,
  en: `Use -${ending} to make the Dutch word ${base} small. The small word ends in ${ending}.`,
});
const long: Localized = { nl: 'Je hoort een lange klinker aan het eind van het eerste klankstuk. Schrijf daar één klinker.', en: 'The first Dutch sound chunk ends in a long vowel sound. Write one vowel there.' };
const short: Localized = { nl: 'Je hoort een korte klinker in het eerste klankstuk. Schrijf daarna twee dezelfde medeklinkers.', en: 'The first Dutch sound chunk has a short vowel sound. Double the consonant after it.' };
function entry(category: string, word: string, wrong: SpellingEntry['wrong'], clue: string, rule: Localized): SpellingEntry {
  return { category, word, wrong, clue, rule };
}
export const SPELLING_ENTRIES: Record<string, SpellingEntry[]> = {
  'ng-nk': [
    entry('ng-nk', 'ring', ['rinkg', 'rinng', 'rign'], 'Oma draagt een gouden ... om haar vinger.', ng),
    entry('ng-nk', 'slang', ['slangk', 'slann', 'slagn'], 'Een ... is een dier dat over de grond kruipt.', ng),
    entry('ng-nk', 'tong', ['tongk', 'tonng', 'togn'], 'Met mijn ... proef ik de soep in mijn mond.', ng),
    entry('ng-nk', 'bang', ['bangk', 'banng', 'bagn'], 'De harde donder maakt mij ... .', ng),
    entry('ng-nk', 'jong', ['jongk', 'jonng', 'jogn'], 'De baby is nog heel ... .', ng),
    entry('ng-nk', 'lang', ['langk', 'lanng', 'lagn'], 'De giraf heeft een heel ... lijf en een hoge nek.', ng),
    entry('ng-nk', 'bank', ['bangk', 'banck', 'bankk'], 'Wij zitten samen op de ... in de woonkamer.', nk),
    entry('ng-nk', 'plank', ['plangk', 'planck', 'plankk'], 'De timmerman zaagt een houten ... doormidden.', nk),
    entry('ng-nk', 'pink', ['pingk', 'pinck', 'pinkk'], 'Mijn kleinste vinger heet mijn ... .', nk),
    entry('ng-nk', 'winkel', ['wingkel', 'winckel', 'winkkel'], 'We kopen brood in de ... op de hoek.', nk),
    entry('ng-nk', 'enkel', ['engkel', 'enckel', 'enkkel'], 'Het gewricht tussen mijn voet en been heet mijn ... .', nk),
    entry('ng-nk', 'donker', ['dongker', 'doncker', 'donkker'], 'Zonder lamp is het in de nacht ... in mijn kamer.', nk),
  ],
  'eer-oor-eur': [
    entry('eer-oor-eur', 'beer', ['beir', 'beeer', 'berr'], 'Een ... is een groot dier met een dikke vacht.', eer),
    entry('eer-oor-eur', 'peer', ['peir', 'peeer', 'perr'], 'Ik eet een groene ... met een smalle bovenkant.', eer),
    entry('eer-oor-eur', 'meer', ['meir', 'meeer', 'merr'], 'We varen op een groot ... vol zoet water.', eer),
    entry('eer-oor-eur', 'veer', ['veir', 'veeer', 'verr'], 'Er valt een zachte ... uit de vleugel van de vogel.', eer),
    entry('eer-oor-eur', 'oor', ['oorr', 'ooor', 'orr'], 'Ik luister met mijn ... naar muziek.', oor),
    entry('eer-oor-eur', 'boor', ['bor', 'boorr', 'borr'], 'Papa maakt met de ... een gat in de muur.', oor),
    entry('eer-oor-eur', 'spoor', ['spoorr', 'spooor', 'spoer'], 'De trein rijdt over het ... van staal.', oor),
    entry('eer-oor-eur', 'koor', ['kooor', 'koorr', 'korr'], 'Veel mensen zingen samen in een ... .', oor),
    entry('eer-oor-eur', 'deur', ['duer', 'deurr', 'deuur'], 'Ik doe de ... open om naar binnen te gaan.', eur),
    entry('eer-oor-eur', 'kleur', ['kluer', 'kleurr', 'kleuur'], 'Rood is mijn lievelings... .', eur),
    entry('eer-oor-eur', 'geur', ['guer', 'geurr', 'geuur'], 'De bloem heeft een lekkere ... .', eur),
    entry('eer-oor-eur', 'beurt', ['buert', 'beurrt', 'beuurt'], 'Nu mag jij gooien: het is jouw ... .', eur),
  ],
  diminutives: [
    entry('diminutives', 'huisje', ['huijsje', 'huissje', 'huisjje'], 'Een heel klein huis noemen we een ... .', diminutive('huis', 'je')),
    entry('diminutives', 'boekje', ['boekjje', 'boekkje', 'boektje'], 'Een klein boek noemen we een ... .', diminutive('boek', 'je')),
    entry('diminutives', 'hondje', ['hondtje', 'hontje', 'hondjje'], 'Een kleine hond noemen we een ... .', diminutive('hond', 'je')),
    entry('diminutives', 'katje', ['kadtje', 'kattje', 'katjje'], 'Een kleine kat noemen we een ... .', diminutive('kat', 'je')),
    entry('diminutives', 'bootje', ['bootj', 'boottje', 'bootjje'], 'Een kleine boot noemen we een ... .', diminutive('boot', 'je')),
    entry('diminutives', 'doosje', ['doossje', 'doosjje', 'doostje'], 'Een kleine doos noemen we een ... .', diminutive('doos', 'je')),
    entry('diminutives', 'boompje', ['boomje', 'boommje', 'boompjje'], 'Een kleine boom noemen we een ... .', diminutive('boom', 'pje')),
    entry('diminutives', 'raampje', ['raamje', 'raammje', 'raampjje'], 'Een klein raam noemen we een ... .', diminutive('raam', 'pje')),
    entry('diminutives', 'bloempje', ['bloemje', 'bloemmje', 'bloempjje'], 'Een kleine bloem noemen we een ... .', diminutive('bloem', 'pje')),
    entry('diminutives', 'stoeltje', ['stoelje', 'stoeltjje', 'stoelltje'], 'Een kleine stoel noemen we een ... .', diminutive('stoel', 'tje')),
    entry('diminutives', 'tafeltje', ['tafelje', 'tafeltjje', 'tafelltje'], 'Een kleine tafel noemen we een ... .', diminutive('tafel', 'tje')),
    entry('diminutives', 'lepeltje', ['lepelje', 'lepeltjje', 'lepelltje'], 'Een kleine lepel noemen we een ... .', diminutive('lepel', 'tje')),
  ],
  vowels: [
    entry('vowels', 'bomen', ['boomen', 'bomeen', 'boomenn'], 'In het bos staan veel hoge ... met bladeren.', long),
    entry('vowels', 'boten', ['booten', 'boteen', 'bootenn'], 'In de haven liggen veel ... op het water.', long),
    entry('vowels', 'ramen', ['raamen', 'rameen', 'raamenn'], 'Ons huis heeft vier ... met glas erin.', long),
    entry('vowels', 'muren', ['muuren', 'mureen', 'murenn'], 'De kamer heeft vier ... die we wit verven.', long),
    entry('vowels', 'benen', ['beenen', 'beneen', 'beenenn'], 'Ik loop en spring met mijn twee ... .', long),
    entry('vowels', 'weken', ['weeken', 'wekeen', 'weekenn'], 'Twee ... duren samen veertien dagen.', long),
    entry('vowels', 'katten', ['katen', 'kaatten', 'kattten'], 'Onze twee ... miauwen en drinken uit hun bakjes.', short),
    entry('vowels', 'kippen', ['kipen', 'kiippen', 'kippenn'], 'De ... in het hok leggen eieren.', short),
    entry('vowels', 'sokken', ['soken', 'sookken', 'sokkenn'], 'Ik trek warme ... aan mijn voeten.', short),
    entry('vowels', 'vissen', ['visen', 'viissen', 'vissenn'], 'Er zwemmen drie ... in het aquarium.', short),
    entry('vowels', 'ballen', ['balllen', 'baallen', 'ballenn'], 'In de gymzaal gooien we met ronde ... .', short),
    entry('vowels', 'pannen', ['panen', 'paannen', 'pannenn'], 'We koken soep in twee grote ... .', short),
  ],
};
