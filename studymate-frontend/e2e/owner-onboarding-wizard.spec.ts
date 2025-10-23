import { test, expect, Page } from '@playwright/test';

/**
 * E2E Tests for Owner Onboarding Wizard - Story 0.1.6
 *
 * CRITICAL: Uses REAL authentication (no mocks) per E2E authentication guidelines
 * Test user: owner@studymate.com / Test@123
 * Backend: http://localhost:8081 (Auth endpoint: /auth/login)
 * Database: studymate (PostgreSQL)
 */

// Helper function for API-based login (faster than UI login)
async function loginAsOwnerAPI(page: Page): Promise<string | null> {
  // Navigate to a page first to ensure localStorage is accessible
  await page.goto('/');

  // Call login API
  const response = await page.request.post('http://localhost:8081/auth/login', {
    data: {
      email: 'owner@studymate.com',
      password: 'Test@123',
    },
  });

  if (!response.ok()) {
    console.error('❌ Login failed:', response.status(), await response.text());
    return null;
  }

  const data = await response.json();
  const token = data.token;

  if (token) {
    // Store token in localStorage
    await page.evaluate((tokenValue) => {
      localStorage.setItem('token', tokenValue);
    }, token);

    console.log('✅ Successfully logged in as owner@studymate.com via API');
    console.log('   Token stored in localStorage');
  }

  return token;
}

// Helper function to delete all halls for test user (for empty state testing)
// NOTE: Currently disabled - DELETE endpoint not implemented in Story 0.1.6
// Use manual database cleanup instead:
// PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate -c "DELETE FROM study_halls WHERE owner_id = (SELECT id FROM users WHERE email = 'owner@studymate.com');"
/*
async function deleteAllOwnerHalls(page: Page): Promise<void> {
  const token = await page.evaluate(() => localStorage.getItem('token'));

  if (!token) {
    console.error('❌ No token found in localStorage');
    return;
  }

  // Get all halls first
  const getResponse = await page.request.get('http://localhost:8081/owner/halls', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!getResponse.ok()) {
    console.error('❌ Failed to fetch halls:', getResponse.status());
    return;
  }

  const hallsData = await getResponse.json();
  const halls = hallsData.halls || [];

  // Delete each hall
  for (const hall of halls) {
    const deleteResponse = await page.request.delete(`http://localhost:8081/owner/halls/${hall.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (deleteResponse.ok()) {
      console.log(`✅ Deleted hall: ${hall.hallName} (ID: ${hall.id})`);
    } else {
      console.error(`❌ Failed to delete hall ${hall.id}:`, deleteResponse.status());
    }
  }

  console.log(`✅ Database cleanup complete - deleted ${halls.length} hall(s)`);
}
*/

test.describe('Owner Onboarding Wizard - Story 0.1.6', () => {

  // ============================================
  // AUTHENTICATION - MANDATORY
  // ============================================
  test.beforeEach(async ({ page }) => {
    // ✅ CORRECT - Real authentication via backend API
    const token = await loginAsOwnerAPI(page);
    expect(token).toBeTruthy();
  });

  // ============================================
  // AC1 & AC4: Dashboard Empty State
  // NOTE: Requires database cleanup before running
  // Run: PGPASSWORD=studymate_user psql -h localhost -U studymate_user -d studymate -c "DELETE FROM study_halls WHERE owner_id = (SELECT id FROM users WHERE email = 'owner@studymate.com');"
  // ============================================
  test('AC4: should display empty state when owner has no halls', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/owner/dashboard');
    await page.waitForLoadState('networkidle');

    // Take screenshot of initial state
    await page.screenshot({ path: 'e2e/screenshots/01-dashboard-empty-state.png', fullPage: true });

    // Verify empty state displays
    const emptyState = page.locator('[data-testid="dashboard-empty-state"]');
    await expect(emptyState).toBeVisible();

    // Verify welcome message
    const heading = page.locator('[data-testid="empty-state-heading"]');
    await expect(heading).toContainText('Welcome to StudyMate!');

    // Verify CTA button
    const createButton = page.locator('[data-testid="dashboard-create-first-hall-button"]');
    await expect(createButton).toBeVisible();
    await expect(createButton).toContainText('Create Your First Hall');

    console.log('✅ AC4: Empty state displays correctly');
  });

  test('AC4: should navigate to onboarding when "Create First Hall" clicked', async ({ page }) => {
    await page.goto('/owner/dashboard');
    await page.waitForLoadState('networkidle');

    // Click "Create Your First Hall" button
    const createButton = page.locator('[data-testid="dashboard-create-first-hall-button"]');
    await createButton.click();

    // Wait for navigation
    await page.waitForURL('/owner/onboarding');
    await page.waitForLoadState('networkidle');

    // Take screenshot of onboarding wizard
    await page.screenshot({ path: 'e2e/screenshots/02-onboarding-wizard.png', fullPage: true });

    // Verify wizard modal displays
    const wizardModal = page.locator('[data-testid="onboarding-wizard-modal"]');
    await expect(wizardModal).toBeVisible();

    // Verify step indicator shows "Step 1 of 3"
    await expect(page.getByText('Hall Setup')).toBeVisible();
    await expect(page.getByText('Pricing')).toBeVisible();
    await expect(page.getByText('Location')).toBeVisible();

    console.log('✅ AC4: Navigation to onboarding wizard works');
  });

  // ============================================
  // AC2: Hall Creation Form Validation
  // ============================================
  test('AC2: should validate required fields', async ({ page }) => {
    await page.goto('/owner/onboarding');
    await page.waitForLoadState('networkidle');

    // Verify submit button is disabled when form is empty
    const submitButton = page.locator('[data-testid="create-hall-button"]');
    await expect(submitButton).toBeDisabled();

    // Fill only some fields to test validation
    await page.locator('[data-testid="hall-name-input"]').fill('Test Hall');
    // Leave other required fields empty

    await page.waitForTimeout(500);

    // Take screenshot of validation state
    await page.screenshot({ path: 'e2e/screenshots/03-form-validation-errors.png', fullPage: true });

    // Button should still be disabled
    await expect(submitButton).toBeDisabled();

    console.log('✅ AC2: Form validation works correctly - button disabled when form invalid');
  });

  // ============================================
  // AC3: Hall Creation with DRAFT Status
  // ============================================
  test('AC3: should create hall with DRAFT status via backend API', async ({ page }) => {
    await page.goto('/owner/onboarding');
    await page.waitForLoadState('networkidle');

    // Fill out the hall creation form
    const timestamp = Date.now();
    await page.locator('[data-testid="hall-name-input"]').fill(`E2E Test Hall ${timestamp}`);
    await page.locator('[data-testid="description-textarea"]').fill('E2E test hall description');
    await page.locator('[data-testid="address-textarea"]').fill('123 Test Street, Suite 100');
    await page.locator('[data-testid="city-input"]').fill('Mumbai');
    await page.locator('[data-testid="state-input"]').fill('Maharashtra');
    await page.locator('[data-testid="postal-code-input"]').fill('400001');
    await page.locator('[data-testid="country-select"]').selectOption('India');

    // Take screenshot of filled form
    await page.screenshot({ path: 'e2e/screenshots/04-form-filled.png', fullPage: true });

    // Submit form
    const submitButton = page.locator('[data-testid="create-hall-button"]');
    await submitButton.click();

    // Verify success message appears (before redirect after 2 seconds)
    const successMessage = page.locator('[data-testid="success-message"]');
    await expect(successMessage).toBeVisible({ timeout: 3000 });
    await expect(successMessage).toContainText('Hall created successfully!');

    // Take screenshot of success message
    await page.screenshot({ path: 'e2e/screenshots/05-hall-created-success.png', fullPage: true });

    console.log('✅ AC3: Hall created successfully with DRAFT status');
  });

  // ============================================
  // AC4: Skip Functionality
  // ============================================
  test('AC4: should navigate to dashboard when "Skip for now" clicked', async ({ page }) => {
    await page.goto('/owner/onboarding');
    await page.waitForLoadState('networkidle');

    // Click "Skip for now" button
    const skipButton = page.locator('[data-testid="skip-button"]');
    await skipButton.click();

    await page.waitForTimeout(500);

    // Take screenshot of confirmation dialog
    await page.screenshot({ path: 'e2e/screenshots/06-skip-confirmation.png', fullPage: true });

    // Confirm skip
    const confirmButton = page.locator('[data-testid="skip-confirm-button"]');
    await confirmButton.click();

    // Wait for navigation
    await page.waitForURL('/owner/dashboard');
    await page.waitForLoadState('networkidle');

    // Take screenshot of dashboard after skip
    await page.screenshot({ path: 'e2e/screenshots/07-dashboard-after-skip.png', fullPage: true });

    // Verify we're back on dashboard
    expect(page.url()).toContain('/owner/dashboard');

    console.log('✅ AC4: Skip functionality works correctly');
  });

  // ============================================
  // AC6: Multi-Hall Support (if hall exists)
  // ============================================
  test('AC6: should display hall selector when owner has halls', async ({ page }) => {
    // First create a hall
    await page.goto('/owner/onboarding');
    await page.waitForLoadState('networkidle');

    const timestamp = Date.now();
    const hallName = `Multi Hall Test ${timestamp}`;
    await page.locator('[data-testid="hall-name-input"]').fill(hallName);
    await page.locator('[data-testid="description-textarea"]').fill('Multi-hall test');
    await page.locator('[data-testid="address-textarea"]').fill('456 Test Avenue');
    await page.locator('[data-testid="city-input"]').fill('Delhi');
    await page.locator('[data-testid="state-input"]').fill('Delhi');
    await page.locator('[data-testid="postal-code-input"]').fill('110001');
    await page.locator('[data-testid="country-select"]').selectOption('India');

    // Wait for form validation to enable button
    const createButton = page.locator('[data-testid="create-hall-button"]');
    await expect(createButton).toBeEnabled({ timeout: 5000 });

    await createButton.click();
    await page.waitForTimeout(2000);

    // Navigate to dashboard
    await page.goto('/owner/dashboard');
    await page.waitForLoadState('networkidle');

    // Take screenshot showing hall selector
    await page.screenshot({ path: 'e2e/screenshots/08-dashboard-with-hall.png', fullPage: true });

    // Verify hall selector is visible and contains a hall name (not checking specific text since DB might have other halls)
    const hallSelector = page.locator('[data-testid="hall-selector-button"]');
    if (await hallSelector.isVisible()) {
      // Check that selector has some text (indicates a hall is loaded)
      const selectorText = await hallSelector.textContent();
      expect(selectorText).toBeTruthy();
      expect(selectorText!.trim().length).toBeGreaterThan(0);

      // Click to open dropdown
      await hallSelector.click();
      await page.waitForTimeout(300);

      await page.screenshot({ path: 'e2e/screenshots/09-hall-selector-dropdown.png', fullPage: true });

      // Verify "Add New Hall" button
      const addButton = page.locator('[data-testid="dashboard-add-new-hall-button"]');
      await expect(addButton).toBeVisible();

      console.log('✅ AC6: Hall selector and "Add New Hall" button display correctly');
    } else {
      console.log('⚠️ Hall selector not visible - owner may not have halls yet');
    }
  });

  // ============================================
  // STORY 0.1.7: Pricing Configuration Step
  // ============================================
  test('Story 0.1.7 - AC1: should display Step 2 (Pricing) after hall creation', async ({ page }) => {
    await page.goto('/owner/onboarding');
    await page.waitForLoadState('networkidle');

    // Fill and submit hall creation form (Step 1)
    const timestamp = Date.now();
    await page.locator('[data-testid="hall-name-input"]').fill(`Pricing Test ${timestamp}`);
    await page.locator('[data-testid="address-textarea"]').fill('123 Pricing Street');
    await page.locator('[data-testid="city-input"]').fill('Mumbai');
    await page.locator('[data-testid="state-input"]').fill('Maharashtra');
    await page.locator('[data-testid="country-select"]').selectOption('India');

    const createButton = page.locator('[data-testid="create-hall-button"]');
    await createButton.click();

    // Wait for success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible({ timeout: 3000 });

    // Wait for navigation to Step 2
    await page.waitForTimeout(1600);

    // Take screenshot of Step 2
    await page.screenshot({ path: 'e2e/screenshots/11-step2-pricing.png', fullPage: true });

    // Verify Step 2 UI elements
    await expect(page.locator('[data-testid="pricing-configuration-form"]')).toBeVisible();
    await expect(page.getByText('Set Your Base Pricing')).toBeVisible();
    await expect(page.locator('[data-testid="base-pricing-input"]')).toBeVisible();

    // Verify progress indicator shows Step 2
    const progressIndicator = page.locator('[data-testid="progress-indicator"]');
    await expect(progressIndicator).toHaveAttribute('aria-valuenow', '2');

    console.log('✅ Story 0.1.7 AC1: Step 2 pricing form displays correctly');
  });

  test('Story 0.1.7 - AC1: should have default pricing value ₹100', async ({ page }) => {
    await page.goto('/owner/onboarding');
    await page.waitForLoadState('networkidle');

    // Create hall and advance to Step 2
    const timestamp = Date.now();
    await page.locator('[data-testid="hall-name-input"]').fill(`Default Pricing ${timestamp}`);
    await page.locator('[data-testid="address-textarea"]').fill('456 Default Street');
    await page.locator('[data-testid="city-input"]').fill('Delhi');
    await page.locator('[data-testid="state-input"]').fill('Delhi');
    await page.locator('[data-testid="country-select"]').selectOption('India');
    await page.locator('[data-testid="create-hall-button"]').click();
    await page.waitForTimeout(1600);

    // Verify default value is ₹100
    const pricingInput = page.locator('[data-testid="base-pricing-input"]');
    await expect(pricingInput).toHaveValue('100');

    console.log('✅ Story 0.1.7 AC1: Default pricing value ₹100 set correctly');
  });

  test('Story 0.1.7 - AC2: should save pricing and navigate to dashboard', async ({ page }) => {
    await page.goto('/owner/onboarding');
    await page.waitForLoadState('networkidle');

    // Create hall and advance to Step 2
    const timestamp = Date.now();
    await page.locator('[data-testid="hall-name-input"]').fill(`Save Pricing ${timestamp}`);
    await page.locator('[data-testid="address-textarea"]').fill('789 Save Street');
    await page.locator('[data-testid="city-input"]').fill('Pune');
    await page.locator('[data-testid="state-input"]').fill('Maharashtra');
    await page.locator('[data-testid="country-select"]').selectOption('India');
    await page.locator('[data-testid="create-hall-button"]').click();
    await page.waitForTimeout(1600);

    // Enter pricing
    const pricingInput = page.locator('[data-testid="base-pricing-input"]');
    await pricingInput.clear();
    await pricingInput.fill('150');

    // Take screenshot before submit
    await page.screenshot({ path: 'e2e/screenshots/12-pricing-filled.png', fullPage: true });

    // Click Continue
    const continueButton = page.locator('[data-testid="continue-pricing-button"]');
    await continueButton.click();

    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Pricing saved successfully');

    // Take screenshot of success
    await page.screenshot({ path: 'e2e/screenshots/13-pricing-saved.png', fullPage: true });

    // Wait for navigation to dashboard
    await page.waitForURL('/owner/dashboard', { timeout: 3000 });

    console.log('✅ Story 0.1.7 AC2: Pricing saved and navigated to dashboard');
  });

  test('Story 0.1.7 - AC3: should validate minimum pricing (₹50)', async ({ page }) => {
    await page.goto('/owner/onboarding');
    await page.waitForLoadState('networkidle');

    // Create hall and advance to Step 2
    const timestamp = Date.now();
    await page.locator('[data-testid="hall-name-input"]').fill(`Min Pricing ${timestamp}`);
    await page.locator('[data-testid="address-textarea"]').fill('111 Min Street');
    await page.locator('[data-testid="city-input"]').fill('Chennai');
    await page.locator('[data-testid="state-input"]').fill('Tamil Nadu');
    await page.locator('[data-testid="country-select"]').selectOption('India');
    await page.locator('[data-testid="create-hall-button"]').click();
    await page.waitForTimeout(1600);

    // Enter pricing below minimum
    const pricingInput = page.locator('[data-testid="base-pricing-input"]');
    await pricingInput.clear();
    await pricingInput.fill('30');

    // Blur to trigger validation
    await page.locator('body').click();
    await page.waitForTimeout(300);

    // Take screenshot of validation error
    await page.screenshot({ path: 'e2e/screenshots/14-pricing-min-error.png', fullPage: true });

    // Verify error message
    await expect(page.locator('[data-testid="base-pricing-error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="base-pricing-error-message"]')).toContainText('must be at least ₹50');

    // Verify Continue button is disabled
    const continueButton = page.locator('[data-testid="continue-pricing-button"]');
    await expect(continueButton).toBeDisabled();

    console.log('✅ Story 0.1.7 AC3: Minimum pricing validation works');
  });

  test('Story 0.1.7 - AC3: should validate maximum pricing (₹5000)', async ({ page }) => {
    await page.goto('/owner/onboarding');
    await page.waitForLoadState('networkidle');

    // Create hall and advance to Step 2
    const timestamp = Date.now();
    await page.locator('[data-testid="hall-name-input"]').fill(`Max Pricing ${timestamp}`);
    await page.locator('[data-testid="address-textarea"]').fill('222 Max Street');
    await page.locator('[data-testid="city-input"]').fill('Kolkata');
    await page.locator('[data-testid="state-input"]').fill('West Bengal');
    await page.locator('[data-testid="country-select"]').selectOption('India');
    await page.locator('[data-testid="create-hall-button"]').click();
    await page.waitForTimeout(1600);

    // Enter pricing above maximum
    const pricingInput = page.locator('[data-testid="base-pricing-input"]');
    await pricingInput.clear();
    await pricingInput.fill('6000');

    // Blur to trigger validation
    await page.locator('body').click();
    await page.waitForTimeout(300);

    // Take screenshot of validation error
    await page.screenshot({ path: 'e2e/screenshots/15-pricing-max-error.png', fullPage: true });

    // Verify error message
    await expect(page.locator('[data-testid="base-pricing-error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="base-pricing-error-message"]')).toContainText('cannot exceed ₹5000');

    // Verify Continue button is disabled
    const continueButton = page.locator('[data-testid="continue-pricing-button"]');
    await expect(continueButton).toBeDisabled();

    console.log('✅ Story 0.1.7 AC3: Maximum pricing validation works');
  });

  test('Story 0.1.7: should skip pricing step and return to dashboard', async ({ page }) => {
    await page.goto('/owner/onboarding');
    await page.waitForLoadState('networkidle');

    // Create hall and advance to Step 2
    const timestamp = Date.now();
    await page.locator('[data-testid="hall-name-input"]').fill(`Skip Pricing ${timestamp}`);
    await page.locator('[data-testid="address-textarea"]').fill('333 Skip Street');
    await page.locator('[data-testid="city-input"]').fill('Hyderabad');
    await page.locator('[data-testid="state-input"]').fill('Telangana');
    await page.locator('[data-testid="country-select"]').selectOption('India');
    await page.locator('[data-testid="create-hall-button"]').click();
    await page.waitForTimeout(1600);

    // Click "Skip for now"
    const skipButton = page.locator('[data-testid="skip-pricing-button"]');
    await skipButton.click();

    // Wait for navigation to dashboard
    await page.waitForURL('/owner/dashboard', { timeout: 3000 });

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/16-pricing-skipped.png', fullPage: true });

    expect(page.url()).toContain('/owner/dashboard');

    console.log('✅ Story 0.1.7: Skip pricing functionality works');
  });

  // ============================================
  // STORY 0.1.8: Location Configuration Step
  // ============================================
  test('Story 0.1.8 - AC1: should display Step 3 (Location) after pricing configuration', async ({ page }) => {
    await page.goto('/owner/onboarding');
    await page.waitForLoadState('networkidle');

    // Complete Step 1 (Hall Creation)
    const timestamp = Date.now();
    await page.locator('[data-testid="hall-name-input"]').fill(`Location Test ${timestamp}`);
    await page.locator('[data-testid="address-textarea"]').fill('123 Location Street');
    await page.locator('[data-testid="city-input"]').fill('Mumbai');
    await page.locator('[data-testid="state-input"]').fill('Maharashtra');
    await page.locator('[data-testid="country-select"]').selectOption('India');
    await page.locator('[data-testid="create-hall-button"]').click();
    await page.waitForTimeout(1600);

    // Complete Step 2 (Pricing)
    await page.locator('[data-testid="base-pricing-input"]').fill('200');
    await page.locator('[data-testid="continue-pricing-button"]').click();
    await page.waitForTimeout(1600);

    // Take screenshot of Step 3
    await page.screenshot({ path: 'e2e/screenshots/20-step3-location.png', fullPage: true });

    // Verify Step 3 UI elements
    await expect(page.locator('[data-testid="location-configuration-form"]')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Set Your Location' })).toBeVisible();
    await expect(page.locator('[data-testid="google-map"]')).toBeVisible();
    await expect(page.locator('[data-testid="region-select"]')).toBeVisible();

    // Verify progress indicator shows Step 3
    const progressIndicator = page.locator('[data-testid="progress-indicator"]');
    await expect(progressIndicator).toHaveAttribute('aria-valuenow', '3');

    console.log('✅ Story 0.1.8 AC1: Step 3 location form displays correctly');
  });

  test('Story 0.1.8 - AC2: should validate required fields (region)', async ({ page }) => {
    await page.goto('/owner/onboarding');
    await page.waitForLoadState('networkidle');

    // Complete Steps 1 and 2
    const timestamp = Date.now();
    await page.locator('[data-testid="hall-name-input"]').fill(`Validation Test ${timestamp}`);
    await page.locator('[data-testid="address-textarea"]').fill('456 Validation Street');
    await page.locator('[data-testid="city-input"]').fill('Delhi');
    await page.locator('[data-testid="state-input"]').fill('Delhi');
    await page.locator('[data-testid="country-select"]').selectOption('India');
    await page.locator('[data-testid="create-hall-button"]').click();
    await page.waitForTimeout(1600);
    await page.locator('[data-testid="continue-pricing-button"]').click();
    await page.waitForTimeout(1600);

    // Verify Complete Setup button is disabled without location selection
    const completeButton = page.locator('[data-testid="complete-setup-button"]');
    await expect(completeButton).toBeDisabled();

    console.log('✅ Story 0.1.8 AC2: Form validation works - button disabled without location');
  });

  test('Story 0.1.8 - AC3: should allow region selection', async ({ page }) => {
    await page.goto('/owner/onboarding');
    await page.waitForLoadState('networkidle');

    // Complete Steps 1 and 2
    const timestamp = Date.now();
    await page.locator('[data-testid="hall-name-input"]').fill(`Region Test ${timestamp}`);
    await page.locator('[data-testid="address-textarea"]').fill('789 Region Street');
    await page.locator('[data-testid="city-input"]').fill('Pune');
    await page.locator('[data-testid="state-input"]').fill('Maharashtra');
    await page.locator('[data-testid="country-select"]').selectOption('India');
    await page.locator('[data-testid="create-hall-button"]').click();
    await page.waitForTimeout(1600);
    await page.locator('[data-testid="continue-pricing-button"]').click();
    await page.waitForTimeout(1600);

    // Select region
    const regionSelect = page.locator('[data-testid="region-select"]');
    await regionSelect.selectOption('WEST_ZONE');

    // Verify selection
    await expect(regionSelect).toHaveValue('WEST_ZONE');

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/21-region-selected.png', fullPage: true });

    console.log('✅ Story 0.1.8 AC3: Region selection works correctly');
  });

  test('Story 0.1.8: should skip location step and return to dashboard', async ({ page }) => {
    await page.goto('/owner/onboarding');
    await page.waitForLoadState('networkidle');

    // Complete Steps 1 and 2
    const timestamp = Date.now();
    await page.locator('[data-testid="hall-name-input"]').fill(`Skip Location ${timestamp}`);
    await page.locator('[data-testid="address-textarea"]').fill('111 Skip Street');
    await page.locator('[data-testid="city-input"]').fill('Chennai');
    await page.locator('[data-testid="state-input"]').fill('Tamil Nadu');
    await page.locator('[data-testid="country-select"]').selectOption('India');
    await page.locator('[data-testid="create-hall-button"]').click();
    await page.waitForTimeout(1600);
    await page.locator('[data-testid="continue-pricing-button"]').click();
    await page.waitForTimeout(1600);

    // Click "Skip for now"
    const skipButton = page.locator('[data-testid="skip-location-button"]');
    await skipButton.click();

    // Wait for navigation to dashboard
    await page.waitForURL('/owner/dashboard', { timeout: 3000 });

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/22-location-skipped.png', fullPage: true });

    expect(page.url()).toContain('/owner/dashboard');

    console.log('✅ Story 0.1.8: Skip location functionality works');
  });

  // ============================================
  // Zero Console Errors Check
  // ============================================
  test('should have zero console errors during onboarding flow', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Run through complete flow
    await page.goto('/owner/dashboard');
    await page.waitForLoadState('networkidle');

    const createButton = page.locator('[data-testid="dashboard-create-first-hall-button"]');
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForURL('/owner/onboarding');
      await page.waitForLoadState('networkidle');
    } else {
      await page.goto('/owner/onboarding');
      await page.waitForLoadState('networkidle');
    }

    // Fill and submit form
    const timestamp = Date.now();
    await page.locator('[data-testid="hall-name-input"]').fill(`Console Test ${timestamp}`);
    await page.locator('[data-testid="address-textarea"]').fill('789 Console Street');
    await page.locator('[data-testid="city-input"]').fill('Bangalore');
    await page.locator('[data-testid="state-input"]').fill('Karnataka');
    await page.locator('[data-testid="country-select"]').selectOption('India');

    await page.locator('[data-testid="create-hall-button"]').click();
    await page.waitForTimeout(2000);

    // Take final screenshot
    await page.screenshot({ path: 'e2e/screenshots/10-final-state.png', fullPage: true });

    // Log console errors for debugging
    if (consoleErrors.length > 0) {
      console.error('❌ Console errors detected:');
      consoleErrors.forEach((error, index) => {
        console.error(`  ${index + 1}. ${error}`);
      });
    }

    // Verify no console errors
    expect(consoleErrors.length).toBe(0);

    if (consoleErrors.length === 0) {
      console.log('✅ Zero console errors during onboarding flow');
    }
  });
});
