/**
 * Environment configuration for development mode
 * Uses Angular dev server proxy (proxy.conf.json) to route API requests to backend on port 8080
 * Empty apiBaseUrl means relative URLs like '/api/v1/...' which the proxy handles
 */
export const environment = {
  production: false,
  version: '1.0.0',
  apiBaseUrl: '', // Empty - relies on Angular proxy to route /api requests to localhost:8080
  enableDebug: true,
  enableVerboseLogging: true,
  // Google Maps API Key (obtain from https://console.cloud.google.com/google/maps-apis)
  googleMapsApiKey: 'AIzaSyAlqTDoIdnH4D0NZho2fCYVGyccYHqMUqA'
};
