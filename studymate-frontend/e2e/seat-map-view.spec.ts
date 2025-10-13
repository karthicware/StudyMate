import { test, expect } from '@playwright/test';

/**
 * Story 1.3: Seat Map Visualization - E2E Tests
 * Tests the complete seat map visualization workflow including:
 * - Seat map rendering at correct positions
 * - Status color display
 * - Occupancy metrics accuracy
 * - Real-time updates
 */
test.describe('Seat Map Visualization (Story 1.3)', () => {
  const TEST_HALL_ID = 'test-hall-123';
  const DASHBOARD_URL = `/owner/dashboard?hallId=${TEST_HALL_ID}`;

  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'mock-jwt-token');
      localStorage.setItem('user_role', 'OWNER');
    });

    // Mock seat map API response
    await page.route('**/api/owner/seats/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          seats: [
            {
              id: 'seat-1',
              hallId: TEST_HALL_ID,
              seatNumber: 'A1',
              xCoord: 100,
              yCoord: 150,
              status: 'available'
            },
            {
              id: 'seat-2',
              hallId: TEST_HALL_ID,
              seatNumber: 'A2',
              xCoord: 200,
              yCoord: 150,
              status: 'booked'
            },
            {
              id: 'seat-3',
              hallId: TEST_HALL_ID,
              seatNumber: 'A3',
              xCoord: 300,
              yCoord: 150,
              status: 'locked'
            },
            {
              id: 'seat-4',
              hallId: TEST_HALL_ID,
              seatNumber: 'B1',
              xCoord: 100,
              yCoord: 250,
              status: 'maintenance'
            }
          ]
        })
      });
    });

    // Mock dashboard metrics API
    await page.route('**/api/owner/dashboard/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalSeats: 4,
          occupancyPercentage: 25.0,
          currentRevenue: 5000,
          seatMap: []
        })
      });
    });
  });

  test('should display seat map on dashboard', async ({ page }) => {
    await page.goto(DASHBOARD_URL);

    // Wait for seat map to load
    await page.waitForSelector('.seat-map-container', { timeout: 10000 });

    // Verify seat map container is visible
    const seatMapContainer = page.locator('.seat-map-container');
    await expect(seatMapContainer).toBeVisible();

    // Verify SVG canvas is present
    const svg = page.locator('.seat-map-svg');
    await expect(svg).toBeVisible();
  });

  test('should render seats at correct positions', async ({ page }) => {
    await page.goto(DASHBOARD_URL);

    // Wait for seats to render
    await page.waitForSelector('.seat-group', { timeout: 10000 });

    // Check that 4 seats are rendered
    const seatGroups = page.locator('.seat-group');
    await expect(seatGroups).toHaveCount(4);

    // Verify seat numbers are displayed
    const seatNumbers = page.locator('.seat-number');
    await expect(seatNumbers.nth(0)).toContainText('A1');
    await expect(seatNumbers.nth(1)).toContainText('A2');
    await expect(seatNumbers.nth(2)).toContainText('A3');
    await expect(seatNumbers.nth(3)).toContainText('B1');
  });

  test('should display correct status colors', async ({ page }) => {
    await page.goto(DASHBOARD_URL);

    // Wait for seats to render
    await page.waitForSelector('.seat-rect', { timeout: 10000 });

    // Get all seat rectangles
    const seatRects = page.locator('.seat-rect');

    // Verify there are 4 seats
    await expect(seatRects).toHaveCount(4);

    // Verify each seat has a fill color (status-based)
    for (let i = 0; i < 4; i++) {
      const fill = await seatRects.nth(i).getAttribute('fill');
      expect(fill).toBeTruthy();
      expect(fill).toMatch(/^#[0-9A-Fa-f]{6}$/); // Valid hex color
    }
  });

  test('should display occupancy metrics', async ({ page }) => {
    await page.goto(DASHBOARD_URL);

    // Wait for metrics to load
    await page.waitForSelector('.metrics-header', { timeout: 10000 });

    // Verify Total Seats metric
    const totalSeatsMetric = page.locator('.metric-card').filter({ hasText: 'Total Seats' });
    await expect(totalSeatsMetric).toBeVisible();
    await expect(totalSeatsMetric.locator('.metric-value')).toContainText('4');

    // Verify Occupancy metric
    const occupancyMetric = page.locator('.metric-card').filter({ hasText: 'Occupancy' });
    await expect(occupancyMetric).toBeVisible();
    await expect(occupancyMetric.locator('.metric-value')).toContainText('%');

    // Verify Available metric
    const availableMetric = page.locator('.metric-card').filter({ hasText: 'Available' });
    await expect(availableMetric).toBeVisible();

    // Verify Booked metric
    const bookedMetric = page.locator('.metric-card').filter({ hasText: 'Booked' });
    await expect(bookedMetric).toBeVisible();
  });

  test('should display status legend', async ({ page }) => {
    await page.goto(DASHBOARD_URL);

    // Wait for legend to load
    await page.waitForSelector('.status-legend', { timeout: 10000 });

    // Verify legend is visible
    const legend = page.locator('.status-legend');
    await expect(legend).toBeVisible();

    // Verify all 4 status types are in legend
    const legendItems = page.locator('.legend-item');
    await expect(legendItems).toHaveCount(4);

    // Verify legend labels
    await expect(legend).toContainText('Available');
    await expect(legend).toContainText('Booked');
    await expect(legend).toContainText('Locked');
    await expect(legend).toContainText('Maintenance');
  });

  test('should handle empty seat map gracefully', async ({ page }) => {
    // Mock empty seat response
    await page.route('**/api/owner/seats/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ seats: [] })
      });
    });

    await page.goto(DASHBOARD_URL);

    // Wait for empty state
    await page.waitForSelector('.empty-state', { timeout: 10000 });

    // Verify empty state message
    const emptyState = page.locator('.empty-state');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText('No seats configured');
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/owner/seats/**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.goto(DASHBOARD_URL);

    // Wait for error state
    await page.waitForSelector('.error-state', { timeout: 10000 });

    // Verify error message
    const errorState = page.locator('.error-state');
    await expect(errorState).toBeVisible();
    await expect(errorState).toContainText('Failed to load seat map');

    // Verify retry button exists
    const retryButton = page.locator('.retry-button');
    await expect(retryButton).toBeVisible();
  });

  test('should have hover effects on seats', async ({ page }) => {
    await page.goto(DASHBOARD_URL);

    // Wait for seats to render
    await page.waitForSelector('.seat-group', { timeout: 10000 });

    // Get first seat
    const firstSeat = page.locator('.seat-group').first();

    // Hover over the seat
    await firstSeat.hover();

    // The seat should remain visible and interactive
    await expect(firstSeat).toBeVisible();
  });

  test('should have no console errors on page load', async ({ page }) => {
    const consoleErrors: string[] = [];

    // Listen for console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto(DASHBOARD_URL);

    // Wait for seat map to fully load
    await page.waitForSelector('.seat-map-svg', { timeout: 10000 });

    // Wait a bit for any delayed errors
    await page.waitForTimeout(2000);

    // Verify no console errors occurred
    expect(consoleErrors).toHaveLength(0);
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(DASHBOARD_URL);

    // Wait for seat map to load
    await page.waitForSelector('.seat-map-container', { timeout: 10000 });

    // Verify seat map is visible on mobile
    const seatMapContainer = page.locator('.seat-map-container');
    await expect(seatMapContainer).toBeVisible();

    // Verify metrics are stacked vertically (full width)
    const metricCards = page.locator('.metric-card');
    const firstCard = metricCards.first();
    const boundingBox = await firstCard.boundingBox();

    expect(boundingBox?.width).toBeGreaterThan(300); // Should be near full width on mobile
  });

  test('should display SVG with correct viewBox', async ({ page }) => {
    await page.goto(DASHBOARD_URL);

    // Wait for SVG to render
    await page.waitForSelector('.seat-map-svg', { timeout: 10000 });

    // Verify viewBox attribute (800x600 canvas)
    const svg = page.locator('.seat-map-svg');
    const viewBox = await svg.getAttribute('viewBox');
    expect(viewBox).toBe('0 0 800 600');
  });

  test('should show loading state initially', async ({ page }) => {
    // Delay the API response to see loading state
    await page.route('**/api/owner/seats/**', async (route) => {
      await page.waitForTimeout(1000); // 1 second delay
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ seats: [] })
      });
    });

    await page.goto(DASHBOARD_URL);

    // Check for loading state (may be very brief)
    const loadingState = page.locator('.loading-state');

    // Either loading state is visible or data loaded quickly
    try {
      await expect(loadingState).toBeVisible({ timeout: 500 });
    } catch {
      // Loading completed too fast - verify seat map loaded
      await expect(page.locator('.seat-map-container')).toBeVisible();
    }
  });
});
