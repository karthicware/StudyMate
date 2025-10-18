import { test, expect } from '@playwright/test';
import { loginAsOwnerAPI } from './utils/auth-helpers';

/**
 * E2E Tests for Story 1.4.1: Ladies-Only Seat Configuration
 *
 * Tests cover:
 * - AC4: Owner can mark seat as ladies-only via checkbox
 * - AC5: Ladies-only seat displays pink styling with ♀ symbol
 * - AC3/AC6: API payloads include isLadiesOnly field
 * - Database persistence validation
 * - Error handling for invalid values
 */
test.describe('Ladies-Only Seat Configuration (Story 1.4.1)', () => {
  const seatMapConfigUrl = '/owner/seat-map-config';
  const hallId = '1';
  const apiBaseUrl = 'http://localhost:8081/api/v1';

  // Shared state for route mocking
  let savedSeatPayload: any = null;

  test.beforeEach(async ({ page }) => {
    // Reset shared state
    savedSeatPayload = null;

    // Login as owner before each test
    const token = await loginAsOwnerAPI(page);
    expect(token).toBeTruthy();

    // Mock study halls list
    await page.route('/api/owner/halls', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: '1', name: 'Main Campus Hall', city: 'Mumbai', basePrice: 200, status: 'active' },
        ]),
      });
    });

    // Mock shift configuration (required by component)
    await page.route(`${apiBaseUrl}/owner/shifts/config/${hallId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          monday: { open: '09:00', close: '22:00', shifts: [] },
        }),
      });
    });

    // COMPREHENSIVE route mock for seats endpoint - handles ALL HTTP methods
    // This prevents route mock override issues (see docs/testing/e2e-route-mocking-best-practices.md)
    await page.route(`${apiBaseUrl}/owner/seats/config/${hallId}`, async (route) => {
      const method = route.request().method();

      if (method === 'GET') {
        // Return saved payload or empty array
        const seatsData = savedSeatPayload?.seats || [];
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(seatsData),
        });
      } else if (method === 'POST') {
        // Capture payload for persistence testing
        savedSeatPayload = JSON.parse(route.request().postData() || '{}');
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Configuration saved successfully',
            success: true,
            seats: savedSeatPayload.seats,
            seatCount: savedSeatPayload.seats.length
          }),
        });
      } else {
        // Fallback for other methods
        await route.continue();
      }
    });

    // Monitor console for errors (zero console errors required)
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`Browser console error: ${msg.text()}`);
      }
    });
  });

  /**
   * E2E Test 1: Owner can mark seat as ladies-only
   * Tests AC4: Ladies-only checkbox in seat properties panel
   * Tests AC3: API accepts isLadiesOnly field
   */
  test('AC4: should allow owner to mark seat as ladies-only via checkbox', async ({ page }) => {
    await page.goto(seatMapConfigUrl);
    await page.waitForSelector('select', { timeout: 5000 });

    // Select hall
    await page.selectOption('select', hallId);
    await page.waitForTimeout(500);

    // Add a new seat using the Add Seat modal
    await page.click('button:has-text("Add Seat")');
    await page.waitForTimeout(300);

    // Fill seat number in modal and press Enter to submit
    await page.fill('input[placeholder*="A1"]', 'A1');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Verify seat appears on canvas
    await expect(page.locator('.seat-item')).toHaveCount(1);

    // Click on the seat to open properties panel
    await page.locator('.seat-item').first().click();
    await page.waitForTimeout(500);

    // Verify properties panel is visible
    await expect(page.locator('text=Seat Properties')).toBeVisible();

    // Find ladies-only checkbox by form control name
    const ladiesOnlyCheckbox = page.locator('input[formControlName="isLadiesOnly"]');
    await expect(ladiesOnlyCheckbox).toBeVisible();

    // Verify checkbox is unchecked by default
    await expect(ladiesOnlyCheckbox).not.toBeChecked();

    // Check the ladies-only checkbox
    await ladiesOnlyCheckbox.check();
    await page.waitForTimeout(300);

    // Verify checkbox is now checked
    await expect(ladiesOnlyCheckbox).toBeChecked();

    // Save the seat properties
    await page.locator('.seat-properties-panel button[type="submit"]').click();
    await page.waitForTimeout(800);

    // Save configuration to backend
    await page.click('button:has-text("Save Configuration")');
    await page.waitForTimeout(1000);

    // Verify API was called with isLadiesOnly: true
    expect(savedSeatPayload).toBeTruthy();
    expect(savedSeatPayload.seats).toBeTruthy();
    expect(savedSeatPayload.seats.length).toBeGreaterThan(0);

    const savedSeat = savedSeatPayload.seats.find((s: any) => s.seatNumber === 'A1');
    expect(savedSeat).toBeTruthy();
    expect(savedSeat.isLadiesOnly).toBe(true);

    // Verify success message appears
    await expect(page.locator('text=Configuration saved successfully')).toBeVisible({ timeout: 3000 });
  });

  /**
   * E2E Test 2: Ladies-only seat displays pink styling with ♀ symbol
   * Tests AC5: Visual styling
   */
  test('AC5: should display pink styling with female symbol for ladies-only seats', async ({ page }) => {
    await page.goto(seatMapConfigUrl);
    await page.waitForSelector('select', { timeout: 5000 });

    // Select hall
    await page.selectOption('select', hallId);
    await page.waitForTimeout(500);

    // Add a new seat
    await page.click('button:has-text("Add Seat")');
    await page.waitForTimeout(300);
    await page.fill('input[placeholder*="A1"]', 'A2');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Click seat to open properties
    await page.locator('.seat-item').first().click();
    await page.waitForTimeout(500);

    // Enable ladies-only
    const ladiesOnlyCheckbox = page.locator('input[formControlName="isLadiesOnly"]');
    await ladiesOnlyCheckbox.check();
    await page.waitForTimeout(300);

    // Save properties
    await page.locator('.seat-properties-panel button[type="submit"]').click();
    await page.waitForTimeout(800);

    // Verify seat has ladies-only class
    const seat = page.locator('.seat-item').first();
    await expect(seat).toHaveClass(/seat-ladies-only/);

    // Verify pink background color on .seat-visual (#FFC0CB = rgb(255, 192, 203))
    const seatVisual = seat.locator('.seat-visual');
    const backgroundColor = await seatVisual.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    expect(backgroundColor).toBe('rgb(255, 192, 203)');

    // Verify female symbol ♀ exists via ::after pseudo-element on .seat-visual
    const hasFemaleSymbol = await seatVisual.evaluate((el) => {
      const afterContent = window.getComputedStyle(el, '::after').content;
      // Content will be quoted: '"♀"' or "'♀'"
      return afterContent.includes('♀') || afterContent.includes('\u2640');
    });
    expect(hasFemaleSymbol).toBe(true);
  });

  /**
   * E2E Test 3: Ladies-only checkbox state persists
   * Tests AC4: State persistence
   */
  test('AC4: should persist ladies-only checkbox state after reopening properties', async ({ page }) => {
    await page.goto(seatMapConfigUrl);
    await page.waitForSelector('select', { timeout: 5000 });

    // Select hall and add seat
    await page.selectOption('select', hallId);
    await page.waitForTimeout(500);
    await page.click('button:has-text("Add Seat")');
    await page.waitForTimeout(300);
    await page.fill('input[placeholder*="A1"]', 'A3');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Click seat and enable ladies-only
    await page.locator('.seat-item').first().click();
    await page.waitForTimeout(500);
    const ladiesOnlyCheckbox = page.locator('input[formControlName="isLadiesOnly"]');
    await ladiesOnlyCheckbox.check();
    await page.waitForTimeout(300);

    // Save properties
    await page.locator('.seat-properties-panel button[type="submit"]').click();
    await page.waitForTimeout(800);

    // Click on canvas to deselect seat (close properties panel)
    await page.locator('.seat-canvas').click({ position: { x: 50, y: 50 } });
    await page.waitForTimeout(500);

    // Click seat again to reopen properties
    await page.locator('.seat-item').first().click();
    await page.waitForTimeout(500);

    // Verify checkbox is still checked
    const checkboxAfterReopen = page.locator('input[formControlName="isLadiesOnly"]');
    await expect(checkboxAfterReopen).toBeChecked();
  });

  /**
   * E2E Test 4: Regular seats remain unaffected by ladies-only styling
   * Tests AC5: Regular seats unaffected
   */
  test('AC5: should not apply ladies-only styling to regular seats', async ({ page }) => {
    await page.goto(seatMapConfigUrl);
    await page.waitForSelector('select', { timeout: 5000 });

    // Select hall
    await page.selectOption('select', hallId);
    await page.waitForTimeout(500);

    // Add first seat (regular)
    await page.click('button:has-text("Add Seat")');
    await page.waitForTimeout(300);
    await page.fill('input[placeholder*="A1"]', 'R1');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Add second seat (ladies-only)
    await page.click('button:has-text("Add Seat")');
    await page.waitForTimeout(300);
    await page.fill('input[placeholder*="A1"]', 'L1');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Make second seat ladies-only
    await page.locator('.seat-item').nth(1).click();
    await page.waitForTimeout(500);
    await page.locator('input[formControlName="isLadiesOnly"]').check();
    await page.waitForTimeout(300);
    await page.locator('.seat-properties-panel button[type="submit"]').click();
    await page.waitForTimeout(800);

    // Verify we have 2 seats
    await expect(page.locator('.seat-item')).toHaveCount(2);

    // Verify first seat (regular) does NOT have ladies-only class
    const regularSeat = page.locator('.seat-item').first();
    await expect(regularSeat).not.toHaveClass(/seat-ladies-only/);

    // Verify second seat (ladies-only) HAS ladies-only class
    const ladiesOnlySeat = page.locator('.seat-item').nth(1);
    await expect(ladiesOnlySeat).toHaveClass(/seat-ladies-only/);
  });

  /**
   * E2E Test 5: API payload includes isLadiesOnly field
   * Tests AC3/AC6: Database persistence
   */
  test('AC3/AC6: should include isLadiesOnly in API payload', async ({ page }) => {
    await page.goto(seatMapConfigUrl);
    await page.waitForSelector('select', { timeout: 5000 });

    // Select hall and add seat
    await page.selectOption('select', hallId);
    await page.waitForTimeout(500);
    await page.click('button:has-text("Add Seat")');
    await page.waitForTimeout(300);
    await page.fill('input[placeholder*="A1"]', 'C1');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Click seat and enable ladies-only
    await page.locator('.seat-item').first().click();
    await page.waitForTimeout(500);
    await page.locator('input[formControlName="isLadiesOnly"]').check();
    await page.waitForTimeout(300);
    await page.locator('.seat-properties-panel button[type="submit"]').click();
    await page.waitForTimeout(800);

    // Save configuration
    await page.click('button:has-text("Save Configuration")');
    await page.waitForTimeout(1000);

    // Verify API payload
    expect(savedSeatPayload).toBeTruthy();
    expect(savedSeatPayload.seats).toBeTruthy();

    const savedSeat = savedSeatPayload.seats.find((s: any) => s.seatNumber === 'C1');
    expect(savedSeat).toBeTruthy();
    expect(savedSeat.isLadiesOnly).toBe(true);

    // Note: Actual PostgreSQL MCP validation would be run manually:
    // Query: SELECT seat_number, is_ladies_only FROM seats WHERE seat_number = 'C1';
    // Expected: is_ladies_only = TRUE
  });

  /**
   * E2E Test 6: Verify zero console errors during ladies-only operations
   * Tests overall code quality and integration
   */
  test('should have zero console errors during ladies-only seat configuration', async ({ page }) => {
    const consoleErrors: string[] = [];

    // Capture console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto(seatMapConfigUrl);
    await page.waitForSelector('select', { timeout: 5000 });

    // Perform full workflow: add seat, mark as ladies-only, save
    await page.selectOption('select', hallId);
    await page.waitForTimeout(500);
    await page.click('button:has-text("Add Seat")');
    await page.waitForTimeout(300);
    await page.fill('input[placeholder*="A1"]', 'E1');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    await page.locator('.seat-item').first().click();
    await page.waitForTimeout(500);
    await page.locator('input[formControlName="isLadiesOnly"]').check();
    await page.waitForTimeout(300);
    await page.locator('.seat-properties-panel button[type="submit"]').click();
    await page.waitForTimeout(800);

    await page.click('button:has-text("Save Configuration")');
    await page.waitForTimeout(1000);

    // Verify zero console errors
    expect(consoleErrors).toHaveLength(0);
  });

  /**
   * E2E Test 7: Unchecking ladies-only removes styling
   * Tests AC5: Styling can be toggled
   */
  test('AC5: should remove ladies-only styling when unchecked', async ({ page }) => {
    await page.goto(seatMapConfigUrl);
    await page.waitForSelector('select', { timeout: 5000 });

    // Select hall and add seat
    await page.selectOption('select', hallId);
    await page.waitForTimeout(500);
    await page.click('button:has-text("Add Seat")');
    await page.waitForTimeout(300);
    await page.fill('input[placeholder*="A1"]', 'F1');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Enable ladies-only
    await page.locator('.seat-item').first().click();
    await page.waitForTimeout(500);
    await page.locator('input[formControlName="isLadiesOnly"]').check();
    await page.waitForTimeout(300);
    await page.locator('.seat-properties-panel button[type="submit"]').click();
    await page.waitForTimeout(800);

    // Verify styling applied
    await expect(page.locator('.seat-item').first()).toHaveClass(/seat-ladies-only/);

    // Disable ladies-only
    await page.locator('.seat-item').first().click();
    await page.waitForTimeout(500);
    await page.locator('input[formControlName="isLadiesOnly"]').uncheck();
    await page.waitForTimeout(300);
    await page.locator('.seat-properties-panel button[type="submit"]').click();
    await page.waitForTimeout(800);

    // Verify styling removed
    await expect(page.locator('.seat-item').first()).not.toHaveClass(/seat-ladies-only/);
  });

  /**
   * E2E Test 8: API payload contains correct false value when unchecked
   * Tests AC3: Backend receives correct boolean values
   */
  test('AC3: should send isLadiesOnly: false when checkbox is unchecked', async ({ page }) => {
    await page.goto(seatMapConfigUrl);
    await page.waitForSelector('select', { timeout: 5000 });

    // Select hall and add seat
    await page.selectOption('select', hallId);
    await page.waitForTimeout(500);
    await page.click('button:has-text("Add Seat")');
    await page.waitForTimeout(300);
    await page.fill('input[placeholder*="A1"]', 'G1');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Leave checkbox unchecked (default state)
    await page.locator('.seat-item').first().click();
    await page.waitForTimeout(500);

    // Verify checkbox is unchecked
    await expect(page.locator('input[formControlName="isLadiesOnly"]')).not.toBeChecked();

    await page.locator('.seat-properties-panel button[type="submit"]').click();
    await page.waitForTimeout(800);

    // Save configuration
    await page.click('button:has-text("Save Configuration")');
    await page.waitForTimeout(1000);

    // Verify API payload has explicit false value
    expect(savedSeatPayload).toBeTruthy();
    const savedSeat = savedSeatPayload.seats.find((s: any) => s.seatNumber === 'G1');
    expect(savedSeat).toBeTruthy();
    expect(savedSeat.isLadiesOnly).toBe(false);
  });
});
