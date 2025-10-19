/**
 * Manual UI Validation Script for Hall Amenities
 * Opens browser, logs in, shows amenities section, and keeps browser open
 */

const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500 // Slow down actions so you can see what's happening
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🌐 Opening application...');
    await page.goto('http://localhost:4200');

    console.log('🔐 Logging in as test owner...');

    // Call login API directly to get token
    const loginResponse = await page.request.post('http://localhost:8081/api/v1/auth/login', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        email: 'test.owner@studymate.test',
        password: 'Test@123'
      }
    });

    if (loginResponse.ok()) {
      const loginData = await loginResponse.json();

      // Store token in localStorage
      await page.evaluate((token) => {
        localStorage.setItem('token', token);
      }, loginData.token);

      console.log('✅ Login successful!');
    } else {
      console.error('❌ Login failed:', loginResponse.status());
    }

    console.log('🗺️  Navigating to Seat Map Config page...');
    await page.goto('http://localhost:4200/owner/seat-map-config');

    // Wait for the page to load
    await page.waitForTimeout(2000);

    console.log('🏛️  Selecting a hall...');
    // Try to select a hall from dropdown
    const hallDropdown = page.locator('[data-testid="hall-selection-dropdown"]');
    if (await hallDropdown.count() > 0) {
      await hallDropdown.selectOption({ index: 1 });
      await page.waitForTimeout(1000);
    }

    console.log('');
    console.log('='.repeat(70));
    console.log('✅ BROWSER IS READY FOR MANUAL VALIDATION');
    console.log('='.repeat(70));
    console.log('');
    console.log('📍 You should see:');
    console.log('   1. Hall Amenities section with header');
    console.log('   2. Two checkboxes: ❄️ Air Conditioning and 📶 Wi-Fi');
    console.log('   3. Each checkbox in a styled card with hover effects');
    console.log('');
    console.log('🧪 Try these interactions:');
    console.log('   • Check/uncheck the AC checkbox');
    console.log('   • Check/uncheck the Wi-Fi checkbox');
    console.log('   • Watch for the "⏳ Saving..." indicator');
    console.log('   • Watch for the "✓ Saved" success message (2 seconds)');
    console.log('   • Switch between halls in the dropdown');
    console.log('');
    console.log('⚠️  Press Ctrl+C in terminal to close browser when done');
    console.log('='.repeat(70));
    console.log('');

    // Keep browser open indefinitely
    await new Promise(() => {}); // Never resolves, keeps script running

  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: 'error-screenshot.png' });
    console.log('📸 Error screenshot saved as error-screenshot.png');
    await browser.close();
  }
})();
