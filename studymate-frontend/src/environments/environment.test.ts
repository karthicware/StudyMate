/**
 * Environment configuration for E2E tests
 * E2E tests connect directly to the test backend on port 8081 (no Angular proxy)
 */
export const environment = {
  production: false,
  version: '1.0.0',
  apiBaseUrl: 'http://localhost:8081',
  enableDebug: true,
  enableVerboseLogging: true,
  // Google Maps API Key (for E2E tests)
  googleMapsApiKey: 'AIzaSyAlqTDoIdnH4D0NZho2fCYVGyccYHqMUqA'
};
