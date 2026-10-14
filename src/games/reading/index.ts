import type { Game, Lang, Level, Localized, Question, Rng, StudyContext } from '../../core/types';
import { pickFresh } from '../../core/pick';
import { el } from '../../core/ui';
import { STORIES, type ReadingSkill, type Story } from './data';

const guidance: Record<ReadingSkill, Localized> = {
  information:{nl:'Zoek het antwoord in de tekst. Lees de vraag en zoek de zin die vertelt wie, wat of waar.',en:'Find the answer in the text. Read the question and find the sentence that tells you who, what or where.'},
  'main-idea':{nl:'Lees alle zinnen. Kies het antwoord dat vertelt waar het hele verhaal vooral over gaat.',en:'Read every sentence. Choose the answer that tells you what the whole story is mainly about.'},
  'cause-effect':{nl:'Zoek wat er gebeurt en waarom. Woorden zoals “dus” helpen je de oorzaak en het gevolg te vinden.',en:'Look for what happens and why. Words like “so” help you find the cause and the effect.'},
  vocabulary:{nl:'Lees de zin met het woord en de zinnen eromheen. Welke betekenis past in deze tekst?',en:'Read the sentence with the word and the sentences around it. Which meaning fits this text?'},
};

function skillOf(level: Level): ReadingSkill {
  if (!(level.id in guidance)) throw new Error(`Unknown reading skill: ${level.id}`);
  return level.id as ReadingSkill;
}

function explanation(story:Story, skill:ReadingSkill, lang:Lang):string {
  const answer = story.questions[skill].choices[0][lang];
  const sentence = /[.!?]$/.test(answer) ? answer : `${answer}.`;
  if (skill === 'main-idea') return lang === 'nl' ? `Samen vertellen de zinnen: ${answer}` : `Together the sentences tell us: ${answer}`;
  if (skill === 'vocabulary') return lang === 'nl' ? `In deze zin betekent het woord: ${answer}. De gekleurde zin helpt je de betekenis te vinden.` : `In this sentence the word means: ${answer}. The highlighted sentence helps you find the meaning.`;
  return lang === 'nl' ? `Het antwoord is: ${sentence} Kijk naar de gekleurde zin${story.questions[skill].evidence.length > 1 ? 'nen' : ''} in het verhaal.` : `The answer is: ${sentence} Look at the highlighted sentence${story.questions[skill].evidence.length > 1 ? 's' : ''} in the story.`;
}

function passage(story:Story, skill:ReadingSkill, lang:Lang, reveal:boolean):HTMLElement {
  const article = el('article',{class:'reading-story',lang,'data-story-id':story.id},el('h3',{},story.title[lang]));
  story.sentences.forEach((sentence,index)=>article.append(el('p',{
    'data-sentence':index,
    class:reveal && story.questions[skill].evidence.includes(index) ? 'reading-evidence' : 'reading-sentence',
  },sentence[lang])));
  if (reveal) article.append(el('p',{class:'reading-explanation'},explanation(story,skill,lang)));
  return article;
}

export function makeReadingQuestion(level:Level,rng:Rng,previous:readonly Question[]):Question {
  const skill = skillOf(level);
  const keyOf = (story:Story) => `${skill}:${story.id}`;
  const target = pickFresh(STORIES,previous,keyOf,rng);
  const data = target.questions[skill];
  const speech:Localized = {
    nl:`${target.title.nl}. ${target.sentences.map(s=>s.nl).join(' ')} ${data.prompt.nl}`,
    en:`${target.title.en}. ${target.sentences.map(s=>s.en).join(' ')} ${data.prompt.en}`,
  };
  return {
    key:keyOf(target),prompt:data.prompt,speech,autoAdvance:false,
    choices:rng.shuffle(data.choices.map((label,index)=>({id:`${target.id}:${index}`,label}))),
    answerId:`${target.id}:0`,
    visual:({lang,picked})=>passage(target,skill,lang,picked !== null),
  };
}

export function readingStudy(level:Level,{lang,speak}:StudyContext):HTMLElement {
  const skill = skillOf(level);
  const example = STORIES[0];
  const data = example.questions[skill];
  const root = el('section',{class:'study reading-study',lang},
    el('h2',{},lang === 'nl' ? `Leer eerst: ${level.label.nl}` : `Learn first: ${level.label.en}`),
    el('p',{},guidance[skill][lang]),
    el('p',{},lang === 'nl' ? 'Lees rustig. Na je antwoord kleuren de zinnen die je helpen. Je kunt de tekst nog eens lezen voordat je verdergaat.' : 'Take your time. After your answer, the sentences that help you are highlighted. You can read the text again before continuing.'),
  );
  const card = el('div',{class:'study-card reading-study-card'},
    el('h3',{},lang === 'nl' ? 'Voorbeeld' : 'Example'),
    passage(example,skill,lang,true),
    el('p',{},data.prompt[lang]),
    el('p',{},`${lang === 'nl' ? 'Antwoord' : 'Answer'}: ${data.choices[0][lang]}`),
  );
  if (speak) {
    const button = el('button',{class:'pill',type:'button'},lang === 'nl' ? 'Lees het voorbeeld voor' : 'Read the example aloud');
    button.addEventListener('click',()=>speak(`${example.title[lang]}. ${example.sentences.map(s=>s[lang]).join(' ')} ${data.prompt[lang]} ${explanation(example,skill,lang)}`));
    card.append(button);
  }
  root.append(card);
  return root;
}

export const readingGame:Game = {
  id:'reading',title:{nl:'Leesdetective',en:'Reading Detective'},icon:'icons/reading.svg',pickerLayout:'list',
  levels:[
    {id:'information',label:{nl:'Informatie vinden',en:'Find information'},example:{nl:'Wie, wat of waar?',en:'Who, what or where?'},autoSpeak:false},
    {id:'main-idea',label:{nl:'De hoofdgedachte',en:'The main idea'},example:{nl:'Waar gaat het hele verhaal over?',en:'What is the whole story about?'},autoSpeak:false},
    {id:'cause-effect',label:{nl:'Oorzaak en gevolg',en:'Cause and effect'},example:{nl:'Waarom gebeurt het?',en:'Why does it happen?'},autoSpeak:false},
    {id:'vocabulary',label:{nl:'Woorden in de tekst',en:'Words in context'},example:{nl:'Wat betekent dit woord hier?',en:'What does this word mean here?'},autoSpeak:false},
  ],makeQuestion:makeReadingQuestion,study:readingStudy,
};
