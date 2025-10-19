const { chromium } = require('@playwright/test');

(async () => {
  console.log('🚀 Starting authentication flow...');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // Enable console logging from the browser
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  page.on('requestfailed', request => console.log('❌ Request failed:', request.url(), request.failure()));

  try {
    // Navigate to login page
    console.log('📍 Navigating to login page...');
    await page.goto('http://localhost:4200/auth/login', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('✅ Login page loaded');
    console.log('   Current URL:', page.url());

    // Wait for email input to be visible and enabled
    console.log('⏳ Waiting for form elements...');
    await page.waitForSelector('input[type="email"]', { state: 'visible', timeout: 10000 });
    await page.waitForSelector('input[type="password"]', { state: 'visible', timeout: 10000 });
    await page.waitForSelector('button[type="submit"]', { state: 'visible', timeout: 10000 });

    console.log('✅ Form elements ready');

    // Fill credentials
    console.log('📝 Filling credentials...');
    await page.fill('input[type="email"]', 'newowner@studymate.com');
    await page.fill('input[type="password"]', 'Password123');

    console.log('   Email: newowner@studymate.com');
    console.log('   Password: Password123');

    // Wait a moment for any validation
    await page.waitForTimeout(500);

    // Click submit and wait for navigation
    console.log('🔘 Clicking login button...');

    // Listen for the login response
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/auth/login') && response.request().method() === 'POST',
      { timeout: 15000 }
    );

    await page.click('button[type="submit"]');

    console.log('⏳ Waiting for login response...');
    const response = await responsePromise;

    console.log('📥 Login response status:', response.status());

    if (response.status() === 200) {
      const responseBody = await response.json();
      console.log('✅ LOGIN SUCCESSFUL!');
      console.log('   User:', responseBody.user?.email);
      console.log('   Role:', responseBody.user?.role);

      // Wait for redirect after successful login
      await page.waitForTimeout(2000);
      console.log('   Redirected to:', page.url());

      // Navigate to seat map config
      console.log('\n📍 Navigating to Seat Map Configuration...');
      await page.goto('http://localhost:4200/owner/seat-map-config', {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      console.log('✅ Seat Map Configuration page loaded!');
      console.log('   Final URL:', page.url());
      console.log('\n🎉 SUCCESS! Browser will stay open for 10 minutes.');
      console.log('   Press Ctrl+C to close.');

      // Keep browser open
      await page.waitForTimeout(600000);

    } else {
      const errorBody = await response.text();
      console.log('❌ LOGIN FAILED!');
      console.log('   Status:', response.status());
      console.log('   Error:', errorBody);

      // Take screenshot
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      await page.screenshot({ path: `login-error-${timestamp}.png`, fullPage: true });

      // Keep browser open for inspection
      console.log('   Browser will stay open for 5 minutes for inspection...');
      await page.waitForTimeout(300000);
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.log('   Current URL:', page.url());

    // Take screenshot
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
