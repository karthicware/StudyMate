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
});
