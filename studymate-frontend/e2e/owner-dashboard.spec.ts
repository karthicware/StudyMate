import { test, expect } from '@playwright/test';

test.describe('Owner Dashboard', () => {
  const hallId = 'test-hall-123';
  const dashboardUrl = `/owner/dashboard/${hallId}`;

  test.beforeEach(async ({ page }) => {
    // Mock API response
    await page.route(`/api/owner/dashboard/${hallId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalSeats: 50,
          occupancyPercentage: 75.5,
          currentRevenue: 15000,
          seatMap: [
            {
              id: '1',
              seatNumber: 'A1',
              xCoord: 100,
              yCoord: 100,
              status: 'available'
            },
            {
              id: '2',
              seatNumber: 'A2',
              xCoord: 150,
              yCoord: 100,
              status: 'occupied'
            },
            {
              id: '3',
              seatNumber: 'A3',
              xCoord: 200,
              yCoord: 100,
              status: 'reserved'
            }
          ]
        })
      });
    });
  });

  test('should load and display dashboard metrics correctly', async ({ page }) => {
    await page.goto(dashboardUrl);

    // Wait for the page to load
    await page.waitForSelector('.metric-card', { timeout: 5000 });

    // Check if metrics are displayed
    await expect(page.locator('text=Total Seats')).toBeVisible();
    await expect(page.locator('text=Occupancy')).toBeVisible();
    await expect(page.locator('text=Current Revenue')).toBeVisible();

    // Verify metric values
    await expect(page.locator('text=50')).toBeVisible();
    await expect(page.locator('text=75.5%')).toBeVisible();
    await expect(page.locator('text=/₹.*15,000/')).toBeVisible();
  });

  test('should render seat map visualization', async ({ page }) => {
    await page.goto(dashboardUrl);

    // Wait for seat map to load
    await page.waitForSelector('.seat-map-svg-container', { timeout: 5000 });

    // Check if SVG is rendered
    const svg = page.locator('svg');
    await expect(svg).toBeVisible();

    // Check if seats are rendered
    const seatCircles = page.locator('.seat-circle');
    await expect(seatCircles).toHaveCount(3);

    // Check if seat labels are displayed
    const seatLabels = page.locator('.seat-label');
    await expect(seatLabels).toHaveCount(3);

    // Verify seat numbers
    await expect(page.locator('text=A1')).toBeVisible();
    await expect(page.locator('text=A2')).toBeVisible();
    await expect(page.locator('text=A3')).toBeVisible();
  });

  test('should display legend with all seat statuses', async ({ page }) => {
    await page.goto(dashboardUrl);

    await page.waitForSelector('.seat-map-svg-container', { timeout: 5000 });

    // Check legend items
    await expect(page.locator('text=Available')).toBeVisible();
    await expect(page.locator('text=Occupied')).toBeVisible();
    await expect(page.locator('text=Reserved')).toBeVisible();
  });

  test('should have zero console errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto(dashboardUrl);
    await page.waitForSelector('.metric-card', { timeout: 5000 });

    // Verify no console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(dashboardUrl);
    await page.waitForSelector('.metric-card', { timeout: 5000 });

    // Check if metrics stack vertically on mobile
    const metricsGrid = page.locator('.grid');
    await expect(metricsGrid).toBeVisible();

    // Verify all metric cards are visible
    const metricCards = page.locator('.metric-card');
    await expect(metricCards).toHaveCount(3);
  });

  test('should be responsive on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto(dashboardUrl);
    await page.waitForSelector('.metric-card', { timeout: 5000 });

    // Verify all components are visible
    await expect(page.locator('.metric-card')).toHaveCount(3);
    await expect(page.locator('.seat-map-svg-container')).toBeVisible();
  });

  test('should handle API error gracefully', async ({ page }) => {
    // Override the beforeEach mock with an error response
    await page.route(`/api/owner/dashboard/${hallId}`, async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Study hall not found' })
      });
    });

    await page.goto(dashboardUrl);

    // Wait for error message
    await page.waitForSelector('text=Study hall not found', { timeout: 5000 });
    await expect(page.locator('text=Study hall not found')).toBeVisible();
  });

  test('should display loading state initially', async ({ page }) => {
    // Delay the API response
    await page.route(`/api/owner/dashboard/${hallId}`, async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalSeats: 50,
          occupancyPercentage: 75.5,
          currentRevenue: 15000,
          seatMap: []
        })
      });
    });

    await page.goto(dashboardUrl);

    // Check for loading state
    await expect(page.locator('text=Loading dashboard data...')).toBeVisible();

    // Wait for data to load
    await page.waitForSelector('.metric-card', { timeout: 5000 });
    await expect(page.locator('text=Loading dashboard data...')).not.toBeVisible();
  });
});
