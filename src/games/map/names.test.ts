import { describe, it, expect } from 'vitest';
import { countryName, whereIs } from './names';

describe('names', () => {
  it('looks up both names', () => {
    expect(countryName('DE')).toEqual({ nl: 'Duitsland', en: 'Germany' });
  });

  it('asks where a country is, with articles and plurals where the language needs them', () => {
    expect(whereIs('DE')).toEqual({ nl: 'Waar ligt Duitsland?', en: 'Where is Germany?' });
    expect(whereIs('NL')).toEqual({ nl: 'Waar ligt Nederland?', en: 'Where is the Netherlands?' });
    expect(whereIs('GB')).toEqual({ nl: 'Waar ligt het Verenigd Koninkrijk?', en: 'Where is the United Kingdom?' });
    expect(whereIs('PH')).toEqual({ nl: 'Waar liggen de Filipijnen?', en: 'Where are the Philippines?' });
    expect(whereIs('US')).toEqual({ nl: 'Waar liggen de Verenigde Staten?', en: 'Where is the United States?' });
  });
});
