import { test, expect, type Page } from '@playwright/test';
import { PROVINCES } from '../src/games/nederland/provinces';

async function prompt(page: Page): Promise<string> {
  return page.locator('.prompt').innerText();
}

/** Province code asked about: by province name (levels 1–2) or by capital name (level 3). */
async function askedCode(page: Page, by: 'name' | 'capital'): Promise<string> {
  const text = await prompt(page);
  const subject = text
    .replace(/^(Waar ligt (de stad )?|Wat is de hoofdstad van )/, '')
    .replace(/\?$/, '');
  const p = PROVINCES.find((x) => (by === 'name' ? x.name.nl : x.capital.nl) === subject);
  if (!p) throw new Error(`No province in prompt: ${text}`);
  return p.code;
}

test('plays a full round of provinces', async ({ page }) => {
  await page.goto('./');
  await page.locator('a.tile-nederland').click();
  await page.locator('a.level[href="#/nederland/1"]').click();
  await expect(page.locator('.map-credit')).toHaveText('Kaart: CBS, Kadaster (CC BY 4.0)');
  for (let i = 1; i <= 12; i++) {
    await expect(page.locator('.progress')).toHaveText(`Vraag ${i} van 12`);
    const code = await askedCode(page, 'name');
    await page.locator(`[data-choice-id="${code}"]`).dispatchEvent('click');
    await expect(page.locator(`.country.correct[data-choice-id="${code}"]`)).toBeVisible();
  }
  await expect(page.locator('.end h1')).toHaveText('12 van 12!');
});

test('a real tap on a province answers', async ({ page }) => {
  await page.goto('./#/nederland/1');
  const code = await askedCode(page, 'name');
  // Tap at the province's own centre point (data-cx/cy, viewBox units): the centre of its bounding box can be water.
  const svg = page.locator('svg.map');
  const [, , w] = (await svg.getAttribute('viewBox'))!.split(' ').map(Number);
  const box = (await svg.boundingBox())!;
  const target = page.locator(`[data-choice-id="${code}"]`);
  const cx = Number(await target.getAttribute('data-cx'));
  const cy = Number(await target.getAttribute('data-cy'));
  const scale = box.width / w;
  await page.mouse.click(box.x + cx * scale, box.y + cy * scale);
  await expect(page.locator(`.country.correct[data-choice-id="${code}"]`)).toBeVisible();
});

test('names the capital of the highlighted province', async ({ page }) => {
  await page.goto('./#/nederland/2');
  await expect(page.locator('.country.highlight')).toBeVisible();
  const code = await askedCode(page, 'name');
  const capital = PROVINCES.find((p) => p.code === code)!.capital.nl;
  await page.locator('.choice .label', { hasText: new RegExp(`^${capital}$`) }).click();
  await expect(page.locator('.choice.correct')).toBeVisible();
});

test('taps the capital on the map', async ({ page }) => {
  await page.goto('./#/nederland/3');
  await expect(page.locator('.point')).toHaveCount(12);
  const code = await askedCode(page, 'capital');
  await page.locator(`.point[data-choice-id="${code}"]`).click();
  await expect(page.locator(`.point.correct[data-choice-id="${code}"]`)).toBeVisible();
});

test('the Netherlands map loads only when a level opens', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (r) => requests.push(r.url()));
  const nlChunk = (u: string) => /\/nl-[\w-]+\.js$/.test(u);
  await page.goto('./');
  await expect(page.locator('.tiles')).toBeVisible();
  expect(requests.some(nlChunk)).toBe(false);
  await page.goto('./#/nederland/1');
  await expect(page.locator('.country.target').first()).toBeVisible();
  expect(requests.some(nlChunk)).toBe(true);
});

test('the Netherlands map keeps its aspect ratio and the prompt stays above the fold', async ({ page }) => {
  await page.goto('./#/nederland/2');
  const svg = page.locator('svg.map');
  await expect(svg).toBeVisible();
  const [, , w, h] = (await svg.getAttribute('viewBox'))!.split(' ').map(Number);
  const box = (await svg.boundingBox())!;
  expect(Math.abs(box.width / box.height - w / h) / (w / h)).toBeLessThan(0.02);
  // The map fills the available width: the container's width, or this level's height cap at this aspect ratio.
  const container = (await page.locator('.visual').boundingBox())!;
  const viewportHeight = page.viewportSize()!.height;
  const cap = parseFloat(await svg.evaluate((e) => getComputedStyle(e).maxHeight));
  expect(box.width).toBeGreaterThanOrEqual(Math.min(container.width, (cap * w) / h) - 2);
  const p = (await page.locator('.prompt').boundingBox())!;
  expect(p.y + p.height).toBeLessThanOrEqual(viewportHeight);
  // Level 2 is a choice question: all four answer buttons fit without scrolling too.
  await expect(page.locator('.choice')).toHaveCount(4);
  const last = (await page.locator('.choice').last().boundingBox())!;
  expect(last.y + last.height).toBeLessThanOrEqual(viewportHeight);
});
