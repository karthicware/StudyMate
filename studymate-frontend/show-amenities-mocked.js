/**
 * Manual UI Validation Script for Hall Amenities (with mocked backend)
 * Opens browser with mocked API responses and keeps it open
 */

const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 300
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    const apiBaseUrl = 'http://localhost:8081/api/v1';

    console.log('🔧 Setting up API route mocks...');

    // Mock login API
    await page.route(`${apiBaseUrl}/auth/login`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock-jwt-token-for-testing',
          user: {
            email: 'test.owner@studymate.test',
            role: 'ROLE_OWNER'
          }
        })
      });
    });

    // Mock study halls list
    await page.route(`${apiBaseUrl.replace('/api/v1', '')}/api/owner/halls`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: '1', name: 'Main Campus Hall', city: 'Mumbai', basePrice: 200, status: 'active' },
          { id: '2', name: 'Downtown Study Center', city: 'Mumbai', basePrice: 250, status: 'active' },
          { id: '3', name: 'East Side Branch', city: 'Pune', basePrice: 180, status: 'active' },
        ])
      });
    });

    // Mock seat configuration
    await page.route(`${apiBaseUrl}/owner/seats/config/**`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    // Mock shift configuration
    await page.route(`${apiBaseUrl}/owner/shifts/config/**`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          monday: { open: '09:00', close: '22:00', shifts: [] }
        })
      });
    });

    // Mock amenities GET
    await page.route(`${apiBaseUrl}/owner/halls/*/amenities`, async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            hallId: '1',
            hallName: 'Main Campus Hall',
            amenities: ['AC'] // Initial state: AC is checked
          })
        });
      } else if (method === 'PUT') {
        // On PUT, return the body that was sent
        const requestBody = route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            hallId: '1',
            hallName: 'Main Campus Hall',
            amenities: requestBody.amenities
          })
        });
      } else {
        await route.continue();
      }
    });

    console.log('🌐 Opening application...');
    await page.goto('http://localhost:4200');
    await page.waitForTimeout(1000);

    console.log('💾 Setting mock token in localStorage...');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-jwt-token-for-testing');
    });

    console.log('🗺️  Navigating to Seat Map Config page...');
    await page.goto('http://localhost:4200/owner/seat-map-config');
    await page.waitForTimeout(2000);

    console.log('🏛️  Selecting hall from dropdown...');
    try {
      const hallDropdown = page.locator('[data-testid="hall-selection-dropdown"]');
      await hallDropdown.waitFor({ state: 'visible', timeout: 5000 });
      await hallDropdown.selectOption('1'); // Select first hall
      await page.waitForTimeout(1500);
    } catch (e) {
      console.log('⚠️  Could not select hall automatically, but page should be visible');
    }

    console.log('');
    console.log('='.repeat(75));
    console.log('✅ BROWSER IS READY FOR MANUAL VALIDATION');
    console.log('='.repeat(75));
    console.log('');
    console.log('📍 HALL AMENITIES SECTION:');
    console.log('   ✓ Located at top of the page (before seat map canvas)');
    console.log('   ✓ White card with shadow and border');
    console.log('   ✓ Header: "Hall Amenities" with status indicators');
    console.log('   ✓ Description: "Configure available amenities for students..."');
    console.log('');
    console.log('📍 TWO AMENITY CHECKBOXES:');
    console.log('   1. ❄️  Air Conditioning (AC)');
    console.log('      • Currently CHECKED (from mocked API)');
    console.log('      • Subtitle: "Climate-controlled environment"');
    console.log('');
    console.log('   2. 📶 Wi-Fi');
    console.log('      • Currently UNCHECKED (from mocked API)');
    console.log('      • Subtitle: "High-speed internet access"');
    console.log('');
    console.log('🧪 TEST THESE INTERACTIONS:');
    console.log('   • ✓ Check/uncheck any checkbox');
    console.log('   • ✓ Watch for "⏳ Saving..." (animated, blue)');
    console.log('   • ✓ Watch for "✓ Saved" (green, shows 2 sec)');
    console.log('   • ✓ Both checkboxes can be selected together');
    console.log('   • ✓ Hover over cards to see hover effect (bg-gray-50)');
    console.log('   • ✓ Click checkbox or label text (both work)');
    console.log('   • ✓ Switch halls in dropdown to see amenities reload');
    console.log('');
    console.log('📊 AUTO-SAVE BEHAVIOR:');
    console.log('   • Changes save after 500ms delay (debounce)');
    console.log('   • Rapid clicks are batched into single save');
    console.log('   • Saving indicator appears during API call');
    console.log('   • Success indicator auto-hides after 2 seconds');
    console.log('');
    console.log('⚠️  Press Ctrl+C in terminal when done to close browser');
    console.log('='.repeat(75));
    console.log('');

    // Keep browser open
    await new Promise(() => {});

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    await page.screenshot({ path: 'error-screenshot.png' });
    await browser.close();
  }
})();
