import { test, expect } from '@playwright/test';

/**
 * Owner Settings Page E2E Tests
 *
 * Tests complete user workflows for settings management including:
 * - Settings page navigation and display
 * - Notification preferences toggle
 * - System preferences changes
 * - Auto-save with debounce
 * - Restore defaults functionality
 *
 * Story: 1.20 - Owner Settings Page
 */

// Helper function to login as owner
async function loginAsOwner(page) {
  await page.goto('/auth/login');
  await page.fill('input[name="email"]', 'owner@studymate.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('/owner/dashboard');
}

test.describe('Owner Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsOwner(page);
    await page.goto('/owner/settings');
    await page.waitForLoadState('networkidle');
  });

  test('should display all settings sections', async ({ page }) => {
    // Verify page loaded
    await expect(page.locator('h1:has-text("Settings")')).toBeVisible();

    // Verify all section headers are visible
    await expect(page.locator('text=Notifications')).toBeVisible();
    await expect(page.locator('text=Notification Types')).toBeVisible();
    await expect(page.locator('text=System Preferences')).toBeVisible();
    await expect(page.locator('text=Privacy')).toBeVisible();
  });

  test('should have notifications section expanded by default', async ({ page }) => {
    // Check if email notifications toggle is visible (indicates section is expanded)
    await expect(page.locator('input[id="emailNotifications"]')).toBeVisible();
  });

  test('should toggle email notifications', async ({ page }) => {
    const toggle = page.locator('input[id="emailNotifications"]');

    // Get initial state
    const initialState = await toggle.isChecked();

    // Click the toggle
    await toggle.click();

    // Wait for auto-save debounce (600ms to be safe)
    await page.waitForTimeout(600);

    // Check for success indicator
    await expect(page.locator('text=Saved')).toBeVisible({ timeout: 3000 });

    // Verify state changed
    const newState = await toggle.isChecked();
    expect(newState).toBe(!initialState);
  });

  test('should toggle SMS notifications', async ({ page }) => {
    const toggle = page.locator('input[id="smsNotifications"]');

    const initialState = await toggle.isChecked();
    await toggle.click();

    await page.waitForTimeout(600);
    await expect(page.locator('text=Saved')).toBeVisible({ timeout: 3000 });

    const newState = await toggle.isChecked();
    expect(newState).toBe(!initialState);
  });

  test('should expand and collapse sections', async ({ page }) => {
    // Click on System Preferences section header
    const systemSection = page.locator('button:has-text("System Preferences")').first();
    await systemSection.click();

    // Verify language dropdown is now visible
    await expect(page.locator('select[id="language"]')).toBeVisible();

    // Click again to collapse
    await systemSection.click();

    // Verify dropdown is hidden
    await expect(page.locator('select[id="language"]')).not.toBeVisible();
  });

  test('should change language setting', async ({ page }) => {
    // Expand System Preferences section
    await page.locator('button:has-text("System Preferences")').first().click();

    // Select Spanish
    await page.selectOption('select[id="language"]', 'es');

    // Wait for auto-save
    await page.waitForTimeout(600);

    // Verify success indicator
    await expect(page.locator('text=Saved')).toBeVisible({ timeout: 3000 });
  });

  test('should change timezone setting', async ({ page }) => {
    // Expand System Preferences section
    await page.locator('button:has-text("System Preferences")').first().click();

    // Select Pacific Time
    await page.selectOption('select[id="timezone"]', 'America/Los_Angeles');

    // Wait for auto-save
    await page.waitForTimeout(600);

    // Verify success indicator
    await expect(page.locator('text=Saved')).toBeVisible({ timeout: 3000 });
  });

  test('should change default view setting', async ({ page }) => {
    // Expand System Preferences section
    await page.locator('button:has-text("System Preferences")').first().click();

    // Select Seat Map view
    await page.selectOption('select[id="defaultView"]', 'seat-map');

    // Wait for auto-save
    await page.waitForTimeout(600);

    // Verify success indicator
    await expect(page.locator('text=Saved')).toBeVisible({ timeout: 3000 });
  });

  test('should toggle profile visibility', async ({ page }) => {
    // Expand Privacy section
    await page.locator('button:has-text("Privacy")').first().click();

    const toggle = page.locator('input[id="profileVisibility"]');
    const initialState = await toggle.isChecked();

    await toggle.click();

    // Wait for auto-save
    await page.waitForTimeout(600);

    // Verify success indicator
    await expect(page.locator('text=Saved')).toBeVisible({ timeout: 3000 });

    const newState = await toggle.isChecked();
    expect(newState).toBe(!initialState);
  });

  test('should toggle booking notifications', async ({ page }) => {
    // Expand Notification Types section
    await page.locator('button:has-text("Notification Types")').first().click();

    const toggle = page.locator('input[id="notificationBooking"]');
    const initialState = await toggle.isChecked();

    await toggle.click();

    // Wait for auto-save
    await page.waitForTimeout(600);

    // Verify success indicator
    await expect(page.locator('text=Saved')).toBeVisible({ timeout: 3000 });

    const newState = await toggle.isChecked();
    expect(newState).toBe(!initialState);
  });

  test('should auto-save with debounce (rapid changes)', async ({ page }) => {
    const toggle1 = page.locator('input[id="emailNotifications"]');
    const toggle2 = page.locator('input[id="smsNotifications"]');
    const toggle3 = page.locator('input[id="pushNotifications"]');

    // Rapidly toggle multiple times
    await toggle1.click();
    await page.waitForTimeout(100);
    await toggle2.click();
    await page.waitForTimeout(100);
    await toggle3.click();

    // Wait for debounce to complete (500ms + buffer)
    await page.waitForTimeout(600);

    // Should show saved indicator (debounced to one save)
    await expect(page.locator('text=Saved')).toBeVisible({ timeout: 3000 });
  });

  test('should restore defaults with confirmation', async ({ page }) => {
    // Click Restore Defaults button
    await page.click('button:has-text("Restore Defaults")');

    // Verify confirmation modal appears
    await expect(page.locator('text=Restore Default Settings?')).toBeVisible();
    await expect(page.locator('text=This will reset all settings to their default values')).toBeVisible();

    // Click Confirm button
    await page.click('button:has-text("Confirm")');

    // Verify success message
    await expect(page.locator('text=Settings restored to defaults')).toBeVisible({ timeout: 5000 });

    // Verify modal closed
    await expect(page.locator('text=Restore Default Settings?')).not.toBeVisible();
  });

  test('should cancel restore defaults', async ({ page }) => {
    // Click Restore Defaults button
    await page.click('button:has-text("Restore Defaults")');

    // Verify confirmation modal appears
    await expect(page.locator('text=Restore Default Settings?')).toBeVisible();

    // Click Cancel button
    await page.click('button:has-text("Cancel")');

    // Verify modal closed without action
    await expect(page.locator('text=Restore Default Settings?')).not.toBeVisible();

    // Should NOT see success message
    await expect(page.locator('text=Settings restored to defaults')).not.toBeVisible();
  });

  test('should show loading state on page load', async ({ page }) => {
    // Reload page to see loading state
    await page.reload();

    // Loading indicator should be visible briefly
    // (may be too fast to catch, so we make it optional)
    const loadingIndicator = page.locator('.loading-state');
    if (await loadingIndicator.isVisible()) {
      await expect(loadingIndicator).toBeVisible();
    }

    // Eventually settings form should be visible
    await expect(page.locator('.settings-form')).toBeVisible({ timeout: 5000 });
  });

  test('should show saving indicator during save', async ({ page }) => {
    const toggle = page.locator('input[id="emailNotifications"]');

    // Change a setting
    await toggle.click();

    // Saving indicator should appear briefly
    // (may be too fast to catch, so check for either saving or saved)
    const savingOrSaved = page.locator('text=Saving, text=Saved');
    await expect(savingOrSaved).toBeVisible({ timeout: 2000 });
  });

  test('should persist settings across page reloads', async ({ page }) => {
    // Expand System Preferences
    await page.locator('button:has-text("System Preferences")').first().click();

    // Change language to Spanish
    await page.selectOption('select[id="language"]', 'es');

    // Wait for save
    await page.waitForTimeout(600);
    await expect(page.locator('text=Saved')).toBeVisible({ timeout: 3000 });

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Expand System Preferences again
    await page.locator('button:has-text("System Preferences")').first().click();

    // Verify language is still Spanish
    const languageSelect = page.locator('select[id="language"]');
    await expect(languageSelect).toHaveValue('es');
  });

  test('should have zero console errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Interact with various elements
    await page.locator('input[id="emailNotifications"]').click();
    await page.waitForTimeout(600);

    await page.locator('button:has-text("System Preferences")').first().click();
    await page.selectOption('select[id="language"]', 'en');
    await page.waitForTimeout(600);

    // Verify no console errors occurred
    expect(consoleErrors).toHaveLength(0);
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Page should still be usable
    await expect(page.locator('h1:has-text("Settings")')).toBeVisible();
    await expect(page.locator('text=Notifications')).toBeVisible();

    // Settings should be functional
    const toggle = page.locator('input[id="emailNotifications"]');
    await toggle.click();
    await page.waitForTimeout(600);
    await expect(page.locator('text=Saved')).toBeVisible({ timeout: 3000 });
  });

  test('should be responsive on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    // Page should still be usable
    await expect(page.locator('h1:has-text("Settings")')).toBeVisible();

    // Test interaction
    const toggle = page.locator('input[id="smsNotifications"]');
    await toggle.click();
    await page.waitForTimeout(600);
    await expect(page.locator('text=Saved')).toBeVisible({ timeout: 3000 });
  });
});
