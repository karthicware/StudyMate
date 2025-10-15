/**
 * API Helper Utilities for E2E Tests
 * Provides functions to interact with the backend API during tests
 */

import { Page, APIResponse } from '@playwright/test';

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:8081';

/**
 * Makes an API request during a test
 */
export async function apiRequest(
  page: Page,
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    body?: any;
    headers?: Record<string, string>;
    token?: string;
  } = {}
): Promise<APIResponse> {
  const { method = 'GET', body, headers = {}, token } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  return await page.request.fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: requestHeaders,
    data: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Registers a new user via API
 */
export async function registerUser(
  page: Page,
  userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    userType: 'OWNER' | 'STUDENT';
    phone?: string;
    gender?: string;
    businessName?: string;
  }
): Promise<APIResponse> {
  return await apiRequest(page, '/api/v1/auth/register', {
    method: 'POST',
    body: userData,
  });
}

/**
 * Logs in a user via API and returns the JWT token
 */
export async function loginUser(
  page: Page,
  email: string,
  password: string
): Promise<string | null> {
  const response = await apiRequest(page, '/api/v1/auth/login', {
    method: 'POST',
    body: { email, password },
  });

  if (response.ok()) {
    const data = await response.json();
    return data.token || data.accessToken || null;
  }

  return null;
}

/**
 * Deletes a user via API (for cleanup)
 */
export async function deleteUser(
  page: Page,
  email: string,
  token: string
): Promise<APIResponse> {
  return await apiRequest(page, `/api/v1/users/${email}`, {
    method: 'DELETE',
    token,
  });
}

/**
 * Waits for an API request to complete during a page interaction
 */
export async function waitForApiRequest(
  page: Page,
  urlPattern: string | RegExp,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET'
): Promise<any> {
  const requestPromise = page.waitForRequest(
    (request) =>
      (typeof urlPattern === 'string'
        ? request.url().includes(urlPattern)
        : urlPattern.test(request.url())) && request.method() === method
  );

  const request = await requestPromise;
  return request.postDataJSON();
}

/**
 * Waits for an API response during a page interaction
 */
export async function waitForApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET'
): Promise<any> {
  const responsePromise = page.waitForResponse(
    (response) =>
      (typeof urlPattern === 'string'
        ? response.url().includes(urlPattern)
        : urlPattern.test(response.url())) &&
      response.request().method() === method
  );

  const response = await responsePromise;
  return await response.json();
}

/**
 * Checks if the backend API is reachable
 */
export async function isBackendReady(page: Page): Promise<boolean> {
  try {
    const response = await apiRequest(page, '/api/v1/auth/register', {
      method: 'OPTIONS',
    });
    return response.status() !== 0;
  } catch {
    return false;
  }
}
