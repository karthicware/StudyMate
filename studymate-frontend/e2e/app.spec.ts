import { test, expect } from '@playwright/test';

test.describe('StudyMate Angular App', () => {
  test('should display app title', async ({ page }) => {
    await page.goto('/');

    // Wait for Angular to load
    await page.waitForLoadState('networkidle');

    // Verify app-root element is visible
    const appRoot = page.locator('app-root');
    await expect(appRoot).toBeVisible();

    // Verify title or main heading exists
    const heading = page.getByRole('heading').first();
    await expect(heading).toBeVisible();
  });

  test('should have no console errors', async ({ page }) => {
    const errors: string[] = [];

    // Listen for console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Assert no errors
    expect(errors).toHaveLength(0);
  });

  test('should have correct page title', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify page title contains expected text
    await expect(page).toHaveTitle(/StudymateFrontend|StudyMate/i);
  });
});
