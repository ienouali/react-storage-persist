import { test, expect } from '@playwright/test';

test.describe('Basic Usage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('text input persists value after page reload', async ({ page }) => {
    const input = page.getByPlaceholder('Enter your name');
    await input.fill('Alice');
    await expect(input).toHaveValue('Alice');

    await page.reload();

    await expect(page.getByPlaceholder('Enter your name')).toHaveValue('Alice');
    await expect(page.locator('.hint strong')).toHaveText('Alice');
  });

  test('counter increments and decrements', async ({ page }) => {
    const counterGroup = page.locator('.counter-group');
    const value = page.locator('.counter-value');
    await expect(value).toHaveText('0');

    await counterGroup.getByRole('button', { name: '+' }).click();
    await counterGroup.getByRole('button', { name: '+' }).click();
    await expect(value).toHaveText('2');

    await counterGroup.getByRole('button', { name: '-' }).click();
    await expect(value).toHaveText('1');
  });

  test('counter resets to zero', async ({ page }) => {
    const counterGroup = page.locator('.counter-group');
    await counterGroup.getByRole('button', { name: '+' }).click();
    await counterGroup.getByRole('button', { name: '+' }).click();
    await expect(page.locator('.counter-value')).toHaveText('2');

    await counterGroup.getByRole('button', { name: 'Reset' }).click();
    await expect(page.locator('.counter-value')).toHaveText('0');
  });

  test('counter value persists after page reload', async ({ page }) => {
    const counterGroup = page.locator('.counter-group');
    await counterGroup.getByRole('button', { name: '+' }).click();
    await counterGroup.getByRole('button', { name: '+' }).click();
    await counterGroup.getByRole('button', { name: '+' }).click();
    await expect(page.locator('.counter-value')).toHaveText('3');

    await page.reload();

    await expect(page.locator('.counter-value')).toHaveText('3');
  });

  test('toggle checkbox persists after page reload', async ({ page }) => {
    const checkbox = page.locator('.checkbox').first();
    await expect(checkbox).not.toBeChecked();

    await checkbox.check();
    await expect(page.locator('.toggle-label strong')).toHaveText('Yes');

    await page.reload();

    await expect(page.locator('.checkbox').first()).toBeChecked();
    await expect(page.locator('.toggle-label strong')).toHaveText('Yes');
  });
});
