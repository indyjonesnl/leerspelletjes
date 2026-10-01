import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath, URL as NodeURL } from 'node:url';
import { PROVINCES } from './provinces';
import { provinceFlagUrl } from './flags';

// jsdom replaces the global URL; node:url's gives real file paths (same trick as the country data test).
const root = fileURLToPath(new NodeURL('../../../', import.meta.url));
const flagFile = (code: string) => `${root}public/flags-nl/${code.toLowerCase()}.svg`;

describe('provinceFlagUrl', () => {
  it('points at the committed copy on our own site', () => {
    expect(provinceFlagUrl('NB')).toBe('flags-nl/nb.svg');
    expect(provinceFlagUrl('ZH')).toBe('flags-nl/zh.svg');
  });
});

describe('province flag files', () => {
  it('has a safe SVG for each of the 12 provinces', () => {
    expect(PROVINCES).toHaveLength(12);
    for (const p of PROVINCES) {
      expect(existsSync(flagFile(p.code)), p.code).toBe(true);
      const svg = readFileSync(flagFile(p.code), 'utf8');
      expect(svg, p.code).toMatch(/<svg[\s>]/);
      expect(svg, p.code).not.toMatch(/<script|<foreignObject|\son\w+\s*=/i);
      expect(svg.length, p.code).toBeLessThan(400 * 1024);
    }
  });

  it('records a public-domain source for each flag', () => {
    const licences = JSON.parse(readFileSync(`${root}src/games/nederland/data/flags-licences.json`, 'utf8'));
    expect(Object.keys(licences).sort()).toEqual(PROVINCES.map((p) => p.code).sort());
    for (const [code, info] of Object.entries<{ file: string; source: string; licence: string }>(licences)) {
      expect(['Public domain', 'CC0'], code).toContain(info.licence);
      expect(info.file, code).toMatch(/^File:.+\.svg$/);
      expect(info.source, code).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    }
  });
});
