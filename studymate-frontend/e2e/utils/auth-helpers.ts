/**
 * Authentication Helper Utilities for E2E Tests
 * Provides functions for login/logout flows in tests
 */

import { Page, expect } from '@playwright/test';
import { TEST_USERS } from '../fixtures/users';
import { loginUser } from './api-helpers';

/**
 * Logs in a user through the UI
 */
export async function loginViaUI(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await page.goto('/login');

  // Fill login form
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for navigation to complete
  await page.waitForURL((url) => !url.pathname.includes('/login'), {
    timeout: 10000,
  });
}

/**
 * Logs in a user via API (faster for setup)
 */
export async function loginViaAPI(
  page: Page,
  email: string,
  password: string
): Promise<string | null> {
  const token = await loginUser(page, email, password);

  if (token) {
    // Store token in localStorage
    await page.evaluate((tokenValue) => {
      localStorage.setItem('authToken', tokenValue);
      localStorage.setItem('token', tokenValue);
    }, token);
  }

  return token;
}

/**
 * Logs in as test owner user via UI
 */
export async function loginAsOwner(page: Page): Promise<void> {
  await loginViaUI(page, TEST_USERS.owner.email, TEST_USERS.owner.password);
}

/**
 * Logs in as test student user via UI
 */
export async function loginAsStudent(page: Page): Promise<void> {
  await loginViaUI(page, TEST_USERS.student.email, TEST_USERS.student.password);
}

/**
 * Logs in as test owner user via API (faster)
 */
export async function loginAsOwnerAPI(page: Page): Promise<string | null> {
  return await loginViaAPI(page, TEST_USERS.owner.email, TEST_USERS.owner.password);
}

/**
 * Logs in as test student user via API (faster)
 */
export async function loginAsStudentAPI(page: Page): Promise<string | null> {
  return await loginViaAPI(
    page,
    TEST_USERS.student.email,
    TEST_USERS.student.password
  );
}

/**
 * Logs out the current user
 */
export async function logout(page: Page): Promise<void> {
  // Try to click logout button if present
  const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout")');

  if (await logoutButton.isVisible()) {
    await logoutButton.click();
  } else {
    // Clear auth tokens manually
    await page.evaluate(() => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      sessionStorage.clear();
    });
  }

  // Navigate to home
  await page.goto('/');
}

/**
 * Checks if user is currently logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  const token = await page.evaluate(() => {
    return localStorage.getItem('authToken') || localStorage.getItem('token');
  });

  return !!token;
}

/**
 * Fills the registration form with user data
 */
export async function fillRegistrationForm(
  page: Page,
  userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    gender?: string;
    businessName?: string;
  }
): Promise<void> {
  // Fill email
  await page.fill('input[type="email"], input[name="email"]', userData.email);

  // Fill password
  await page.fill('input[type="password"][name="password"]', userData.password);

  // Fill first name
  await page.fill('input[name="firstName"]', userData.firstName);

  // Fill last name
  await page.fill('input[name="lastName"]', userData.lastName);

  // Fill phone if provided
  if (userData.phone) {
    await page.fill('input[type="tel"], input[name="phone"]', userData.phone);
  }

  // Select gender if provided
  if (userData.gender) {
    await page.selectOption('select[name="gender"]', userData.gender);
  }

  // Fill business name if provided (for owner registration)
  if (userData.businessName) {
    await page.fill('input[name="businessName"]', userData.businessName);
  }
}

/**
 * Submits the registration form and waits for response
 */
export async function submitRegistrationForm(page: Page): Promise<void> {
  const submitButton = page.locator('button[type="submit"]');

  // Wait for button to be enabled
  await expect(submitButton).toBeEnabled({ timeout: 5000 });

  // Click submit
  await submitButton.click();

  // Wait for navigation or success message
  await Promise.race([
    page.waitForURL((url) => !url.pathname.includes('/register'), {
      timeout: 10000,
    }),
    page.waitForSelector('.success-message, .alert-success', {
      timeout: 10000,
    }),
  ]).catch(() => {
    // Ignore timeout - let test assertions handle validation
  });
}
