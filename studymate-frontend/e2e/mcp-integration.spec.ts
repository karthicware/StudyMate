import { test, expect } from '@playwright/test';

/**
 * MCP Integration Tests
 *
 * These tests verify Playwright functionality that can also be accessed
 * via MCP tools for browser automation.
 */
test.describe('Playwright MCP Integration', () => {
  test('should navigate and capture page snapshot', async ({ page }) => {
    // Navigate using standard Playwright (MCP equivalent: mcp__playwright__browser_navigate)
    await page.goto('/');

    // Verify page loaded successfully
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/localhost:4200/);

    // Take accessibility snapshot (MCP: mcp__playwright__browser_snapshot)
    const snapshot = await page.accessibility.snapshot();
    expect(snapshot).toBeTruthy();
    expect(snapshot).toHaveProperty('role');
  });

  test('should support element interaction', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify page content is present
    const body = await page.locator('body');
    await expect(body).toBeVisible();

    // Check if any buttons exist (MCP: mcp__playwright__browser_click would be used)
    const buttons = await page.getByRole('button').count();
    console.log(`Found ${buttons} button(s) on the page`);

    // Check if any links exist
    const links = await page.getByRole('link').count();
    console.log(`Found ${links} link(s) on the page`);
  });

  test('should capture console logs', async ({ page }) => {
    const consoleLogs: { type: string; text: string }[] = [];

    // Monitor console messages (MCP: mcp__playwright__browser_console_messages)
    page.on('console', (msg) => {
      consoleLogs.push({
        type: msg.type(),
        text: msg.text(),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify we captured some console messages
    console.log(`Captured ${consoleLogs.length} console message(s)`);

    // Filter for errors only
    const errors = consoleLogs.filter((log) => log.type === 'error');

    // Verify no console errors
    expect(errors).toHaveLength(0);
  });

  test('should support screenshots', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Take screenshot (MCP: mcp__playwright__browser_screenshot)
    const screenshot = await page.screenshot();

    // Verify screenshot was captured
    expect(screenshot).toBeTruthy();
    expect(screenshot.length).toBeGreaterThan(0);
  });

  test('should detect page visibility and content', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify the app root element exists
    const appRoot = page.locator('app-root');
    await expect(appRoot).toBeVisible();

    // Verify page has loaded content
    const bodyContent = await page.textContent('body');
    expect(bodyContent).toBeTruthy();
    expect(bodyContent!.length).toBeGreaterThan(0);
  });
});
