import { test, expect } from '@playwright/test';

test.describe('Settings Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByRole('button', { name: 'Settings Panel' }).click();
    await expect(page.getByRole('heading', { name: 'Settings Panel' })).toBeVisible();
  });

  test('changes theme and persists after reload', async ({ page }) => {
    await page.locator('.select').first().selectOption('dark');
    await expect(page.locator('.json-preview')).toContainText('"theme": "dark"');

    await page.reload();
    await page.getByRole('button', { name: 'Settings Panel' }).click();

    await expect(page.locator('.select').first()).toHaveValue('dark');
    await expect(page.locator('.json-preview')).toContainText('"theme": "dark"');
  });

  test('toggles notifications and persists', async ({ page }) => {
    const checkbox = page.locator('.checkbox').first();
    await expect(checkbox).toBeChecked();

    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
    await expect(page.locator('.json-preview')).toContainText('"notifications": false');

    await page.reload();
    await page.getByRole('button', { name: 'Settings Panel' }).click();

    await expect(page.locator('.checkbox').first()).not.toBeChecked();
  });

  test('changes language and persists', async ({ page }) => {
    // Language select is in the Preferences card (last select)
    const selects = page.locator('.select');
    const langSelect = selects.last();
    await langSelect.selectOption('fr');
    await expect(page.locator('.json-preview')).toContainText('"language": "fr"');

    await page.reload();
    await page.getByRole('button', { name: 'Settings Panel' }).click();

    await expect(page.locator('.select').last()).toHaveValue('fr');
  });

  test('shows default settings on first load', async ({ page }) => {
    const preview = page.locator('.json-preview');
    await expect(preview).toContainText('"theme": "light"');
    await expect(preview).toContainText('"notifications": true');
    await expect(preview).toContainText('"language": "en"');
    await expect(preview).toContainText('"fontSize": 16');
  });

  test('email frequency select is disabled when notifications off', async ({ page }) => {
    // Disable notifications
    await page.locator('.checkbox').first().uncheck();

    // Email frequency select should be disabled
    const emailSelect = page.locator('.select').nth(1);
    await expect(emailSelect).toBeDisabled();
  });
});
