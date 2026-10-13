import { test, expect, type Page } from '@playwright/test';
import { MONTHS } from '../src/games/calendar/data';

async function finishChoiceQuestion(page: Page) {
  await page.locator('.choice').first().click();
  await expect(page.locator('.feedback')).toBeVisible();
  const wrong = await page.locator('.continue').count();
  if (wrong) await page.locator('.continue').click();
  return wrong > 0;
}

async function monthOrder(page: Page) {
  return page.locator('.month-card').evaluateAll((cards) => cards.map((card) => (card as HTMLElement).dataset.monthId!));
}

async function arrangeMonths(page: Page, reverse = false, keyboard = false) {
  const available = await monthOrder(page);
  const ordered = MONTHS.map((month) => month.id).filter((id) => available.includes(id));
  if (reverse) ordered.reverse();
  for (const [index, id] of ordered.entries()) {
    while ((await monthOrder(page)).indexOf(id) > index) {
      const row = page.locator(`.month-card[data-month-id="${id}"]`);
      if (keyboard) {
        await row.locator('.month-handle').focus();
        await page.keyboard.press('ArrowUp');
      } else await row.locator('.month-move-up').click();
    }
  }
}

async function solveMonthQuestion(page: Page) {
  await arrangeMonths(page);
  await page.locator('.month-check').click();
  await expect(page.locator('.month-correct-order')).toBeVisible();
  await expect(page.locator('.continue')).toBeVisible();
  await page.locator('.continue').click();
}

async function playCalendarRound(page: Page, level: 'weekdays' | 'months' | 'dates' | 'elapsed') {
  await page.goto(`./#/calendar/${level}`);
  for (let question = 1; question <= 10; question++) {
    await expect(page.locator('.progress')).toHaveText(`Vraag ${question} van 10`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    if (level === 'months') await solveMonthQuestion(page);
    else await finishChoiceQuestion(page);
  }
  await expect(page.locator('.end h1')).toContainText('van 10!');
}

for (const level of ['weekdays', 'months', 'dates', 'elapsed'] as const) {
  test(`plays a complete Calendar Quest ${level} round`, async ({ page }) => {
    await page.goto('./');
    await page.locator('.tile-calendar').click();
    await expect(page.locator(`a.level[href="#/calendar/${level}"]`)).toBeVisible();
    await playCalendarRound(page, level);
  });
}

test('the single month list previews mouse insertion and preserves ordering through language changes', async ({ page }) => {
  await page.goto('./#/calendar/months');
  const before = await monthOrder(page);
  const source = page.locator('.month-handle').first();
  const sourceBox = (await source.boundingBox())!;
  const destinationBox = (await page.locator('.month-card').last().boundingBox())!;
  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(destinationBox.x + destinationBox.width / 2, destinationBox.y + destinationBox.height - 4, { steps: 8 });
  await expect(page.locator('.month-drag-ghost')).toBeVisible();
  await expect(page.locator('.month-card.is-dragging')).toBeVisible();
  await page.keyboard.press('Escape');
  expect(await monthOrder(page)).toEqual(before);
  await expect(page.locator('.month-drag-ghost')).toHaveCount(0);
  await page.mouse.up();
  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(destinationBox.x + destinationBox.width / 2, destinationBox.y + destinationBox.height - 4, { steps: 8 });
  await page.mouse.up();
  const expected = [...before.slice(1), before[0]];
  expect(await monthOrder(page)).toEqual(expected);
  await expect(page.locator('.month-drag-ghost')).toHaveCount(0);
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  expect(await monthOrder(page)).toEqual(expected);
  await page.locator('.month-move-up').nth(1).tap();
  expect(await monthOrder(page)).toEqual([expected[1], expected[0], ...expected.slice(2)]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('real touch dragging reorders months and cancels safely', async ({ page }) => {
  await page.goto('./#/calendar/months');
  const before = await monthOrder(page);
  const session = await page.context().newCDPSession(page);
  async function drag(ending: 'touchEnd' | 'touchCancel', outside = false) {
    const source = (await page.locator('.month-handle').first().boundingBox())!;
    const destination = (await page.locator('.month-card').last().boundingBox())!;
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ id: 1, x: source.x + source.width / 2, y: source.y + source.height / 2 }] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ id: 1, x: outside ? 1 : destination.x + destination.width / 2, y: destination.y + destination.height - 4 }] });
    await expect(page.locator('.month-drag-ghost')).toBeVisible();
    await session.send('Input.dispatchTouchEvent', { type: ending, touchPoints: [] });
    await expect(page.locator('.month-drag-ghost')).toHaveCount(0);
  }
  await drag('touchEnd');
  const expected = [...before.slice(1), before[0]];
  expect(await monthOrder(page)).toEqual(expected);
  await drag('touchCancel');
  expect(await monthOrder(page)).toEqual(expected);
  await drag('touchEnd', true);
  expect(await monthOrder(page)).toEqual(expected);
  await session.detach();
});

test('keyboard users reorder months and continue after both correct and wrong feedback', async ({ page }) => {
  await page.goto('./#/calendar/months');
  await arrangeMonths(page, false, true);
  await page.locator('.month-check').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.feedback')).toHaveText('Goed zo!');
  await expect(page.locator('.continue')).toBeFocused();
  await page.waitForTimeout(1500);
  await expect(page.locator('.progress')).toHaveText('Vraag 1 van 10');
  await page.keyboard.press('Enter');
  await expect(page.locator('.progress')).toHaveText('Vraag 2 van 10');
  await expect(page.locator('.month-handle').first()).toBeFocused();
  await arrangeMonths(page, true, true);
  await page.locator('.month-check').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.continue')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('.progress')).toHaveText('Vraag 3 van 10');
  await expect(page.locator('.month-handle').first()).toBeFocused();
});

test('Calendar Quest offers study links in both languages', async ({ page }) => {
  for (const [game, levels] of [['calendar', ['weekdays', 'months', 'dates', 'elapsed']]] as const) {
    await page.goto(`./#/${game}`);
    await expect(page.locator('.learn-link')).toHaveCount(levels.length);
    for (const level of levels) {
      await page.goto(`./#/${game}/${level}/learn`);
      await page.getByRole('button', { name: 'NL', exact: true }).click();
      await expect(page.locator('.study h2')).toBeVisible();
      await expect(page.getByRole('link', { name: 'Nu oefenen' })).toBeVisible();
      await page.getByRole('button', { name: 'EN', exact: true }).click();
      await expect(page.getByRole('link', { name: 'Practise now' })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
  }
});

test('removed history links return home and no history tile is shown', async ({ page }) => {
  for (const route of ['', '#/history', '#/history/dutch', '#/history/world', '#/history/dutch/learn', '#/history/world/learn']) {
    await page.goto(`./${route}`);
    await expect(page.locator('.home')).toBeVisible();
    await expect(page.locator('.tile-calendar')).toBeVisible();
    await expect(page.locator('.tile-history')).toHaveCount(0);
  }
});
