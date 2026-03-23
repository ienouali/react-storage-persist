import { test, expect } from '@playwright/test';

test.describe('Todo App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByRole('button', { name: 'Todo App' }).click();
    await expect(
      page.getByRole('heading', { name: 'Todo App with useStorageReducer' })
    ).toBeVisible();
  });

  test('adds a new todo', async ({ page }) => {
    await page.getByPlaceholder('What needs to be done?').fill('Buy groceries');
    await page.getByRole('button', { name: 'Add' }).click();

    await expect(page.locator('.todo-text').filter({ hasText: 'Buy groceries' })).toBeVisible();
    await expect(page.locator('.todo-stats')).toContainText('1 active');
  });

  test('adds todo by pressing Enter', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('Press Enter todo');
    await input.press('Enter');

    await expect(page.locator('.todo-text').filter({ hasText: 'Press Enter todo' })).toBeVisible();
  });

  test('does not add empty todo', async ({ page }) => {
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.locator('.todo-item')).toHaveCount(0);
  });

  test('toggles todo completion', async ({ page }) => {
    await page.getByPlaceholder('What needs to be done?').fill('Task to complete');
    await page.getByRole('button', { name: 'Add' }).click();

    const todoItem = page.locator('.todo-item').filter({ hasText: 'Task to complete' });
    await expect(todoItem).not.toHaveClass(/completed/);
    await expect(page.locator('.todo-stats')).toContainText('1 active');
    await expect(page.locator('.todo-stats')).toContainText('0 completed');

    await todoItem.locator('.checkbox').check();
    await expect(todoItem).toHaveClass(/completed/);
    await expect(page.locator('.todo-stats')).toContainText('0 active');
    await expect(page.locator('.todo-stats')).toContainText('1 completed');
  });

  test('deletes a todo', async ({ page }) => {
    await page.getByPlaceholder('What needs to be done?').fill('Delete me');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.locator('.todo-item')).toHaveCount(1);

    await page.locator('.todo-item').getByRole('button', { name: 'Delete' }).click();
    await expect(page.locator('.todo-item')).toHaveCount(0);
  });

  test('clears completed todos', async ({ page }) => {
    // Add two todos
    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('Todo 1');
    await page.getByRole('button', { name: 'Add' }).click();
    await input.fill('Todo 2');
    await page.getByRole('button', { name: 'Add' }).click();

    // Complete first
    await page.locator('.todo-item').first().locator('.checkbox').check();
    await expect(page.locator('.todo-stats')).toContainText('1 completed');

    await page.getByRole('button', { name: 'Clear Completed' }).click();
    await expect(page.locator('.todo-item')).toHaveCount(1);
    await expect(page.locator('.todo-text')).toHaveText('Todo 2');
  });

  test('todos persist after page reload', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('Persisted todo');
    await page.getByRole('button', { name: 'Add' }).click();

    // Wait for todo to appear in the DOM before reloading (ensures async storage write completes)
    await expect(page.locator('.todo-text').filter({ hasText: 'Persisted todo' })).toBeVisible();

    await page.reload();
    await page.getByRole('button', { name: 'Todo App' }).click();
    await expect(
      page.getByRole('heading', { name: 'Todo App with useStorageReducer' })
    ).toBeVisible();

    await expect(page.locator('.todo-text').filter({ hasText: 'Persisted todo' })).toBeVisible();
    await expect(page.locator('.todo-stats')).toContainText('1 active');
  });

  test('shows correct stats for multiple todos', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('Task A');
    await page.getByRole('button', { name: 'Add' }).click();
    await input.fill('Task B');
    await page.getByRole('button', { name: 'Add' }).click();
    await input.fill('Task C');
    await page.getByRole('button', { name: 'Add' }).click();

    await page.locator('.todo-item').first().locator('.checkbox').check();

    await expect(page.locator('.todo-stats')).toContainText('2 active');
    await expect(page.locator('.todo-stats')).toContainText('1 completed');
    await expect(page.locator('.todo-stats')).toContainText('3 total');
  });
});
