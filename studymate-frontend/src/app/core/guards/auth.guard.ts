import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../../store/auth/auth.store';

/**
 * Auth Guard - Protects routes requiring authentication
 *
 * Implementation using Angular 20 functional guard pattern (CanActivateFn).
 * Uses NgRx Signals (AuthStore) for state management.
 *
 * Behavior:
 * - Checks authentication status from AuthStore
 * - Allows access if user is authenticated
 * - Redirects to /login with returnUrl if not authenticated
 * - Preserves intended destination for post-login redirect
 *
 * @param route - The activated route snapshot
 * @param state - The router state snapshot
 * @returns true if authenticated, UrlTree redirect if not
 *
 * @example
 * ```typescript
 * {
 *   path: 'owner',
 *   canActivate: [authGuard],
 *   children: [...]
 * }
 * ```
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  // Check if user is authenticated using signal store
  const isAuthenticated = authStore.selectIsAuthenticated();

  if (isAuthenticated) {
    return true;
  }

  // Store the attempted URL for redirecting after login
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};
