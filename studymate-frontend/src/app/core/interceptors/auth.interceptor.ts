import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * HTTP interceptor to add JWT token to outgoing requests
 * and handle 401 unauthorized responses with token refresh
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Get token from AuthService
  const token = authService.getToken();

  // Clone request and add Authorization header if token exists
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Handle the request and catch 401 errors
  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        // Don't retry refresh endpoint to avoid infinite loop
        if (req.url.includes('/auth/refresh')) {
          console.error('Token refresh failed, logging out');
          authService.logout();
          router.navigate(['/login']);
          return throwError(() => error);
        }

        // Don't retry login/register endpoints
        if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
          return throwError(() => error);
        }

        // Try to refresh token and retry request
        console.log('Received 401, attempting token refresh');
        return authService.refreshToken().pipe(
          switchMap((response) => {
            // Retry the original request with new token
            const newToken = response.token;
            const clonedReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`,
              },
            });
            console.log('Token refreshed, retrying request');
            return next(clonedReq);
          }),
          catchError((refreshError) => {
            // Refresh failed, logout user
            console.error('Token refresh failed, logging out', refreshError);
            authService.logout();
            router.navigate(['/login']);
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
