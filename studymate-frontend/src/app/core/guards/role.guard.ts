import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../../store/auth/auth.store';

/**
 * Role Guard - Enforces role-based access control
 *
 * Implementation using Angular 20 functional guard pattern (CanActivateFn).
 * Uses NgRx Signals (AuthStore) for state management.
 *
 * Behavior:
 * - Checks if user has required role from route data
 * - Allows access if user role matches required role
 * - Redirects to /unauthorized if role doesn't match
 * - Works in conjunction with authGuard (authentication check happens first)
 *
 * Route Data:
 * - Requires 'role' property in route data
 * - Example: { path: 'owner', canActivate: [authGuard, roleGuard], data: { role: 'OWNER' } }
 *
 * @param route - The activated route snapshot (contains role requirement in data)
 * @param state - The router state snapshot
 * @returns true if authorized, UrlTree redirect if not
 *
 * @example
 * ```typescript
 * {
 *   path: 'owner',
 *   canActivate: [authGuard, roleGuard],
 *   data: { role: 'OWNER' },
 *   children: [...]
 * }
 * ```
 */
export const roleGuard: CanActivateFn = (route, _state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  // Get required role from route data
  const requiredRole = route.data['role'] as string | undefined;

  // If no role requirement specified, allow access
  if (!requiredRole) {
    return true;
  }

  // Get user's current role from auth store
  const userRole = authStore.selectUserRole();

  // Check if user's role matches required role
  if (userRole === requiredRole) {
    return true;
  }

  // User doesn't have required role, redirect to unauthorized page
  return router.createUrlTree(['/unauthorized']);
};
