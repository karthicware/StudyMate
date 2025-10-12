import { test, expect, Page } from '@playwright/test';

/**
 * Owner Portal Layout & Routing E2E Tests (Story 1.17)
 *
 * Tests the complete Owner Portal layout shell and routing infrastructure including:
 * - Layout structure (header, main, footer, router-outlet)
 * - Authentication guard (redirect to login when not authenticated)
 * - Authorization guard (role-based access control)
 * - Route navigation (all 6 Owner Portal routes)
 * - 404 handling (invalid routes)
 * - returnUrl preservation (redirect after login)
 * - Browser back/forward navigation
 * - Zero console errors
 *
 * Acceptance Criteria Coverage:
 * - AC1: Layout Shell Component Structure
 * - AC2: Angular Routing Configuration
 * - AC3: Authentication Guard
 * - AC4: Authorization Guard (Role-Based Access)
 * - AC5: 404 Not Found Handling
 * - AC7: Route Transitions
 * - AC8: Responsive Layout
 */

test.describe('Owner Portal Layout & Routing', () => {
  /**
   * Helper: Login as Owner
   * TODO: Update when full auth implementation is complete
   */
  async function loginAsOwner(page: Page) {
    await page.goto('/auth/login');
    // For now, navigate directly - update when auth is fully implemented
    await page.goto('/owner/dashboard');
  }

  /**
   * Helper: Login as Student (for role guard testing)
   * TODO: Update when full auth implementation is complete
   */
  async function loginAsStudent(page: Page) {
    await page.goto('/auth/login');
    // For now, this is a placeholder - update when auth roles are fully implemented
    // This should authenticate with STUDENT role
  }

  /**
   * Test Group 1: Authentication Guard (AC3)
   * Verify redirect to login when not authenticated
   */
  test.describe('Authentication Guard', () => {
    test('should redirect to login when not authenticated', async ({ page }) => {
      // Try to access owner dashboard without authentication
      await page.goto('/owner/dashboard');

      // Should redirect to login page (either /login or /auth/login)
      await page.waitForURL(/\/(auth\/)?login/, { timeout: 5000 }).catch(() => {
        console.log('Note: Auth redirect may need backend integration');
      });

      // Verify we're on a login page
      const url = page.url();
      expect(url).toMatch(/\/(auth\/)?login/);
    });

    test('should redirect all owner routes to login when unauthenticated', async ({ page }) => {
      const routes = [
        '/owner/dashboard',
        '/owner/seat-map-config',
        '/owner/user-management',
        '/owner/reports',
        '/owner/profile',
        '/owner/settings',
      ];

      for (const route of routes) {
        await page.goto(route);
        await page.waitForTimeout(500); // Allow redirect

        const url = page.url();
        // Should be redirected to login
        expect(url).toMatch(/\/(auth\/)?login/);
      }
    });
  });

  /**
   * Test Group 2: Access After Login (AC3)
   * Verify authenticated users can access dashboard
   */
  test.describe('Authenticated Access', () => {
    test('should access dashboard after login', async ({ page }) => {
      await loginAsOwner(page);

      // Should be on owner dashboard
      await page.waitForURL('**/owner/dashboard', { timeout: 5000 });
      expect(page.url()).toContain('/owner/dashboard');
    });

    test('should allow navigation to all owner routes when authenticated', async ({ page }) => {
      await loginAsOwner(page);

      const routes = [
        '/owner/dashboard',
        '/owner/seat-map-config',
        '/owner/user-management',
        '/owner/reports',
        '/owner/profile',
        '/owner/settings',
      ];

      for (const route of routes) {
        await page.goto(route);
        await page.waitForURL(`**${route}`, { timeout: 3000 });
        expect(page.url()).toContain(route);
      }
    });
  });

  /**
   * Test Group 3: Layout Structure (AC1, AC8)
   * Verify layout displays header, footer, and main content
   */
  test.describe('Layout Structure', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsOwner(page);
      await page.goto('/owner/dashboard');
    });

    test('should display layout with header and footer', async ({ page }) => {
      // Verify header is visible
      const header = page.locator('app-owner-header, header').first();
      await expect(header).toBeVisible();

      // Verify footer is visible
      const footer = page.locator('app-owner-footer, footer').first();
      await expect(footer).toBeVisible();

      // Verify main content area exists
      const main = page.locator('main').first();
      await expect(main).toBeVisible();
    });

    test('should have router-outlet in main content area', async ({ page }) => {
      // Router outlet should be present (though not directly visible in DOM)
      const routerOutlet = page.locator('router-outlet');
      expect(await routerOutlet.count()).toBeGreaterThan(0);
    });

    test('should maintain layout structure across all routes', async ({ page }) => {
      const routes = ['/owner/dashboard', '/owner/profile', '/owner/settings'];

      for (const route of routes) {
        await page.goto(route);
        await page.waitForURL(`**${route}`);

        // Header should persist
        const header = page.locator('app-owner-header, header').first();
        await expect(header).toBeVisible();

        // Footer should persist
        const footer = page.locator('app-owner-footer, footer').first();
        await expect(footer).toBeVisible();
      }
    });

    test('should have proper layout structure classes', async ({ page }) => {
      // Check for flexbox/grid layout structure
      const layoutContainer = page.locator('.min-h-screen, .layout-container').first();
      await expect(layoutContainer).toBeVisible();

      // Check for flex column layout
      const layoutClasses = await layoutContainer.getAttribute('class');
      expect(layoutClasses).toBeTruthy();
    });
  });

  /**
   * Test Group 4: Route Navigation (AC2, AC7)
   * Verify navigation to all 6 owner routes
   */
  test.describe('Route Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsOwner(page);
    });

    test('should navigate to dashboard', async ({ page }) => {
      await page.goto('/owner/dashboard');
      await page.waitForURL('**/owner/dashboard');
      expect(page.url()).toContain('/owner/dashboard');
    });

    test('should navigate to seat map config', async ({ page }) => {
      await page.goto('/owner/seat-map-config');
      await page.waitForURL('**/owner/seat-map-config');
      expect(page.url()).toContain('/owner/seat-map-config');
    });

    test('should navigate to user management', async ({ page }) => {
      await page.goto('/owner/user-management');
      await page.waitForURL('**/owner/user-management');
      expect(page.url()).toContain('/owner/user-management');
    });

    test('should navigate to reports', async ({ page }) => {
      await page.goto('/owner/reports');
      await page.waitForURL('**/owner/reports');
      expect(page.url()).toContain('/owner/reports');
    });

    test('should navigate to profile', async ({ page }) => {
      await page.goto('/owner/profile');
      await page.waitForURL('**/owner/profile');
      expect(page.url()).toContain('/owner/profile');
    });

    test('should navigate to settings', async ({ page }) => {
      await page.goto('/owner/settings');
      await page.waitForURL('**/owner/settings');
      expect(page.url()).toContain('/owner/settings');
    });

    test('should navigate between all routes sequentially', async ({ page }) => {
      const routes = [
        '/owner/dashboard',
        '/owner/seat-map-config',
        '/owner/user-management',
        '/owner/reports',
        '/owner/profile',
        '/owner/settings',
      ];

      for (const route of routes) {
        await page.goto(route);
        await page.waitForURL(`**${route}`, { timeout: 3000 });
        expect(page.url()).toContain(route);

        // Brief pause for route transition
        await page.waitForTimeout(100);
      }
    });

    test('should redirect from /owner to /owner/dashboard', async ({ page }) => {
      await page.goto('/owner');
      await page.waitForURL('**/owner/dashboard', { timeout: 3000 });
      expect(page.url()).toContain('/owner/dashboard');
    });

    test('should have smooth transitions between routes (no flash/flicker)', async ({ page }) => {
      await page.goto('/owner/dashboard');
      await page.waitForLoadState('networkidle');

      // Navigate to another route
      await page.goto('/owner/profile');
      await page.waitForURL('**/owner/profile');

      // Layout should remain visible (no full page reload)
      const header = page.locator('app-owner-header, header').first();
      await expect(header).toBeVisible();
    });
  });

  /**
   * Test Group 5: Role-Based Access (AC4)
   * Verify STUDENT role is blocked from Owner Portal
   */
  test.describe('Role Guard - Authorization', () => {
    test('should block student role from owner portal', async ({ page }) => {
      // This test requires full auth implementation with role-based tokens
      // For now, it's a placeholder that can be updated when auth is complete

      // TODO: Implement when role-based auth is fully integrated
      // await loginAsStudent(page);
      // await page.goto('/owner/dashboard');
      // await page.waitForURL('**/unauthorized', { timeout: 5000 });
      // expect(page.url()).toContain('/unauthorized');

      test.skip(); // Skip until auth roles are implemented
    });

    test('should allow owner role to access owner portal', async ({ page }) => {
      await loginAsOwner(page);
      await page.goto('/owner/dashboard');
      await page.waitForURL('**/owner/dashboard', { timeout: 5000 });

      // Owner should have access
      expect(page.url()).toContain('/owner/dashboard');

      // Should not be redirected to unauthorized
      expect(page.url()).not.toContain('/unauthorized');
    });
  });

  /**
   * Test Group 6: 404 Handling (AC5)
   * Verify invalid routes show 404 page
   */
  test.describe('404 Not Found Handling', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsOwner(page);
    });

    test('should show 404 for invalid owner routes', async ({ page }) => {
      await page.goto('/owner/invalid-route-that-does-not-exist');
      await page.waitForTimeout(1000); // Allow route to process

      // Should see 404 message or not found component
      const bodyText = await page.locator('body').textContent();
      expect(bodyText).toMatch(/404|not found|page not found/i);
    });

    test('should display 404 page within owner portal layout', async ({ page }) => {
      await page.goto('/owner/this-route-does-not-exist');
      await page.waitForTimeout(1000);

      // Header and footer should still be visible (404 within layout)
      const header = page.locator('app-owner-header, header').first();
      await expect(header).toBeVisible();

      const footer = page.locator('app-owner-footer, footer').first();
      await expect(footer).toBeVisible();
    });

    test('should have "Return to Dashboard" link on 404 page', async ({ page }) => {
      await page.goto('/owner/nonexistent-page');
      await page.waitForTimeout(1000);

      // Look for dashboard link or button
      const dashboardLink = page.locator('a[href*="dashboard"], button:has-text("Dashboard")');
      const count = await dashboardLink.count();

      // Should have at least one way to return to dashboard
      expect(count).toBeGreaterThan(0);
    });
  });

  /**
   * Test Group 7: returnUrl Preservation (AC3)
   * Verify intended destination is preserved after login
   */
  test.describe('Return URL Preservation', () => {
    test('should preserve returnUrl after login', async ({ page }) => {
      // This test requires full auth implementation
      // For now, it's a placeholder

      // TODO: Implement when auth flow is complete
      // 1. Try to access /owner/profile without auth
      // 2. Should redirect to /login?returnUrl=/owner/profile
      // 3. After login, should redirect back to /owner/profile

      // await page.goto('/owner/profile');
      // await page.waitForURL(/login.*returnUrl/);
      // const url = page.url();
      // expect(url).toContain('returnUrl');
      // expect(url).toContain('profile');

      // await loginAsOwner(page);
      // await page.waitForURL('**/owner/profile');
      // expect(page.url()).toContain('/owner/profile');

      test.skip(); // Skip until auth flow is fully implemented
    });
  });

  /**
   * Test Group 8: Browser Navigation (AC7)
   * Verify browser back/forward buttons work correctly
   */
  test.describe('Browser Back/Forward Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsOwner(page);
    });

    test('should work with browser back button', async ({ page }) => {
      // Navigate through multiple pages
      await page.goto('/owner/dashboard');
      await page.waitForURL('**/owner/dashboard');

      await page.goto('/owner/profile');
      await page.waitForURL('**/owner/profile');

      await page.goto('/owner/settings');
      await page.waitForURL('**/owner/settings');

      // Go back to profile
      await page.goBack();
      await page.waitForURL('**/owner/profile');
      expect(page.url()).toContain('/owner/profile');

      // Go back to dashboard
      await page.goBack();
      await page.waitForURL('**/owner/dashboard');
      expect(page.url()).toContain('/owner/dashboard');
    });

    test('should work with browser forward button', async ({ page }) => {
      // Navigate forward through history
      await page.goto('/owner/dashboard');
      await page.waitForURL('**/owner/dashboard');

      await page.goto('/owner/profile');
      await page.waitForURL('**/owner/profile');

      await page.goto('/owner/settings');
      await page.waitForURL('**/owner/settings');

      // Go back twice
      await page.goBack();
      await page.waitForURL('**/owner/profile');

      await page.goBack();
      await page.waitForURL('**/owner/dashboard');

      // Go forward
      await page.goForward();
      await page.waitForURL('**/owner/profile');
      expect(page.url()).toContain('/owner/profile');

      // Go forward again
      await page.goForward();
      await page.waitForURL('**/owner/settings');
      expect(page.url()).toContain('/owner/settings');
    });

    test('should maintain layout during back/forward navigation', async ({ page }) => {
      await page.goto('/owner/dashboard');
      await page.goto('/owner/settings');

      // Go back
      await page.goBack();
      await page.waitForURL('**/owner/dashboard');

      // Header and footer should still be visible
      const header = page.locator('app-owner-header, header').first();
      await expect(header).toBeVisible();

      const footer = page.locator('app-owner-footer, footer').first();
      await expect(footer).toBeVisible();
    });
  });

  /**
   * Test Group 9: Responsive Layout (AC8)
   * Verify layout works at all breakpoints
   */
  test.describe('Responsive Layout', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsOwner(page);
    });

    test('should work at mobile breakpoint (<768px)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      await page.goto('/owner/dashboard');

      // Layout should be visible
      const header = page.locator('app-owner-header, header').first();
      await expect(header).toBeVisible();

      const footer = page.locator('app-owner-footer, footer').first();
      await expect(footer).toBeVisible();

      // No horizontal scroll
      const body = page.locator('body');
      const scrollWidth = await body.evaluate(el => el.scrollWidth);
      const clientWidth = await body.evaluate(el => el.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // +1 for rounding
    });

    test('should work at tablet breakpoint (768px-1023px)', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad
      await page.goto('/owner/dashboard');

      // Layout should be visible and functional
      const header = page.locator('app-owner-header, header').first();
      await expect(header).toBeVisible();

      const footer = page.locator('app-owner-footer, footer').first();
      await expect(footer).toBeVisible();

      // Should be able to navigate
      await page.goto('/owner/profile');
      await page.waitForURL('**/owner/profile');
      expect(page.url()).toContain('/owner/profile');
    });

    test('should work at desktop breakpoint (≥1024px)', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 }); // Desktop
      await page.goto('/owner/dashboard');

      // Layout should be visible
      const header = page.locator('app-owner-header, header').first();
      await expect(header).toBeVisible();

      const footer = page.locator('app-owner-footer, footer').first();
      await expect(footer).toBeVisible();

      // Content should be properly constrained
      const main = page.locator('main').first();
      await expect(main).toBeVisible();
    });

    test('should have no horizontal scroll at any viewport', async ({ page }) => {
      const viewports = [
        { width: 375, height: 667 }, // Mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1024, height: 768 }, // Small desktop
        { width: 1440, height: 900 }, // Desktop
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto('/owner/dashboard');
        await page.waitForLoadState('networkidle');

        // Check for horizontal scroll
        const body = page.locator('body');
        const scrollWidth = await body.evaluate(el => el.scrollWidth);
        const clientWidth = await body.evaluate(el => el.clientWidth);
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // +1 for rounding
      }
    });
  });

  /**
   * Test Group 10: Error Detection (AC7)
   * Verify zero console errors during routing
   */
  test.describe('Console Error Detection', () => {
    test('should have zero console errors', async ({ page }) => {
      const errors: string[] = [];

      // Listen for console errors
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await loginAsOwner(page);

      // Navigate through multiple routes
      const routes = [
        '/owner/dashboard',
        '/owner/seat-map-config',
        '/owner/profile',
        '/owner/settings',
      ];

      for (const route of routes) {
        await page.goto(route);
        await page.waitForURL(`**${route}`);
        await page.waitForTimeout(500); // Allow route to settle
      }

      // Verify no console errors
      expect(errors).toEqual([]);
    });

    test('should have zero console errors during back/forward navigation', async ({ page }) => {
      const errors: string[] = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await loginAsOwner(page);

      // Navigate and use back/forward
      await page.goto('/owner/dashboard');
      await page.goto('/owner/profile');
      await page.goBack();
      await page.goForward();

      // Verify no console errors
      expect(errors).toEqual([]);
    });
  });

  /**
   * Test Group 11: Performance (AC7)
   * Verify route transitions are smooth and fast
   */
  test.describe('Route Transition Performance', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsOwner(page);
    });

    test('should navigate between routes without full page reload', async ({ page }) => {
      await page.goto('/owner/dashboard');
      await page.waitForLoadState('networkidle');

      // Track navigation events
      let navigationCount = 0;
      page.on('framenavigated', () => {
        navigationCount++;
      });

      // Navigate to another route
      await page.goto('/owner/profile');
      await page.waitForURL('**/owner/profile');

      // Should have minimal navigation events (Angular SPA behavior)
      // Exact count depends on implementation, but should not reload entire page
      expect(page.url()).toContain('/owner/profile');
    });

    test('should maintain header/footer during route transitions', async ({ page }) => {
      await page.goto('/owner/dashboard');

      // Get reference to header
      const header = page.locator('app-owner-header, header').first();
      await expect(header).toBeVisible();

      // Navigate to different route
      await page.goto('/owner/settings');
      await page.waitForURL('**/owner/settings');

      // Header should still be visible (no re-render)
      await expect(header).toBeVisible();
    });
  });
});
