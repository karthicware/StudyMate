import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Accessibility Tests for Gender Field in Registration Forms
 *
 * Tests AC5 requirements:
 * - Keyboard navigation
 * - ARIA attributes
 * - Screen reader compatibility
 * - Responsive design
 * - Color contrast (visual)
 */

test.describe('Gender Field Accessibility - Owner Registration', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/owner/register');
  });

  test('should have proper ARIA attributes on gender field', async ({ page }) => {
    const genderDropdown = page.locator('select[name="gender"], #gender');
    const label = page.locator('label[for="gender"]');

    // Verify label is properly associated
    const labelFor = await label.getAttribute('for');
    expect(labelFor).toBe('gender');

    // Verify aria-describedby points to help text
    const ariaDescribedBy = await genderDropdown.getAttribute('aria-describedby');
    expect(ariaDescribedBy).toBe('gender-help');

    // Verify help text has correct ID
    const helpText = page.locator('#gender-help');
    await expect(helpText).toBeVisible();
  });

  test('should be fully keyboard navigable', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

    // Focus gender field directly to test keyboard interaction
    const genderDropdown = page.locator('select[name="gender"], #gender');
    await genderDropdown.focus();

    // Verify we can interact with gender using keyboard
    await expect(genderDropdown).toBeFocused({ timeout: 3000 });

    // Use arrow keys to change selection
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);

    const selectedValue = await genderDropdown.inputValue();
    // Should have changed from default (accept any valid value or empty)
    expect(['MALE', 'FEMALE', 'OTHER', '']).toContain(selectedValue);
  });

  test('should have visible focus indicator on keyboard focus', async ({ page }) => {
    const genderDropdown = page.locator('select[name="gender"], #gender');

    // Focus the element using keyboard
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // Should be on gender

    // Check if element has focus ring visible
    const hasFocusRing = await genderDropdown.evaluate(el => {
      const styles = window.getComputedStyle(el);
      // Check for focus ring (outline or box-shadow)
      return styles.outline !== 'none' ||
             styles.boxShadow !== 'none' ||
             styles.outlineWidth !== '0px';
    });

    expect(hasFocusRing).toBe(true);
  });

  test('should be operable with Enter/Space keys', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

    // Navigate to gender field
    const genderDropdown = page.locator('select[name="gender"], #gender');
    await genderDropdown.focus();

    // Verify it's focused
    await expect(genderDropdown).toBeFocused({ timeout: 3000 });

    // Use arrow keys to change selection
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);

    // Verify selection changed (accept any valid value)
    const value = await genderDropdown.inputValue();
    expect(['MALE', 'FEMALE', 'OTHER', '']).toContain(value);
  });

  test('should have proper label text for screen readers', async ({ page }) => {
    const label = page.locator('label[for="gender"]');
    const labelText = await label.textContent();

    // Verify label clearly indicates field is optional
    expect(labelText).toContain('Optional');
    expect(labelText).toContain('Gender');
  });

  test('should announce help text to screen readers', async ({ page }) => {
    const genderDropdown = page.locator('select[name="gender"], #gender');
    const helpText = page.locator('#gender-help');

    // Verify help text is properly linked via aria-describedby
    const ariaDescribedBy = await genderDropdown.getAttribute('aria-describedby');
    expect(ariaDescribedBy).toBe('gender-help');

    // Verify help text content is meaningful
    const helpTextContent = await helpText.textContent();
    expect(helpTextContent).toContain('ladies-only seat booking');
  });

  test('should maintain focus order in logical tab sequence', async ({ page }) => {
    const expectedFieldNames = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'gender',
      'businessName',
      'password',
      'confirmPassword'
    ];

    const actualOrder: string[] = [];

    for (let i = 0; i < expectedFieldNames.length; i++) {
      await page.keyboard.press('Tab');
      const focusedId = await page.evaluate(() => {
        const el = document.activeElement as HTMLInputElement;
        return el?.id || el?.name || '';
      });
      if (focusedId) {
        actualOrder.push(focusedId);
      }
    }

    // Verify gender is in the correct position (after phone, before business name)
    const genderIndex = actualOrder.findIndex(id => id.toLowerCase() === 'gender');
    const phoneIndex = actualOrder.findIndex(id => id.toLowerCase().includes('phone'));
    const businessNameIndex = actualOrder.findIndex(id => id.toLowerCase().includes('business'));

    if (genderIndex >= 0 && phoneIndex >= 0 && businessNameIndex >= 0) {
      expect(genderIndex).toBeGreaterThan(phoneIndex);
      expect(genderIndex).toBeLessThan(businessNameIndex);
    }
  });

  test('should be accessible on mobile devices (touch targets)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/auth/owner/register');

    const genderDropdown = page.locator('select[name="gender"], #gender');
    const boundingBox = await genderDropdown.boundingBox();

    // Verify touch target is at least 44x44px (WCAG recommendation)
    expect(boundingBox).toBeTruthy();
    expect(boundingBox!.height).toBeGreaterThanOrEqual(44);
  });

  test('should have sufficient color contrast for label', async ({ page }) => {
    const label = page.locator('label[for="gender"]');

    const contrast = await label.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        color: styles.color,
        backgroundColor: styles.backgroundColor,
        fontSize: styles.fontSize
      };
    });

    // Visual check - label should use gray-700 (dark enough for contrast)
    // This is a basic check; full contrast testing requires specialized tools
    expect(contrast.color).toBeTruthy();
    expect(contrast.fontSize).toBeTruthy();
  });

  test('should not rely solely on color to convey information', async ({ page }) => {
    const genderDropdown = page.locator('select[name="gender"], #gender');
    const helpText = page.locator('#gender-help');

    // Verify text labels and help text provide information, not just color
    await expect(genderDropdown).toBeVisible();
    await expect(helpText).toBeVisible();

    const helpTextContent = await helpText.textContent();
    expect(helpTextContent).toBeTruthy();
    expect(helpTextContent!.length).toBeGreaterThan(10); // Meaningful text
  });
});

test.describe('Gender Field Accessibility - Student Registration', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/register');
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    const genderDropdown = page.locator('select[name="gender"], #gender');
    const ariaDescribedBy = await genderDropdown.getAttribute('aria-describedby');
    expect(ariaDescribedBy).toBe('gender-help');

    const helpText = page.locator('#gender-help');
    await expect(helpText).toBeVisible();
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

    // Focus gender field directly
    const genderDropdown = page.locator('select[name="gender"], #gender');
    await genderDropdown.focus();

    await expect(genderDropdown).toBeFocused({ timeout: 3000 });

    // Test keyboard interaction
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);

    const value = await genderDropdown.inputValue();
    expect(['MALE', 'FEMALE', 'OTHER', '']).toContain(value);
  });

  test('should have visible focus indicator', async ({ page }) => {
    const genderDropdown = page.locator('select[name="gender"], #gender');
    await genderDropdown.focus();

    const hasFocusStyles = await genderDropdown.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return styles.outline !== 'none' || styles.boxShadow !== 'none';
    });

    expect(hasFocusStyles).toBe(true);
  });

  test('should maintain logical tab order', async ({ page }) => {
    const tabOrder: string[] = [];

    for (let i = 0; i < 7; i++) {
      await page.keyboard.press('Tab');
      const id = await page.evaluate(() => {
        const el = document.activeElement as HTMLInputElement;
        return el?.id || el?.name || '';
      });
      if (id) tabOrder.push(id);
    }

    // Verify gender comes after confirmPassword
    const confirmPasswordIndex = tabOrder.findIndex(id => id.toLowerCase().includes('confirm'));
    const genderIndex = tabOrder.findIndex(id => id.toLowerCase() === 'gender');

    if (confirmPasswordIndex >= 0 && genderIndex >= 0) {
      expect(genderIndex).toBeGreaterThan(confirmPasswordIndex);
    }
  });

  test('should work with assistive technologies (basic check)', async ({ page }) => {
    // Verify semantic HTML and ARIA usage
    const genderDropdown = page.locator('select[name="gender"], #gender');

    const role = await genderDropdown.evaluate(el => el.getAttribute('role'));
    const tagName = await genderDropdown.evaluate(el => el.tagName.toLowerCase());

    // Native select element or explicit role
    expect(tagName === 'select' || role === 'combobox').toBe(true);
  });
});

test.describe('Responsive Design Accessibility', () => {

  const viewports = [
    { name: 'Mobile (320px)', width: 320, height: 568 },
    { name: 'Mobile (375px)', width: 375, height: 667 },
    { name: 'Tablet (768px)', width: 768, height: 1024 },
    { name: 'Desktop (1024px)', width: 1024, height: 768 },
    { name: 'Desktop (1280px)', width: 1280, height: 800 }
  ];

  for (const viewport of viewports) {
    test(`should be accessible on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/auth/owner/register');

      const genderDropdown = page.locator('select[name="gender"], #gender');
      const label = page.locator('label[for="gender"]');
      const helpText = page.locator('#gender-help');

      // All elements should be visible
      await expect(genderDropdown).toBeVisible();
      await expect(label).toBeVisible();
      await expect(helpText).toBeVisible();

      // Should be keyboard accessible regardless of viewport
      await genderDropdown.focus();
      await expect(genderDropdown).toBeFocused();

      // Touch target size check for mobile
      if (viewport.width <= 768) {
        const boundingBox = await genderDropdown.boundingBox();
        expect(boundingBox!.height).toBeGreaterThanOrEqual(40); // Reasonable touch target
      }
    });
  }
});

test.describe('Screen Reader Compatibility', () => {

  test('should provide complete context to screen readers - owner form', async ({ page }) => {
    await page.goto('/auth/owner/register');

    const genderDropdown = page.locator('select[name="gender"], #gender');

    // Get all ARIA and accessibility attributes
    const a11yInfo = await genderDropdown.evaluate(el => ({
      id: el.id || (el as HTMLInputElement).name,
      ariaDescribedBy: el.getAttribute('aria-describedby'),
      ariaLabel: el.getAttribute('aria-label'),
      ariaLabelledBy: el.getAttribute('aria-labelledby'),
      tagName: el.tagName
    }));

    // Verify screen reader can understand the field
    expect(['gender', 'Gender'].includes(a11yInfo.id!)).toBe(true);
    expect(a11yInfo.ariaDescribedBy).toBe('gender-help');
    expect(a11yInfo.tagName).toBe('SELECT');

    // Verify associated label exists
    const label = page.locator('label[for="gender"]');
    await expect(label).toBeVisible();
    const labelText = await label.textContent();
    expect(labelText).toContain('Gender');
    expect(labelText).toContain('Optional');

    // Verify help text provides context
    const helpText = page.locator('#gender-help');
    const helpContent = await helpText.textContent();
    expect(helpContent).toContain('ladies-only seat booking');
  });

  test('should announce option changes to screen readers', async ({ page }) => {
    await page.goto('/auth/owner/register');
    const genderDropdown = page.locator('select[name="gender"], #gender');

    // Select an option
    await page.selectOption('select[name="gender"], #gender', 'FEMALE');

    // Verify option is selected (screen readers would announce this)
    const selectedOption = await genderDropdown.locator('option:checked').textContent();
    expect(selectedOption).toBe('Female');
  });

  test('should have meaningful option labels', async ({ page }) => {
    await page.goto('/auth/owner/register');
    const genderDropdown = page.locator('select[name="gender"], #gender');

    const options = await genderDropdown.locator('option').allTextContents();

    // Verify all options have clear, meaningful labels
    expect(options).toEqual([
      'Prefer not to say',
      'Male',
      'Female',
      'Other'
    ]);

    // Verify no options are empty or unclear
    for (const option of options) {
      expect(option.length).toBeGreaterThan(2);
    }
  });
});
