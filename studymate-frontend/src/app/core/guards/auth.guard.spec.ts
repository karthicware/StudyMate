import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { AuthStore } from '../../store/auth/auth.store';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('authGuard', () => {
  let router: Router;
  let authService: AuthService;
  let authStore: InstanceType<typeof AuthStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, AuthStore],
    });

    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService);
    authStore = TestBed.inject(AuthStore);

    spyOn(router, 'navigate');
  });

  it('should allow access when user is authenticated', () => {
    // Setup: Set user as authenticated
    authStore.setUser({
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    });

    const mockRoute: any = {};
    const mockState: any = { url: '/dashboard' };

    const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login when user is not authenticated', () => {
    // Ensure user is not authenticated
    authStore.logout();

    const mockRoute: any = {};
    const mockState: any = { url: '/dashboard' };

    const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/dashboard' },
    });
  });

  it('should store the attempted URL in query params', () => {
    authStore.logout();

    const mockRoute: any = {};
    const mockState: any = { url: '/protected-route' };

    TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/protected-route' },
    });
  });
});
