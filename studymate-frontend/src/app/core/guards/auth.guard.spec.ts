import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthStore } from '../../store/auth/auth.store';

describe('authGuard', () => {
  let authStore: InstanceType<typeof AuthStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthStore, Router],
    });

    authStore = TestBed.inject(AuthStore);
  });

  describe('Authentication Check', () => {
    it('should allow access when user is authenticated', () => {
      // Setup: Set user as authenticated
      authStore.setUser({
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'OWNER',
      });

      const mockRoute = {} as ActivatedRouteSnapshot;
      const mockState = { url: '/owner/dashboard' } as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

      expect(result).toBe(true);
    });

    it('should return UrlTree redirect when user is not authenticated', () => {
      // Ensure user is not authenticated
      authStore.logout();

      const mockRoute = {} as ActivatedRouteSnapshot;
      const mockState = { url: '/owner/dashboard' } as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

      expect(result).toBeInstanceOf(UrlTree);
      expect((result as UrlTree).toString()).toContain('/login');
      expect((result as UrlTree).queryParams['returnUrl']).toBe('/owner/dashboard');
    });
  });

  describe('Return URL Preservation', () => {
    it('should store the attempted URL in returnUrl query param', () => {
      authStore.logout();

      const mockRoute = {} as ActivatedRouteSnapshot;
      const mockState = { url: '/owner/protected-route' } as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

      expect(result).toBeInstanceOf(UrlTree);
      expect((result as UrlTree).queryParams['returnUrl']).toBe('/owner/protected-route');
    });

    it('should preserve complex URLs with query params', () => {
      authStore.logout();

      const mockRoute = {} as ActivatedRouteSnapshot;
      const mockState = {
        url: '/owner/dashboard?hallId=123&view=detailed',
      } as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

      expect(result).toBeInstanceOf(UrlTree);
      expect((result as UrlTree).queryParams['returnUrl']).toBe(
        '/owner/dashboard?hallId=123&view=detailed',
      );
    });

    it('should preserve URL fragments', () => {
      authStore.logout();

      const mockRoute = {} as ActivatedRouteSnapshot;
      const mockState = { url: '/owner/settings#notifications' } as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

      expect(result).toBeInstanceOf(UrlTree);
      expect((result as UrlTree).queryParams['returnUrl']).toBe('/owner/settings#notifications');
    });
  });

  describe('Guard Behavior', () => {
    it('should not redirect when user is already authenticated', () => {
      authStore.setUser({
        id: 2,
        email: 'owner@example.com',
        firstName: 'Owner',
        lastName: 'User',
        role: 'OWNER',
      });

      const mockRoute = {} as ActivatedRouteSnapshot;
      const mockState = { url: '/owner/reports' } as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

      expect(result).toBe(true);
    });

    it('should work with root path', () => {
      authStore.logout();

      const mockRoute = {} as ActivatedRouteSnapshot;
      const mockState = { url: '/' } as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

      expect(result).toBeInstanceOf(UrlTree);
      expect((result as UrlTree).queryParams['returnUrl']).toBe('/');
    });

    it('should handle deeply nested routes', () => {
      authStore.logout();

      const mockRoute = {} as ActivatedRouteSnapshot;
      const mockState = { url: '/owner/user-management/edit/123' } as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

      expect(result).toBeInstanceOf(UrlTree);
      expect((result as UrlTree).queryParams['returnUrl']).toBe('/owner/user-management/edit/123');
    });
  });

  describe('Signal Store Integration', () => {
    it('should use AuthStore signal for authentication status', () => {
      // Set up authenticated user
      authStore.setUser({
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'OWNER',
      });

      const mockRoute = {} as ActivatedRouteSnapshot;
      const mockState = { url: '/owner/dashboard' } as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

      // Verify the signal value is being used correctly
      expect(authStore.selectIsAuthenticated()).toBe(true);
      expect(result).toBe(true);
    });

    it('should react to authentication state changes', () => {
      const mockRoute = {} as ActivatedRouteSnapshot;
      const mockState = { url: '/owner/dashboard' } as RouterStateSnapshot;

      // User not authenticated
      authStore.logout();
      let result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));
      expect(result).toBeInstanceOf(UrlTree);

      // User becomes authenticated
      authStore.setUser({
        id: 3,
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
        role: 'OWNER',
      });
      result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));
      expect(result).toBe(true);
    });
  });
});
