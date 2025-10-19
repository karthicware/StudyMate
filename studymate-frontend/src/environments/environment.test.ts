/**
 * Environment configuration for E2E tests
 * E2E tests connect directly to the test backend on port 8081 (no Angular proxy)
 */
export const environment = {
  production: false,
  version: '1.0.0',
  apiBaseUrl: 'http://localhost:8081/api/v1',
  enableDebug: true,
  enableVerboseLogging: true,
};
