import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { AuthStore } from '../../store/auth/auth.store';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let router: Router;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        AuthService,
        AuthStore,
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService);

    localStorage.clear();
    spyOn(router, 'navigate');
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should add Authorization header when token exists', () => {
    localStorage.setItem('token', 'test-jwt-token');

    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBe(true);
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-jwt-token');
    req.flush({});
  });

  it('should not add Authorization header when token does not exist', () => {
    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should handle 401 error and redirect to login', () => {
    localStorage.setItem('token', 'test-jwt-token');
    spyOn(authService, 'logout');

    httpClient.get('/api/protected').subscribe({
      error: () => {
        expect(authService.logout).toHaveBeenCalled();
      },
    });

    const req = httpMock.expectOne('/api/protected');
    req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
  });

  it('should not handle non-401 errors', () => {
    spyOn(authService, 'logout');

    httpClient.get('/api/test').subscribe({
      error: () => {
        expect(authService.logout).not.toHaveBeenCalled();
      },
    });

    const req = httpMock.expectOne('/api/test');
    req.flush({ message: 'Server Error' }, { status: 500, statusText: 'Server Error' });
  });
});
