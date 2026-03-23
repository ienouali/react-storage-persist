import { test, expect } from '@playwright/test';

test.describe('Shopping Cart', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByRole('button', { name: 'Shopping Cart' }).click();
    await expect(page.getByRole('heading', { name: 'Shopping Cart with TTL' })).toBeVisible();
  });

  test('shows empty cart initially', async ({ page }) => {
    await expect(page.locator('.empty-state')).toHaveText('Your cart is empty');
  });

  test('adds a product to the cart', async ({ page }) => {
    await page
      .locator('.product-card')
      .filter({ hasText: 'Laptop' })
      .getByRole('button', { name: 'Add to Cart' })
      .click();

    await expect(page.locator('.cart-item')).toHaveCount(1);
    await expect(page.locator('.cart-item').filter({ hasText: 'Laptop' })).toBeVisible();
  });

  test('increments quantity when same product added twice', async ({ page }) => {
    const laptopCard = page.locator('.product-card').filter({ hasText: 'Laptop' });
    await laptopCard.getByRole('button', { name: 'Add to Cart' }).click();
    await laptopCard.getByRole('button', { name: 'Add to Cart' }).click();

    await expect(page.locator('.cart-item')).toHaveCount(1);
    await expect(page.locator('.cart-item-quantity span')).toHaveText('2');
  });

  test('updates quantity with + and - buttons', async ({ page }) => {
    await page
      .locator('.product-card')
      .filter({ hasText: 'Laptop' })
      .getByRole('button', { name: 'Add to Cart' })
      .click();

    const quantitySpan = page.locator('.cart-item-quantity span');
    await expect(quantitySpan).toHaveText('1');

    await page.locator('.cart-item-quantity').getByRole('button', { name: '+' }).click();
    await expect(quantitySpan).toHaveText('2');

    await page.locator('.cart-item-quantity').getByRole('button', { name: '-' }).click();
    await expect(quantitySpan).toHaveText('1');
  });

  test('removes item when quantity decremented to zero', async ({ page }) => {
    const phoneCard = page
      .locator('.product-card')
      .filter({ has: page.locator('h3', { hasText: /^Phone$/ }) });
    await phoneCard.getByRole('button', { name: 'Add to Cart' }).click();
    await expect(page.locator('.cart-item')).toHaveCount(1);

    await page.locator('.cart-item-quantity').getByRole('button', { name: '-' }).click();
    await expect(page.locator('.cart-item')).toHaveCount(0);
    await expect(page.locator('.empty-state')).toBeVisible();
  });

  test('removes item with Remove button', async ({ page }) => {
    await page
      .locator('.product-card')
      .filter({ hasText: 'Headphones' })
      .getByRole('button', { name: 'Add to Cart' })
      .click();
    await expect(page.locator('.cart-item')).toHaveCount(1);

    await page.locator('.cart-item').getByRole('button', { name: 'Remove' }).click();
    await expect(page.locator('.cart-item')).toHaveCount(0);
    await expect(page.locator('.empty-state')).toBeVisible();
  });

  test('calculates correct total', async ({ page }) => {
    const phoneCard = page
      .locator('.product-card')
      .filter({ has: page.locator('h3', { hasText: /^Phone$/ }) });
    await page
      .locator('.product-card')
      .filter({ hasText: 'Laptop' })
      .getByRole('button', { name: 'Add to Cart' })
      .click();
    await phoneCard.getByRole('button', { name: 'Add to Cart' }).click();

    await expect(page.locator('.cart-total')).toContainText('$1698.00');
  });

  test('clears entire cart', async ({ page }) => {
    const phoneCard = page
      .locator('.product-card')
      .filter({ has: page.locator('h3', { hasText: /^Phone$/ }) });
    await page
      .locator('.product-card')
      .filter({ hasText: 'Laptop' })
      .getByRole('button', { name: 'Add to Cart' })
      .click();
    await phoneCard.getByRole('button', { name: 'Add to Cart' }).click();
    await expect(page.locator('.cart-item')).toHaveCount(2);

    await page.getByRole('button', { name: 'Clear Cart' }).click();
    await expect(page.locator('.empty-state')).toBeVisible();
    await expect(page.locator('.cart-item')).toHaveCount(0);
  });

  test('cart persists after page reload', async ({ page }) => {
    await page
      .locator('.product-card')
      .filter({ hasText: 'Laptop' })
      .getByRole('button', { name: 'Add to Cart' })
      .click();
    await page
      .locator('.product-card')
      .filter({ hasText: 'Watch' })
      .getByRole('button', { name: 'Add to Cart' })
      .click();
    await expect(page.locator('.cart-item')).toHaveCount(2);

    await page.reload();
    await page.getByRole('button', { name: 'Shopping Cart' }).click();

    await expect(page.locator('.cart-item')).toHaveCount(2);
    await expect(page.locator('.cart-item').filter({ hasText: 'Laptop' })).toBeVisible();
    await expect(page.locator('.cart-item').filter({ hasText: 'Watch' })).toBeVisible();
  });
});
