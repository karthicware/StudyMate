import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { AuthStore } from '../../store/auth/auth.store';
import { LoginRequest, RegisterRequest, AuthResponse } from '../models/auth.models';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;
  let authStore: InstanceType<typeof AuthStore>;

  const mockAuthResponse: AuthResponse = {
    token: 'mock-jwt-token',
    user: {
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'student',
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, AuthStore],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    authStore = TestBed.inject(AuthStore);

    // Clear localStorage before each test
    localStorage.clear();
    spyOn(router, 'navigate');
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login user and store token', (done) => {
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      service.login(credentials).subscribe({
        next: (response) => {
          expect(response).toEqual(mockAuthResponse);
          expect(localStorage.getItem('token')).toBe('mock-jwt-token');
          expect(authStore.selectUser()).toEqual(mockAuthResponse.user);
          expect(authStore.selectIsAuthenticated()).toBe(true);
          done();
        },
      });

      const req = httpMock.expectOne('/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(mockAuthResponse);
    });

    it('should set loading state', () => {
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      service.login(credentials).subscribe();

      expect(authStore.loading()).toBe(true);

      const req = httpMock.expectOne('/api/auth/login');
      req.flush(mockAuthResponse);
    });
  });

  describe('register', () => {
    it('should register user and store token', (done) => {
      const userData: RegisterRequest = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      };

      service.register(userData).subscribe({
        next: (response) => {
          expect(response).toEqual(mockAuthResponse);
          expect(localStorage.getItem('token')).toBe('mock-jwt-token');
          expect(authStore.selectUser()).toEqual(mockAuthResponse.user);
          expect(authStore.selectIsAuthenticated()).toBe(true);
          done();
        },
      });

      const req = httpMock.expectOne('/api/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(userData);
      req.flush(mockAuthResponse);
    });
  });

  describe('logout', () => {
    it('should logout user and clear token', () => {
      // Setup: login first
      localStorage.setItem('token', 'mock-jwt-token');
      authStore.setUser(mockAuthResponse.user);

      // Execute logout
      service.logout();

      // Verify
      expect(localStorage.getItem('token')).toBeNull();
      expect(authStore.selectUser()).toBeNull();
      expect(authStore.selectIsAuthenticated()).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      localStorage.setItem('token', 'test-token');
      expect(service.getToken()).toBe('test-token');
    });

    it('should return null when no token exists', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('checkAuthStatus', () => {
    it('should not set authenticated when no token exists', () => {
      // Service is initialized in beforeEach, so we just verify state
      expect(authStore.selectIsAuthenticated()).toBe(false);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token and update stored token', (done) => {
      const newAuthResponse: AuthResponse = {
        token: 'new-jwt-token',
        user: mockAuthResponse.user,
      };

      service.refreshToken().subscribe({
        next: (response) => {
          expect(response).toEqual(newAuthResponse);
          expect(localStorage.getItem('token')).toBe('new-jwt-token');
          expect(authStore.selectUser()).toEqual(newAuthResponse.user);
          done();
        },
      });

      const req = httpMock.expectOne('/api/auth/refresh');
      expect(req.request.method).toBe('POST');
      req.flush(newAuthResponse);
    });

    it('should handle refresh token failure', (done) => {
      service.refreshToken().subscribe({
        error: (error) => {
          expect(error.status).toBe(401);
          done();
        },
      });

      const req = httpMock.expectOne('/api/auth/refresh');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('getTokenExpiry', () => {
    it('should extract expiration from valid JWT', () => {
      // JWT with exp: 1760200000 (Jan 11, 2026 16:00:00 GMT)
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZXhwIjoxNzYwMjAwMDAwfQ.signature';
      const expiry = service.getTokenExpiry(token);
      expect(expiry).toBe(1760200000000); // Should be in milliseconds
    });

    it('should return null for invalid token', () => {
      const invalidToken = 'invalid-token';
      const expiry = service.getTokenExpiry(invalidToken);
      expect(expiry).toBeNull();
    });

    it('should return null for token without exp claim', () => {
      // JWT without exp claim
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIn0.signature';
      const expiry = service.getTokenExpiry(token);
      expect(expiry).toBeNull();
    });
  });

  describe('token refresh timer', () => {
    beforeEach(() => {
      jasmine.clock().install();
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should schedule token refresh before expiration', () => {
      // Create a token that expires in 10 minutes
      const futureTime = Date.now() + 10 * 60 * 1000;
      const tokenWithExpiry = createTokenWithExpiry(futureTime / 1000);

      const authResponse: AuthResponse = {
        token: tokenWithExpiry,
        user: mockAuthResponse.user,
      };

      service.login({ email: 'test@example.com', password: 'password' }).subscribe();

      const req = httpMock.expectOne('/api/auth/login');
      req.flush(authResponse);

      // Fast-forward to 5 minutes before expiry (when refresh should happen)
      jasmine.clock().tick(5 * 60 * 1000);

      // Verify refresh was called
      httpMock.expectOne('/api/auth/refresh');
    });

    it('should clear timer on logout', () => {
      // Create a token
      const futureTime = Date.now() + 10 * 60 * 1000;
      const tokenWithExpiry = createTokenWithExpiry(futureTime / 1000);

      localStorage.setItem('token', tokenWithExpiry);
      authStore.setUser(mockAuthResponse.user);

      service.logout();

      // Fast-forward time
      jasmine.clock().tick(10 * 60 * 1000);

      // Verify no refresh was attempted
      httpMock.expectNone('/api/auth/refresh');
    });
  });
});

/**
 * Helper function to create a JWT token with specific expiration
 */
function createTokenWithExpiry(expSeconds: number): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: 'test@example.com',
      exp: expSeconds,
      roles: ['ROLE_STUDENT'],
    })
  );
  return `${header}.${payload}.signature`;
}
