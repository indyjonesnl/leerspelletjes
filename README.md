# Leerspelletjes / Learning Games

Free educational games for primary school children (groep 1–8), in Dutch and English.
No accounts, no cookies, no tracking.

Games: clock reading, times tables, flags.

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

## Country data

`src/games/flags/data/countries.ts` is generated. To change names, edit `scripts/gen-countries.mjs` and run `npm run gen:countries`.

## Deploy (Cloudflare Pages or Netlify)

- Build command: `npm run build`
- Output directory: `dist`
- Node version: 20 or newer

The site is fully static and uses relative paths, so it also works from a sub-folder.
