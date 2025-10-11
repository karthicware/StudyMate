import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from '../models/auth.models';
import { AuthStore } from '../../store/auth/auth.store';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authStore = inject(AuthStore);

  private readonly TOKEN_KEY = 'token';
  private readonly API_URL = '/api/auth';
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;

  // Expose computed selectors from store
  isAuthenticated = this.authStore.selectIsAuthenticated;
  currentUser = this.authStore.selectUser;

  constructor() {
    // Check if token exists on initialization
    this.checkAuthStatus();
  }

  /**
   * Authenticate user with email and password
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    this.authStore.setLoading(true);
    return this.http
      .post<AuthResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap((response) => {
          this.storeToken(response.token);
          this.authStore.setUser(response.user);
          this.startTokenRefresh(response.token);
        })
      );
  }

  /**
   * Register new user
   */
  register(userData: RegisterRequest): Observable<AuthResponse> {
    this.authStore.setLoading(true);
    return this.http
      .post<AuthResponse>(`${this.API_URL}/register`, userData)
      .pipe(
        tap((response) => {
          this.storeToken(response.token);
          this.authStore.setUser(response.user);
          this.startTokenRefresh(response.token);
        })
      );
  }

  /**
   * Logout user and clear authentication state
   */
  logout(): void {
    this.stopTokenRefresh();
    this.removeToken();
    this.authStore.logout();
    this.router.navigate(['/login']);
  }

  /**
   * Refresh JWT token
   * Requires valid JWT token to be present
   */
  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/refresh`, {}).pipe(
      tap((response) => {
        this.storeToken(response.token);
        this.authStore.setUser(response.user);
        this.startTokenRefresh(response.token);
      })
    );
  }

  /**
   * Get JWT token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get token expiration timestamp from JWT
   * @returns expiration timestamp in milliseconds, or null if invalid
   */
  getTokenExpiry(token: string): number | null {
    try {
      const decoded: any = jwtDecode(token);
      if (decoded.exp) {
        return decoded.exp * 1000; // Convert seconds to milliseconds
      }
      return null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Store JWT token in localStorage
   */
  private storeToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Remove JWT token from localStorage
   */
  private removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Check authentication status on service initialization
   * Starts token refresh timer if valid token exists
   */
  private checkAuthStatus(): void {
    const token = this.getToken();
    if (token) {
      const expiry = this.getTokenExpiry(token);
      if (expiry && expiry > Date.now()) {
        // Token is valid and not expired, start refresh timer
        this.startTokenRefresh(token);
      } else {
        // Token is expired, remove it
        this.removeToken();
      }
    }
  }

  /**
   * Start automatic token refresh timer
   * Refreshes token 5 minutes before expiration
   * @param token JWT token to calculate refresh time
   */
  private startTokenRefresh(token: string): void {
    // Clear any existing timer
    this.stopTokenRefresh();

    const expiry = this.getTokenExpiry(token);
    if (!expiry) {
      console.warn('Cannot start token refresh: invalid token expiration');
      return;
    }

    // Calculate time to refresh (5 minutes before expiry)
    const REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 minutes
    const refreshTime = expiry - REFRESH_BUFFER_MS;
    const timeout = refreshTime - Date.now();

    // Only set timer if refresh time is in the future
    if (timeout > 0) {
      console.log(
        `Token refresh scheduled in ${Math.round(timeout / 1000)} seconds`
      );
      this.refreshTimer = setTimeout(() => {
        console.log('Refreshing token...');
        this.refreshToken().subscribe({
          next: () => console.log('Token refreshed successfully'),
          error: (err) => {
            console.error('Token refresh failed:', err);
            // If refresh fails, logout user
            this.logout();
          },
        });
      }, timeout);
    } else {
      console.warn('Token expires soon or already expired, refreshing now');
      // Token expires very soon, refresh immediately
      this.refreshToken().subscribe({
        next: () => console.log('Token refreshed successfully'),
        error: (err) => {
          console.error('Token refresh failed:', err);
          this.logout();
        },
      });
    }
  }

  /**
   * Stop automatic token refresh timer
   */
  private stopTokenRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
      console.log('Token refresh timer stopped');
    }
  }
}
