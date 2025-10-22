/**
 * Example Playwright Verification Script Template
 *
 * Use this template when creating adhoc scripts for story verification
 *
 * SETUP:
 * 1. Ensure backend is running: cd ../studymate-backend && ./mvnw spring-boot:run
 * 2. Ensure frontend is running: npm start (from studymate-frontend directory)
 * 3. Run this script: node e2e/fixtures/example-verification-script.js
 */

const { chromium } = require('@playwright/test');
const { loginAsOwner, TEST_USERS } = require('./test-credentials');

(async () => {
  console.log('🚀 Starting verification script...');

  // Launch browser
  const browser = await chromium.launch({
    headless: false,  // Set to true for headless mode
    slowMo: 500,      // Slow down actions for visibility
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();

  // Enable console logging from the browser
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  page.on('requestfailed', request => console.log('❌ Request failed:', request.url(), request.failure()));

  try {
    // ============================================
    // STEP 1: Login using helper function
    // ============================================
    await loginAsOwner(page);

    // ============================================
    // STEP 2: Navigate to the page you want to verify
    // ============================================
    console.log('\n📍 Navigating to feature page...');
    await page.goto('http://localhost:4200/owner/seat-map-config', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    console.log('✅ Page loaded successfully!');
    console.log('   Current URL:', page.url());

    // ============================================
    // STEP 3: Perform any interactions or verifications
    // ============================================
    // Example: Wait for specific elements
    // await page.waitForSelector('[data-testid="seat-grid"]', { state: 'visible' });

    // Example: Click a button
    // await page.click('button[data-testid="add-seat"]');

    // Example: Fill a form
    // await page.fill('input[name="seatNumber"]', '42');

    // Example: Take a screenshot
    // await page.screenshot({ path: 'verification-screenshot.png', fullPage: true });

    // ============================================
    // STEP 4: Keep browser open for manual inspection
    // ============================================
    console.log('\n🎉 Verification complete! Browser will stay open for 10 minutes.');
    console.log('   Press Ctrl+C to close earlier.');
    await page.waitForTimeout(600000); // 10 minutes

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.log('   Current URL:', page.url());

    // Take screenshot on error
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({ path: `error-${timestamp}.png`, fullPage: true });
    console.log(`   Screenshot saved: error-${timestamp}.png`);

    // Keep browser open for inspection
    console.log('   Browser will stay open for 5 minutes...');
    await page.waitForTimeout(300000);
  } finally {
    console.log('\n👋 Closing browser...');
    await browser.close();
  }
})();
