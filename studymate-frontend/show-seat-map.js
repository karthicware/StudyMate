const { chromium } = require('@playwright/test');

(async () => {
  console.log('🚀 Launching browser to show Seat Mapping Configuration...');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    console.log('📍 Navigating to Seat Map Config page...');
    await page.goto('http://localhost:4200/owner/seat-map-config', {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    console.log('✅ Page loaded! Browser will stay open for viewing.');
    console.log('   Press Ctrl+C in terminal to close the browser.');

    // Keep the browser open
    await page.waitForTimeout(300000); // 5 minutes

  } catch (error) {
    console.error('❌ Error:', error.message);

    // If there's an auth redirect, try logging in first
    if (page.url().includes('login')) {
      console.log('🔐 Redirected to login page. You need to log in as an owner first.');
      console.log('   Browser will stay open for you to log in manually.');
      await page.waitForTimeout(300000);
    }
  } finally {
    // Don't close automatically - let user view the page
    console.log('Browser session ended.');
  }
})();
