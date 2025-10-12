import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouterMock, createRouterSpy, TEST_ROUTES } from './router-test-utils';

describe('Router Test Utilities', () => {

  describe('provideRouterMock', () => {
    it('should return a provider', () => {
      const provider = provideRouterMock();
      expect(provider).toBeDefined();
    });

    it('should provide Router instance with empty routes', () => {
      TestBed.configureTestingModule({
        providers: [provideRouterMock()]
      });

      const router = TestBed.inject(Router);
      expect(router).toBeDefined();
      expect(router.config).toEqual([]);
    });

    it('should allow component to use RouterLink without errors', () => {
      TestBed.configureTestingModule({
        providers: [provideRouterMock()]
      });

      const router = TestBed.inject(Router);
      expect(router).toBeInstanceOf(Router);
    });
  });

  describe('createRouterSpy', () => {
    it('should create a spy object', () => {
      const routerSpy = createRouterSpy();
      expect(routerSpy).toBeDefined();
    });

    it('should have navigate method', () => {
      const routerSpy = createRouterSpy();
      expect(routerSpy.navigate).toBeDefined();
      expect(jasmine.isSpy(routerSpy.navigate)).toBe(true);
    });

    it('should have navigateByUrl method', () => {
      const routerSpy = createRouterSpy();
      expect(routerSpy.navigateByUrl).toBeDefined();
      expect(jasmine.isSpy(routerSpy.navigateByUrl)).toBe(true);
    });

    it('should allow navigate to be called and tracked', () => {
      const routerSpy = createRouterSpy();
      routerSpy.navigate(['/test']);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/test']);
    });

    it('should allow navigateByUrl to be called and tracked', () => {
      const routerSpy = createRouterSpy();
      routerSpy.navigateByUrl('/test');
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/test');
    });

    it('should be usable as Router provider', () => {
      const routerSpy = createRouterSpy();

      TestBed.configureTestingModule({
        providers: [{ provide: Router, useValue: routerSpy }]
      });

      const router = TestBed.inject(Router);
      expect(router).toBe(routerSpy);
    });
  });

  describe('TEST_ROUTES', () => {
    it('should be defined', () => {
      expect(TEST_ROUTES).toBeDefined();
    });

    it('should be an array', () => {
      expect(Array.isArray(TEST_ROUTES)).toBe(true);
    });

    it('should contain auth routes', () => {
      const authRoutes = TEST_ROUTES.filter(route =>
        typeof route.path === 'string' && route.path.startsWith('auth/')
      );
      expect(authRoutes.length).toBeGreaterThan(0);
      expect(authRoutes.some(r => r.path === 'auth/login')).toBe(true);
      expect(authRoutes.some(r => r.path === 'auth/register')).toBe(true);
      expect(authRoutes.some(r => r.path === 'auth/owner-register')).toBe(true);
      expect(authRoutes.some(r => r.path === 'auth/verify-email')).toBe(true);
    });

    it('should contain owner portal routes', () => {
      const ownerRoutes = TEST_ROUTES.filter(route =>
        typeof route.path === 'string' && route.path.startsWith('owner/')
      );
      expect(ownerRoutes.length).toBeGreaterThan(0);
      expect(ownerRoutes.some(r => r.path === 'owner/dashboard')).toBe(true);
      expect(ownerRoutes.some(r => r.path === 'owner/profile')).toBe(true);
      expect(ownerRoutes.some(r => r.path === 'owner/settings')).toBe(true);
    });

    it('should contain student routes', () => {
      const studentRoutes = TEST_ROUTES.filter(route =>
        typeof route.path === 'string' && route.path.startsWith('student/')
      );
      expect(studentRoutes.length).toBeGreaterThan(0);
      expect(studentRoutes.some(r => r.path === 'student/dashboard')).toBe(true);
      expect(studentRoutes.some(r => r.path === 'student/discovery')).toBe(true);
      expect(studentRoutes.some(r => r.path === 'student/bookings')).toBe(true);
    });

    it('should contain root redirect', () => {
      const rootRoute = TEST_ROUTES.find(route => route.path === '');
      expect(rootRoute).toBeDefined();
      expect(rootRoute?.redirectTo).toBe('/auth/login');
      expect(rootRoute?.pathMatch).toBe('full');
    });

    it('should have at least 13 routes total', () => {
      // 4 auth + 5 owner + 3 student + 1 root = 13 routes
      expect(TEST_ROUTES.length).toBeGreaterThanOrEqual(13);
    });
  });
});
