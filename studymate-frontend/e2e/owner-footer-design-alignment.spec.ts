import { test, expect } from '@playwright/test';

/**
 * Story 1.16.1: Owner Footer - Design System Alignment Tests
 *
 * Tests validate Section 9 design system compliance:
 * - Visual styling (colors, borders, padding)
 * - Multi-column grid layout responsiveness
 * - Navigation column structure and content
 * - Typography and spacing
 * - Hover and interactive states
 * - Responsive behavior (breathing layout)
 * - Legal and branding bar
 * - No functional regressions
 */

test.describe('Owner Footer - Design System Alignment (Story 1.16.1)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to owner portal page with footer
    await page.goto('http://localhost:4200/owner/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test.describe('AC1: Visual Styling Update', () => {
    test('should have white background (bg-white)', async ({ page }) => {
      const footer = page.locator('footer[role="contentinfo"]');
      await expect(footer).toBeVisible();

      const backgroundColor = await footer.evaluate((el) =>
        window.getComputedStyle(el).backgroundColor
      );
      // bg-white = rgb(255, 255, 255)
      expect(backgroundColor).toBe('rgb(255, 255, 255)');
    });

    test('should have subtle top border (border-t border-gray-200)', async ({ page }) => {
      const footer = page.locator('footer[role="contentinfo"]');

      const borderTopWidth = await footer.evaluate((el) =>
        window.getComputedStyle(el).borderTopWidth
      );
      const borderTopColor = await footer.evaluate((el) =>
        window.getComputedStyle(el).borderTopColor
      );

      expect(borderTopWidth).toBe('1px');
      // border-gray-200 = rgb(229, 231, 235)
      expect(borderTopColor).toBe('rgb(229, 231, 235)');
    });

    test('should have correct padding (pt-12 pb-8)', async ({ page }) => {
      const footer = page.locator('footer[role="contentinfo"]');

      const paddingTop = await footer.evaluate((el) =>
        window.getComputedStyle(el).paddingTop
      );
      const paddingBottom = await footer.evaluate((el) =>
        window.getComputedStyle(el).paddingBottom
      );

      // pt-12 = 48px (3rem), pb-8 = 32px (2rem)
      expect(paddingTop).toBe('48px');
      expect(paddingBottom).toBe('32px');
    });

    test('should have text-gray-600 for links', async ({ page }) => {
      const firstLink = page.locator('footer nav ul li a').first();
      await expect(firstLink).toBeVisible();

      const color = await firstLink.evaluate((el) =>
        window.getComputedStyle(el).color
      );
      // text-gray-600 = rgb(75, 85, 99)
      expect(color).toBe('rgb(75, 85, 99)');
    });

    test('should have text-gray-900 for headings', async ({ page }) => {
      const firstHeading = page.locator('footer h3').first();
      await expect(firstHeading).toBeVisible();

      const color = await firstHeading.evaluate((el) =>
        window.getComputedStyle(el).color
      );
      // text-gray-900 = rgb(17, 24, 39)
      expect(color).toBe('rgb(17, 24, 39)');
    });
  });

  test.describe('AC2: Multi-Column Grid Layout', () => {
    test('should display 4 columns on desktop (≥1024px)', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });

      const navGrid = page.locator('footer nav[aria-label="Footer navigation"]');
      await expect(navGrid).toBeVisible();

      const columns = page.locator('footer nav > div');
      const columnCount = await columns.count();

      expect(columnCount).toBe(4);
    });

    test('should display 2 columns on tablet (768-1023px)', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      const navGrid = page.locator('footer nav[aria-label="Footer navigation"]');
      await expect(navGrid).toBeVisible();

      // Verify grid-cols-2 is active
      const gridTemplateColumns = await navGrid.evaluate((el) =>
        window.getComputedStyle(el).gridTemplateColumns
      );

      // Should have 2 columns (e.g., "repeat(2, minmax(0, 1fr))")
      const columnCount = gridTemplateColumns.split(' ').length;
      expect(columnCount).toBe(2);
    });

    test('should display 1 column on mobile (<768px)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const navGrid = page.locator('footer nav[aria-label="Footer navigation"]');
      await expect(navGrid).toBeVisible();

      // Verify grid-cols-1 is active
      const gridTemplateColumns = await navGrid.evaluate((el) =>
        window.getComputedStyle(el).gridTemplateColumns
      );

      // Should have 1 column (e.g., "minmax(0, 1fr)")
      const columnCount = gridTemplateColumns.split(' ').length;
      expect(columnCount).toBe(1);
    });
  });

  test.describe('AC3: Navigation Column Structure', () => {
    test('should include "Owner Resources" column with 4 links', async ({ page }) => {
      const ownerResourcesHeading = page.locator('footer h3', {
        hasText: 'Owner Resources',
      });
      await expect(ownerResourcesHeading).toBeVisible();

      const ownerResourcesColumn = ownerResourcesHeading.locator('..');
      const links = ownerResourcesColumn.locator('ul li a');

      await expect(links).toHaveCount(4);
      await expect(links.nth(0)).toContainText('Dashboard');
      await expect(links.nth(1)).toContainText('Reports');
      await expect(links.nth(2)).toContainText('Settings');
      await expect(links.nth(3)).toContainText('Profile');
    });

    test('should include "Support" column with 3 links', async ({ page }) => {
      const supportHeading = page.locator('footer h3', { hasText: 'Support' });
      await expect(supportHeading).toBeVisible();

      const supportColumn = supportHeading.locator('..');
      const links = supportColumn.locator('ul li a');

      await expect(links).toHaveCount(3);
      await expect(links.nth(0)).toContainText('Help Center');
      await expect(links.nth(1)).toContainText('Contact Support');
      await expect(links.nth(2)).toContainText('FAQ');
    });

    test('should include "About" column with Terms, Privacy, and Version', async ({
      page,
    }) => {
      const aboutHeading = page.locator('footer h3', { hasText: 'About' });
      await expect(aboutHeading).toBeVisible();

      const aboutColumn = aboutHeading.locator('..');
      const links = aboutColumn.locator('ul li a');

      await expect(links).toHaveCount(3);
      await expect(links.nth(0)).toContainText('Terms of Service');
      await expect(links.nth(1)).toContainText('Privacy Policy');
      await expect(links.nth(2)).toContainText('Version');
    });

    test('should include "Legal" column with compliance links', async ({ page }) => {
      const legalHeading = page.locator('footer h3', { hasText: 'Legal' });
      await expect(legalHeading).toBeVisible();

      const legalColumn = legalHeading.locator('..');
      const links = legalColumn.locator('ul li a');

      await expect(links).toHaveCount(3);
      await expect(links.nth(0)).toContainText('Accessibility');
      await expect(links.nth(1)).toContainText('Cookie Policy');
      await expect(links.nth(2)).toContainText('Sitemap');
    });
  });

  test.describe('AC4: Typography & Spacing', () => {
    test('should have correct heading typography (text-sm font-bold text-gray-900 mb-4)', async ({
      page,
    }) => {
      const heading = page.locator('footer h3').first();
      await expect(heading).toBeVisible();

      const fontSize = await heading.evaluate((el) =>
        window.getComputedStyle(el).fontSize
      );
      const fontWeight = await heading.evaluate((el) =>
        window.getComputedStyle(el).fontWeight
      );
      const marginBottom = await heading.evaluate((el) =>
        window.getComputedStyle(el).marginBottom
      );

      // text-sm = 14px (0.875rem), font-bold = 700, mb-4 = 16px (1rem)
      expect(fontSize).toBe('14px');
      expect(fontWeight).toBe('700');
      expect(marginBottom).toBe('16px');
    });

    test('should have correct link typography (text-sm text-gray-600)', async ({
      page,
    }) => {
      const link = page.locator('footer nav ul li a').first();
      await expect(link).toBeVisible();

      const fontSize = await link.evaluate((el) =>
        window.getComputedStyle(el).fontSize
      );

      // text-sm = 14px (0.875rem)
      expect(fontSize).toBe('14px');
    });

    test('should have correct link spacing (space-y-3)', async ({ page }) => {
      const linkList = page.locator('footer ul').first();
      await expect(linkList).toBeVisible();

      // space-y-3 applies gap between children
      const listItems = linkList.locator('li');
      const count = await listItems.count();

      if (count > 1) {
        const firstItem = listItems.nth(0);
        const secondItem = listItems.nth(1);

        const firstBottom = await firstItem.evaluate((el) =>
          el.getBoundingClientRect().bottom
        );
        const secondTop = await secondItem.evaluate((el) =>
          el.getBoundingClientRect().top
        );

        // space-y-3 = 12px gap (0.75rem)
        const gap = secondTop - firstBottom;
        expect(gap).toBeCloseTo(12, 1); // Allow 1px tolerance
      }
    });
  });

  test.describe('AC5: Hover & Interactive States', () => {
    test('should show underline on link hover', async ({ page }) => {
      const firstLink = page.locator('footer nav ul li a').first();
      await expect(firstLink).toBeVisible();

      // Check text-decoration before hover
      const textDecorationBefore = await firstLink.evaluate((el) =>
        window.getComputedStyle(el).textDecoration
      );
      expect(textDecorationBefore).toContain('none');

      // Hover and check text-decoration
      await firstLink.hover();
      await page.waitForTimeout(300); // Wait for transition

      const textDecorationAfter = await firstLink.evaluate((el) =>
        window.getComputedStyle(el).textDecoration
      );
      expect(textDecorationAfter).toContain('underline');
    });

    test('should have pointer cursor on links', async ({ page }) => {
      const firstLink = page.locator('footer nav ul li a').first();
      await expect(firstLink).toBeVisible();

      const cursor = await firstLink.evaluate((el) =>
        window.getComputedStyle(el).cursor
      );
      expect(cursor).toBe('pointer');
    });

    test('should have smooth transitions (transition-all duration-200)', async ({
      page,
    }) => {
      const firstLink = page.locator('footer nav ul li a').first();
      await expect(firstLink).toBeVisible();

      const transition = await firstLink.evaluate((el) =>
        window.getComputedStyle(el).transition
      );

      // Should contain "all" and "200ms" or "0.2s"
      expect(transition).toMatch(/all/);
      expect(transition).toMatch(/(200ms|0\.2s)/);
    });
  });

  test.describe('AC6: Responsive Behavior (Breathing Layout)', () => {
    test('should maintain stable spacing across breakpoints', async ({ page }) => {
      const viewports = [
        { width: 1920, height: 1080, name: 'Desktop' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 375, height: 667, name: 'Mobile' },
      ];

      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(300); // Wait for layout shift

        const footer = page.locator('footer[role="contentinfo"]');
        await expect(footer).toBeVisible();

        // Verify footer is not cut off or overflowing
        const footerBox = await footer.boundingBox();
        expect(footerBox).toBeTruthy();
        expect(footerBox!.width).toBeLessThanOrEqual(viewport.width);
      }
    });

    test('should adapt grid layout at each breakpoint', async ({ page }) => {
      // Desktop: 4 columns
      await page.setViewportSize({ width: 1920, height: 1080 });
      let columns = page.locator('footer nav > div');
      await expect(columns.first()).toBeVisible();
      expect(await columns.count()).toBe(4);

      // Tablet: 2 columns
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(300);
      await expect(columns.first()).toBeVisible();

      // Mobile: 1 column (stacked)
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(300);
      await expect(columns.first()).toBeVisible();
    });
  });

  test.describe('AC7: Legal & Branding Bar', () => {
    test('should display copyright with current year', async ({ page }) => {
      const currentYear = new Date().getFullYear();
      const copyrightText = page.locator('footer span[aria-label="Copyright information"]');

      await expect(copyrightText).toBeVisible();
      await expect(copyrightText).toContainText(`© ${currentYear} StudyMate`);
    });

    test('should display app version from environment', async ({ page }) => {
      const versionText = page.locator('footer span[aria-label="Application version"]');

      await expect(versionText).toBeVisible();
      await expect(versionText).toContainText('Version');
    });

    test('should display branding tagline', async ({ page }) => {
      const brandingText = page.locator('footer', {
        hasText: 'Built with',
      });

      await expect(brandingText).toBeVisible();
      await expect(brandingText).toContainText('for educators');
    });

    test('should be responsive (column on mobile, row on desktop)', async ({ page }) => {
      // Desktop: flex-row
      await page.setViewportSize({ width: 1920, height: 1080 });
      const legalBar = page.locator('footer > div > div:last-child > div');
      await expect(legalBar).toBeVisible();

      let flexDirection = await legalBar.evaluate((el) =>
        window.getComputedStyle(el).flexDirection
      );
      expect(flexDirection).toBe('row');

      // Mobile: flex-col
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(300);

      flexDirection = await legalBar.evaluate((el) =>
        window.getComputedStyle(el).flexDirection
      );
      expect(flexDirection).toBe('column');
    });
  });

  test.describe('AC8: No Functional Regressions', () => {
    test('should navigate correctly when clicking internal links', async ({ page }) => {
      const dashboardLink = page.locator('footer a', { hasText: 'Dashboard' });
      await expect(dashboardLink).toBeVisible();

      // Click and verify navigation
      await dashboardLink.click();
      await page.waitForLoadState('networkidle');

      // Should navigate to /owner/dashboard
      expect(page.url()).toContain('/owner/dashboard');
    });

    test('should open external links in new tab', async ({ page, context }) => {
      const termsLink = page.locator('footer a', { hasText: 'Terms of Service' });
      await expect(termsLink).toBeVisible();

      // Verify link has target="_blank" and rel="noopener noreferrer"
      const target = await termsLink.getAttribute('target');
      const rel = await termsLink.getAttribute('rel');

      expect(target).toBe('_blank');
      expect(rel).toBe('noopener noreferrer');
    });

    test('should have zero browser console errors', async ({ page }) => {
      const consoleErrors: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.reload();
      await page.waitForLoadState('networkidle');

      expect(consoleErrors).toHaveLength(0);
    });

    test('should have zero browser console warnings', async ({ page }) => {
      const consoleWarnings: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'warning') {
          consoleWarnings.push(msg.text());
        }
      });

      await page.reload();
      await page.waitForLoadState('networkidle');

      expect(consoleWarnings).toHaveLength(0);
    });
  });

  test.describe('Visual Regression Tests', () => {
    test('should match desktop design (1920x1080)', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      const footer = page.locator('footer[role="contentinfo"]');
      await expect(footer).toBeVisible();

      await expect(footer).toHaveScreenshot('owner-footer-desktop.png', {
        fullPage: false,
      });
    });

    test('should match tablet design (768x1024)', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      const footer = page.locator('footer[role="contentinfo"]');
      await expect(footer).toBeVisible();

      await expect(footer).toHaveScreenshot('owner-footer-tablet.png', {
        fullPage: false,
      });
    });

    test('should match mobile design (375x667)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      const footer = page.locator('footer[role="contentinfo"]');
      await expect(footer).toBeVisible();

      await expect(footer).toHaveScreenshot('owner-footer-mobile.png', {
        fullPage: false,
      });
    });
  });
});
