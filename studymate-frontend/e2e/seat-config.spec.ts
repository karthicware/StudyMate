import { test, expect } from '@playwright/test';

/**
 * E2E tests for Seat Map Configuration (Story 1.2)
 * Tests seat placement, CRUD operations, and shift configuration
 */

test.describe('Seat Map Configuration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to seat map configuration page
    await page.goto('/owner/seat-map-config');

    // Wait for page to be ready
    await page.waitForSelector('h1:has-text("Seat Map Configuration")');
  });

  test('should display seat map configuration page', async ({ page }) => {
    // Verify page title
    await expect(page.locator('h1')).toContainText('Seat Map Configuration');

    // Verify canvas is present
    await expect(page.locator('.seat-canvas')).toBeVisible();

    // Verify action buttons
    await expect(page.locator('button:has-text("Add Seat")')).toBeVisible();
    await expect(page.locator('button:has-text("Save Layout")')).toBeVisible();
  });

  test('should add a new seat', async ({ page }) => {
    // Click Add Seat button
    await page.click('button:has-text("Add Seat")');

    // Verify modal appeared
    await expect(page.locator('.modal-overlay')).toBeVisible();
    await expect(page.locator('h3:has-text("Add New Seat")')).toBeVisible();

    // Enter seat number
    await page.fill('input[placeholder="e.g., A1"]', 'A1');

    // Click Add Seat in modal
    await page.click('.modal-content button:has-text("Add Seat")');

    // Verify modal closed
    await expect(page.locator('.modal-overlay')).not.toBeVisible();

    // Verify seat appears on canvas
    await expect(page.locator('.seat-item:has-text("A1")')).toBeVisible();

    // Verify seat count updated
    await expect(page.locator('text=/Total Seats:.*1/')).toBeVisible();
  });

  test('should not add duplicate seat number', async ({ page }) => {
    // Add first seat
    await page.click('button:has-text("Add Seat")');
    await page.fill('input[placeholder="e.g., A1"]', 'A1');
    await page.click('.modal-content button:has-text("Add Seat")');

    // Try to add duplicate
    await page.click('button:has-text("Add Seat")');
    await page.fill('input[placeholder="e.g., A1"]', 'A1');
    await page.click('.modal-content button:has-text("Add Seat")');

    // Verify error message
    await expect(page.locator('.bg-red-50')).toContainText('Seat number must be unique');
  });

  test('should drag and reposition seat', async ({ page }) => {
    // Add a seat
    await page.click('button:has-text("Add Seat")');
    await page.fill('input[placeholder="e.g., A1"]', 'B1');
    await page.click('.modal-content button:has-text("Add Seat")');

    // Get initial position
    const seat = page.locator('.seat-item:has-text("B1")');
    const initialBox = await seat.boundingBox();
    expect(initialBox).not.toBeNull();

    // Drag seat to new position
    await seat.dragTo(page.locator('.seat-canvas'), {
      targetPosition: { x: 300, y: 300 }
    });

    // Get new position
    const newBox = await seat.boundingBox();
    expect(newBox).not.toBeNull();

    // Verify position changed
    expect(newBox!.x).not.toBe(initialBox!.x);
    expect(newBox!.y).not.toBe(initialBox!.y);
  });

  test('should select and edit seat number', async ({ page }) => {
    // Add a seat
    await page.click('button:has-text("Add Seat")');
    await page.fill('input[placeholder="e.g., A1"]', 'C1');
    await page.click('.modal-content button:has-text("Add Seat")');

    // Click on seat to select
    await page.click('.seat-item:has-text("C1")');

    // Verify seat details panel shows
    await expect(page.locator('.bg-white:has-text("Seat Details")')).toBeVisible();

    // Edit seat number
    const input = page.locator('label:has-text("Seat Number") + input');
    await input.fill('C2');

    // Click Update button
    await page.click('button:has-text("Update")');

    // Verify seat number updated
    await expect(page.locator('.seat-item:has-text("C2")')).toBeVisible();
    await expect(page.locator('.seat-item:has-text("C1")')).not.toBeVisible();
  });

  test('should delete seat', async ({ page }) => {
    // Add a seat
    await page.click('button:has-text("Add Seat")');
    await page.fill('input[placeholder="e.g., A1"]', 'D1');
    await page.click('.modal-content button:has-text("Add Seat")');

    // Select seat
    await page.click('.seat-item:has-text("D1")');

    // Click Delete button (handle confirm dialog)
    page.on('dialog', dialog => dialog.accept());
    await page.click('.bg-white:has-text("Seat Details") button:has-text("Delete")');

    // Verify seat removed
    await expect(page.locator('.seat-item:has-text("D1")')).not.toBeVisible();

    // Verify seat count updated
    await expect(page.locator('text=/Total Seats:.*0/')).toBeVisible();
  });

  test('should save seat configuration', async ({ page }) => {
    // Mock API response
    await page.route('**/owner/seats/config/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Saved',
          seats: [],
          seatCount: 2
        })
      });
    });

    // Add two seats
    await page.click('button:has-text("Add Seat")');
    await page.fill('input[placeholder="e.g., A1"]', 'E1');
    await page.click('.modal-content button:has-text("Add Seat")');

    await page.click('button:has-text("Add Seat")');
    await page.fill('input[placeholder="e.g., A1"]', 'E2');
    await page.click('.modal-content button:has-text("Add Seat")');

    // Click Save Layout
    await page.click('button:has-text("Save Layout")');

    // Verify success message
    await expect(page.locator('.bg-green-50')).toContainText('Configuration saved successfully');
  });

  test('should add shift timing', async ({ page }) => {
    // Click Add button in Shift Timings section
    await page.click('.bg-white:has-text("Shift Timings") button:has-text("+ Add")');

    // Verify modal appeared
    await expect(page.locator('h3:has-text("Add New Shift")')).toBeVisible();

    // Fill shift details
    await page.fill('input[placeholder="e.g., Morning"]', 'Night');
    await page.fill('input[type="time"]').first().fill('22:00');
    await page.fill('input[type="time"]').last().fill('06:00');

    // Click Save Shift
    await page.click('.modal-content button:has-text("Save Shift")');

    // Verify shift appears in list
    await expect(page.locator('.bg-gray-50:has-text("Night")')).toBeVisible();
    await expect(page.locator('text=/22:00.*06:00/')).toBeVisible();
  });

  test('should edit shift timing', async ({ page }) => {
    // Click Edit on first shift (assuming default shifts loaded)
    await page.click('.bg-gray-50 button:has-text("Edit")').first();

    // Verify modal appeared with existing data
    await expect(page.locator('h3:has-text("Edit Shift")')).toBeVisible();

    // Modify shift name
    const nameInput = page.locator('input[placeholder="e.g., Morning"]');
    await nameInput.clear();
    await nameInput.fill('Early Morning');

    // Save
    await page.click('.modal-content button:has-text("Save Shift")');

    // Verify shift updated
    await expect(page.locator('.bg-gray-50:has-text("Early Morning")')).toBeVisible();
  });

  test('should delete shift timing', async ({ page }) => {
    // Handle confirm dialog
    page.on('dialog', dialog => dialog.accept());

    // Click Delete on first shift
    await page.click('.bg-gray-50 button:has-text("Delete")').first();

    // Verify shift count reduced (default is 3, should become 2)
    const shiftItems = page.locator('.bg-gray-50');
    await expect(shiftItems).toHaveCount(2);
  });

  test('should validate overlapping shifts', async ({ page }) => {
    // Add a shift that overlaps with existing Morning shift (06:00-12:00)
    await page.click('.bg-white:has-text("Shift Timings") button:has-text("+ Add")');

    await page.fill('input[placeholder="e.g., Morning"]', 'Overlap Test');
    await page.fill('input[type="time"]').first().fill('10:00');
    await page.fill('input[type="time"]').last().fill('14:00');

    await page.click('.modal-content button:has-text("Save Shift")');

    // Verify error message about overlap
    await expect(page.locator('.bg-red-50')).toContainText('overlap');
  });

  test('should save shift configuration', async ({ page }) => {
    // Mock API response
    await page.route('**/owner/shifts/config/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Shifts saved',
          openingHours: {}
        })
      });
    });

    // Click Save Shifts button
    await page.click('.bg-white:has-text("Shift Timings") button:has-text("Save Shifts")');

    // Verify success message
    await expect(page.locator('.bg-green-50')).toContainText('Configuration saved successfully');
  });

  test('should have zero console errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Perform basic interactions
    await page.click('button:has-text("Add Seat")');
    await page.fill('input[placeholder="e.g., A1"]', 'F1');
    await page.click('.modal-content button:has-text("Add Seat")');

    await page.click('.bg-white:has-text("Shift Timings") button:has-text("+ Add")');
    await page.click('.modal-content button:has-text("Cancel")');

    // Wait for any async operations
    await page.waitForTimeout(1000);

    // Filter out expected errors (e.g., API call failures in test environment)
    const unexpectedErrors = consoleErrors.filter(
      err => !err.includes('Failed to load') && !err.includes('Error loading')
    );

    expect(unexpectedErrors).toEqual([]);
  });
});
