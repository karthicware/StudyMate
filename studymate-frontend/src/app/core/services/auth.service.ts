import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
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
        })
      );
  }

  /**
   * Logout user and clear authentication state
   */
  logout(): void {
    this.removeToken();
    this.authStore.logout();
    this.router.navigate(['/login']);
  }

  /**
   * Get JWT token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
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
   *
   * SECURITY NOTE: This is a basic implementation for MVP.
   * Production improvements needed:
   * - Decode JWT to validate expiration before accepting token
   * - Call backend to validate token freshness
   * - Load user profile data from backend
   * - Implement token refresh logic
   * - Consider using HttpOnly cookies instead of localStorage
   */
  private checkAuthStatus(): void {
    const token = this.getToken();
    if (token) {
      // Token exists - we trust it for now
      // In production, should validate token expiration and fetch user profile
      // For MVP: Token presence is sufficient, user data will be loaded on next API call
    }
  }
}
