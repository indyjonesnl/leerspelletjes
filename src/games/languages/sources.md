# Language data: sources and borderline decisions

Rule: a language counts only if it is a first or everyday home language of at least ~5% of the population.
Sources: CIA World Factbook "Languages", Ethnologue, Wikipedia (country language pages and national censuses).
Figures are approximate and from memory of the cited censuses; verify before relying on any single number.

Note on the catalog test: the "no unused language" test accepts a code used in `main` or `minor` anywhere
(minor-only languages such as Romansh must exist in the catalog so they can be excluded from distractors).

## Europe, borderline (within +-2% of the cut)

| Country | Decision | Reason |
|---|---|---|
| AD | ca, es, pt main; fr minor | Census/Wikipedia: Spanish ~46%, Catalan ~38%, Portuguese ~15%, French ~5% (just under, mostly a second language) |
| BG | tr main | 2011 census: Turkish mother tongue ~8.5% |
| ES | ca main; gl, eu minor | Catalan ~17% of Spain; Galician and Basque home use ~4% and ~1.5%, regional co-official |
| FI | sv main | Statistics Finland: Swedish ~5.1% (2023), just over the cut |
| LT | lt, ru main; pl minor | 2021 census: Russian ~5% as home/mother tongue kept in; Polish ~5% counted by ethnicity, lower as home language |
| LU | lb, fr, pt main; de minor | 2011 census main language: Luxembourgish ~56%, French ~21%, Portuguese ~16%, German ~3% |
| MC | fr, it main | Italians ~19% of residents; Italian everyday language; Monegasque too small to teach as chip |
| ME | sr, cnr, bs, sq main | 2011 census: Serbian 42.9%, Montenegrin 37%, Bosnian 5.3%, Albanian 5.3% |
| MK | mk, sq main; tr minor | Albanian ~25%; Turkish ~3.5% |
| MT | mt, en main | English as household language ~8-10% in census/Eurobarometer |
| NL | nl main; fy minor | West Frisian ~2-3% of population |
| RO | ro, hu main | 2011/2021 census: Hungarian mother tongue ~6% |
| SK | sk, hu main | 2021 census: Hungarian mother tongue ~7.7% |
| UA | uk, ru main | 2001 census: Russian native ~30% |
| IE | en main; ga minor | Irish is official but used daily by ~2% |
| CH | de, fr, it main; rm minor | Romansh ~0.5% |
| BE | nl, fr main; de minor | German ~1% |

## Outside Europe: global conventions

- Figures are from memory of censuses/Ethnologue/Wikipedia; not re-verified online. Treat any single percentage as approximate.
- Catalog granularity: Persian `fa` also covers Dari (AF); Arabic is one language (Darija, Gulf, Egyptian etc. folded in); `ber` is the Berber/Amazigh group (Kabyle, Tashelhit, Tarifit, Tamazight); `zh` covers Mandarin and Cantonese; Hindi (`hi`) and Urdu (`ur`) separate; `ff` is Fula/Pulaar/Fulfulde.
- English-based Caribbean creoles are folded into `en`, except Jamaican Patois (`jam`), which sits beside `en`. French-based creoles get their own entry when they clear 5% (Haitian `ht`, Seychellois `crs`, Mauritian `mfe`); Kwéyòl (`acf`) is `main` in DM/LC, where it is a majority home language.
- Very fragmented countries (BJ, CM, ET, ML, NE, KE, UG, TZ, TG, TL, NP, PH, PG, SB, VU, CD, CF, CG) show the largest national or regional languages only. Several languages at 5-7% were deliberately left out of the catalog to keep chips teachable (named in the tables below). This is a known departure from a strict 5% rule.
- Gulf states (AE, BH, KW, OM, QA, SA): `main` is Arabic only; the large expatriate languages (Hindi, Urdu, Bengali, English) are `minor`. Strictly, expatriate home languages exceed 5% in several of these (Hindi/Urdu/Malayalam in AE, QA, KW), but they are not the languages a child would be asked about for these countries; `minor` keeps them out of answers and distractors.
- Official-only or lingua franca second languages (English in India, French in most of Africa, Portuguese in TL, Russian in the Caucasus and Central Asia) are `minor` or absent.

## Final review: unfair distractors and promotions

A language below the 5% cut that a child could reasonably know (or the same language under another name, or one
highly visible in the Netherlands) must not show up as a wrong chip ("Dit hoort er niet bij"). Such languages were added to
the country's `minor`, which keeps them out of both the answer and the distractors.

- Added to `minor` (all present in the catalog): NL tr; DE tr ru pl; AT tr hr sr bs; CH en pt sq; IE pl; GR sq; SE fi; SI hr sr bs; RS hu bs; HR sr; CZ sk uk; PL uk; MD uk; LU it en; MC en; CI sev mos bm; BF bm; ML dyu mnk tmh; GN kpe; CM fan; ER aa bej; ZW kck ny toi ts; UG luo; ZM tum; CF sba; LR mnk; MZ ny sn; IN bho mai; TH lo km my; AF tg tk; IR tg tk; TJ fa; IQ tr az; ID ms; MY id jv; NZ zh sm; MM zh; UZ kk; NP ur hi; AM ku; VN km hmn zh; BZ kek; CA es.
- Gulf states (AE, BH, KW, OM, QA, SA): additionally ne tl ta pa ps fa si id as `minor` (SA also hi), so no expatriate language shows up as a wrong chip.
- Promoted to `main` (clear 5%): KE so (Somali ~5.8%, 2019 census), NA loz (Lozi/Silozi ~5%+ home language in Zambezi region), IS pl (Polish ~5-6% of residents, largest immigrant language), PW tl (Filipino ~15% of residents).
- IR glk and mzn moved from `main` to `minor` (Gilaki and Mazandarani are borderline at ~3-5%; no footnote languages).
- LT pl stays `minor`: Polish home use (~5%) is not clearly above Russian by the same home-language metric, and Polish is ethnicity-based above that; left as is.

## Americas, borderline (within +-2% of the cut)

| Country | Decision | Reason |
|---|---|---|
| BO | es, qu, ay main; gn minor | Quechua ~20%, Aymara ~15% mother tongue; Guarani ~1% |
| EC | es main; qu minor | Kichwa/Quechua ~3-4% |
| GT | es, quc, kek, cak main; mam minor | 2018 census: K'iche' ~9%, Q'eqchi' ~8%, Kaqchikel ~6%, Mam ~5% (borderline, left minor) |
| PE | es, qu main; ay minor | Quechua ~13% (2017 census); Aymara ~1.5% |
| PY | es, gn main | Guarani is the home language of a majority |
| CA | en, fr main; zh minor | Chinese languages at home ~3.5-4%, just under |
| US | en, es main; zh minor | Spanish ~13%; Chinese ~1% |
| BS | en main; ht minor | Haitian Creole ~4% |
| SR | nl, srn, hns, jv main | Sranan widely used at home; Sarnami ~18%, Javanese ~15% |
| BZ | en, es main | Spanish ~56%; Kriol folded into en |
| JM | en, jam main | Patois is the everyday language for most |
| MX | es main; nah minor | Nahuatl ~1.5% |
| DM, LC | en, acf main | Kwéyòl/Patwa is a majority home language (review fix); English-based creoles elsewhere stay folded into en |
| HT | ht main; fr minor | French is first language of well under 5% |
| GY, TT | en main; hi minor | Hindi/Bhojpuri home use below 5% |

## Africa, borderline (within +-2% of the cut)

| Country | Decision | Reason |
|---|---|---|
| ZA | zu, xh, af, en, nso, tn, st main; ts, ss, ve minor | 2011 census: Tsonga ~4.5%, Swati ~2.5%, Venda ~2.4% |
| AO | pt, umb, kg, kmb, cjk main | 2014 census: Chokwe ~6.5%, Kikongo/Kimbundu ~8% each |
| SC | crs, en main; fr minor | English ~5% as home language (2010 census), French ~1% |
| MU | mfe, bho main; fr minor | Bhojpuri ~5.3% (2011), French ~3.5% |
| SN | wo, ff, srr, mnk main; dyo minor | Jola ~4.5%, Mandinka ~5% (borderline) |
| GM | mnk, ff, wo, dyo, snk main | Jola ~10%, Soninke ~9% |
| NE | ha, dje, tmh, ff main; kr minor | Kanuri ~4.7% |
| NG | ha, yo, ig, ff, pcm, en main | Fula ~5-6%; Nigerian Pidgin widely a first language; English kept as an everyday home language of urban speakers |
| ZW | sn, nd main; en minor | English ~2%; Kalanga (`kck`, ~5%) is in the catalog but only `minor` here (also `main` in BW) |
| LY | ar main; ber minor | Amazigh ~4-5% |
| MZ | pt, vmw, ts, seh, lon main | Portuguese first language ~17% (2017 census) |
| KE | sw, ki, luy, luo, kln, kam, so main | Kikuyu ~17%, Luhya ~14%, Kalenjin ~13%, Luo ~10%, Kamba ~10%, Somali ~5.8% (promoted in the final review); Kisii and Mijikenda ~5-6% omitted |
| UG | lg, nyn, xog, teo main | Luganda ~17%, Runyankole ~10%, Soga ~8%, Ateso ~7%; Lango (~6%) and Acholi (~5%) omitted |
| BJ | fon, yo, ajg, bba, ff main | Ottamari ~6% omitted |
| SD | ar, bej main; en minor | Fur ~3-5% omitted |
| SL | kri, tem, men main | Limba ~8% and Kono ~5% omitted |
| TZ | sw, suk main | Swahili home use mixed; Sukuma ~16%; other groups ~4% each |
| TG | ee, kbp main; fr minor | Mina/Gen and Tem 5-8% omitted |
| NA | kj, naq, af, hz, kwn, loz main; en, de minor | English ~3% home language, official only; Lozi ~5% (promoted in the final review) |
| LR | en, kpe, bsq, grb, dnj main | Grebo ~10% and Dan/Gio ~8% added (review fix) |
| ML | bm, ff, snk, son, sev, dog main | Senufo ~10% and Dogon ~8% added (review fix) |
| CG | kg, ln, tek, mdw main; fr minor | Teke ~17% and Mbochi ~12% added (review fix) |
| CF | sg, gba, bad main | Sango is the everyday language |
| GH | ak, ee, gaa main; en minor | Mole-Dagbani is a group: each individual language (Dagbani ~4%, Frafra, Dagaare, ...) is under 5%, so left out |
| ST | pt, cri main | Forro ~36% |
| CV | kea main; pt minor | Portuguese official, Kriolu is the home language |

## Asia and Oceania, borderline (within +-2% of the cut)

| Country | Decision | Reason |
|---|---|---|
| IN | hi, bn, mr, te, ta main; gu, ur, kn, ml, pa, en minor | 2011 census mother tongues: Hindi ~44%, Bengali ~8%, Marathi ~7%, Telugu ~6.7%, Tamil ~5.7%; Gujarati 4.6%, Urdu 4.2% just under; English <1% |
| PK | pa, ps, sd, skr, ur main | Saraiki ~12%, Urdu ~7%; Balochi ~3.5% omitted |
| NP | ne, mai, bho, thl, taj main | Tharu ~5.8% and Tamang ~5% included so the cut is consistent (review fix) |
| PH | tl, ceb, ilo, hil main; en minor | Bikol ~6% omitted; Waray ~3.5% |
| GE | ka, az main; hy, ru minor | 2014 census: Azerbaijani 6.3%, Armenian 4.5% (just under) |
| UZ | uz main; ru, tg minor | Russian and Tajik home use ~5% (borderline) |
| TM | tk, uz main; ru minor | Uzbek ~5%, Russian ~4% |
| KZ | kk, ru main; uz minor | Russian is the home language of ~20%+ |
| SG | en, zh, ms main; ta minor | 2020 census: English ~48%, Mandarin+dialects ~38%, Malay ~9%, Tamil ~2.5% |
| MY | ms, zh, ta main | Tamil ~6% |
| BN | ms, zh main | Chinese ~10% |
| LK | si, ta main | Tamil ~18% |
| TH | th main | Isan and Northern/Southern Thai folded into Thai |
| MM | my, shn, kar main | Shan ~9%, Karen ~7%; Rakhine ~4% omitted |
| IQ, SY | ar, ku main | Kurdish ~15-20% (IQ), ~9% (SY) |
| IR | fa, az, ku, lrc main; ar, glk, mzn, tg, tk minor | Luri ~6% main; Gilaki and Mazandarani (~3-5%) moved to minor in the final review |
| GW | pov, ff, bjt, mnk, mfv, pbo main; pt minor | Manjak ~8% and Papel ~7% added (review fix) |
| TL | tet, mgm, mkz main; pt, id minor | Mambai ~12%, Makasae ~10% (review fix); other languages under 5% |
| NZ | en main; mi minor | Maori spoken by ~4% |
| AU | en main; zh, ar minor | Mandarin ~2.7%, Arabic ~1.4% |
| FJ | fj, hif main | Fijian ~55%, Fiji Hindi ~35% |
| PG, SB, VU | tpi, pis, bi main | Pidgin/creole lingua francas in daily use; hundreds of local languages, none above ~5% |
| FM | chk, pon, kos, yap main | Chuukese ~48%, Pohnpeian ~24%, Kosraean ~6%, Yapese ~5.5% |
