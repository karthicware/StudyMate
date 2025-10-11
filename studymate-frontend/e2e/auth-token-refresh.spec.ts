import { test, expect } from '@playwright/test';

/**
 * E2E Test for Token Refresh Flow
 *
 * This test validates the authentication token refresh mechanism:
 * 1. User logs in and receives a token
 * 2. Token is stored and used for authenticated requests
 * 3. Token can be refreshed via the refresh endpoint
 * 4. New token allows continued authenticated access
 *
 * Note: This test validates the manual refresh flow. The automatic
 * timer-based refresh (5 min before expiry) is covered by unit tests.
 */
test.describe('Auth Token Refresh Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
  });

  test('should successfully refresh token and maintain authentication', async ({ page }) => {
    // Step 1: Navigate to login page
    await page.goto('http://localhost:4200/login');
    await expect(page).toHaveTitle(/StudyMate/);

    // Step 2: Fill in login credentials
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');

    // Step 3: Submit login form
    await page.click('button[type="submit"]');

    // Step 4: Wait for successful login (redirect to dashboard)
    await page.waitForURL('**/dashboard', { timeout: 5000 });

    // Step 5: Verify token is stored in localStorage
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
    expect(token).toContain('.'); // JWT format check (has dots)

    // Step 6: Make an authenticated API call to verify token works
    const profileResponse = await page.evaluate(async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return {
        status: response.status,
        ok: response.ok
      };
    });
    expect(profileResponse.status).toBe(200);
    expect(profileResponse.ok).toBe(true);

    // Step 7: Call token refresh endpoint
    const refreshResponse = await page.evaluate(async () => {
      const oldToken = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${oldToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      if (response.ok) {
        const data = await response.json();
        return {
          status: response.status,
          ok: response.ok,
          hasNewToken: !!data.token,
          newTokenDifferent: data.token !== oldToken
        };
      }
      return {
        status: response.status,
        ok: response.ok,
        hasNewToken: false,
        newTokenDifferent: false
      };
    });

    // Step 8: Verify refresh was successful
    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.ok).toBe(true);
    expect(refreshResponse.hasNewToken).toBe(true);
    expect(refreshResponse.newTokenDifferent).toBe(true);

    // Step 9: Verify new token is stored in localStorage
    const newToken = await page.evaluate(() => localStorage.getItem('token'));
    expect(newToken).toBeTruthy();
    expect(newToken).not.toBe(token); // Should be a different token

    // Step 10: Make another authenticated API call with new token
    const profileResponse2 = await page.evaluate(async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return {
        status: response.status,
        ok: response.ok
      };
    });
    expect(profileResponse2.status).toBe(200);
    expect(profileResponse2.ok).toBe(true);

    // Step 11: Verify logout clears token
    await page.click('button:has-text("Logout")'); // Assuming logout button exists
    await page.waitForTimeout(500);

    const tokenAfterLogout = await page.evaluate(() => localStorage.getItem('token'));
    expect(tokenAfterLogout).toBeNull();
  });

  test('should handle token refresh failure gracefully', async ({ page }) => {
    // Set up an invalid/expired token
    await page.goto('http://localhost:4200/dashboard');
    await page.evaluate(() => {
      localStorage.setItem('token', 'invalid.jwt.token');
    });

    // Try to make an authenticated API call
    await page.goto('http://localhost:4200/dashboard');

    // Should be redirected to login due to invalid token
    await page.waitForURL('**/login', { timeout: 5000 });

    // Verify token was cleared
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
  });

  test('should logout and clear tokens on multiple failed refresh attempts', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:4200/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // Replace token with an expired one
    await page.evaluate(() => {
      // Expired JWT token (exp claim in the past)
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZXhwIjoxMDAwMDAwfQ.signature';
      localStorage.setItem('token', expiredToken);
    });

    // Try to navigate to a protected page
    await page.goto('http://localhost:4200/dashboard');

    // Should be redirected to login after failed refresh
    await page.waitForURL('**/login', { timeout: 5000 });

    // Verify token was cleared
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
  });
});
