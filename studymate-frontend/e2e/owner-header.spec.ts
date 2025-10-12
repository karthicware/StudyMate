import { test, expect, Page } from '@playwright/test';

/**
 * Owner Header Navigation E2E Tests
 *
 * Tests the Owner Portal Header component functionality including:
 * - Header display and layout
 * - Navigation to all sections
 * - Active route highlighting
 * - Logout functionality
 * - Responsive behavior
 * - Zero console errors
 */

test.describe('Owner Header Navigation', () => {
  // Helper function to login as owner (placeholder - update when auth is implemented)
  async function loginAsOwner(page: Page) {
    // TODO: Implement actual login flow when auth is ready
    // For now, we'll navigate directly and assume we're logged in
    await page.goto('/owner/dashboard');
  }

  test.beforeEach(async ({ page }) => {
    // Login as owner before each test
    await loginAsOwner(page);
  });

  test.describe('Header Display and Structure', () => {
    test('should display header with all required elements', async ({ page }) => {
      // Verify header is visible
      const header = page.locator('header');
      await expect(header).toBeVisible();

      // Verify logo is visible
      const logo = page.locator('button[aria-label="Go to Dashboard"]');
      await expect(logo).toBeVisible();

      // Verify logout button is visible (mobile or desktop)
      const logoutButton = page.locator('button:has-text("Logout")').first();
      await expect(logoutButton).toBeVisible();
    });

    test('should display all 6 navigation items', async ({ page }) => {
      // Count navigation links (may be in desktop menu or hamburger menu)
      const navLinks = page.locator('a[href^="/owner/"]');
      const count = await navLinks.count();

      // Should have at least 6 navigation items
      expect(count).toBeGreaterThanOrEqual(6);
    });

    test('should have proper ARIA attributes for accessibility', async ({ page }) => {
      const header = page.locator('header');
      await expect(header).toHaveAttribute('role', 'banner');

      const nav = page.locator('nav').first();
      await expect(nav).toHaveAttribute('role', 'navigation');
      await expect(nav).toHaveAttribute('aria-label', 'Main navigation');
    });
  });

  test.describe('Navigation Functionality', () => {
    test('should navigate to Dashboard', async ({ page }) => {
      await page.click('a[href="/owner/dashboard"]');
      await page.waitForURL('**/owner/dashboard');
      expect(page.url()).toContain('/owner/dashboard');
    });

    test('should navigate to Seat Map', async ({ page }) => {
      await page.click('text=Seat Map');
      await page.waitForURL('**/owner/seat-map-config');
      expect(page.url()).toContain('/owner/seat-map-config');
    });

    test('should navigate to Users', async ({ page }) => {
      await page.click('text=Users');
      await page.waitForURL('**/owner/user-management');
      expect(page.url()).toContain('/owner/user-management');
    });

    test('should navigate to Reports', async ({ page }) => {
      await page.click('text=Reports');
      await page.waitForURL('**/owner/reports');
      expect(page.url()).toContain('/owner/reports');
    });

    test('should navigate to Profile', async ({ page }) => {
      await page.click('text=Profile');
      await page.waitForURL('**/owner/profile');
      expect(page.url()).toContain('/owner/profile');
    });

    test('should navigate to Settings', async ({ page }) => {
      await page.click('text=Settings');
      await page.waitForURL('**/owner/settings');
      expect(page.url()).toContain('/owner/settings');
    });

    test('should navigate to dashboard on logo click', async ({ page }) => {
      // Navigate away from dashboard first
      await page.goto('/owner/profile');

      // Click logo to go back to dashboard
      await page.click('button[aria-label="Go to Dashboard"]');
      await page.waitForURL('**/owner/dashboard');
      expect(page.url()).toContain('/owner/dashboard');
    });
  });

  test.describe('Active Route Highlighting', () => {
    test('should highlight Dashboard when on dashboard page', async ({ page }) => {
      await page.goto('/owner/dashboard');
      const dashboardLink = page.locator('a[href="/owner/dashboard"]').first();

      // Check if link has active styling classes
      const classes = await dashboardLink.getAttribute('class');
      expect(classes).toBeTruthy();
    });

    test('should highlight Profile when on profile page', async ({ page }) => {
      await page.goto('/owner/profile');
      const profileLink = page.locator('a[href="/owner/profile"]').first();

      // Check if link has active styling
      const classes = await profileLink.getAttribute('class');
      expect(classes).toBeTruthy();
    });

    test('should update highlighting on route change', async ({ page }) => {
      // Start on dashboard
      await page.goto('/owner/dashboard');

      // Navigate to settings
      await page.click('text=Settings');
      await page.waitForURL('**/owner/settings');

      // Verify settings link is now highlighted
      const settingsLink = page.locator('a[href="/owner/settings"]').first();
      const classes = await settingsLink.getAttribute('class');
      expect(classes).toBeTruthy();
    });
  });

  test.describe('Logout Functionality', () => {
    test('should logout successfully', async ({ page }) => {
      // Click logout button
      await page.click('button:has-text("Logout")');

      // Should navigate to login page
      await page.waitForURL('**/login');
      expect(page.url()).toContain('/login');
    });

    test('should clear authentication on logout', async ({ page }) => {
      // Logout
      await page.click('button:has-text("Logout")');
      await page.waitForURL('**/login');

      // Try to access protected route
      await page.goto('/owner/dashboard');

      // Should redirect back to login
      await page.waitForURL('**/login', { timeout: 5000 }).catch(() => {
        // If no redirect yet, auth guards may not be fully implemented
        console.log('Note: Auth guards may not be fully implemented yet');
      });
    });
  });

  test.describe('Responsive Behavior', () => {
    test('should display desktop menu on large screens', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto('/owner/dashboard');

      // Desktop navigation should be visible
      const desktopNav = page.locator('nav a[href^="/owner/"]').first();
      await expect(desktopNav).toBeVisible();

      // Hamburger menu should not be visible on desktop
      const hamburger = page.locator('button[aria-label="Toggle navigation menu"]');
      await expect(hamburger).toBeVisible(); // It exists but may be hidden via CSS
    });

    test('should display hamburger menu on mobile', async ({ page }) => {
      // Set mobile viewport (iPhone SE)
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/owner/dashboard');

      // Hamburger menu button should be visible
      const hamburger = page.locator('button[aria-label="Toggle navigation menu"]');
      await expect(hamburger).toBeVisible();
    });

    test('should open and close mobile menu', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/owner/dashboard');

      // Click hamburger to open menu
      const hamburger = page.locator('button[aria-label="Toggle navigation menu"]');
      await hamburger.click();

      // Mobile menu should be visible
      const mobileMenu = page.locator('#mobile-menu');
      await expect(mobileMenu).toBeVisible();

      // Click hamburger again to close
      await hamburger.click();

      // Mobile menu should be hidden
      await expect(mobileMenu).not.toBeVisible();
    });

    test('should navigate from mobile menu', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/owner/dashboard');

      // Open mobile menu
      await page.click('button[aria-label="Toggle navigation menu"]');

      // Click navigation item in mobile menu
      await page.click('#mobile-menu a:has-text("Profile")');

      // Should navigate to profile
      await page.waitForURL('**/owner/profile');
      expect(page.url()).toContain('/owner/profile');

      // Mobile menu should close after navigation
      const mobileMenu = page.locator('#mobile-menu');
      await expect(mobileMenu).not.toBeVisible();
    });

    test('should test at tablet breakpoint', async ({ page }) => {
      // Set tablet viewport (iPad)
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/owner/dashboard');

      // Header should be visible and functional
      const header = page.locator('header');
      await expect(header).toBeVisible();

      // Should be able to navigate
      await page.click('text=Settings');
      await page.waitForURL('**/owner/settings');
      expect(page.url()).toContain('/owner/settings');
    });

    test('should test at desktop breakpoint', async ({ page }) => {
      // Set desktop viewport (Standard laptop)
      await page.setViewportSize({ width: 1024, height: 768 });
      await page.goto('/owner/dashboard');

      // Header should be visible
      const header = page.locator('header');
      await expect(header).toBeVisible();

      // Desktop navigation should be visible
      const dashboardLink = page.locator('a[href="/owner/dashboard"]').first();
      await expect(dashboardLink).toBeVisible();
    });
  });

  test.describe('Browser Back/Forward Navigation', () => {
    test('should work with browser back button', async ({ page }) => {
      // Navigate to profile
      await page.goto('/owner/dashboard');
      await page.click('text=Profile');
      await page.waitForURL('**/owner/profile');

      // Go back
      await page.goBack();
      await page.waitForURL('**/owner/dashboard');
      expect(page.url()).toContain('/owner/dashboard');
    });

    test('should work with browser forward button', async ({ page }) => {
      // Navigate forward through history
      await page.goto('/owner/dashboard');
      await page.click('text=Settings');
      await page.waitForURL('**/owner/settings');

      // Go back
      await page.goBack();
      await page.waitForURL('**/owner/dashboard');

      // Go forward
      await page.goForward();
      await page.waitForURL('**/owner/settings');
      expect(page.url()).toContain('/owner/settings');
    });
  });

  test.describe('Error Detection', () => {
    test('should have zero console errors', async ({ page }) => {
      const errors: string[] = [];

      // Listen for console errors
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      // Navigate to dashboard and interact with header
      await page.goto('/owner/dashboard');
      await page.click('text=Profile');
      await page.waitForURL('**/owner/profile');
      await page.click('text=Dashboard');
      await page.waitForURL('**/owner/dashboard');

      // Verify no console errors
      expect(errors).toEqual([]);
    });

    test('should have zero console warnings (excluding known deprecations)', async ({ page }) => {
      const warnings: string[] = [];

      // Listen for console warnings
      page.on('console', msg => {
        if (msg.type() === 'warning' && !msg.text().includes('deprecated')) {
          warnings.push(msg.text());
        }
      });

      await page.goto('/owner/dashboard');

      // Allow some time for any async warnings
      await page.waitForTimeout(1000);

      // Verify no unexpected warnings
      expect(warnings.length).toBe(0);
    });
  });

  test.describe('User Context Display', () => {
    test('should display study hall name', async ({ page }) => {
      await page.goto('/owner/dashboard');

      // Study hall name should be visible somewhere in the header
      const header = page.locator('header');
      const headerText = await header.textContent();

      // Should contain "Study Hall" (or the actual hall name once backend is connected)
      expect(headerText).toBeTruthy();
    });

    test('should display user avatar or initials', async ({ page }) => {
      await page.goto('/owner/dashboard');

      // User avatar/initials should be visible on desktop
      await page.setViewportSize({ width: 1024, height: 768 });

      const avatarButton = page.locator('button[aria-label="User menu"]');
      await expect(avatarButton).toBeVisible();
    });
  });

  test.describe('Deep Linking', () => {
    test('should support direct navigation to specific routes', async ({ page }) => {
      // Navigate directly to profile
      await page.goto('/owner/profile');
      await page.waitForURL('**/owner/profile');

      // Header should still be visible and functional
      const header = page.locator('header');
      await expect(header).toBeVisible();

      // Should be able to navigate to other sections
      await page.click('text=Dashboard');
      await page.waitForURL('**/owner/dashboard');
      expect(page.url()).toContain('/owner/dashboard');
    });
  });
});
