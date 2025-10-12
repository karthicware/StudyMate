import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { roleGuard } from './role.guard';
import { AuthStore } from '../../store/auth/auth.store';

describe('roleGuard', () => {
  let authStore: InstanceType<typeof AuthStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthStore, Router],
    });

    authStore = TestBed.inject(AuthStore);
  });

  describe('Role-Based Access Control', () => {
    it('should allow access when user has required role', () => {
      // Setup: Set user with OWNER role
      authStore.setUser({
        id: 1,
        email: 'owner@example.com',
        firstName: 'Owner',
        lastName: 'User',
        role: 'OWNER',
      });

      const mockRoute = { data: { role: 'OWNER' } } as ActivatedRouteSnapshot;
      const mockState = { url: '/owner/dashboard' } as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => roleGuard(mockRoute, mockState));

      expect(result).toBe(true);
    });

    it('should redirect to unauthorized when user lacks required role', () => {
      // Setup: Set user with STUDENT role
      authStore.setUser({
        id: 2,
        email: 'student@example.com',
        firstName: 'Student',
        lastName: 'User',
        role: 'STUDENT',
      });

      const mockRoute = { data: { role: 'OWNER' } } as ActivatedRouteSnapshot;
      const mockState = { url: '/owner/dashboard' } as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => roleGuard(mockRoute, mockState));

      expect(result).toBeInstanceOf(UrlTree);
      expect((result as UrlTree).toString()).toContain('/unauthorized');
    });

    it('should allow access when no role requirement specified', () => {
      // Setup: User with any role
      authStore.setUser({
        id: 3,
        email: 'user@example.com',
        firstName: 'User',
        lastName: 'Name',
        role: 'STUDENT',
      });

      const mockRoute = { data: {} } as ActivatedRouteSnapshot; // No role requirement
      const mockState = { url: '/public-page' } as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => roleGuard(mockRoute, mockState));

      expect(result).toBe(true);
    });

    it('should allow access when route data is undefined', () => {
      authStore.setUser({
        id: 4,
        email: 'user@example.com',
        firstName: 'User',
        lastName: 'Name',
        role: 'OWNER',
      });

      const mockRoute = {} as ActivatedRouteSnapshot; // No data property
      const mockState = { url: '/some-page' } as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => roleGuard(mockRoute, mockState));

      expect(result).toBe(true);
    });
  });

  describe('Different Role Scenarios', () => {
    it('should block STUDENT role from OWNER routes', () => {
      authStore.setUser({
        id: 5,
        email: 'student@example.com',
        firstName: 'Student',
        lastName: 'User',
        role: 'STUDENT',
      });

      const mockRoute = { data: { role: 'OWNER' } } as ActivatedRouteSnapshot;
      const mockState = { url: '/owner/seat-map-config' } as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => roleGuard(mockRoute, mockState));

      expect(result).toBeInstanceOf(UrlTree);
      expect((result as UrlTree).toString()).toContain('/unauthorized');
    });

    it('should allow OWNER role on OWNER routes', () => {
      authStore.setUser({
        id: 6,
        email: 'owner@example.com',
        firstName: 'Owner',
        lastName: 'User',
        role: 'OWNER',
      });

      const mockRoute = { data: { role: 'OWNER' } } as ActivatedRouteSnapshot;
      const mockState = { url: '/owner/user-management' } as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => roleGuard(mockRoute, mockState));

      expect(result).toBe(true);
    });

    it('should handle undefined user role', () => {
      authStore.setUser({
        id: 7,
        email: 'user@example.com',
        firstName: 'User',
        lastName: 'Name',
        // role is undefined
      });

      const mockRoute = { data: { role: 'OWNER' } } as ActivatedRouteSnapshot;
      const mockState = { url: '/owner/dashboard' } as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => roleGuard(mockRoute, mockState));

      expect(result).toBeInstanceOf(UrlTree);
      expect((result as UrlTree).toString()).toContain('/unauthorized');
    });

    it('should handle null user (no user logged in)', () => {
      authStore.logout(); // Ensure no user is set

      const mockRoute = { data: { role: 'OWNER' } } as ActivatedRouteSnapshot;
      const mockState = { url: '/owner/dashboard' } as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => roleGuard(mockRoute, mockState));

      expect(result).toBeInstanceOf(UrlTree);
      expect((result as UrlTree).toString()).toContain('/unauthorized');
    });
  });

  describe('Case Sensitivity', () => {
    it('should be case-sensitive for role matching', () => {
      authStore.setUser({
        id: 8,
        email: 'owner@example.com',
        firstName: 'Owner',
        lastName: 'User',
        role: 'owner', // lowercase
      });

      const mockRoute = { data: { role: 'OWNER' } } as ActivatedRouteSnapshot; // uppercase
      const mockState = { url: '/owner/dashboard' } as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => roleGuard(mockRoute, mockState));

      // Should fail because 'owner' !== 'OWNER'
      expect(result).toBeInstanceOf(UrlTree);
      expect((result as UrlTree).toString()).toContain('/unauthorized');
    });

    it('should match when role cases are identical', () => {
      authStore.setUser({
        id: 9,
        email: 'owner@example.com',
        firstName: 'Owner',
        lastName: 'User',
        role: 'OWNER',
      });

      const mockRoute = { data: { role: 'OWNER' } } as ActivatedRouteSnapshot;
      const mockState = { url: '/owner/dashboard' } as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => roleGuard(mockRoute, mockState));

      expect(result).toBe(true);
    });
  });

  describe('Guard Integration with Routes', () => {
    it('should work with multiple route segments', () => {
      authStore.setUser({
        id: 10,
        email: 'owner@example.com',
        firstName: 'Owner',
        lastName: 'User',
        role: 'OWNER',
      });

      const mockRoute = { data: { role: 'OWNER' } } as ActivatedRouteSnapshot;
      const mockState = { url: '/owner/reports/monthly/2024' } as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => roleGuard(mockRoute, mockState));

      expect(result).toBe(true);
    });

    it('should work with query parameters', () => {
      authStore.setUser({
        id: 11,
        email: 'owner@example.com',
        firstName: 'Owner',
        lastName: 'User',
        role: 'OWNER',
      });

      const mockRoute = { data: { role: 'OWNER' } } as ActivatedRouteSnapshot;
      const mockState = {
        url: '/owner/dashboard?hallId=123&view=detailed',
      } as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => roleGuard(mockRoute, mockState));

      expect(result).toBe(true);
    });
  });

  describe('Signal Store Integration', () => {
    it('should use AuthStore signal for user role', () => {
      authStore.setUser({
        id: 12,
        email: 'owner@example.com',
        firstName: 'Owner',
        lastName: 'User',
        role: 'OWNER',
      });

      const mockRoute = { data: { role: 'OWNER' } } as ActivatedRouteSnapshot;
      const mockState = { url: '/owner/dashboard' } as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => roleGuard(mockRoute, mockState));

      expect(result).toBe(true);
      // Verify the role from the store
      expect(authStore.selectUserRole()).toBe('OWNER');
    });

    it('should react to role changes', () => {
      const mockRoute = { data: { role: 'OWNER' } } as ActivatedRouteSnapshot;
      const mockState = { url: '/owner/dashboard' } as RouterStateSnapshot;

      // User with STUDENT role
      authStore.setUser({
        id: 13,
        email: 'student@example.com',
        firstName: 'Student',
        lastName: 'User',
        role: 'STUDENT',
      });
      let result = TestBed.runInInjectionContext(() => roleGuard(mockRoute, mockState));
      expect(result).toBeInstanceOf(UrlTree);

      // User role changes to OWNER
      authStore.setUser({
        id: 13,
        email: 'student@example.com',
        firstName: 'Student',
        lastName: 'User',
        role: 'OWNER',
      });
      result = TestBed.runInInjectionContext(() => roleGuard(mockRoute, mockState));
      expect(result).toBe(true);
    });
  });

  describe('Unauthorized Redirect', () => {
    it('should redirect to /unauthorized path', () => {
      authStore.setUser({
        id: 14,
        email: 'student@example.com',
        firstName: 'Student',
        lastName: 'User',
        role: 'STUDENT',
      });

      const mockRoute = { data: { role: 'OWNER' } } as ActivatedRouteSnapshot;
      const mockState = { url: '/owner/settings' } as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => roleGuard(mockRoute, mockState));

      expect(result).toBeInstanceOf(UrlTree);
      const urlTree = result as UrlTree;
      expect(urlTree.toString()).toBe('/unauthorized');
    });

    it('should not include query params in unauthorized redirect', () => {
      authStore.setUser({
        id: 15,
        email: 'student@example.com',
        firstName: 'Student',
        lastName: 'User',
        role: 'STUDENT',
      });

      const mockRoute = { data: { role: 'OWNER' } } as ActivatedRouteSnapshot;
      const mockState = { url: '/owner/profile' } as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => roleGuard(mockRoute, mockState));

      expect(result).toBeInstanceOf(UrlTree);
      const urlTree = result as UrlTree;
      expect(urlTree.queryParams).toEqual({});
    });
  });
});
