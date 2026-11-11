import { test, expect } from '@playwright/test';

test('homepage has correct title and content', async ({ page }) => {
  await page.goto('/');

  // Check for the main heading
  await expect(page.getByText('DARMASABA', { exact: true })).toBeVisible();
});
