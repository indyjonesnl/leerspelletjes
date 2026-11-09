import type { CountryLanguages } from './types';

/**
 * Languages per country in the Americas (5% home-language rule; see ../sources.md for borderline decisions).
 * `minor` = well-known languages below the cut.
 */
export const AMERICAS: Readonly<Record<string, CountryLanguages>> = {
  AG: { main: ['en'] },
  AR: { main: ['es'] },
  BB: { main: ['en'] },
  BO: { main: ['es', 'qu', 'ay'], minor: ['gn'] },
  BR: { main: ['pt'], minor: ['es'] },
  BS: { main: ['en'], minor: ['ht'] },
  BZ: { main: ['en', 'es'] },
  CA: { main: ['en', 'fr'], minor: ['zh'] },
  CL: { main: ['es'] },
  CO: { main: ['es'] },
  CR: { main: ['es'] },
  CU: { main: ['es'] },
  DM: { main: ['en', 'acf'] },
  DO: { main: ['es'], minor: ['ht'] },
  EC: { main: ['es'], minor: ['qu'] },
  GD: { main: ['en'] },
  GT: { main: ['es', 'quc', 'kek', 'cak'], minor: ['mam'] },
  GY: { main: ['en'], minor: ['hi'] },
  HN: { main: ['es'] },
  HT: { main: ['ht'], minor: ['fr'] },
  JM: { main: ['en', 'jam'] },
  KN: { main: ['en'] },
  LC: { main: ['en', 'acf'] },
  MX: { main: ['es'], minor: ['nah'] },
  NI: { main: ['es'] },
  PA: { main: ['es'] },
  PE: { main: ['es', 'qu'], minor: ['ay'] },
  PY: { main: ['es', 'gn'] },
  SR: { main: ['nl', 'srn', 'hns', 'jv'] },
  SV: { main: ['es'] },
  TT: { main: ['en'], minor: ['hi'] },
  US: { main: ['en', 'es'], minor: ['zh'] },
  UY: { main: ['es'] },
  VC: { main: ['en'] },
  VE: { main: ['es'] },
};
