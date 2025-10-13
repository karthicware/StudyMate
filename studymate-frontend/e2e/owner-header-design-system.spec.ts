import { test, expect, Page } from '@playwright/test';

/**
 * Owner Header Design System Alignment Tests (Story 1.15.1)
 *
 * Tests the visual styling and design system compliance of the Owner Portal Header
 * as specified in Section 9 of the Airbnb-inspired design system.
 *
 * Test Categories:
 * - Visual styling verification (colors, borders, shadows)
 * - Typography alignment
 * - Spacing and layout (8-point grid)
 * - Hover and interactive states
 * - Mobile navigation design
 * - Responsive behavior
 * - Accessibility compliance
 */

test.describe('Owner Header - Design System Alignment (Story 1.15.1)', () => {
  // Helper function to login as owner
  async function loginAsOwner(page: Page) {
    await page.goto('/owner/dashboard');
  }

  test.beforeEach(async ({ page }) => {
    await loginAsOwner(page);
  });

  test.describe('AC1: Visual Styling Update', () => {
    test('should have white background instead of blue', async ({ page }) => {
      const header = page.locator('header');

      // Get computed background color
      const bgColor = await header.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );

      // White background should be rgb(255, 255, 255)
      expect(bgColor).toBe('rgb(255, 255, 255)');
    });

    test('should have subtle border at bottom', async ({ page }) => {
      const header = page.locator('header');

      // Check border bottom
      const borderBottom = await header.evaluate(el =>
        window.getComputedStyle(el).borderBottomStyle
      );
      const borderColor = await header.evaluate(el =>
        window.getComputedStyle(el).borderBottomColor
      );

      expect(borderBottom).toBe('solid');
      // border-gray-200 is rgb(229, 231, 235)
      expect(borderColor).toBe('rgb(229, 231, 235)');
    });

    test('should have dark text color', async ({ page }) => {
      const logoButton = page.locator('button[aria-label="Go to Dashboard"]');

      const textColor = await logoButton.evaluate(el =>
        window.getComputedStyle(el).color
      );

      // text-gray-900 should be dark (approximately rgb(17, 24, 39))
      expect(textColor).toContain('rgb(17, 24, 39)');
    });

    test('should not have heavy shadow', async ({ page }) => {
      const header = page.locator('header');

      const boxShadow = await header.evaluate(el =>
        window.getComputedStyle(el).boxShadow
      );

      // Should not have shadow-md or heavy shadows
      // Box shadow should be 'none' or very subtle (Tailwind may add minimal default shadow)
      expect(boxShadow).not.toContain('10px'); // shadow-md would have larger values
      expect(boxShadow).not.toContain('15px'); // Heavy shadows have large values
    });
  });

  test.describe('AC3: Typography Alignment', () => {
    test('should use correct font sizes for navigation links', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });

      const navLink = page.locator('a[href="/owner/dashboard"]').first();

      const fontSize = await navLink.evaluate(el =>
        window.getComputedStyle(el).fontSize
      );
      const fontWeight = await navLink.evaluate(el =>
        window.getComputedStyle(el).fontWeight
      );

      // text-base is 16px
      expect(fontSize).toBe('16px');
      // font-medium is 500
      expect(fontWeight).toBe('500');
    });

    test('should use correct font sizes for user name', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });

      const userName = page.locator('button[aria-label="User menu"] span').first();

      const fontSize = await userName.evaluate(el =>
        window.getComputedStyle(el).fontSize
      );
      const fontWeight = await userName.evaluate(el =>
        window.getComputedStyle(el).fontWeight
      );

      // text-sm is 14px
      expect(fontSize).toBe('14px');
      // font-medium is 500
      expect(fontWeight).toBe('500');
    });

    test('should use correct font size for hall name', async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 768 });

      const hallName = page.locator('header span:has-text("Study Hall")').first();

      const fontSize = await hallName.evaluate(el =>
        window.getComputedStyle(el).fontSize
      );
      const fontWeight = await hallName.evaluate(el =>
        window.getComputedStyle(el).fontWeight
      );

      // text-sm is 14px
      expect(fontSize).toBe('14px');
      // font-normal is 400
      expect(fontWeight).toBe('400');
    });
  });

  test.describe('AC4: Spacing & Layout (8-Point Grid)', () => {
    test('should have correct padding on main container', async ({ page }) => {
      const nav = page.locator('nav[role="navigation"]').first();

      const padding = await nav.evaluate(el =>
        window.getComputedStyle(el).padding
      );

      // p-4 is 16px on all sides
      expect(padding).toBe('16px');
    });

    test('should have consistent gap between navigation items', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });

      const navContainer = page.locator('.lg\\:flex.items-center.gap-4').first();

      const gap = await navContainer.evaluate(el =>
        window.getComputedStyle(el).gap
      );

      // gap-4 is 16px
      expect(gap).toContain('16px');
    });
  });

  test.describe('AC5: Mobile Navigation Redesign', () => {
    test('should have white background in mobile drawer', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Open mobile menu
      await page.click('button[aria-label="Toggle navigation menu"]');

      const mobileMenu = page.locator('#mobile-menu');
      await expect(mobileMenu).toBeVisible();

      const bgColor = await mobileMenu.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );

      // White background
      expect(bgColor).toBe('rgb(255, 255, 255)');
    });

    test('should have backdrop overlay when drawer is open', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Open mobile menu
      await page.click('button[aria-label="Toggle navigation menu"]');

      // Overlay should be visible
      const overlay = page.locator('.fixed.inset-0.bg-black.bg-opacity-50');
      await expect(overlay).toBeVisible();

      const bgColor = await overlay.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );

      // Should have black background with opacity
      expect(bgColor).toContain('rgba(0, 0, 0');
    });

    test('should have smooth transitions on drawer', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const overlay = page.locator('.fixed.inset-0.bg-black.bg-opacity-50');

      // Check if transition classes exist when menu opens
      await page.click('button[aria-label="Toggle navigation menu"]');

      await expect(overlay).toBeVisible();

      // Verify transition duration (should be 300ms based on Section 9)
      const transition = await overlay.evaluate(el =>
        window.getComputedStyle(el).transitionDuration
      );

      expect(transition).toBe('0.3s');
    });

    test('should close drawer when clicking overlay', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Open mobile menu
      await page.click('button[aria-label="Toggle navigation menu"]');

      const mobileMenu = page.locator('#mobile-menu');
      await expect(mobileMenu).toBeVisible();

      // Click overlay to close
      const overlay = page.locator('.fixed.inset-0.bg-black.bg-opacity-50');
      await overlay.click();

      // Mobile menu should close
      await expect(mobileMenu).not.toBeVisible();
    });
  });

  test.describe('AC6: Hover & Interactive States', () => {
    test('should show hover state on navigation links', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });

      const navLink = page.locator('a[href="/owner/dashboard"]').first();

      // Hover over the link
      await navLink.hover();

      // Wait a bit for transition
      await page.waitForTimeout(300);

      // Check background color (should be gray-50)
      const bgColor = await navLink.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );

      // hover:bg-gray-50 is rgb(249, 250, 251)
      expect(bgColor).toBe('rgb(249, 250, 251)');
    });

    test('should have smooth transitions on hover', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });

      const navLink = page.locator('a[href="/owner/dashboard"]').first();

      const transition = await navLink.evaluate(el =>
        window.getComputedStyle(el).transitionProperty
      );
      const transitionDuration = await navLink.evaluate(el =>
        window.getComputedStyle(el).transitionDuration
      );

      // Should have transition-all duration-200
      expect(transition).toBe('all');
      expect(transitionDuration).toBe('0.2s');
    });

    test('should show focus indicators', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });

      const navLink = page.locator('a[href="/owner/profile"]').first();

      // Focus the link using keyboard
      await navLink.focus();

      // Check outline (focus indicator)
      const outline = await navLink.evaluate(el =>
        window.getComputedStyle(el).outlineStyle
      );

      // Should have visible focus indicator
      expect(outline).not.toBe('none');
    });
  });

  test.describe('AC7: Responsive Behavior (Breathing Layout)', () => {
    test('should hide hall name on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Center section with hall name should be hidden on mobile
      const centerHallName = page.locator('.hidden.md\\:block.text-center');

      // Should not be visible
      await expect(centerHallName).not.toBeVisible();
    });

    test('should show hall name on tablet+', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      // Hall name should be visible on tablet
      const centerHallName = page.locator('.hidden.md\\:block.text-center');

      await expect(centerHallName).toBeVisible();
    });

    test('should show desktop menu on large screens', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });

      // Desktop navigation should be visible
      const desktopNav = page.locator('.hidden.lg\\:flex.items-center');

      await expect(desktopNav).toBeVisible();
    });

    test('should show hamburger menu on small screens', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Hamburger button should be visible
      const hamburger = page.locator('button[aria-label="Toggle navigation menu"]');

      await expect(hamburger).toBeVisible();
    });

    test('should maintain avatar visibility on all sizes', async ({ page }) => {
      // Test mobile
      await page.setViewportSize({ width: 375, height: 667 });
      let avatarOrLogout = page.locator('button:has-text("Logout")');
      await expect(avatarOrLogout).toBeVisible();

      // Test tablet
      await page.setViewportSize({ width: 768, height: 1024 });
      const avatar = page.locator('button[aria-label="User menu"]');
      await expect(avatar).toBeVisible();

      // Test desktop
      await page.setViewportSize({ width: 1440, height: 900 });
      await expect(avatar).toBeVisible();
    });
  });

  test.describe('AC8: No Functional Regressions', () => {
    test('should navigate to all routes correctly', async ({ page }) => {
      const routes = [
        '/owner/dashboard',
        '/owner/seat-map-config',
        '/owner/user-management',
        '/owner/reports',
        '/owner/profile',
        '/owner/settings'
      ];

      for (const route of routes) {
        await page.click(`a[href="${route}"]`);
        await page.waitForURL(`**${route}`);
        expect(page.url()).toContain(route);
      }
    });

    test('should open and close user avatar dropdown', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });

      // Click avatar to open dropdown
      await page.click('button[aria-label="User menu"]');

      // Dropdown should be visible
      const dropdown = page.locator('.absolute.right-0.mt-2.w-48');
      await expect(dropdown).toBeVisible();

      // Click avatar again to close
      await page.click('button[aria-label="User menu"]');

      // Dropdown should be hidden
      await expect(dropdown).not.toBeVisible();
    });

    test('should open and close mobile menu', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Open menu
      await page.click('button[aria-label="Toggle navigation menu"]');
      const mobileMenu = page.locator('#mobile-menu');
      await expect(mobileMenu).toBeVisible();

      // Close menu
      await page.click('button[aria-label="Toggle navigation menu"]');
      await expect(mobileMenu).not.toBeVisible();
    });

    test('should logout successfully', async ({ page }) => {
      await page.click('button:has-text("Logout")');
      await page.waitForURL('**/login');
      expect(page.url()).toContain('/login');
    });

    test('should navigate to dashboard on logo click', async ({ page }) => {
      await page.goto('/owner/profile');
      await page.click('button[aria-label="Go to Dashboard"]');
      await page.waitForURL('**/owner/dashboard');
      expect(page.url()).toContain('/owner/dashboard');
    });
  });

  test.describe('Visual Regression - Screenshots', () => {
    test('should match design system styling on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });

      // Take screenshot of header
      const header = page.locator('header');
      await expect(header).toHaveScreenshot('owner-header-desktop.png', {
        maxDiffPixels: 100
      });
    });

    test('should match design system styling on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      const header = page.locator('header');
      await expect(header).toHaveScreenshot('owner-header-tablet.png', {
        maxDiffPixels: 100
      });
    });

    test('should match design system styling on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const header = page.locator('header');
      await expect(header).toHaveScreenshot('owner-header-mobile.png', {
        maxDiffPixels: 100
      });
    });

    test('should match mobile drawer design', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Open mobile menu
      await page.click('button[aria-label="Toggle navigation menu"]');

      // Wait for animation to complete
      await page.waitForTimeout(350);

      // Take screenshot of full page with drawer open
      await expect(page).toHaveScreenshot('owner-header-mobile-drawer.png', {
        maxDiffPixels: 100
      });
    });
  });

  test.describe('Accessibility Compliance', () => {
    test('should tab through all interactive elements', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });

      // Start from top of page
      await page.keyboard.press('Tab');

      // Should be able to tab through logo, nav links, avatar
      const focusedElements = [];
      for (let i = 0; i < 10; i++) {
        const focused = await page.evaluate(() => document.activeElement?.tagName);
        focusedElements.push(focused);
        await page.keyboard.press('Tab');
      }

      // Should have focused on multiple elements
      expect(focusedElements.filter(el => el === 'BUTTON' || el === 'A').length).toBeGreaterThan(0);
    });

    test('should have proper ARIA labels', async ({ page }) => {
      const logoButton = page.locator('button[aria-label="Go to Dashboard"]');
      await expect(logoButton).toHaveAttribute('aria-label', 'Go to Dashboard');

      const hamburger = page.locator('button[aria-label="Toggle navigation menu"]');
      await expect(hamburger).toHaveAttribute('aria-label', 'Toggle navigation menu');

      await page.setViewportSize({ width: 1440, height: 900 });
      const userMenu = page.locator('button[aria-label="User menu"]');
      await expect(userMenu).toHaveAttribute('aria-label', 'User menu');
    });

    test('should have focus indicators visible', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });

      const navLink = page.locator('a[href="/owner/dashboard"]').first();
      await navLink.focus();

      // Check that outline is visible (not 'none')
      const outline = await navLink.evaluate(el =>
        window.getComputedStyle(el).outlineStyle
      );

      expect(outline).not.toBe('none');
    });
  });

  test.describe('Zero Console Errors', () => {
    test('should have no console errors after design updates', async ({ page }) => {
      const errors: string[] = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.goto('/owner/dashboard');

      // Interact with header
      await page.click('text=Profile');
      await page.waitForURL('**/owner/profile');

      await page.click('button[aria-label="Go to Dashboard"]');
      await page.waitForURL('**/owner/dashboard');

      // Test mobile menu
      await page.setViewportSize({ width: 375, height: 667 });
      await page.click('button[aria-label="Toggle navigation menu"]');
      await page.click('.fixed.inset-0.bg-black.bg-opacity-50');

      expect(errors).toEqual([]);
    });

    test('should have no styling-related warnings', async ({ page }) => {
      const warnings: string[] = [];

      page.on('console', msg => {
        if (msg.type() === 'warning' &&
            (msg.text().includes('style') ||
             msg.text().includes('CSS') ||
             msg.text().includes('class'))) {
          warnings.push(msg.text());
        }
      });

      await page.goto('/owner/dashboard');
      await page.waitForTimeout(1000);

      expect(warnings).toEqual([]);
    });
  });
});
