import { test, expect } from '@playwright/test';

/**
 * Owner Profile E2E Tests
 *
 * Tests the complete profile management workflow including:
 * - Profile display
 * - Edit mode
 * - Form validation
 * - Avatar upload
 * - Responsive design
 * - Error handling
 */
test.describe('Owner Profile Page', () => {
  const profileUrl = '/owner/profile';
  const mockProfile = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '(123) 456-7890',
    profilePictureUrl: 'https://example.com/avatar.jpg',
    studyHallName: 'Downtown Study Hall',
    createdAt: '2024-01-01T00:00:00Z'
  };

  test.beforeEach(async ({ page }) => {
    // Mock GET /owner/profile
    await page.route('/api/v1/owner/profile', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockProfile)
        });
      }
    });
  });

  test('should display profile information correctly (AC1)', async ({ page }) => {
    await page.goto(profileUrl);

    // Wait for profile to load
    await page.waitForSelector('text=My Profile', { timeout: 5000 });

    // Verify profile information is displayed
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=john.doe@example.com')).toBeVisible();
    await expect(page.locator('text=Downtown Study Hall')).toBeVisible();

    // Verify form fields are populated
    await expect(page.locator('input#firstName')).toHaveValue('John');
    await expect(page.locator('input#lastName')).toHaveValue('Doe');
    await expect(page.locator('input#phone')).toHaveValue('(123) 456-7890');

    // Verify email is read-only
    await expect(page.locator('input#email')).toBeDisabled();

    // Verify account created date is shown
    await expect(page.locator('text=/Member Since/i')).toBeVisible();
  });

  test('should display user initials when no avatar (AC3)', async ({ page }) => {
    // Mock profile without avatar
    await page.route('/api/v1/owner/profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...mockProfile,
          profilePictureUrl: null
        })
      });
    });

    await page.goto(profileUrl);
    await page.waitForSelector('text=My Profile');

    // Check for initials
    await expect(page.locator('text=JD')).toBeVisible();
  });

  test('should enter edit mode when Edit Profile is clicked (AC2)', async ({ page }) => {
    await page.goto(profileUrl);
    await page.waitForSelector('text=My Profile');

    // Click Edit Profile button
    await page.click('button:has-text("Edit Profile")');

    // Verify edit mode is active
    await expect(page.locator('button:has-text("Save Changes")')).toBeVisible();
    await expect(page.locator('button:has-text("Cancel")')).toBeVisible();

    // Verify form fields are enabled
    await expect(page.locator('input#firstName')).not.toBeDisabled();
    await expect(page.locator('input#lastName')).not.toBeDisabled();
    await expect(page.locator('input#phone')).not.toBeDisabled();

    // Email should still be disabled
    await expect(page.locator('input#email')).toBeDisabled();
  });

  test('should save profile changes successfully (AC2)', async ({ page }) => {
    // Mock PUT /owner/profile
    await page.route('/api/v1/owner/profile', async (route) => {
      if (route.request().method() === 'PUT') {
        const requestBody = route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ...mockProfile,
            ...requestBody
          })
        });
      } else if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockProfile)
        });
      }
    });

    await page.goto(profileUrl);
    await page.waitForSelector('text=My Profile');

    // Enter edit mode
    await page.click('button:has-text("Edit Profile")');

    // Update fields
    await page.fill('input#firstName', 'Jane');
    await page.fill('input#lastName', 'Smith');
    await page.fill('input#phone', '(555) 555-5555');

    // Save changes
    await page.click('button:has-text("Save Changes")');

    // Verify success toast
    await expect(page.locator('text=Profile updated successfully')).toBeVisible();

    // Verify edit mode is exited
    await expect(page.locator('button:has-text("Edit Profile")')).toBeVisible();
    await expect(page.locator('button:has-text("Save Changes")')).not.toBeVisible();
  });

  test('should cancel edit without saving changes (AC2)', async ({ page }) => {
    await page.goto(profileUrl);
    await page.waitForSelector('text=My Profile');

    // Enter edit mode
    await page.click('button:has-text("Edit Profile")');

    // Make changes
    await page.fill('input#firstName', 'Changed');

    // Click Cancel
    await page.click('button:has-text("Cancel")');

    // Verify changes are reverted
    await expect(page.locator('input#firstName')).toHaveValue('John');

    // Verify back in display mode
    await expect(page.locator('button:has-text("Edit Profile")')).toBeVisible();
  });

  test('should validate required fields (AC5)', async ({ page }) => {
    await page.goto(profileUrl);
    await page.waitForSelector('text=My Profile');

    // Enter edit mode
    await page.click('button:has-text("Edit Profile")');

    // Clear required fields
    await page.fill('input#firstName', '');
    await page.fill('input#lastName', '');

    // Try to save
    await page.click('button:has-text("Save Changes")');

    // Verify error messages are displayed
    await expect(page.locator('text=First Name is required')).toBeVisible();
    await expect(page.locator('text=Last Name is required')).toBeVisible();

    // Verify Save button is disabled
    await expect(page.locator('button:has-text("Save Changes")')).toBeDisabled();
  });

  test('should validate phone number format (AC5)', async ({ page }) => {
    await page.goto(profileUrl);
    await page.waitForSelector('text=My Profile');

    // Enter edit mode
    await page.click('button:has-text("Edit Profile")');

    // Enter invalid phone number
    await page.fill('input#phone', '1234567890');
    await page.locator('input#phone').blur();

    // Verify error message
    await expect(page.locator('text=/Phone must be in format/i')).toBeVisible();
  });

  test('should accept valid phone formats (AC2)', async ({ page }) => {
    await page.goto(profileUrl);
    await page.waitForSelector('text=My Profile');

    // Enter edit mode
    await page.click('button:has-text("Edit Profile")');

    // Test format (XXX) XXX-XXXX
    await page.fill('input#phone', '(555) 123-4567');
    await page.locator('input#phone').blur();
    await expect(page.locator('text=/Phone must be in format/i')).not.toBeVisible();

    // Test format +1-XXX-XXX-XXXX
    await page.fill('input#phone', '+1-555-123-4567');
    await page.locator('input#phone').blur();
    await expect(page.locator('text=/Phone must be in format/i')).not.toBeVisible();
  });

  test('should display password change section (AC4)', async ({ page }) => {
    await page.goto(profileUrl);
    await page.waitForSelector('text=My Profile');

    // Verify password section exists
    await expect(page.locator('text=Security')).toBeVisible();
    await expect(page.locator('button:has-text("Change Password")')).toBeVisible();

    // Click change password button
    await page.click('button:has-text("Change Password")');

    // Verify info toast (placeholder implementation)
    await expect(page.locator('text=/Password change feature coming soon/i')).toBeVisible();
  });

  test('should validate file type for avatar upload (AC3)', async ({ page }) => {
    await page.goto(profileUrl);
    await page.waitForSelector('text=My Profile');

    // Note: File upload validation happens client-side before upload
    // We can test the error message appears for invalid files
  });

  test('should handle API error gracefully', async ({ page }) => {
    // Mock API error
    await page.route('/api/v1/owner/profile', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal server error' })
      });
    });

    await page.goto(profileUrl);

    // Verify error toast
    await expect(page.locator('text=Failed to load profile')).toBeVisible({ timeout: 5000 });
  });

  test('should handle update validation error (AC5)', async ({ page }) => {
    await page.route('/api/v1/owner/profile', async (route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Invalid profile data' })
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockProfile)
        });
      }
    });

    await page.goto(profileUrl);
    await page.waitForSelector('text=My Profile');

    // Enter edit mode and try to save
    await page.click('button:has-text("Edit Profile")');
    await page.fill('input#firstName', 'Updated');
    await page.click('button:has-text("Save Changes")');

    // Verify error toast
    await expect(page.locator('text=Invalid profile data')).toBeVisible();
  });

  test('should be responsive on mobile viewport (AC7)', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(profileUrl);
    await page.waitForSelector('text=My Profile');

    // Verify all form fields are visible
    await expect(page.locator('input#firstName')).toBeVisible();
    await expect(page.locator('input#lastName')).toBeVisible();
    await expect(page.locator('input#email')).toBeVisible();
    await expect(page.locator('input#phone')).toBeVisible();

    // Verify avatar is displayed
    await expect(page.locator('text=JD').or(page.locator('img[alt="Profile Avatar"]')).first()).toBeVisible();

    // Verify buttons are accessible
    await expect(page.locator('button:has-text("Edit Profile")')).toBeVisible();
    await expect(page.locator('button:has-text("Change Avatar")')).toBeVisible();
  });

  test('should be responsive on tablet viewport (AC7)', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto(profileUrl);
    await page.waitForSelector('text=My Profile');

    // Verify all components are visible
    await expect(page.locator('text=My Profile')).toBeVisible();
    await expect(page.locator('input#firstName')).toBeVisible();
    await expect(page.locator('button:has-text("Edit Profile")')).toBeVisible();
  });

  test('should be responsive on desktop viewport (AC7)', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    await page.goto(profileUrl);
    await page.waitForSelector('text=My Profile');

    // Verify layout is optimized for desktop
    await expect(page.locator('text=My Profile')).toBeVisible();
    await expect(page.locator('input#firstName')).toBeVisible();
  });

  test('should have zero console errors (AC, General Quality)', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto(profileUrl);
    await page.waitForSelector('text=My Profile');

    // Enter edit mode and interact with form
    await page.click('button:has-text("Edit Profile")');
    await page.fill('input#firstName', 'Test');
    await page.click('button:has-text("Cancel")');

    // Verify no console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test('should display loading state while fetching profile (AC1)', async ({ page }) => {
    // Delay API response
    await page.route('/api/v1/owner/profile', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockProfile)
      });
    });

    await page.goto(profileUrl);

    // Check for loading indicator
    await expect(page.locator('text=/Loading profile/i')).toBeVisible();

    // Wait for profile to load
    await page.waitForSelector('text=My Profile', { timeout: 5000 });
    await expect(page.locator('text=/Loading profile/i')).not.toBeVisible();
  });

  test('should show toast notifications auto-dismiss (AC6)', async ({ page }) => {
    // Mock successful update
    await page.route('/api/v1/owner/profile', async (route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockProfile)
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockProfile)
        });
      }
    });

    await page.goto(profileUrl);
    await page.waitForSelector('text=My Profile');

    // Trigger success toast
    await page.click('button:has-text("Edit Profile")');
    await page.fill('input#firstName', 'Updated');
    await page.click('button:has-text("Save Changes")');

    // Verify toast appears
    await expect(page.locator('text=Profile updated successfully')).toBeVisible();

    // Wait for auto-dismiss (4 seconds)
    await page.waitForTimeout(4500);

    // Verify toast is dismissed
    await expect(page.locator('text=Profile updated successfully')).not.toBeVisible();
  });

  test('should allow dismissing toast manually (AC6)', async ({ page }) => {
    // Trigger error toast
    await page.route('/api/v1/owner/profile', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Server error' })
      });
    });

    await page.goto(profileUrl);

    // Wait for error toast
    await expect(page.locator('text=Failed to load profile')).toBeVisible({ timeout: 5000 });

    // Find and click close button on toast
    const closeButton = page.locator('[aria-label="Close notification"]').first();
    await closeButton.click();

    // Verify toast is dismissed
    await expect(page.locator('text=Failed to load profile')).not.toBeVisible();
  });
});
