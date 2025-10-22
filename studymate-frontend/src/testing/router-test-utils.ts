import { provideRouter, Routes } from '@angular/router';
import { Component } from '@angular/core';

// Type declaration for Jasmine (for test files only)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const jasmine: any;

// Dummy component for test routes
@Component({ template: '' })
class DummyComponent {}

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
  { path: 'auth/login', component: DummyComponent },
  { path: 'auth/register', component: DummyComponent },
  { path: 'auth/owner-register', component: DummyComponent },
  { path: 'auth/verify-email', component: DummyComponent },

  // Owner portal routes
  { path: 'owner/dashboard', component: DummyComponent },
  { path: 'owner/profile', component: DummyComponent },
  { path: 'owner/settings', component: DummyComponent },
  { path: 'owner/users', component: DummyComponent },
  { path: 'owner/reports', component: DummyComponent },

  // Student routes
  { path: 'student/dashboard', component: DummyComponent },
  { path: 'student/discovery', component: DummyComponent },
  { path: 'student/bookings', component: DummyComponent },

  // Root
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
];
