/**
 * Test Credentials for E2E Tests and Manual Verification
 *
 * IMPORTANT: These credentials are for the DEVELOPMENT database only.
 * - Development backend: localhost:8080
 * - Test backend: localhost:8081
 *
 * Usage in Playwright scripts:
 * ```typescript
 * import { TEST_USERS } from './fixtures/test-credentials';
 *
 * await page.fill('input[type="email"]', TEST_USERS.OWNER.email);
 * await page.fill('input[type="password"]', TEST_USERS.OWNER.password);
 * ```
 */

export const TEST_USERS = {
  /**
   * Owner account for testing owner features
   * Created: 2025-10-19
   * Database: studymate (development)
   */
  OWNER: {
    email: 'newowner@studymate.com',
    password: 'Password123',
    role: 'ROLE_OWNER',
    firstName: 'New',
    lastName: 'Owner',
  },

  /**
   * Legacy owner account (from seed data)
   * NOTE: Password hash may be invalid - use OWNER instead
   */
  OWNER_LEGACY: {
    email: 'owner@studymate.com',
    password: 'password', // May not work - hash is placeholder
    role: 'ROLE_OWNER',
  },

  /**
   * Student account for testing student features
   * TODO: Create this account if needed
   */
  STUDENT: {
    email: 'student@studymate.com',
    password: 'Password123',
    role: 'ROLE_STUDENT',
  },
};

/**
 * Login URLs for different environments
 */
export const LOGIN_URLS = {
  DEVELOPMENT: 'http://localhost:4200/auth/login',
  E2E_TEST: 'http://localhost:4200/auth/login', // Same - proxy handles routing
};

/**
 * Helper function to perform login in Playwright scripts
 *
 * @example
 * ```typescript
 * import { loginAsOwner } from './fixtures/test-credentials';
 *
 * const page = await context.newPage();
 * await loginAsOwner(page);
 * // Now logged in and ready to navigate
 * ```
 */
export async function loginAsOwner(page: any) {
  console.log('🔐 Logging in as owner...');

  await page.goto(LOGIN_URLS.DEVELOPMENT, {
    waitUntil: 'networkidle',
    timeout: 30000,
  });

  await page.waitForSelector('input[type="email"]', { state: 'visible' });
  await page.fill('input[type="email"]', TEST_USERS.OWNER.email);
  await page.fill('input[type="password"]', TEST_USERS.OWNER.password);

  console.log(`   Email: ${TEST_USERS.OWNER.email}`);

  await page.click('button[type="submit"]');

  // Wait for redirect away from login page
  await page.waitForURL((url: URL) => !url.pathname.includes('/login'), {
    timeout: 10000,
  });

  console.log('✅ Login successful!');
  console.log(`   Current URL: ${page.url()}`);
}

/**
 * Helper function to perform login and wait for specific response
 * Use this when you need to validate the login response
 */
export async function loginAsOwnerWithValidation(page: any) {
  console.log('🔐 Logging in as owner with response validation...');

  await page.goto(LOGIN_URLS.DEVELOPMENT, {
    waitUntil: 'networkidle',
    timeout: 30000,
  });

  await page.waitForSelector('input[type="email"]', { state: 'visible' });
  await page.fill('input[type="email"]', TEST_USERS.OWNER.email);
  await page.fill('input[type="password"]', TEST_USERS.OWNER.password);

  // Listen for login response
  const responsePromise = page.waitForResponse(
    (response: any) => response.url().includes('/auth/login') && response.request().method() === 'POST',
    { timeout: 15000 }
  );

  await page.click('button[type="submit"]');

  const response = await responsePromise;
  const status = response.status();

  if (status === 200) {
    const responseBody = await response.json();
    console.log('✅ LOGIN SUCCESSFUL!');
    console.log(`   User: ${responseBody.user?.email}`);
    console.log(`   Role: ${responseBody.user?.role}`);

    await page.waitForTimeout(1000);
    console.log(`   Redirected to: ${page.url()}`);

    return responseBody;
  } else {
    const errorBody = await response.text();
    throw new Error(`Login failed with status ${status}: ${errorBody}`);
  }
}

/**
 * Helper to login as student (when student account is created)
 */
export async function loginAsStudent(page: any) {
  console.log('🔐 Logging in as student...');

  await page.goto(LOGIN_URLS.DEVELOPMENT, {
    waitUntil: 'networkidle',
    timeout: 30000,
  });

  await page.waitForSelector('input[type="email"]', { state: 'visible' });
  await page.fill('input[type="email"]', TEST_USERS.STUDENT.email);
  await page.fill('input[type="password"]', TEST_USERS.STUDENT.password);

  await page.click('button[type="submit"]');

  await page.waitForURL((url: URL) => !url.pathname.includes('/login'), {
    timeout: 10000,
  });

  console.log('✅ Login successful as student!');
}
