import { test, expect } from '@playwright/test';
import { loginAsOwnerAPI } from './utils/auth-helpers';

/**
 * Owner Footer E2E Tests
 *
 * Tests the Owner Portal Footer component functionality including:
 * - Footer display and structure
 * - Footer links (Terms, Privacy, Contact)
 * - Copyright year (dynamic)
 * - Application version display
 * - Sticky footer behavior
 * - Responsive design
 * - Zero console errors
 */

test.describe('Owner Footer', () => {
  test.beforeEach(async ({ page }) => {
    // Login as owner before each test
    const token = await loginAsOwnerAPI(page);
    expect(token).toBeTruthy();

    // Navigate to dashboard after login
    await page.goto('/owner/dashboard');
  });

  test.describe('Footer Display and Structure', () => {
    test('should display footer with all elements', async ({ page }) => {
      // Verify footer is visible
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();

      // Verify footer contains StudyMate branding
      await expect(footer).toContainText('StudyMate');

      // Verify footer contains version information
      await expect(footer).toContainText('Version');

      // Verify footer contains copyright symbol
      await expect(footer).toContainText('©');
    });

    test('should have proper ARIA attributes for accessibility', async ({ page }) => {
      const footer = page.locator('footer');
      await expect(footer).toHaveAttribute('role', 'contentinfo');
    });

    test('should display footer navigation with aria-label', async ({ page }) => {
      const footerNav = page.locator('footer nav');
      await expect(footerNav).toBeVisible();
      await expect(footerNav).toHaveAttribute('aria-label', 'Footer navigation');
    });

    test('should display branding tagline', async ({ page }) => {
      const footer = page.locator('footer');
      await expect(footer).toContainText('Built with');
      await expect(footer).toContainText('for educators');
    });
  });

  test.describe('Footer Links', () => {
    test('should have all 3 footer links', async ({ page }) => {
      const footer = page.locator('footer');

      // Verify Terms of Service link
      const termsLink = footer.locator('a:has-text("Terms of Service")');
      await expect(termsLink).toBeVisible();

      // Verify Privacy Policy link
      const privacyLink = footer.locator('a:has-text("Privacy Policy")');
      await expect(privacyLink).toBeVisible();

      // Verify Contact Support link
      const contactLink = footer.locator('a:has-text("Contact Support")');
      await expect(contactLink).toBeVisible();
    });

    test('should have correct href for Terms of Service', async ({ page }) => {
      const termsLink = page.locator('footer a:has-text("Terms of Service")');
      await expect(termsLink).toHaveAttribute('href', '/terms');
    });

    test('should have correct href for Privacy Policy', async ({ page }) => {
      const privacyLink = page.locator('footer a:has-text("Privacy Policy")');
      await expect(privacyLink).toHaveAttribute('href', '/privacy');
    });

    test('should have target="_blank" on external links', async ({ page }) => {
      // Terms of Service should open in new tab
      const termsLink = page.locator('footer a:has-text("Terms of Service")');
      await expect(termsLink).toHaveAttribute('target', '_blank');

      // Privacy Policy should open in new tab
      const privacyLink = page.locator('footer a:has-text("Privacy Policy")');
      await expect(privacyLink).toHaveAttribute('target', '_blank');
    });

    test('should have rel="noopener noreferrer" on external links', async ({ page }) => {
      // Verify security attributes on external links
      const termsLink = page.locator('footer a:has-text("Terms of Service")');
      await expect(termsLink).toHaveAttribute('rel', 'noopener noreferrer');

      const privacyLink = page.locator('footer a:has-text("Privacy Policy")');
      await expect(privacyLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    test('should NOT have target="_blank" on internal Contact link', async ({ page }) => {
      const contactLink = page.locator('footer a:has-text("Contact Support")');
      await expect(contactLink).not.toHaveAttribute('target', '_blank');
    });

    test('should have hover states on links', async ({ page }) => {
      const termsLink = page.locator('footer a:has-text("Terms of Service")');

      // Hover over link
      await termsLink.hover();

      // Link should have transition classes
      const classes = await termsLink.getAttribute('class');
      expect(classes).toContain('hover:text-primary-600');
      expect(classes).toContain('transition-colors');
    });
  });

  test.describe('Dynamic Content', () => {
    test('should display current year in copyright', async ({ page }) => {
      const currentYear = new Date().getFullYear().toString();
      const footer = page.locator('footer');

      // Verify current year is displayed
      await expect(footer).toContainText(currentYear);
      await expect(footer).toContainText(`© ${currentYear} StudyMate`);
    });

    test('should display application version', async ({ page }) => {
      const footer = page.locator('footer');

      // Verify version is displayed (should be "Version 1.0.0" or similar)
      await expect(footer).toContainText('Version');

      // Get the version text
      const versionText = await footer.textContent();
      expect(versionText).toMatch(/Version \d+\.\d+\.\d+/);
    });
  });

  test.describe('Sticky Footer Behavior', () => {
    test('should stick to bottom with short content', async ({ page }) => {
      // Navigate to dashboard (content may be short on initial load)
      await page.goto('/owner/dashboard');

      // Get footer position
      const footer = page.locator('footer');
      const footerBox = await footer.boundingBox();
      const viewportSize = page.viewportSize();

      // Footer should be visible
      expect(footerBox).toBeTruthy();

      // Footer should be at or near bottom of viewport
      // Allow 20px tolerance for any margins/padding
      if (footerBox && viewportSize) {
        expect(footerBox.y + footerBox.height).toBeGreaterThanOrEqual(
          viewportSize.height - 20
        );
      }
    });

    test('should push below fold with long content', async ({ page }) => {
      // Navigate to a page with potentially more content
      await page.goto('/owner/dashboard');

      const footer = page.locator('footer');

      // Verify footer is still visible (may need to scroll)
      await expect(footer).toBeVisible();

      // Scroll to footer
      await footer.scrollIntoViewIfNeeded();

      // Footer should be visible after scrolling
      await expect(footer).toBeInViewport();
    });

    test('should not overlap with page content', async ({ page }) => {
      // Navigate to dashboard
      await page.goto('/owner/dashboard');

      // Get main content area
      const main = page.locator('main');
      const footer = page.locator('footer');

      // Both should be visible
      await expect(main).toBeVisible();
      await expect(footer).toBeVisible();

      // Get bounding boxes
      const mainBox = await main.boundingBox();
      const footerBox = await footer.boundingBox();

      // Main content should be above footer (no overlap)
      if (mainBox && footerBox) {
        expect(mainBox.y + mainBox.height).toBeLessThanOrEqual(footerBox.y + 5); // 5px tolerance
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile (375px)', async ({ page }) => {
      // Set mobile viewport (iPhone SE)
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/owner/dashboard');

      // Footer should be visible
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();

      // All footer elements should still be visible
      await expect(footer).toContainText('StudyMate');
      await expect(footer).toContainText('Version');

      // Links should be visible
      await expect(footer.locator('a:has-text("Terms of Service")')).toBeVisible();
      await expect(footer.locator('a:has-text("Privacy Policy")')).toBeVisible();
      await expect(footer.locator('a:has-text("Contact Support")')).toBeVisible();
    });

    test('should display correctly on tablet (768px)', async ({ page }) => {
      // Set tablet viewport (iPad)
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/owner/dashboard');

      // Footer should be visible
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();

      // All footer elements should be visible
      await expect(footer).toContainText('StudyMate');
      await expect(footer).toContainText('Version');

      // Footer should have horizontal layout at tablet size
      const footerContainer = footer.locator('.flex');
      await expect(footerContainer).toBeVisible();
    });

    test('should display correctly on desktop (1440px)', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto('/owner/dashboard');

      // Footer should be visible
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();

      // All sections should be visible horizontally
      await expect(footer).toContainText('StudyMate');
      await expect(footer).toContainText('Version');
      await expect(footer).toContainText('Terms of Service');
      await expect(footer).toContainText('Privacy Policy');
      await expect(footer).toContainText('Contact Support');
      await expect(footer).toContainText('Built with');
    });

    test('should maintain readability at all breakpoints', async ({ page }) => {
      const breakpoints = [
        { width: 375, height: 667, name: 'Mobile' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 1024, height: 768, name: 'Desktop' }
      ];

      for (const breakpoint of breakpoints) {
        await page.setViewportSize({
          width: breakpoint.width,
          height: breakpoint.height
        });
        await page.goto('/owner/dashboard');

        const footer = page.locator('footer');

        // Footer should be visible at this breakpoint
        await expect(footer).toBeVisible();

        // Text should be readable (not overlapping or cut off)
        const footerText = await footer.textContent();
        expect(footerText).toBeTruthy();
        expect(footerText).toContain('StudyMate');
      }
    });
  });

  test.describe('Footer on Multiple Pages', () => {
    test('should display footer on dashboard page', async ({ page }) => {
      await page.goto('/owner/dashboard');
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
      await expect(footer).toContainText('StudyMate');
    });

    test('should display footer on profile page', async ({ page }) => {
      await page.goto('/owner/profile');
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
      await expect(footer).toContainText('StudyMate');
    });

    test('should display footer on settings page', async ({ page }) => {
      await page.goto('/owner/settings');
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
      await expect(footer).toContainText('StudyMate');
    });

    test('should persist across navigation', async ({ page }) => {
      // Start on dashboard
      await page.goto('/owner/dashboard');
      let footer = page.locator('footer');
      await expect(footer).toBeVisible();

      // Navigate to profile
      await page.click('text=Profile');
      await page.waitForURL('**/owner/profile');
      footer = page.locator('footer');
      await expect(footer).toBeVisible();

      // Navigate to settings
      await page.click('text=Settings');
      await page.waitForURL('**/owner/settings');
      footer = page.locator('footer');
      await expect(footer).toBeVisible();
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

      // Navigate to dashboard
      await page.goto('/owner/dashboard');

      // Interact with footer links
      const footer = page.locator('footer');
      await footer.scrollIntoViewIfNeeded();

      // Hover over links
      await page.hover('footer a:has-text("Terms of Service")');
      await page.hover('footer a:has-text("Privacy Policy")');
      await page.hover('footer a:has-text("Contact Support")');

      // Allow time for any async errors
      await page.waitForTimeout(500);

      // Verify no console errors
      expect(errors).toEqual([]);
    });

    test('should have zero console warnings (excluding known deprecations)', async ({
      page
    }) => {
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

  test.describe('Footer Styling', () => {
    test('should have proper background color', async ({ page }) => {
      await page.goto('/owner/dashboard');
      const footer = page.locator('footer');

      // Check for background color class
      const classes = await footer.getAttribute('class');
      expect(classes).toContain('bg-gray-100');
    });

    test('should have top border for separation', async ({ page }) => {
      await page.goto('/owner/dashboard');
      const footer = page.locator('footer');

      // Check for border classes
      const classes = await footer.getAttribute('class');
      expect(classes).toContain('border-t');
      expect(classes).toContain('border-gray-300');
    });

    test('should have proper padding', async ({ page }) => {
      await page.goto('/owner/dashboard');
      const footer = page.locator('footer');

      // Check for padding classes
      const classes = await footer.getAttribute('class');
      expect(classes).toContain('py-4');
    });
  });

  test.describe('Content Formatting', () => {
    test('should format copyright with separator', async ({ page }) => {
      await page.goto('/owner/dashboard');
      const footer = page.locator('footer');

      const footerText = await footer.textContent();
      // Should have format: "© 2025 StudyMate | Version 1.0.0"
      expect(footerText).toMatch(/©.*StudyMate.*\|.*Version/);
    });

    test('should have proper text size classes', async ({ page }) => {
      await page.goto('/owner/dashboard');
      const footer = page.locator('footer');

      // Footer text should use text-sm class
      const textElements = footer.locator('.text-sm');
      const count = await textElements.count();
      expect(count).toBeGreaterThan(0);
    });
  });
});
