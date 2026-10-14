import type { Localized } from '../../core/types';
export type ReadingSkill = 'information' | 'main-idea' | 'cause-effect' | 'vocabulary';
type Pair = readonly [string, string];
export interface ReadingItem { prompt: Localized; choices: Localized[]; evidence: number[]; }
export interface Story { id: string; title: Localized; sentences: Localized[]; questions: Record<ReadingSkill, ReadingItem>; }
const text = ([nl,en]: Pair): Localized => ({nl,en});
function item(prompt: Pair, choices: Pair[], evidence: number[]): ReadingItem {
  return {prompt:text(prompt),choices:choices.map(text),evidence};
}
function story(id:string, title:Pair, sentences:Pair[], information:ReadingItem, main:Pair[], cause:ReadingItem, word:Pair, meanings:Pair[], wordSentence:number):Story {
  return {id,title:text(title),sentences:sentences.map(text),questions:{
    information,
    'main-idea':item(['Waar gaat het hele verhaal vooral over?','What is the whole story mainly about?'],main,[0,1,2]),
    'cause-effect':cause,
    vocabulary:item([`Wat betekent ‘${word[0]}’ in dit verhaal?`,`What does “${word[1]}” mean in this story?`],meanings,[wordSentence]),
  }};
}
// In each authored option list, the first option is correct. The game shuffles
// choices while keeping their IDs stable in Dutch and English.
export const STORIES: readonly Story[] = [
  story('garden',['De droge plant','The dry plant'],[
    ['Noor ziet een plant met slappe bladeren in de tuin.','Noor sees a plant with drooping leaves in the garden.'],
    ['De aarde is droog, dus Noor geeft de plant water.','The soil is dry, so Noor waters the plant.'],
    ['De volgende dag staan de bladeren weer rechtop.','The next day the leaves stand upright again.'],
  ],item(['Waar staat de plant?','Where is the plant?'],[['In de tuin','In the garden'],['In de keuken','In the kitchen'],['Op school','At school'],['Op het balkon','On the balcony']],[0]),
  [['Noor helpt een droge plant met water.','Noor helps a dry plant by watering it.'],['Noor plant nieuwe bloemen in de tuin.','Noor plants new flowers in the garden.'],['Noor haalt de plant uit de tuin.','Noor takes the plant out of the garden.'],['Noor knipt de slappe bladeren af.','Noor cuts off the drooping leaves.']],
  item(['Waarom geeft Noor de plant water?','Why does Noor water the plant?'],[['De aarde is droog.','The soil is dry.'],['De plant is te groot.','The plant is too big.'],['Het regent hard.','It is raining hard.'],['Er zitten bloemen aan.','It has flowers.']],[1]),
  ['slappe','drooping'],[['Naar beneden hangende','Hanging down'],['Heel scherpe','Very sharp'],['Felrode','Bright red'],['Gloednieuwe','Brand new']],0),
  story('kite',['De vlieger','The kite'],[
    ['Sam neemt zijn vlieger mee naar het veld.','Sam takes his kite to the field.'],
    ['Er is geen wind, dus de vlieger blijft op de grond.','There is no wind, so the kite stays on the ground.'],
    ['Dan voelt Sam een briesje en zijn vlieger stijgt omhoog.','Then Sam feels a breeze and his kite rises into the air.'],
  ],item(['Waar neemt Sam zijn vlieger mee naartoe?','Where does Sam take his kite?'],[['Naar het veld','To the field'],['Naar de klas','To the classroom'],['Naar het zwembad','To the swimming pool'],['Naar de winkel','To the shop']],[0]),
  [['Sams vlieger gaat pas omhoog als er wind komt.','Sam’s kite only rises when the wind starts.'],['Sam maakt een vlieger van papier.','Sam makes a paper kite.'],['Sam krijgt zijn vlieger niet omhoog, ook niet met wind.','Sam cannot get his kite into the air, even with wind.'],['Sams vlieger waait weg en Sam gaat hem zoeken.','Sam’s kite blows away and Sam goes to look for it.']],
  item(['Waarom blijft de vlieger eerst op de grond?','Why does the kite stay on the ground at first?'],[['Er is geen wind.','There is no wind.'],['Het touw is kapot.','The string is broken.'],['Sam staat binnen.','Sam is indoors.'],['De vlieger is nat.','The kite is wet.']],[1]),
  ['briesje','breeze'],[['Een zachte wind','A gentle wind'],['Een harde knal','A loud bang'],['Een felle lamp','A bright lamp'],['Een dikke mist','A thick fog']],2),
  story('library',['Een boek zoeken','Finding a book'],[
    ['Lina wil een boek over de maan lezen.','Lina wants to read a book about the moon.'],
    ['Ze kan het boek niet vinden en vraagt hulp aan de bibliothecaris.','She cannot find the book and asks the librarian for help.'],
    ['De bibliothecaris, die in de bibliotheek werkt, wijst haar de juiste plank.','The librarian, who works in the library, shows her the right shelf.'],
  ],item(['Waarover wil Lina lezen?','What does Lina want to read about?'],[['De maan','The moon'],['Voetbal','Football'],['Honden','Dogs'],['Koken','Cooking']],[0]),
  [['Lina krijgt hulp om een boek over de maan te vinden.','Lina gets help finding a book about the moon.'],['Lina helpt de bibliothecaris een boek te zoeken.','Lina helps the librarian find a book.'],['Lina vindt zonder hulp een boek over de maan.','Lina finds a book about the moon without help.'],['Lina zet haar eigen boek op de plank terug.','Lina puts her own book back on the shelf.']],
  item(['Waarom vraagt Lina om hulp?','Why does Lina ask for help?'],[['Ze kan het boek niet vinden.','She cannot find the book.'],['Ze wil de plank schilderen.','She wants to paint the shelf.'],['Ze heeft haar tas verloren.','She has lost her bag.'],['Ze wil een hond kopen.','She wants to buy a dog.']],[1]),
  ['bibliothecaris','librarian'],[['Iemand die in de bibliotheek werkt','Someone who works in the library'],['Iemand die naar de maan vliegt','Someone who flies to the moon'],['Iemand die eten kookt','Someone who cooks food'],['Iemand die huizen bouwt','Someone who builds houses']],2),
  story('bridge',['De brug van blokken','The block bridge'],[
    ['Mila bouwt een brug van blokken voor haar speelgoedauto.','Mila builds a block bridge for her toy car.'],
    ['De brug wiebelt, dus Mila zet extra blokken onder de brug.','The bridge wobbles, so Mila puts extra blocks underneath it.'],
    ['Nu staat de brug stevig en kan de auto eroverheen.','Now the bridge is steady and the car can cross it.'],
  ],item(['Wat wil Mila over de brug laten rijden?','What does Mila want to drive over the bridge?'],[['Haar speelgoedauto','Her toy car'],['Haar fiets','Her bicycle'],['Een echte bus','A real bus'],['Een speelgoedtrein','A toy train']],[0]),
  [['Mila maakt haar blokkenbrug stevig voor haar auto.','Mila makes her block bridge steady for her car.'],['Mila bouwt een brug voor een speelgoedtrein.','Mila builds a bridge for a toy train.'],['Mila haalt blokken weg zodat haar brug steviger wordt.','Mila removes blocks to make her bridge steadier.'],['Mila breekt de brug af omdat de auto te groot is.','Mila takes down the bridge because the car is too big.']],
  item(['Waarom zet Mila extra blokken onder de brug?','Why does Mila put extra blocks under the bridge?'],[['De brug wiebelt.','The bridge wobbles.'],['De auto is kwijt.','The car is missing.'],['De brug is te vies.','The bridge is too dirty.'],['Ze wil een tunnel dichtmaken.','She wants to close a tunnel.']],[1]),
  ['stevig','steady'],[['Zonder te wiebelen','Without wobbling'],['Heel nat','Very wet'],['Helemaal leeg','Completely empty'],['Met veel lawaai','With lots of noise']],2),
  story('rain',['Een droge tekening','A dry drawing'],[
    ['Daan loopt naar huis met een tekening in zijn hand.','Daan walks home with a drawing in his hand.'],
    ['Het begint te regenen, dus hij stopt de tekening in zijn tas.','It starts raining, so he puts the drawing in his bag.'],
    ['De tas beschermt het papier: de tekening blijft droog.','The bag protects the paper: the drawing stays dry.'],
  ],item(['Waar stopt Daan de tekening in?','Where does Daan put the drawing?'],[['In zijn tas','In his bag'],['In zijn schoen','In his shoe'],['In een boom','In a tree'],['In een doos op school','In a box at school']],[1]),
  [['Daan houdt zijn tekening droog tijdens de regen.','Daan keeps his drawing dry in the rain.'],['Daan maakt buiten een tekening van de regen.','Daan makes a drawing of the rain outside.'],['Daan laat zijn tekening thuis omdat het regent.','Daan leaves his drawing at home because it is raining.'],['Daan probeert zijn natte tekening te drogen.','Daan tries to dry his wet drawing.']],
  item(['Waarom stopt Daan de tekening in zijn tas?','Why does Daan put the drawing in his bag?'],[['Het begint te regenen.','It starts raining.'],['De tekening is klaar om weg te gooien.','The drawing is ready to throw away.'],['Zijn tas is te zwaar.','His bag is too heavy.'],['Hij gaat de tas wassen.','He is going to wash the bag.']],[1,2]),
  ['beschermt','protects'],[['Zorgt dat het niet nat wordt','Keeps it from getting wet'],['Scheurt het in stukjes','Tears it into pieces'],['Maakt het kleiner','Makes it smaller'],['Kleurt het blauw','Colours it blue']],2),
  story('bread',['Brood voor de lunch','Bread for lunch'],[
    ['Aya en haar vader bakken brood voor de lunch.','Aya and her father bake bread for lunch.'],
    ['Het brood is nog heet, dus ze wachten met snijden.','The bread is still hot, so they wait before slicing it.'],
    ['Als het brood is afgekoeld en niet meer heet is, snijdt haar vader er sneetjes van.','When the bread has cooled and is no longer hot, her father cuts it into slices.'],
  ],item(['Voor welke maaltijd bakken Aya en haar vader brood?','Which meal do Aya and her father bake bread for?'],[['De lunch','Lunch'],['Het ontbijt','Breakfast'],['Het avondeten','Dinner'],['Een nachtelijke maaltijd','A midnight meal']],[0]),
  [['Aya en haar vader bakken brood en laten het afkoelen voor het snijden.','Aya and her father bake bread and let it cool before slicing it.'],['Aya koopt brood in de winkel.','Aya buys bread in the shop.'],['Aya en haar vader snijden hun brood terwijl het nog heet is.','Aya and her father slice their bread while it is still hot.'],['Aya en haar vader wachten tot na de lunch om brood te bakken.','Aya and her father wait until after lunch to bake bread.']],
  item(['Waarom wachten ze met snijden?','Why do they wait before slicing?'],[['Het brood is nog heet.','The bread is still hot.'],['Het brood is verdwenen.','The bread has disappeared.'],['Ze hebben al gegeten.','They have already eaten.'],['Ze bakken pas morgen.','They will only bake tomorrow.']],[1]),
  ['afgekoeld','cooled'],[['Minder warm geworden','Become less warm'],['Groter geworden','Become bigger'],['Heel hard gaan branden','Started burning fiercely'],['In de oven gezet','Put in the oven']],2),
  story('rabbit',['Het konijn','The rabbit'],[
    ['Bo zet een bakje water bij haar konijn.','Bo puts a bowl of water beside her rabbit.'],
    ['Het konijn stoot het bakje om, dus Bo haalt een doek.','The rabbit knocks over the bowl, so Bo gets a cloth.'],
    ['De doek neemt het water op en de vloer is weer droog.','The cloth absorbs the water and the floor is dry again.'],
  ],item(['Welk dier heeft Bo?','Which animal does Bo have?'],[['Een konijn','A rabbit'],['Een kat','A cat'],['Een hond','A dog'],['Een hamster','A hamster']],[0]),
  [['Bo ruimt het water op dat haar konijn heeft gemorst.','Bo cleans up the water her rabbit spilled.'],['Bo geeft haar konijn eten omdat het bakje leeg is.','Bo feeds her rabbit because the bowl is empty.'],['Bo wast haar konijn met een natte doek.','Bo washes her rabbit with a wet cloth.'],['Bo zet een nieuw bakje neer omdat het oude kapot is.','Bo puts down a new bowl because the old one is broken.']],
  item(['Waarom haalt Bo een doek?','Why does Bo get a cloth?'],[['Het konijn heeft het water omgestoten.','The rabbit has knocked over the water.'],['Het konijn heeft honger.','The rabbit is hungry.'],['De vloer was al droog.','The floor was already dry.'],['Het bakje moet worden ingepakt.','The bowl needs wrapping.']],[1,2]),
  ['neemt op','absorbs'],[['Zuigt het water in zich','Soaks up the water'],['Duwt het water naar buiten','Pushes the water out'],['Maakt het water warm','Makes the water warm'],['Verandert het water in ijs','Turns the water into ice']],2),
  story('bus',['De andere bushalte','The other bus stop'],[
    ['Finn staat bij de bushalte naast het park.','Finn stands at the bus stop beside the park.'],
    ['Op een bord staat dat de bus daar vandaag niet stopt, dus Finn loopt naar de volgende halte.','A sign says the bus will not stop there today, so Finn walks to the next stop.'],
    ['Bij die halte komt de bus aan en Finn stapt in.','The bus arrives at that stop and Finn gets on.'],
  ],item(['Waar staat de eerste bushalte?','Where is the first bus stop?'],[['Naast het park','Beside the park'],['Voor de bibliotheek','In front of the library'],['Bij het zwembad','By the swimming pool'],['Naast de bakker','Beside the baker’s']],[0]),
  [['Finn gaat naar een andere halte om de bus te nemen.','Finn goes to another stop to catch the bus.'],['Finn blijft bij de eerste halte wachten op de bus.','Finn keeps waiting for the bus at the first stop.'],['Finn mist de bus en loopt daarom naar huis.','Finn misses the bus and walks home.'],['Finn leest een bord en besluit helemaal te gaan lopen.','Finn reads a sign and decides to walk the whole way.']],
  item(['Waarom loopt Finn naar de volgende halte?','Why does Finn walk to the next stop?'],[['De bus stopt vandaag niet bij de eerste halte.','The bus will not stop at the first stop today.'],['Hij wil de bus wassen.','He wants to wash the bus.'],['Het park is gesloten.','The park is closed.'],['Hij is zijn jas kwijt.','He has lost his coat.']],[1]),
  ['halte','stop'],[['Een plek waar je op de bus wacht','A place where you wait for the bus'],['Een plek waar je brood bakt','A place where you bake bread'],['Een plek waar je slaapt','A place where you sleep'],['Een plek waar je zwemt','A place where you swim']],2),
  story('puzzle',['Het laatste stukje','The last piece'],[
    ['Yara maakt een puzzel van een schip.','Yara does a puzzle showing a ship.'],
    ['Er ontbreekt één stukje, dus ze zoekt onder de tafel.','One piece is missing, so she looks under the table.'],
    ['Daar vindt ze het stukje en nu is de puzzel compleet: er mist niets meer.','She finds the piece there and now the puzzle is complete: nothing is missing.'],
  ],item(['Wat staat er op de puzzel?','What does the puzzle show?'],[['Een schip','A ship'],['Een trein','A train'],['Een bos','A forest'],['Een kasteel','A castle']],[0]),
  [['Yara vindt het ontbrekende stukje en maakt haar puzzel af.','Yara finds the missing piece and finishes her puzzle.'],['Yara maakt zelf een nieuw puzzelstukje van papier.','Yara makes a new puzzle piece out of paper.'],['Yara zoekt het stukje maar haar puzzel blijft onaf.','Yara looks for the piece but her puzzle remains unfinished.'],['Yara kiest een andere puzzel omdat er een stukje mist.','Yara chooses another puzzle because a piece is missing.']],
  item(['Waarom zoekt Yara onder de tafel?','Why does Yara look under the table?'],[['Er ontbreekt een puzzelstukje.','A puzzle piece is missing.'],['Ze wil de tafel schilderen.','She wants to paint the table.'],['Ze zoekt haar lunch.','She is looking for her lunch.'],['Het schip vaart weg.','The ship is sailing away.']],[1]),
  ['compleet','complete'],[['Met alle stukjes erbij','With all the pieces'],['In kleine stukjes gebroken','Broken into little pieces'],['Zonder plaatje erop','Without a picture on it'],['Helemaal nat','Completely wet']],2),
  story('seed',['De zaadjes','The seeds'],[
    ['Omar zaait zaadjes in twee potten bij het raam.','Omar plants seeds in two pots beside the window.'],
    ['In één pot staat te veel water, dus hij giet wat water weg.','There is too much water in one pot, so he pours some away.'],
    ['Na een paar dagen ontkiemen de zaadjes: kleine groene plantjes komen uit de aarde.','After a few days the seeds sprout: tiny green plants come out of the soil.'],
  ],item(['Hoeveel potten gebruikt Omar?','How many pots does Omar use?'],[['Twee','Two'],['Eén','One'],['Drie','Three'],['Vier','Four']],[0]),
  [['Omar verzorgt zaadjes die kleine plantjes worden.','Omar cares for seeds that become small plants.'],['Omar giet extra water in de pot die al te nat is.','Omar pours extra water into the pot that is already too wet.'],['Omar zet de potten buiten omdat de zaadjes niet groeien.','Omar puts the pots outside because the seeds do not grow.'],['Omar haalt de zaadjes uit de potten voor ze groeien.','Omar takes the seeds out of the pots before they grow.']],
  item(['Waarom giet Omar wat water weg?','Why does Omar pour some water away?'],[['Er staat te veel water in één pot.','There is too much water in one pot.'],['De potten staan buiten.','The pots are outside.'],['De zaadjes zijn verdwenen.','The seeds have disappeared.'],['Het raam is dicht.','The window is closed.']],[1]),
  ['ontkiemen','sprout'],[['Beginnen te groeien als plantjes','Begin to grow into small plants'],['Veranderen in stenen','Turn into stones'],['Worden helemaal droog','Become completely dry'],['Vallen uit de pot','Fall out of the pot']],2),
  story('picnic',['Samen delen','Sharing together'],[
    ['Eva en Tom picknicken op een kleed in het park.','Eva and Tom have a picnic on a blanket in the park.'],
    ['Tom heeft zijn brood vergeten, dus Eva deelt haar brood met hem.','Tom has forgotten his bread, so Eva shares her bread with him.'],
    ['Eva geeft Tom de helft: ze krijgen allebei een even groot stuk.','Eva gives Tom half: they each get a piece of the same size.'],
  ],item(['Waar picknicken Eva en Tom?','Where do Eva and Tom have their picnic?'],[['In het park','In the park'],['In de klas','In the classroom'],['In de trein','On the train'],['In de keuken','In the kitchen']],[0]),
  [['Eva deelt haar brood omdat Tom zijn brood vergeten is.','Eva shares her bread because Tom has forgotten his.'],['Eva en Tom gaan naar huis om Toms brood te halen.','Eva and Tom go home to get Tom’s bread.'],['Tom deelt zijn brood omdat Eva haar brood vergeten is.','Tom shares his bread because Eva has forgotten hers.'],['Eva geeft al haar brood aan Tom en eet zelf niets.','Eva gives all her bread to Tom and eats nothing herself.']],
  item(['Waarom deelt Eva haar brood met Tom?','Why does Eva share her bread with Tom?'],[['Tom heeft zijn brood vergeten.','Tom has forgotten his bread.'],['Tom houdt niet van brood.','Tom does not like bread.'],['Eva wil vogels voeren.','Eva wants to feed birds.'],['Het brood is gevallen.','The bread has fallen.']],[1]),
  ['helft','half'],[['Eén van twee even grote delen','One of two equal parts'],['Een heel brood','A whole loaf'],['Het kleinste kruimeltje','The smallest crumb'],['Drie grote stukken','Three big pieces']],2),
  story('bell',['De bel van de fiets','The bicycle bell'],[
    ['Luuk wil op zijn fiets naar zijn oma rijden.','Luuk wants to ride his bicycle to his grandma’s house.'],
    ['Zijn bel maakt geen geluid, dus zijn moeder zet een losse schroef vast.','His bell makes no sound, so his mother tightens a loose screw.'],
    ['De bel werkt weer en rinkelt met een helder ting-ting.','The bell works again and rings with a clear ding-ding.'],
  ],item(['Naar wie wil Luuk fietsen?','Who does Luuk want to cycle to?'],[['Zijn oma','His grandma'],['Zijn meester','His teacher'],['Zijn vriend','His friend'],['Zijn buurman','His neighbour']],[0]),
  [['Luuks moeder maakt de kapotte fietsbel weer werkend.','Luuk’s mother gets the broken bicycle bell working again.'],['Luuk koopt een nieuwe bel omdat de oude kapot is.','Luuk buys a new bell because the old one is broken.'],['Luuks oma maakt de kapotte fietsbel voor hem.','Luuk’s grandma fixes the broken bicycle bell for him.'],['Luuks moeder repareert een lekke band.','Luuk’s mother repairs a flat tyre.']],
  item(['Waarom zet zijn moeder de schroef vast?','Why does his mother tighten the screw?'],[['De bel maakt geen geluid.','The bell makes no sound.'],['De band is leeg.','The tyre is flat.'],['Het zadel is te hoog.','The seat is too high.'],['De ketting is vuil.','The chain is dirty.']],[1,2]),
  ['rinkelt','rings'],[['Maakt een ting-tinggeluid','Makes a ding-ding sound'],['Staat helemaal stil','Stays completely still'],['Geeft veel licht','Gives lots of light'],['Wordt heel warm','Gets very warm']],2),
];
