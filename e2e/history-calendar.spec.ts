import { test, expect, type Page } from '@playwright/test';
import { MONTHS } from '../src/games/calendar/data';
import { HISTORY_EVENTS } from '../src/games/history/data';

async function finishChoiceQuestion(page: Page) {
  await page.locator('.choice').first().click();
  await expect(page.locator('.feedback')).toBeVisible();
  const wrong = await page.locator('.continue').count();
  if (wrong) await page.locator('.continue').click();
  return wrong > 0;
}

async function playHistoryRound(page: Page, level: 'dutch' | 'world') {
  await page.goto(`./#/history/${level}`);
  for (let question = 1; question <= 10; question++) {
    await expect(page.locator('.progress')).toHaveText(`Vraag ${question} van 10`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(await page.locator('.history-event').count()).toBe(0);
    await expect(page.getByRole('article')).toHaveCount(0);
    if (question === 1) {
      const ids = await page.locator('.choice').evaluateAll((buttons) => buttons.map((button) => (button as HTMLElement).dataset.id!));
      const earliest = HISTORY_EVENTS[level].filter((event) => ids.includes(event.id)).sort((a, b) => a.year - b.year)[0];
      await page.locator(`.choice[data-id="${earliest.id}"]`).click();
      await page.waitForTimeout(1500);
      await expect(page.locator('.progress')).toHaveText('Vraag 1 van 10');
    } else {
      await page.locator('.choice').first().click();
    }
    await expect(page.locator('.feedback')).toBeVisible();
    await expect(page.locator('.continue')).toBeVisible();
    await expect(page.locator('.history-event')).toHaveCount(4);
    expect(await page.locator('.history-event-year').count()).toBe(4);
    await expect(page.getByRole('link', { name: /Source|Bron/ })).toHaveCount(4);
    await expect(page.getByRole('article')).toHaveCount(4);
    await expect(page.getByRole('heading', { level: 3 })).toHaveCount(4);
    const firstYear = (await page.locator('.history-event-year').first().textContent())!;
    await expect(page.getByText(firstYear, { exact: true })).toBeVisible();
    await page.locator('.continue').press('Enter');
  }
  await expect(page.locator('.end h1')).toContainText('van 10!');
}

async function solveMonthQuestion(page: Page) {
  const available = await page.locator('.month-tile').evaluateAll((tiles) => tiles.map((tile) => (tile as HTMLElement).dataset.monthId!));
  const canonical = MONTHS.map((month) => month.id).filter((id) => available.includes(id));
  for (const [index, id] of canonical.entries()) {
    const slot = page.locator('.month-slot').nth(index);
    if (await slot.getAttribute('data-month-id') === id) continue;
    if (await page.locator(`.month-tile[data-month-id="${id}"]`).count()) {
      await page.locator(`.month-tile[data-month-id="${id}"]`).click();
      await slot.click();
    } else {
      await page.locator(`.month-slot[data-month-id="${id}"]`).click();
      await slot.click();
    }
  }
  await page.locator('.month-check').click();
  await expect(page.locator('.month-correct-order')).toBeVisible();
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

for (const level of ['dutch', 'world'] as const) {
  test(`plays a complete ${level} History Timeline round and reveals its chronology`, async ({ page }) => {
    await page.goto('./');
    await page.locator('.tile-history').click();
    await expect(page.locator(`a.level[href="#/history/${level}"]`)).toBeVisible();
    await playHistoryRound(page, level);
  });
}

for (const level of ['weekdays', 'months', 'dates', 'elapsed'] as const) {
  test(`plays a complete Calendar Quest ${level} round`, async ({ page }) => {
    await page.goto('./');
    await page.locator('.tile-calendar').click();
    await expect(page.locator(`a.level[href="#/calendar/${level}"]`)).toBeVisible();
    await playCalendarRound(page, level);
  });
}

test('month ordering supports pointer drag, tap, keyboard moves, and language changes without losing state', async ({ page }) => {
  await page.goto('./#/calendar/months');
  const tile = page.locator('.month-tile').first();
  const tileId = (await tile.getAttribute('data-month-id'))!;
  const tileBox = (await tile.boundingBox())!;
  const slot = page.locator('.month-slot').first();
  const slotBox = (await slot.boundingBox())!;
  await page.mouse.move(tileBox.x + tileBox.width / 2, tileBox.y + tileBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(slotBox.x + slotBox.width / 2, slotBox.y + slotBox.height / 2, { steps: 5 });
  await page.mouse.up();
  await expect(slot).toHaveAttribute('data-month-id', tileId);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.locator('.progress')).toHaveText('Question 1 of 10');
  await expect(slot).toHaveAttribute('data-month-id', tileId);
  const touchTile = page.locator('.month-tile').first();
  const touchId = (await touchTile.getAttribute('data-month-id'))!;
  const touchTileBox = (await touchTile.boundingBox())!;
  const secondSlot = page.locator('.month-slot').nth(1);
  const secondSlotBox = (await secondSlot.boundingBox())!;
  await page.touchscreen.tap(touchTileBox.x + touchTileBox.width / 2, touchTileBox.y + touchTileBox.height / 2);
  await page.touchscreen.tap(secondSlotBox.x + secondSlotBox.width / 2, secondSlotBox.y + secondSlotBox.height / 2);
  await expect(secondSlot).toHaveAttribute('data-month-id', touchId);

  const keyboardTile = page.locator('.month-tile').first();
  const keyboardId = (await keyboardTile.getAttribute('data-month-id'))!;
  await keyboardTile.focus();
  await page.keyboard.press('Enter');
  await page.locator('.month-slot').nth(0).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.month-slot').nth(0)).toHaveAttribute('data-month-id', keyboardId);
  await page.locator('.month-slot').nth(0).press('ArrowDown');
  await expect(page.locator('.month-slot').nth(1)).toHaveAttribute('data-month-id', keyboardId);
});

test('month ordering supports real touch dragging from the tray into a slot', async ({ page }) => {
  await page.goto('./#/calendar/months');
  const tile = page.locator('.month-tile').first();
  const monthId = (await tile.getAttribute('data-month-id'))!;
  const tileBox = (await tile.boundingBox())!;
  const slot = page.locator('.month-slot').first();
  const slotBox = (await slot.boundingBox())!;
  const session = await page.context().newCDPSession(page);
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ id: 1, x: tileBox.x + tileBox.width / 2, y: tileBox.y + tileBox.height / 2 }],
  });
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ id: 1, x: slotBox.x + slotBox.width / 2, y: slotBox.y + slotBox.height / 2 }],
  });
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(slot).toHaveAttribute('data-month-id', monthId);

  const sourceBox = (await slot.boundingBox())!;
  const secondSlot = page.locator('.month-slot').nth(1);
  const secondBox = (await secondSlot.boundingBox())!;
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ id: 2, x: sourceBox.x + sourceBox.width / 2, y: sourceBox.y + sourceBox.height / 2 }],
  });
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ id: 2, x: secondBox.x + secondBox.width / 2, y: secondBox.y + secondBox.height / 2 }],
  });
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(slot).toHaveAttribute('data-month-id', '');
  await expect(secondSlot).toHaveAttribute('data-month-id', monthId);

  const outsideBox = (await page.locator('.prompt').boundingBox())!;
  const placedBox = (await secondSlot.boundingBox())!;
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ id: 3, x: placedBox.x + placedBox.width / 2, y: placedBox.y + placedBox.height / 2 }],
  });
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ id: 3, x: outsideBox.x + outsideBox.width / 2, y: outsideBox.y + outsideBox.height / 2 }],
  });
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(secondSlot).toHaveAttribute('data-month-id', monthId);
  await expect(page.locator('.month-board')).not.toHaveAttribute('data-dragging-month', /.+/);

  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ id: 4, x: placedBox.x + placedBox.width / 2, y: placedBox.y + placedBox.height / 2 }],
  });
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ id: 4, x: slotBox.x + slotBox.width / 2, y: slotBox.y + slotBox.height / 2 }],
  });
  await session.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  await expect(secondSlot).toHaveAttribute('data-month-id', monthId);
  await expect(page.locator('.month-board')).not.toHaveAttribute('data-dragging-month', /.+/);
  await session.detach();
});

test('keyboard users keep focus through correct and incorrect month answers', async ({ page }) => {
  await page.goto('./#/calendar/months');
  const canonical = MONTHS.map((month) => month.id);

  async function arrange(reverse: boolean) {
    const available = await page.locator('.month-tile').evaluateAll((tiles) => tiles.map((tile) => (tile as HTMLElement).dataset.monthId!));
    const ordered = canonical.filter((id) => available.includes(id));
    const months = reverse ? [...ordered].reverse() : ordered;
    for (const [index, id] of months.entries()) {
      const target = page.locator('.month-slot').nth(index);
      if (await target.getAttribute('data-month-id') === id) continue;
      const trayTile = page.locator(`.month-tile[data-month-id="${id}"]`);
      if (await trayTile.count()) {
        await trayTile.focus();
        await page.keyboard.press('Enter');
      } else {
        const source = page.locator(`.month-slot[data-month-id="${id}"]`);
        await source.focus();
        await page.keyboard.press('Enter');
      }
      await target.focus();
      await page.keyboard.press('Enter');
    }
    await page.locator('.month-check').focus();
    await page.keyboard.press('Enter');
  }

  await arrange(false);
  await expect(page.locator('.feedback')).toBeVisible();
  await page.waitForTimeout(1100);
  await expect(page.locator('.progress')).toHaveText('Vraag 2 van 10');
  await expect(page.locator('[data-interactive-initial-focus]').first()).toBeFocused();

  await arrange(true);
  await expect(page.locator('.continue')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('.progress')).toHaveText('Vraag 3 van 10');
  await expect(page.locator('[data-interactive-initial-focus]').first()).toBeFocused();
});

test('History Timeline and Calendar Quest offer study links in both languages', async ({ page }) => {
  for (const [game, levels] of [['history', ['dutch', 'world']], ['calendar', ['weekdays', 'months', 'dates', 'elapsed']]] as const) {
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
