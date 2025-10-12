import { provideRouter } from '@angular/router';
import { Router, Routes } from '@angular/router';

/**
 * Provides empty router configuration for isolated component tests.
 *
 * Use this when testing standalone components that don't need actual routing,
 * but use RouterLink or other router directives.
 *
 * **Pattern**: Isolated Component Tests
 *
 * @example
 * ```typescript
 * TestBed.configureTestingModule({
 *   imports: [MyComponent],
 *   providers: [provideRouterMock()]
 * });
 * ```
 *
 * @returns Router provider with empty routes array
 */
export function provideRouterMock() {
  return provideRouter([]);
}

/**
 * Creates a Router spy for tests that don't need actual routing.
 *
 * Use this when you want to verify navigation calls without actual routing behavior.
 * The spy includes the most commonly used Router methods: `navigate` and `navigateByUrl`.
 *
 * **Pattern**: Navigation Spy Tests
 *
 * @example
 * ```typescript
 * const routerSpy = createRouterSpy();
 * TestBed.configureTestingModule({
 *   imports: [MyComponent],
 *   providers: [{ provide: Router, useValue: routerSpy }]
 * });
 *
 * // Later in test:
 * expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
 * ```
 *
 * @returns Jasmine spy object with navigate and navigateByUrl methods
 */
export function createRouterSpy() {
  return jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
}

/**
 * Common test routes for integration tests.
 *
 * Use these routes when testing navigation flows or route guards.
 * Routes include auth pages, owner portal, and student portal paths.
 *
 * **Pattern**: Integration Tests with Routes
 *
 * @example
 * ```typescript
 * import { RouterTestingModule } from '@angular/router/testing';
 *
 * TestBed.configureTestingModule({
 *   imports: [
 *     MyComponent,
 *     RouterTestingModule.withRoutes(TEST_ROUTES)
 *   ]
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Or with provideRouter for standalone components:
 * TestBed.configureTestingModule({
 *   imports: [MyComponent],
 *   providers: [provideRouter(TEST_ROUTES)]
 * });
 * ```
 */
export const TEST_ROUTES: Routes = [
  // Auth routes
  { path: 'auth/login', component: {} as any },
  { path: 'auth/register', component: {} as any },
  { path: 'auth/owner-register', component: {} as any },
  { path: 'auth/verify-email', component: {} as any },

  // Owner portal routes
  { path: 'owner/dashboard', component: {} as any },
  { path: 'owner/profile', component: {} as any },
  { path: 'owner/settings', component: {} as any },
  { path: 'owner/users', component: {} as any },
  { path: 'owner/reports', component: {} as any },

  // Student routes
  { path: 'student/dashboard', component: {} as any },
  { path: 'student/discovery', component: {} as any },
  { path: 'student/bookings', component: {} as any },

  // Root
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' }
];
