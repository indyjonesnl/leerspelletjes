# Leerspelletjes / Learning Games

Free educational games for primary school children (groep 1–8), in Dutch and English.
No accounts, no cookies, no tracking.

Games: clock reading, times tables, flags, finding countries on the map, capitals, the Dutch provinces (map, capitals and flags), Money & Change, Word Builder, Pattern Puzzles, First Letters (Beginletters), Fraction Match, Traffic Signs, Animal Detective, Solar System, Body Explorer, Calendar Quest, Number Jumps (Rekensprongen), Spelling Detective, Reading Detective (Leesdetective), and Measure Master (Meetmeester). Flags, capitals, the map game, the Dutch provinces, Traffic Signs, Solar System, Body Explorer, Calendar Quest, Number Jumps, Spelling Detective, Reading Detective, and Measure Master have a "Leer eerst" study screen for every level.

Money & Change has four levels: counting euro coins, counting euros and cents, adding prices, and calculating change. Calculations use integer cents. Word Builder has three word-length levels with Dutch and English vocabulary, picture clues, and scrambled letters; children choose the correctly spelled word from four options. Its read-aloud clues describe the picture without giving away the spelling. Pattern Puzzles has four levels: repeating shapes, counting sequences, missing numbers, and growing steps. Each new game uses the shared ten-question rounds, answer buttons, keyboard controls, feedback, and score screen.

Euro coin images are served locally from `public/coins/`, using unmodified ECB common-side images with a visible source credit. The coins are displayed in proportion to their real diameters. Source files and reuse terms are recorded in `public/coins/README.md`.

First Letters uses 36 familiar pictures and their Dutch/English names. Children click one of four letters, type the actual first letter (case-insensitive), or use 1–4 to choose a button position. A/B/C/D are letter answers, never positional shortcuts. Read-aloud names the object; its written name appears after answering. A typed letter outside the offered choices counts as a wrong answer. Typing is active while focus is in the play area; an answer receives focus automatically on entry and after a language switch. Held keys and Ctrl/Alt/Meta shortcuts are ignored. Switching language replaces an unanswered picture while preserving score and progress; an answered question advances once into the new language, with its pending timer cancelled. This behaviour is opt-in (`Game.letterInput` and `Game.refreshOnLanguageChange`); other games keep their existing controls and language-switch behaviour.

Fraction Match has four levels: match equal shaded SVG parts to fractions, find equivalent fractions, convert to terminating decimals, and convert to percentages. It uses integer arithmetic and cross multiplication so every question has exactly one correct option; Dutch decimals use commas.

Traffic Signs uses 18 Dutch RVV signs in both interface languages, with levels for recognition, walking/cycling, and interpreting the sign in a short situation. A fourth level, "Herken de verkeersplek", uses six locally served Dutch photographs to practise recognising haaientanden, roundabouts, and zebra crossings. Its ten-question rounds mix recognition with basic meaning questions, avoid consecutive repetitions of a photo, and keep explanations visible until Continue. Each level offers Learn First; the photo cards include photographer and license credits. The original SVG sign images are downloaded from NDW's collection and served locally, with their MIT license, source revision, and checksums included. Artwork and meaning references are recorded in `src/games/traffic/sources.md`.

Animal Detective uses 14 familiar animals, with picture, silhouette-with-clue, and riddle levels. Silhouettes reveal the coloured illustration after answering; riddles reveal the animal only after answering. OpenMoji illustrations are stored in `public/animals/`, with visible attribution and source/license details in `public/animals/README.md`. All three new games use standard ten-question rounds and numbered answer shortcuts. Language switching keeps the same question and score.

Solar System has planet recognition, missing planets in Sun-outward order, and space riddles. Recognition rounds cover all eight planets; the other levels use ten questions. NASA images are served locally with visible credits and source details in `public/solar/README.md`. Numbered order diagrams explicitly use simplified sizes and distances.

Body Explorer has organ recognition, organ functions, and parts of the skeleton, with ten-question rounds. Original SVG diagrams highlight the target in orange and describe its location for read-aloud and screen readers. The front views simplify anatomy and make organs behind other organs visible; references are in `src/games/body/Sources.md`. Both science games offer study cards for every level, Dutch/English translations, and numbered keyboard answers.

Calendar Quest has weekday, month-ordering, calendar-reading, and elapsed-day levels. Children arrange four shuffled month cards in a single list, using visible drag feedback, up/down buttons, or keyboard arrows. Checked month answers stay visible until Continue; the date levels include leap years and month boundaries. All four levels have bilingual Learn First examples.

Number Jumps (Rekensprongen) practises addition and subtraction to 100, crossing tens, and missing numbers. Optional empty number lines show intermediate checkpoints while keeping the final result unknown; after answering, worked steps explain a strategy. Its four bilingual lessons cover tens/ones splitting and bridging.

Spelling Detective practises Dutch ng/nk, eer/oor/eur, diminutives, and introductory long/short vowel spelling. Each sentence has one missing word and four curated spelling choices. The interface and lessons are bilingual; exercises remain Dutch, with Dutch text language tags and an optional Dutch voice even when the interface is English. Lessons offer spoken examples in Dutch.

Reading Detective (Leesdetective) uses 12 original three-sentence stories in Dutch and English, with levels for finding information, main ideas, cause/effect, and vocabulary from context. Reading is not automatically narrated. After either answer outcome, relevant evidence is highlighted and explained.

Measure Master (Meetmeester) covers cm/m/kg/l units, pencil lengths on a ruler (including shifted starts), scale readings in kilograms, and comparisons of whole litres. Original local SVG diagrams present the same measurement evidence visually and through accessible descriptions. All four groep-4 additions offer Learn First, ten-question rounds, numbered keyboard answers, and feedback that remains visible until Continue.

## Development

```bash
npm install
npm run dev        # local dev server
npm test           # unit tests (Vitest)
npm run test:e2e   # end-to-end tests (Playwright, first run: npx playwright install chromium)
npm run size       # build and check the 200 KB first-load budget
```

## Adding a game

1. Create `src/games/<id>/` with an `index.ts` exporting a `Game` (see `src/core/types.ts`).
2. Add it to `src/games/registry.ts`.
3. Add a tile icon in `public/icons/<id>.svg` and a `.tile-<id>` colour in `src/styles.css`.
4. Add unit tests for question generation.

## Learn mode

Every level of Flags, Capitals, "Waar ligt het?", Nederland, Traffic Signs, Solar System, Body Explorer, Calendar Quest, Number Jumps, Spelling Detective, Reading Detective, and Measure Master has a "Leer eerst" link (`#/<game>/<level>/learn`). A game opts in by setting `study(level, { lang, speak })` on its `Game` (see `src/core/types.ts`): it returns the study view for the level, and the shared `learnScreen` adds loading (through the game's `load`), the "Nu oefenen" button and the way back. Games without `study` (for example clock and times tables) show no link. Nothing about what a child has studied is stored.

## Country data

`src/games/flags/data/countries.ts` is generated. To change names, edit `scripts/gen-countries.mjs` and run `npm run gen:countries`.

## Map data

`src/games/map/data/*.ts` is generated from [world-atlas](https://github.com/topojson/world-atlas) (ISC licence) by `scripts/gen-maps.mjs`: one file per region, loaded when a map level opens. world-atlas packages [Natural Earth](https://www.naturalearthdata.com/) data, which is public domain. Map projections, which countries count as "small" and simplification are set at the top of the script; run `npm run gen:maps` after changing them.

## Capitals

`src/games/capitals/data/capitals.ts` is written by hand: one capital per country, in Dutch and English, as school atlases give it. Conventions for countries with more than one capital are listed at the top of the file.

## Netherlands map

`src/games/nederland/data/nl.ts` is generated by `scripts/gen-nl.mjs` (`npm run gen:nl`, needs network). Provinces come from the CBS generalised province boundaries via [PDOK](https://api.pdok.nl/cbs/gebiedsindelingen/ogc/v1), licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) — source: CBS, Kadaster; the game shows this credit under the map. Belgium and Germany come from world-atlas (see Map data). The script also places the provincial capitals and checks that each lies inside its province and that the IJsselmeer, Wadden Sea and Zeeland waters stay water.

## Province flags

`public/flags-nl/*.svg` are the flags of the 12 Dutch provinces, downloaded once from [Wikimedia Commons](https://commons.wikimedia.org/) by `scripts/gen-province-flags.mjs` (`npm run gen:province-flags`, needs network) and committed, so the site never fetches anything at runtime. The script only accepts files whose Commons licence is public domain or CC0 and stops otherwise. `src/games/nederland/data/flags-licences.json` records the Commons file, its page and its licence for every flag. (`public/flags/`, the country flags, is different: it is rebuilt from `flag-icons` by `scripts/copy-flags.mjs` and git-ignored.)

## Deploy to GitHub Pages

`.github/workflows/deploy.yml` runs the unit tests, builds the site and publishes `dist/` on every push to `main`.

One-time setup:

1. Push this repository to GitHub (public, unless your plan allows Pages on private repositories).
2. In the repository go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Push to `main` (or run the workflow from the **Actions** tab). The site appears at `https://<user>.github.io/<repo>/`.

Hash-based routing (`#/...`) means refreshing or sharing a game link never hits a 404, and relative asset paths work from the `/<repo>/` sub-path. For a custom domain, set it under **Settings → Pages → Custom domain**.

## Deploy (Cloudflare Pages or Netlify)

- Build command: `npm run build`
- Output directory: `dist`
- Node version: 20 or newer

The site is fully static and uses relative paths, so it also works from a sub-folder.
