import { test, expect } from '@playwright/test';
import { loginAsOwnerAPI } from './utils/auth-helpers';

/**
 * API Contract Validation Tests
 *
 * Purpose: Verify backend endpoints exist and respond correctly
 * Run these BEFORE writing feature E2E tests to catch configuration issues early
 *
 * Benefits:
 * - Early detection of missing endpoints (404 errors)
 * - Validation of API path structure (/api/v1/...)
 * - Verification of authentication requirements
 * - Documentation of expected API behavior
 *
 * Run: npx playwright test e2e/api-contract.spec.ts
 */

test.describe('API Contract Validation - Owner Endpoints', () => {
  let authToken: string;
  const hallId = '1';

  test.beforeAll(async ({ page }) => {
    // Get auth token for authenticated requests
    authToken = await loginAsOwnerAPI(page);
    expect(authToken).toBeTruthy();
  });

  // ============================================================
  // Seat Configuration Endpoints
  // ============================================================

  test('GET /api/v1/owner/seats/config/{hallId} endpoint exists and returns seats array', async ({
    request,
  }) => {
    const url = `http://localhost:8081/api/v1/owner/seats/config/${hallId}`;

    // Test 1: Endpoint requires authentication
    const unauthResponse = await request.get(url);
    expect([401, 403]).toContain(unauthResponse.status());
    expect(unauthResponse.status()).not.toBe(404); // Endpoint must exist

    // Test 2: Endpoint accepts authenticated requests
    const authResponse = await request.get(url, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(authResponse.status()).toBe(200);
    expect(authResponse.status()).not.toBe(404);
    expect(authResponse.status()).not.toBe(500);

    // Test 3: Response is array
    const seats = await authResponse.json();
    expect(Array.isArray(seats)).toBe(true);
  });

  test('POST /api/v1/owner/seats/config/{hallId} endpoint validates payload and saves seats', async ({
    request,
  }) => {
    const url = `http://localhost:8081/api/v1/owner/seats/config/${hallId}`;

    // Test 1: Endpoint requires authentication
    const unauthResponse = await request.post(url, {
      data: {},
    });
    expect([401, 403]).toContain(unauthResponse.status());
    expect(unauthResponse.status()).not.toBe(404);

    // Test 2: Endpoint validates payload (returns 400 for invalid data)
    const invalidPayloadResponse = await request.post(url, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {}, // Empty payload should fail validation
    });

    expect([400, 422]).toContain(invalidPayloadResponse.status());
    expect(invalidPayloadResponse.status()).not.toBe(404);
    expect(invalidPayloadResponse.status()).not.toBe(500);

    // Test 3: Endpoint accepts valid payload
    const validPayload = {
      seats: [
        {
          seatNumber: 'CONTRACT-TEST-1',
          xCoord: 100,
          yCoord: 100,
          spaceType: 'Cabin',
          isLadiesOnly: false,
        },
      ],
    };

    const validResponse = await request.post(url, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: validPayload,
    });

    expect([200, 201]).toContain(validResponse.status());

    // Test 4: Response structure validation
    const data = await validResponse.json();
    expect(data).toBeDefined();
    expect(data).toHaveProperty('message');
    expect(data).toHaveProperty('seatsCreated');
  });

  test('DELETE /api/v1/owner/seats/{hallId}/{seatId} endpoint exists', async ({ request }) => {
    const seatId = '999'; // Non-existent seat
    const url = `http://localhost:8081/api/v1/owner/seats/${hallId}/${seatId}`;

    // Test 1: Requires authentication
    const unauthResponse = await request.delete(url);
    expect([401, 403]).toContain(unauthResponse.status());
    expect(unauthResponse.status()).not.toBe(404); // Endpoint must exist

    // Test 2: Handles missing resource gracefully
    const notFoundResponse = await request.delete(url, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    // Should return 404 (not found) or 204 (deleted)
    // Should NOT crash with 500
    expect([404, 204]).toContain(notFoundResponse.status());
    expect(notFoundResponse.status()).not.toBe(500);
  });

  // ============================================================
  // Shift Configuration Endpoints
  // ============================================================

  test('GET /api/v1/owner/shifts/config/{hallId} endpoint exists and returns opening hours', async ({
    request,
  }) => {
    const url = `http://localhost:8081/api/v1/owner/shifts/config/${hallId}`;

    // Test 1: Requires authentication
    const unauthResponse = await request.get(url);
    expect([401, 403]).toContain(unauthResponse.status());
    expect(unauthResponse.status()).not.toBe(404);

    // Test 2: Returns opening hours structure
    const authResponse = await request.get(url, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(authResponse.status()).toBe(200);

    const openingHours = await authResponse.json();
    expect(openingHours).toBeDefined();
    expect(typeof openingHours).toBe('object');
  });

  test('POST /api/v1/owner/shifts/config/{hallId} endpoint validates and saves shifts', async ({
    request,
  }) => {
    const url = `http://localhost:8081/api/v1/owner/shifts/config/${hallId}`;

    // Test 1: Requires authentication
    const unauthResponse = await request.post(url, { data: {} });
    expect([401, 403]).toContain(unauthResponse.status());
    expect(unauthResponse.status()).not.toBe(404);

    // Test 2: Validates payload
    const invalidResponse = await request.post(url, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {},
    });

    expect([400, 422]).toContain(invalidResponse.status());
    expect(invalidResponse.status()).not.toBe(500);

    // Test 3: Accepts valid shift configuration
    const validPayload = {
      hallId: hallId,
      openingHours: {
        monday: {
          open: '09:00',
          close: '22:00',
          shifts: [],
        },
      },
    };

    const validResponse = await request.post(url, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: validPayload,
    });

    expect([200, 201]).toContain(validResponse.status());

    const data = await validResponse.json();
    expect(data).toBeDefined();
    expect(data).toHaveProperty('message');
  });

  // ============================================================
  // Profile Endpoints
  // ============================================================

  test('GET /api/v1/owner/profile endpoint exists and returns owner profile', async ({
    request,
  }) => {
    const url = 'http://localhost:8081/api/v1/owner/profile';

    // Requires authentication
    const unauthResponse = await request.get(url);
    expect([401, 403]).toContain(unauthResponse.status());
    expect(unauthResponse.status()).not.toBe(404);

    // Returns profile data
    const authResponse = await request.get(url, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect(authResponse.status()).toBe(200);

    const profile = await authResponse.json();
    expect(profile).toBeDefined();
    expect(profile).toHaveProperty('email');
  });

  test('PUT /api/v1/owner/profile endpoint validates and updates profile', async ({ request }) => {
    const url = 'http://localhost:8081/api/v1/owner/profile';

    // Requires authentication
    const unauthResponse = await request.put(url, { data: {} });
    expect([401, 403]).toContain(unauthResponse.status());
    expect(unauthResponse.status()).not.toBe(404);

    // Validates payload
    const invalidResponse = await request.put(url, {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {},
    });

    expect([400, 422]).toContain(invalidResponse.status());
    expect(invalidResponse.status()).not.toBe(500);
  });

  // ============================================================
  // Settings Endpoints
  // ============================================================

  test('GET /api/v1/owner/settings endpoint exists', async ({ request }) => {
    const url = 'http://localhost:8081/api/v1/owner/settings';

    // Requires authentication
    const unauthResponse = await request.get(url);
    expect([401, 403]).toContain(unauthResponse.status());
    expect(unauthResponse.status()).not.toBe(404);

    // Returns settings
    const authResponse = await request.get(url, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    expect([200, 404]).toContain(authResponse.status()); // 404 if no settings yet
    expect(authResponse.status()).not.toBe(500);
  });
});

test.describe('API Contract Validation - Auth Endpoints', () => {
  test('POST /api/v1/auth/register endpoint validates registration payload', async ({ request }) => {
    const url = 'http://localhost:8081/api/v1/auth/register';

    // Test 1: Endpoint exists (no auth required for registration)
    const emptyResponse = await request.post(url, {
      data: {},
    });

    // Should return 400 (validation error), not 404
    expect(emptyResponse.status()).toBe(400);
    expect(emptyResponse.status()).not.toBe(404);

    // Test 2: Validates email format
    const invalidEmailResponse = await request.post(url, {
      data: {
        email: 'invalid-email',
        password: 'Test@123',
        firstName: 'Test',
        lastName: 'User',
        gender: 'MALE',
      },
    });

    expect([400, 422]).toContain(invalidEmailResponse.status());
  });

  test('POST /api/v1/auth/login endpoint validates credentials', async ({ request }) => {
    const url = 'http://localhost:8081/api/v1/auth/login';

    // Test 1: Endpoint exists
    const emptyResponse = await request.post(url, {
      data: {},
    });

    expect([400, 401]).toContain(emptyResponse.status());
    expect(emptyResponse.status()).not.toBe(404);

    // Test 2: Returns 401 for invalid credentials
    const invalidCredsResponse = await request.post(url, {
      data: {
        email: 'nonexistent@test.com',
        password: 'WrongPassword',
      },
    });

    expect(invalidCredsResponse.status()).toBe(401);
  });
});

/**
 * Summary Tests - Overall API Health
 */
test.describe('API Contract Summary', () => {
  test('All critical owner endpoints exist with /v1 prefix', async ({ request }) => {
    const criticalEndpoints = [
      '/api/v1/owner/seats/config/1',
      '/api/v1/owner/shifts/config/1',
      '/api/v1/owner/profile',
      '/api/v1/owner/settings',
    ];

    const authToken = 'invalid-token'; // Use invalid token to test endpoint existence

    for (const endpoint of criticalEndpoints) {
      const url = `http://localhost:8081${endpoint}`;
      const response = await request.get(url, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      // Endpoint should return 401/403 (auth error), NOT 404 (missing)
      expect([401, 403]).toContain(response.status());
      expect(response.status()).not.toBe(404);
    }
  });

  test('All critical auth endpoints exist with /v1 prefix', async ({ request }) => {
    const authEndpoints = ['/api/v1/auth/register', '/api/v1/auth/login'];

    for (const endpoint of authEndpoints) {
      const url = `http://localhost:8081${endpoint}`;
      const response = await request.post(url, {
        data: {}, // Empty payload
      });

      // Should return 400/401 (validation/auth error), NOT 404 (missing)
      expect([400, 401]).toContain(response.status());
      expect(response.status()).not.toBe(404);
    }
  });
});
