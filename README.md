# Leerspelletjes / Learning Games

Free educational games for primary school children (groep 1–8), in Dutch and English.
No accounts, no cookies, no tracking.

Games: clock reading, times tables, flags, finding countries on the map.

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

## Map data

`src/games/map/data/*.ts` is generated from [world-atlas](https://github.com/topojson/world-atlas) (Natural Earth, public domain) by `scripts/gen-maps.mjs`: one file per region, loaded when a map level opens. Map projections, which countries count as "small" and simplification are set at the top of the script; run `npm run gen:maps` after changing them.

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
