const { chromium } = require('@playwright/test');

(async () => {
  console.log('🚀 Launching browser with authentication...');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 300
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    // Step 1: Login
    console.log('🔐 Step 1: Logging in as test owner...');
    await page.goto('http://localhost:4200/login', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Fill login form
    console.log('   Filling email: newowner@studymate.com');
    await page.fill('input[type="email"]', 'newowner@studymate.com');

    console.log('   Filling password: Password123');
    await page.fill('input[type="password"]', 'Password123');

    console.log('   Clicking login button...');
    await page.click('button[type="submit"]');

    // Wait for login to complete
    await page.waitForURL((url) => !url.pathname.includes('/login'), {
      timeout: 10000,
    });

    console.log('✅ Successfully logged in!');
    console.log('   Current URL:', page.url());

    // Wait a bit for any redirects
    await page.waitForTimeout(1000);

    // Step 2: Navigate to Seat Map Config
    console.log('\n📍 Step 2: Navigating to Seat Map Configuration page...');
    await page.goto('http://localhost:4200/owner/seat-map-config', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('✅ Page loaded successfully!');
    console.log('   Current URL:', page.url());

    // Wait for seat map elements to load
    await page.waitForTimeout(2000);

    console.log('\n🎉 Seat Mapping Configuration screen is now visible!');
    console.log('   The browser will stay open for viewing.');
    console.log('   Press Ctrl+C in terminal to close the browser.');

    // Keep the browser open for 10 minutes
    await page.waitForTimeout(600000);

  } catch (error) {
    console.error('\n❌ Error occurred:', error.message);
    console.log('   Current URL:', page.url());

    // Take a screenshot on error
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = `error-screenshot-${timestamp}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`   Screenshot saved: ${screenshotPath}`);

    // Keep browser open even on error so user can see what happened
    console.log('   Browser will stay open for 5 minutes for inspection...');
    await page.waitForTimeout(300000);
  } finally {
    console.log('\nClosing browser...');
    await browser.close();
  }
})();
