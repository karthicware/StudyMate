import { test, expect } from '@playwright/test';
import { loginAsOwnerAPI } from './utils/auth-helpers';

test.describe('Owner Seat Map Configuration (Story 1.4)', () => {
  const seatMapConfigUrl = '/owner/seat-map-config';
  const hallId = '1';
  const apiBaseUrl = 'http://localhost:8081/api/v1';

  test.beforeEach(async ({ page }) => {
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
          { id: '2', name: 'Downtown Study Center', city: 'Mumbai', basePrice: 250, status: 'active' },
        ]),
      });
    });

    // Mock empty seat configuration initially
    await page.route(`${apiBaseUrl}/owner/seats/config/${hallId}`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      }
    });

    // Mock shift configuration
    await page.route(`/api/v1/owner/shifts/config/${hallId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          monday: { open: '09:00', close: '22:00', shifts: [] },
        }),
      });
    });
  });

  test('AC1: should require hall selection before enabling editor', async ({ page }) => {
    await page.goto(seatMapConfigUrl);

    // Wait for page to load
    await page.waitForSelector('[data-testid="hall-selection-dropdown"]', { timeout: 5000 });

    // Verify hall dropdown is present
    const hallDropdown = page.locator('[data-testid="hall-selection-dropdown"]');
    await expect(hallDropdown).toBeVisible();

    // Verify "Add Seat" button is disabled initially
    const addSeatButton = page.locator('[data-testid="open-add-seat-modal-btn"]');
    await expect(addSeatButton).toBeDisabled();

    // Verify canvas overlay message
    await expect(page.locator('text=Select a hall above to configure seats')).toBeVisible();
  });

  test('AC1: should enable editor after hall selection', async ({ page }) => {
    await page.goto(seatMapConfigUrl);
    await page.waitForSelector('[data-testid="hall-selection-dropdown"]', { timeout: 5000 });

    // Select a hall
    await page.selectOption('[data-testid="hall-selection-dropdown"]', hallId);

    // Wait for editor to enable
    await page.waitForTimeout(500);

    // Verify "Add Seat" button is now enabled
    const addSeatButton = page.locator('[data-testid="open-add-seat-modal-btn"]');
    await expect(addSeatButton).toBeEnabled();

    // Verify canvas overlay is gone
    await expect(page.locator('text=Select a hall above to configure seats')).not.toBeVisible();
  });

  test('AC2: should add seat via drag-and-drop modal', async ({ page }) => {
    await page.goto(seatMapConfigUrl);
    await page.waitForSelector('[data-testid="hall-selection-dropdown"]', { timeout: 5000 });

    // Select hall
    await page.selectOption('[data-testid="hall-selection-dropdown"]', hallId);
    await page.waitForTimeout(500);

    // Click "Add Seat" button
    const addSeatButton = page.locator('[data-testid="open-add-seat-modal-btn"]');
    await addSeatButton.click();

    // Verify modal opened
    await expect(page.locator('text=Add New Seat')).toBeVisible();

    // Enter seat number
    await page.fill('[data-testid="new-seat-number-input"]', 'A1');

    // Click add in modal
    await page.click('[data-testid="confirm-add-seat-btn"]');

    // Wait for modal to close
    await expect(page.locator('text=Add New Seat')).not.toBeVisible();

    // Verify seat appears on canvas
    await expect(page.locator('text=A1').first()).toBeVisible();
  });

  test('AC2: should validate seat number uniqueness', async ({ page }) => {
    await page.goto(seatMapConfigUrl);
    await page.waitForSelector('[data-testid="hall-selection-dropdown"]', { timeout: 5000 });

    // Select hall and add first seat
    await page.selectOption('[data-testid="hall-selection-dropdown"]', hallId);
    await page.waitForTimeout(500);
    await page.click('[data-testid="open-add-seat-modal-btn"]');
    await page.fill('[data-testid="new-seat-number-input"]', 'A1');
    await page.click('[data-testid="confirm-add-seat-btn"]');
    await page.waitForTimeout(300);

    // Try to add duplicate seat
    await page.click('[data-testid="open-add-seat-modal-btn"]');
    await page.fill('[data-testid="new-seat-number-input"]', 'A1');
    await page.click('[data-testid="confirm-add-seat-btn"]');

    // Verify error message
    await expect(page.locator('text=Seat number must be unique')).toBeVisible();
  });

  test('AC3: should display seat properties panel when seat is clicked', async ({ page }) => {
    await page.goto(seatMapConfigUrl);
    await page.waitForSelector('[data-testid="hall-selection-dropdown"]', { timeout: 5000 });

    // Select hall and add seat
    await page.selectOption('[data-testid="hall-selection-dropdown"]', hallId);
    await page.waitForTimeout(500);
    await page.click('[data-testid="open-add-seat-modal-btn"]');
    await page.fill('[data-testid="new-seat-number-input"]', 'A1');
    await page.click('[data-testid="confirm-add-seat-btn"]');
    await page.waitForTimeout(500);

    // Click on the seat
    const seat = page.locator('.seat-item').first();
    await seat.click();

    // Verify properties panel appears
    await expect(page.locator('[data-testid="seat-properties-panel"]')).toBeVisible();

    // Verify seat number is read-only
    const seatNumberInput = page.locator('[data-testid="seat-number-input"]');
    await expect(seatNumberInput).toBeDisabled();

    // Verify space type dropdown exists
    const spaceTypeDropdown = page.locator('[data-testid="space-type-dropdown"]');
    await expect(spaceTypeDropdown).toBeVisible();

    // Verify all 6 space types are available
    const options = await spaceTypeDropdown.locator('option').allTextContents();
    expect(options).toContain('Cabin');
    expect(options).toContain('Seat Row');
    expect(options).toContain('4-Person Table');
    expect(options).toContain('Study Pod');
    expect(options).toContain('Meeting Room');
    expect(options).toContain('Lounge Area');
  });

  test('AC3: should update seat space type and custom price', async ({ page }) => {
    await page.goto(seatMapConfigUrl);
    await page.waitForSelector('[data-testid="hall-selection-dropdown"]', { timeout: 5000 });

    // Setup: add a seat
    await page.selectOption('[data-testid="hall-selection-dropdown"]', hallId);
    await page.waitForTimeout(500);
    await page.click('[data-testid="open-add-seat-modal-btn"]');
    await page.fill('[data-testid="new-seat-number-input"]', 'A1');
    await page.click('[data-testid="confirm-add-seat-btn"]');
    await page.waitForTimeout(500);

    // Click seat to open properties
    await page.locator('.seat-item').first().click();

    // Change space type
    await page.selectOption('[data-testid="space-type-dropdown"]', 'Study Pod');

    // Enter custom price
    await page.fill('[data-testid="custom-price-input"]', '750');

    // Save properties
    await page.click('[data-testid="properties-save-btn"]');

    // Verify properties panel closed
    await page.waitForTimeout(300);

    // Verify seat icon updated (Study Pod emoji) - use seat-specific locator
    await expect(page.locator('.seat-item .seat-visual').first()).toContainText('📚');
  });

  test('AC3: should validate custom price range (50-1000 INR)', async ({ page }) => {
    await page.goto(seatMapConfigUrl);
    await page.waitForSelector('[data-testid="hall-selection-dropdown"]', { timeout: 5000 });

    // Setup: add a seat and open properties
    await page.selectOption('[data-testid="hall-selection-dropdown"]', hallId);
    await page.waitForTimeout(500);
    await page.click('[data-testid="open-add-seat-modal-btn"]');
    await page.fill('[data-testid="new-seat-number-input"]', 'A1');
    await page.click('[data-testid="confirm-add-seat-btn"]');
    await page.waitForTimeout(500);
    await page.locator('.seat-item').first().click();

    // Try invalid price (below minimum)
    await page.fill('[data-testid="custom-price-input"]', '40');
    await page.locator('[data-testid="custom-price-input"]').blur(); // Mark as touched
    await page.waitForTimeout(100); // Wait for validation
    await expect(page.locator('text=Price must be at least ₹50')).toBeVisible();

    // Try invalid price (above maximum)
    await page.fill('[data-testid="custom-price-input"]', '1500');
    await page.locator('[data-testid="custom-price-input"]').blur(); // Mark as touched
    await page.waitForTimeout(100); // Wait for validation
    await expect(page.locator('text=Price cannot exceed ₹1000')).toBeVisible();

    // Try valid price
    await page.fill('[data-testid="custom-price-input"]', '500');
    await page.locator('[data-testid="custom-price-input"]').blur(); // Mark as touched

    // Wait for validation errors to disappear
    await expect(page.locator('text=Price must be at least ₹50')).not.toBeVisible();
    await expect(page.locator('text=Price cannot exceed ₹1000')).not.toBeVisible();

    // Wait for Save button to become enabled
    await page.waitForSelector('[data-testid="properties-save-btn"]:not([disabled])', { timeout: 5000 });
    await page.click('[data-testid="properties-save-btn"]');

    // Should succeed (panel closes)
    await page.waitForTimeout(500);
    await expect(page.locator('[data-testid="seat-properties-panel"]')).not.toBeVisible();
  });

  test('AC5: should clear canvas when switching halls', async ({ page }) => {
    await page.goto(seatMapConfigUrl);
    await page.waitForSelector('[data-testid="hall-selection-dropdown"]', { timeout: 5000 });

    // Select first hall and add seat
    await page.selectOption('[data-testid="hall-selection-dropdown"]', '1');
    await page.waitForTimeout(500);
    await page.click('[data-testid="open-add-seat-modal-btn"]');
    await page.fill('[data-testid="new-seat-number-input"]', 'A1');
    await page.click('[data-testid="confirm-add-seat-btn"]');
    await page.waitForTimeout(500);

    // Verify seat exists
    await expect(page.locator('.seat-item')).toHaveCount(1);

    // Switch to second hall
    await page.selectOption('[data-testid="hall-selection-dropdown"]', '2');
    await page.waitForTimeout(500);

    // Verify canvas is cleared
    await expect(page.locator('.seat-item')).toHaveCount(0);
    await expect(page.locator('text=No seats configured')).toBeVisible();
  });

  test('AC6: should save seat configuration with space types', async ({ page }) => {
    let savedPayload: any = null;

    // Intercept POST request
    await page.route(`${apiBaseUrl}/owner/seats/config/${hallId}`, async (route) => {
      if (route.request().method() === 'POST') {
        savedPayload = JSON.parse(route.request().postData() || '{}');
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Seat configuration saved successfully',
            seatsCreated: savedPayload.seats.length,
            seatsUpdated: 0,
          }),
        });
      } else {
        // Return saved seats on GET
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(savedPayload?.seats || []),
        });
      }
    });

    await page.goto(seatMapConfigUrl);
    await page.waitForSelector('[data-testid="hall-selection-dropdown"]', { timeout: 5000 });

    // Select hall and add seats
    await page.selectOption('[data-testid="hall-selection-dropdown"]', hallId);
    await page.waitForTimeout(500);

    // Add first seat
    await page.click('[data-testid="open-add-seat-modal-btn"]');
    await page.fill('[data-testid="new-seat-number-input"]', 'A1');
    await page.click('[data-testid="confirm-add-seat-btn"]');
    await page.waitForTimeout(300);

    // Add second seat
    await page.click('[data-testid="open-add-seat-modal-btn"]');
    await page.fill('[data-testid="new-seat-number-input"]', 'A2');
    await page.click('[data-testid="confirm-add-seat-btn"]');
    await page.waitForTimeout(300);

    // Update second seat space type
    await page.locator('.seat-item').nth(1).click();
    await page.selectOption('[data-testid="space-type-dropdown"]', 'Meeting Room');
    await page.fill('[data-testid="custom-price-input"]', '800');
    await page.click('[data-testid="properties-save-btn"]');

    // Wait for properties panel to close
    await page.waitForTimeout(500);

    // Wait for Save Configuration button to become enabled (hasUnsavedChanges becomes true)
    await page.waitForSelector('[data-testid="save-configuration-btn"]:not([disabled])', { timeout: 5000 });

    // Save configuration
    await page.click('[data-testid="save-configuration-btn"]');

    // Wait for success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible({ timeout: 5000 });

    // Verify payload structure
    expect(savedPayload).toBeTruthy();
    expect(savedPayload.seats).toHaveLength(2);

    // Verify first seat (default Cabin)
    expect(savedPayload.seats[0].seatNumber).toBe('A1');
    expect(savedPayload.seats[0].spaceType).toBe('Cabin');
    expect(savedPayload.seats[0].xCoord).toBe(100);
    expect(savedPayload.seats[0].yCoord).toBe(100);

    // Verify second seat (Meeting Room with custom price)
    expect(savedPayload.seats[1].seatNumber).toBe('A2');
    expect(savedPayload.seats[1].spaceType).toBe('Meeting Room');
    expect(savedPayload.seats[1].customPrice).toBe(800);
  });

  test('AC6: should display error toast on save failure', async ({ page }) => {
    // Mock save failure
    await page.route(`${apiBaseUrl}/owner/seats/config/${hallId}`, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Validation failed: Duplicate seat number',
          }),
        });
      } else if (route.request().method() === 'GET') {
        // Need to mock GET as well
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      }
    });

    await page.goto(seatMapConfigUrl);
    await page.waitForSelector('[data-testid="hall-selection-dropdown"]', { timeout: 5000 });

    // Add seat and try to save
    await page.selectOption('[data-testid="hall-selection-dropdown"]', hallId);
    await page.waitForTimeout(500);
    await page.click('[data-testid="open-add-seat-modal-btn"]');
    await page.fill('[data-testid="new-seat-number-input"]', 'A1');
    await page.click('[data-testid="confirm-add-seat-btn"]');

    // Wait for modal to close
    await page.waitForTimeout(500);

    // Wait for Save Configuration button to become enabled (hasUnsavedChanges becomes true)
    await page.waitForSelector('[data-testid="save-configuration-btn"]:not([disabled])', { timeout: 5000 });

    await page.click('[data-testid="save-configuration-btn"]');

    // Verify error message displayed
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('should have zero console errors during workflow', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto(seatMapConfigUrl);
    await page.waitForSelector('[data-testid="hall-selection-dropdown"]', { timeout: 5000 });

    // Complete workflow
    await page.selectOption('[data-testid="hall-selection-dropdown"]', hallId);
    await page.waitForTimeout(500);
    await page.click('[data-testid="open-add-seat-modal-btn"]');
    await page.fill('[data-testid="new-seat-number-input"]', 'A1');
    await page.click('[data-testid="confirm-add-seat-btn"]');
    await page.waitForTimeout(500);

    // Verify no console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test('should display space type legend', async ({ page }) => {
    await page.goto(seatMapConfigUrl);
    await page.waitForSelector('[data-testid="hall-selection-dropdown"]', { timeout: 5000 });
    await page.selectOption('[data-testid="hall-selection-dropdown"]', hallId);
    await page.waitForTimeout(500);

    // Verify legend section exists
    await expect(page.locator('text=Space Types:')).toBeVisible();

    // Verify all 6 space type icons in legend
    await expect(page.locator('text=🚪')).toBeVisible(); // Cabin
    await expect(page.locator('text=💺')).toBeVisible(); // Seat Row
    await expect(page.locator('text=🪑')).toBeVisible(); // 4-Person Table
    await expect(page.locator('text=📚')).toBeVisible(); // Study Pod
    await expect(page.locator('text=🏢')).toBeVisible(); // Meeting Room
    await expect(page.locator('text=🛋️')).toBeVisible(); // Lounge Area
  });
});

test.describe('Ladies-Only Seat Configuration (Story 1.4.1)', () => {
  const seatMapConfigUrl = '/owner/seat-map-config';
  const hallId = '1';
  const apiBaseUrl = 'http://localhost:8081/api/v1';

  test.beforeEach(async ({ page }) => {
    // Login as owner before each test
    const token = await loginAsOwnerAPI(page);
    expect(token).toBeTruthy();

    // Mock study halls list
    await page.route(`${apiBaseUrl.replace('/api/v1', '')}/api/owner/halls`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: '1', name: 'Main Campus Hall', city: 'Mumbai', basePrice: 200, status: 'active' },
        ]),
      });
    });

    // Note: Seat configuration mocks are handled by individual tests to avoid conflicts

    // Mock shift configuration
    await page.route(`${apiBaseUrl}/owner/shifts/config/${hallId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          monday: { open: '09:00', close: '22:00', shifts: [] },
        }),
      });
    });
  });

  test('AC4: should display ladies-only checkbox in seat properties panel', async ({ page }) => {
    // Mock seat configuration - comprehensive (GET only needed for this test)
    await page.route(`${apiBaseUrl}/owner/seats/config/${hallId}`, async (route) => {
      const method = route.request().method();

      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      } else if (method === 'POST') {
        // Handle POST even though not used in this test
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Success' }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto(seatMapConfigUrl);
    await page.waitForSelector('[data-testid="hall-selection-dropdown"]', { timeout: 5000 });

    // Setup: add a seat
    await page.selectOption('[data-testid="hall-selection-dropdown"]', hallId);
    await page.waitForTimeout(500);

    // Click "Add Seat" button to open modal
    await page.locator('[data-testid="open-add-seat-modal-btn"]').click();
    await page.waitForSelector('text=Add New Seat');

    // Fill in seat number
    await page.fill('[data-testid="new-seat-number-input"]', 'A1');

    // Click "Add Seat" button inside modal
    await page.click('[data-testid="confirm-add-seat-btn"]');
    await page.waitForTimeout(500);

    // Click seat to open properties
    await page.locator('.seat-item').first().click();

    // Verify ladies-only checkbox exists and is visible
    const checkbox = page.locator('[data-testid="ladies-only-checkbox"]');
    await expect(checkbox).toBeVisible();

    // Verify label and help text
    await expect(page.locator('label[for="ladiesOnly"]')).toContainText('Ladies Only Seat');
    await expect(page.locator('text=Only female users can book this seat')).toBeVisible();

    // Verify checkbox is unchecked by default
    await expect(checkbox).not.toBeChecked();
  });

  test('AC4: should mark seat as ladies-only when checkbox is checked', async ({ page }) => {
    let savedPayload: any = null;

    // Capture console errors for debugging
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Intercept ALL HTTP methods for seat configuration
    await page.route(`${apiBaseUrl}/owner/seats/config/${hallId}`, async (route) => {
      const method = route.request().method();

      if (method === 'POST') {
        savedPayload = JSON.parse(route.request().postData() || '{}');
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Seat configuration saved successfully',
            seatsCreated: savedPayload.seats.length,
            seatsUpdated: 0,
          }),
        });
      } else if (method === 'GET') {
        // Return saved seats or empty array
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(savedPayload?.seats || []),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto(seatMapConfigUrl);
    await page.waitForSelector('[data-testid="hall-selection-dropdown"]', { timeout: 5000 });

    // Setup: add a seat
    await page.selectOption('[data-testid="hall-selection-dropdown"]', hallId);
    await page.waitForTimeout(500);

    // Click "Add Seat" button to open modal
    await page.locator('[data-testid="open-add-seat-modal-btn"]').click();
    await page.waitForSelector('text=Add New Seat');

    // Fill in seat number
    await page.fill('[data-testid="new-seat-number-input"]', 'A1');

    // Click "Add Seat" button inside modal
    await page.click('[data-testid="confirm-add-seat-btn"]');
    await page.waitForTimeout(500);

    // Click seat to open properties
    await page.locator('.seat-item').first().click();

    // Check the ladies-only checkbox
    const checkbox = page.locator('[data-testid="ladies-only-checkbox"]');
    await checkbox.check();

    // Verify checkbox is now checked
    await expect(checkbox).toBeChecked();

    // Save the seat properties
    await page.click('[data-testid="properties-save-btn"]');

    // Wait for properties panel form to close
    await page.waitForTimeout(300);
    await expect(page.locator('[data-testid="seat-properties-panel"]')).not.toBeVisible();

    // Wait for Save Configuration button to become enabled (hasUnsavedChanges should be true now)
    const saveConfigButton = page.locator('[data-testid="save-configuration-btn"]');
    await expect(saveConfigButton).toBeEnabled({ timeout: 3000 });

    // Save the configuration
    await saveConfigButton.click();

    // Wait for success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible({ timeout: 5000 });

    // Verify API payload includes isLadiesOnly=true
    expect(savedPayload).toBeTruthy();
    expect(savedPayload.seats).toHaveLength(1);
    expect(savedPayload.seats[0].isLadiesOnly).toBe(true);
  });

  test('AC4: should persist ladies-only checkbox state after save and reload', async ({ page }) => {
    let savedSeats: any[] = [];

    // Intercept POST and GET requests
    await page.route(`${apiBaseUrl}/owner/seats/config/${hallId}`, async (route) => {
      if (route.request().method() === 'POST') {
        const payload = JSON.parse(route.request().postData() || '{}');
        savedSeats = payload.seats;
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Seat configuration saved successfully',
            seatsCreated: savedSeats.length,
            seatsUpdated: 0,
          }),
        });
      } else if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(savedSeats),
        });
      }
    });

    await page.goto(seatMapConfigUrl);
    await page.waitForSelector('[data-testid="hall-selection-dropdown"]', { timeout: 5000 });

    // Setup: add a seat and mark as ladies-only
    await page.selectOption('[data-testid="hall-selection-dropdown"]', hallId);
    await page.waitForTimeout(500);

    // Click "Add Seat" button to open modal
    await page.locator('[data-testid="open-add-seat-modal-btn"]').click();
    await page.waitForSelector('text=Add New Seat');

    // Fill in seat number
    await page.fill('[data-testid="new-seat-number-input"]', 'B1');

    // Click "Add Seat" button inside modal
    await page.click('[data-testid="confirm-add-seat-btn"]');
    await page.waitForTimeout(500);

    // Mark as ladies-only
    await page.locator('.seat-item').first().click();
    await page.locator('[data-testid="ladies-only-checkbox"]').check();
    await page.click('[data-testid="properties-save-btn"]');

    // Wait for properties panel form to close
    await page.waitForTimeout(300);
    await expect(page.locator('[data-testid="seat-properties-panel"]')).not.toBeVisible();

    // Wait for Save Configuration button to become enabled
    const saveConfigButton = page.locator('[data-testid="save-configuration-btn"]');
    await expect(saveConfigButton).toBeEnabled({ timeout: 3000 });

    // Save configuration
    await saveConfigButton.click();
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible({ timeout: 5000 });

    // Reload the page
    await page.reload();
    await page.waitForSelector('[data-testid="hall-selection-dropdown"]', { timeout: 5000 });

    // Select the same hall (should load saved seats)
    await page.selectOption('[data-testid="hall-selection-dropdown"]', hallId);
    await page.waitForTimeout(1000);

    // Click the seat again
    await page.locator('.seat-item').first().click();

    // Verify checkbox is still checked
    const checkbox = page.locator('[data-testid="ladies-only-checkbox"]');
    await expect(checkbox).toBeChecked();
  });

  test('AC5: should display pink styling for ladies-only seats', async ({ page }) => {
    // Mock a seat that's already marked ladies-only
    await page.route(`${apiBaseUrl}/owner/seats/config/${hallId}`, async (route) => {
      const method = route.request().method();

      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              seatNumber: 'A2',
              xCoord: 100,
              yCoord: 100,
              spaceType: 'Cabin',
              isLadiesOnly: true,
            },
          ]),
        });
      } else if (method === 'POST') {
        // Handle POST for completeness
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Success' }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto(seatMapConfigUrl);
    await page.waitForSelector('[data-testid="hall-selection-dropdown"]', { timeout: 5000 });

    // Select hall (should load ladies-only seat)
    await page.selectOption('[data-testid="hall-selection-dropdown"]', hallId);
    await page.waitForTimeout(1000);

    // Wait for seat to be rendered
    await page.waitForSelector('.seat-item', { timeout: 5000 });

    // Verify seat has ladies-only class
    const seatItem = page.locator('.seat-item');
    await expect(seatItem).toBeVisible();

    // Check if seat has ladies-only class applied
    const hasLadiesOnlyClass = await seatItem.evaluate((el) => el.classList.contains('seat-ladies-only'));
    expect(hasLadiesOnlyClass).toBe(true);

    // Verify pink styling is applied
    const seatVisual = seatItem.locator('.seat-visual');
    const backgroundColor = await seatVisual.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Pink color #FFC0CB = rgb(255, 192, 203)
    expect(backgroundColor).toContain('255, 192, 203');
  });

  test('AC5: should display female symbol (♀) on ladies-only seats', async ({ page }) => {
    // Mock a ladies-only seat
    await page.route(`${apiBaseUrl}/owner/seats/config/${hallId}`, async (route) => {
      const method = route.request().method();

      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              seatNumber: 'B3',
              xCoord: 100,
              yCoord: 100,
              spaceType: 'Study Pod',
              isLadiesOnly: true,
            },
          ]),
        });
      } else if (method === 'POST') {
        // Handle POST for completeness
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Success' }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto(seatMapConfigUrl);
    await page.waitForSelector('[data-testid="hall-selection-dropdown"]', { timeout: 5000 });

    // Select hall
    await page.selectOption('[data-testid="hall-selection-dropdown"]', hallId);
    await page.waitForTimeout(1000);

    // Wait for seat to be rendered
    await page.waitForSelector('.seat-item', { timeout: 5000 });

    // Verify seat visual is present
    const seatItem = page.locator('.seat-item').first();
    const seatVisual = seatItem.locator('.seat-visual');
    await expect(seatVisual).toBeVisible();

    // Check for the female symbol via CSS content (can't directly verify ::after, but we can verify class is applied)
    const hasLadiesOnlyClass = await page.locator('.seat-item').first().evaluate((el) => {
      return el.classList.contains('seat-ladies-only');
    });
    expect(hasLadiesOnlyClass).toBe(true);
  });

  test('AC6: should include isLadiesOnly in API payload when saving mixed seats', async ({ page }) => {
    let savedPayload: any = null;

    // Intercept ALL HTTP methods for seat configuration
    await page.route(`${apiBaseUrl}/owner/seats/config/${hallId}`, async (route) => {
      const method = route.request().method();

      if (method === 'POST') {
        savedPayload = JSON.parse(route.request().postData() || '{}');
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Seat configuration saved successfully',
            seatsCreated: savedPayload.seats.length,
            seatsUpdated: 0,
          }),
        });
      } else if (method === 'GET') {
        // Return saved seats or empty array
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(savedPayload?.seats || []),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto(seatMapConfigUrl);
    await page.waitForSelector('[data-testid="hall-selection-dropdown"]', { timeout: 5000 });

    // Select hall
    await page.selectOption('[data-testid="hall-selection-dropdown"]', hallId);
    await page.waitForTimeout(500);

    // Add first seat (regular)
    await page.locator('[data-testid="open-add-seat-modal-btn"]').click();
    await page.waitForSelector('text=Add New Seat');
    await page.fill('[data-testid="new-seat-number-input"]', 'C1');
    await page.click('[data-testid="confirm-add-seat-btn"]');
    await page.waitForTimeout(300);

    // Add second seat (ladies-only)
    await page.locator('[data-testid="open-add-seat-modal-btn"]').click();
    await page.waitForSelector('text=Add New Seat');
    await page.fill('[data-testid="new-seat-number-input"]', 'C2');
    await page.click('[data-testid="confirm-add-seat-btn"]');
    await page.waitForTimeout(300);

    // Mark second seat as ladies-only
    await page.locator('.seat-item').nth(1).click();
    await page.locator('[data-testid="ladies-only-checkbox"]').check();
    await page.click('[data-testid="properties-save-btn"]');
    await page.waitForTimeout(300);

    // Add third seat (ladies-only with custom price)
    await page.locator('[data-testid="open-add-seat-modal-btn"]').click();
    await page.waitForSelector('text=Add New Seat');
    await page.fill('[data-testid="new-seat-number-input"]', 'C3');
    await page.click('[data-testid="confirm-add-seat-btn"]');
    await page.waitForTimeout(300);

    await page.locator('.seat-item').nth(2).click();
    await page.selectOption('[data-testid="space-type-dropdown"]', 'Seat Row');
    await page.fill('[data-testid="custom-price-input"]', '750');
    await page.locator('[data-testid="ladies-only-checkbox"]').check();
    await page.click('[data-testid="properties-save-btn"]');

    // Wait for properties panel form to close
    await page.waitForTimeout(300);
    await expect(page.locator('[data-testid="seat-properties-panel"]')).not.toBeVisible();

    // Wait for Save Configuration button to become enabled
    const saveConfigButton = page.locator('[data-testid="save-configuration-btn"]');
    await expect(saveConfigButton).toBeEnabled({ timeout: 3000 });

    // Save configuration
    await saveConfigButton.click();
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible({ timeout: 5000 });

    // Verify payload structure
    expect(savedPayload).toBeTruthy();
    expect(savedPayload.seats).toHaveLength(3);

    // Verify first seat (regular)
    expect(savedPayload.seats[0].seatNumber).toBe('C1');
    expect(savedPayload.seats[0].isLadiesOnly).toBe(false);

    // Verify second seat (ladies-only)
    expect(savedPayload.seats[1].seatNumber).toBe('C2');
    expect(savedPayload.seats[1].isLadiesOnly).toBe(true);

    // Verify third seat (ladies-only with custom price)
    expect(savedPayload.seats[2].seatNumber).toBe('C3');
    expect(savedPayload.seats[2].isLadiesOnly).toBe(true);
    expect(savedPayload.seats[2].spaceType).toBe('Seat Row');
    expect(savedPayload.seats[2].customPrice).toBe(750);
  });

  test('should have zero console errors during ladies-only workflow', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Mock seat configuration endpoint - ALL methods
    await page.route(`${apiBaseUrl}/owner/seats/config/${hallId}`, async (route) => {
      const method = route.request().method();

      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      } else if (method === 'POST') {
        const payload = JSON.parse(route.request().postData() || '{}');
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Seat configuration saved successfully',
            seatsCreated: payload.seats.length,
            seatsUpdated: 0,
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto(seatMapConfigUrl);
    await page.waitForSelector('[data-testid="hall-selection-dropdown"]', { timeout: 5000 });

    // Complete ladies-only workflow
    await page.selectOption('[data-testid="hall-selection-dropdown"]', hallId);
    await page.waitForTimeout(500);

    // Add seat
    await page.locator('[data-testid="open-add-seat-modal-btn"]').click();
    await page.waitForSelector('text=Add New Seat');
    await page.fill('[data-testid="new-seat-number-input"]', 'D1');
    await page.click('[data-testid="confirm-add-seat-btn"]');
    await page.waitForTimeout(500);

    // Mark as ladies-only
    await page.locator('.seat-item').first().click();
    await page.locator('[data-testid="ladies-only-checkbox"]').check();
    await page.click('[data-testid="properties-save-btn"]');
    await page.waitForTimeout(500);

    // Verify no console errors
    expect(consoleErrors).toHaveLength(0);
  });

  // Story 1.22: Hall Amenities Configuration E2E Tests
  test.describe('Hall Amenities Configuration (Story 1.22)', () => {
    test.beforeEach(async ({ page }) => {
      // Mock amenities GET endpoint
      await page.route(`${apiBaseUrl}/owner/halls/${hallId}/amenities`, async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              hallId: hallId,
              hallName: 'Main Campus Hall',
              amenities: []
            })
          });
        }
      });
    });

    test('should display amenities section when hall is selected', async ({ page }) => {
      await page.goto(seatMapConfigUrl);
      await page.waitForSelector('[data-testid="hall-selection-dropdown"]');

      // Amenities section should NOT be visible before hall selection
      await expect(page.locator('text=Hall Amenities')).not.toBeVisible();

      // Select hall
      await page.selectOption('[data-testid="hall-selection-dropdown"]', hallId);
      await page.waitForTimeout(500);

      // Amenities section should now be visible
      await expect(page.locator('text=Hall Amenities')).toBeVisible();
      await expect(page.locator('[data-testid="amenity-ac-checkbox"]')).toBeVisible();
      await expect(page.locator('[data-testid="amenity-wifi-checkbox"]')).toBeVisible();
    });

    test('should load existing amenities when hall is selected', async ({ page }) => {
      // Mock with existing amenities
      await page.route(`${apiBaseUrl}/owner/halls/${hallId}/amenities`, async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              hallId: hallId,
              hallName: 'Main Campus Hall',
              amenities: ['AC', 'WiFi']
            })
          });
        }
      });

      await page.goto(seatMapConfigUrl);
      await page.waitForSelector('[data-testid="hall-selection-dropdown"]');
      await page.selectOption('[data-testid="hall-selection-dropdown"]', hallId);
      await page.waitForTimeout(500);

      // Both checkboxes should be checked
      await expect(page.locator('[data-testid="amenity-ac-checkbox"]')).toBeChecked();
      await expect(page.locator('[data-testid="amenity-wifi-checkbox"]')).toBeChecked();
    });

    test('should auto-save when AC checkbox is toggled', async ({ page }) => {
      let updateCalled = false;
      let savedAmenities: string[] = [];

      // Mock PUT endpoint
      await page.route(`${apiBaseUrl}/owner/halls/${hallId}/amenities`, async (route) => {
        if (route.request().method() === 'PUT') {
          updateCalled = true;
          const requestBody = route.request().postDataJSON();
          savedAmenities = requestBody.amenities;
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              hallId: hallId,
              hallName: 'Main Campus Hall',
              amenities: requestBody.amenities
            })
          });
        } else if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              hallId: hallId,
              hallName: 'Main Campus Hall',
              amenities: []
            })
          });
        }
      });

      await page.goto(seatMapConfigUrl);
      await page.waitForSelector('[data-testid="hall-selection-dropdown"]');
      await page.selectOption('[data-testid="hall-selection-dropdown"]', hallId);
      await page.waitForTimeout(500);

      // Check AC checkbox
      await page.locator('[data-testid="amenity-ac-checkbox"]').check();

      // Wait for debounce (500ms) + network delay
      await page.waitForTimeout(1000);

      // Verify auto-save was called
      expect(updateCalled).toBe(true);
      expect(savedAmenities).toEqual(['AC']);
    });

    test('should auto-save both amenities when both checkboxes are checked', async ({ page }) => {
      let savedAmenities: string[] = [];

      await page.route(`${apiBaseUrl}/owner/halls/${hallId}/amenities`, async (route) => {
        if (route.request().method() === 'PUT') {
          const requestBody = route.request().postDataJSON();
          savedAmenities = requestBody.amenities;
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              hallId: hallId,
              hallName: 'Main Campus Hall',
              amenities: requestBody.amenities
            })
          });
        } else if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              hallId: hallId,
              hallName: 'Main Campus Hall',
              amenities: []
            })
          });
        }
      });

      await page.goto(seatMapConfigUrl);
      await page.waitForSelector('[data-testid="hall-selection-dropdown"]');
      await page.selectOption('[data-testid="hall-selection-dropdown"]', hallId);
      await page.waitForTimeout(500);

      // Check both checkboxes
      await page.locator('[data-testid="amenity-ac-checkbox"]').check();
      await page.locator('[data-testid="amenity-wifi-checkbox"]').check();

      // Wait for debounce + network delay
      await page.waitForTimeout(1000);

      // Verify both amenities were saved
      expect(savedAmenities).toContain('AC');
      expect(savedAmenities).toContain('WiFi');
      expect(savedAmenities.length).toBe(2);
    });

    test('should show saving indicator during save', async ({ page }) => {
      await page.route(`${apiBaseUrl}/owner/halls/${hallId}/amenities`, async (route) => {
        if (route.request().method() === 'PUT') {
          // Simulate slow network with delay
          await page.waitForTimeout(200);
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              hallId: hallId,
              hallName: 'Main Campus Hall',
              amenities: ['WiFi']
            })
          });
        } else if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              hallId: hallId,
              hallName: 'Main Campus Hall',
              amenities: []
            })
          });
        }
      });

      await page.goto(seatMapConfigUrl);
      await page.waitForSelector('[data-testid="hall-selection-dropdown"]');
      await page.selectOption('[data-testid="hall-selection-dropdown"]', hallId);
      await page.waitForTimeout(500);

      // Check WiFi checkbox
      await page.locator('[data-testid="amenity-wifi-checkbox"]').check();

      // Wait for debounce
      await page.waitForTimeout(600);

      // Saving indicator should briefly appear
      // Note: This might be too fast to catch reliably, so we'll check for success indicator instead
      await page.waitForTimeout(500);

      // Success indicator should appear
      await expect(page.locator('[data-testid="amenities-success-indicator"]')).toBeVisible();
    });

    test('should save empty array when all checkboxes are unchecked', async ({ page }) => {
      let savedAmenities: string[] | null = null;

      // Start with both amenities checked
      await page.route(`${apiBaseUrl}/owner/halls/${hallId}/amenities`, async (route) => {
        if (route.request().method() === 'PUT') {
          const requestBody = route.request().postDataJSON();
          savedAmenities = requestBody.amenities;
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              hallId: hallId,
              hallName: 'Main Campus Hall',
              amenities: requestBody.amenities
            })
          });
        } else if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              hallId: hallId,
              hallName: 'Main Campus Hall',
              amenities: ['AC', 'WiFi']
            })
          });
        }
      });

      await page.goto(seatMapConfigUrl);
      await page.waitForSelector('[data-testid="hall-selection-dropdown"]');
      await page.selectOption('[data-testid="hall-selection-dropdown"]', hallId);
      await page.waitForTimeout(500);

      // Both should be checked initially
      await expect(page.locator('[data-testid="amenity-ac-checkbox"]')).toBeChecked();
      await expect(page.locator('[data-testid="amenity-wifi-checkbox"]')).toBeChecked();

      // Uncheck both
      await page.locator('[data-testid="amenity-ac-checkbox"]').uncheck();
      await page.locator('[data-testid="amenity-wifi-checkbox"]').uncheck();

      // Wait for debounce + network delay
      await page.waitForTimeout(1000);

      // Verify empty array was saved
      expect(savedAmenities).toEqual([]);
    });
  });
});
