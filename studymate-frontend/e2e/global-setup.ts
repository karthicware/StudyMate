/**
 * Global setup for Playwright E2E tests
 * Ensures backend is ready before running tests
 */

async function globalSetup() {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:8081';
  const maxRetries = 30;
  const retryDelay = 1000; // 1 second

  console.log('Waiting for backend to be ready...');

  for (let i = 0; i < maxRetries; i++) {
    try {
      // Try to connect to the backend register endpoint
      const response = await fetch(`${backendUrl}/api/v1/auth/register`, {
        method: 'OPTIONS', // Use OPTIONS to avoid creating data
      });

      // If we get any response (even error), backend is up
      if (response) {
        console.log('✓ Backend is ready');
        return;
      }
    } catch (error) {
      // Backend not ready yet, wait and retry
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  console.warn('Warning: Backend may not be fully ready, but proceeding with tests...');
}

export default globalSetup;
