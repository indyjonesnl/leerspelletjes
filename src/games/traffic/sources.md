# Dutch traffic signs

Only Dutch RVV signs are used, even when the interface is in English. English names and the short walking/cycling actions are translations for this educational game.

Sign identities and meanings are checked against:

- [Rijksoverheid: traffic signs and rules](https://www.rijksoverheid.nl/documenten/vraag-en-antwoord/verkeersveiligheid/welke-verkeersborden-en-verkeersregels-gelden-in-nederland), linking to RVV 1990 and its sign annex.
- [Veilig Verkeer Nederland: traffic signs for children walking and cycling](https://examen.vvn.nl/sites/default/files/2022-01/VVN_Verkeersborden.pdf).
- [ANWB: Dutch traffic signs with RVV codes](https://www.anwb.nl/verkeer/nederland/verkeersinformatie/verkeersborden-nederland).

## Sign artwork

The 18 SVGs in `public/traffic-signs/` are downloaded, unmodified RVV sign illustrations from [Nationaal Dataportaal Wegverkeer (NDW)'s collection](https://github.com/ndwnu/qgis-verkeersborden-style). These replace the game's earlier simplified drawings. NDW publishes the collection under the MIT license; its original copyright and license notice are included in `public/traffic-signs/LICENSE`.

`public/traffic-signs/sources.json` records each sign's source page, original download URL, publisher, license, and SHA-256 checksum. All files come from revision `24d3c1aa0e3dc14ff50cb58916efd82db4cbbd31` of the collection. This pins the imported artwork to a reproducible version.

The files are served from this site's `traffic-signs/` directory in both questions and study cards; playing never contacts NDW, GitHub, or Wikimedia. They remain separate SVG images so their original proportions, artwork, and lettering are preserved.

The game uses signs without supplementary exception plates. Actions distinguish B6 (give way) from B7 (always stop and give way), G11 (mandatory cycle path) from G13 (optional cycle path), and J22 (warning of a crossing ahead) from L2 (pedestrian crossing). Contextual questions specify walking or cycling.
