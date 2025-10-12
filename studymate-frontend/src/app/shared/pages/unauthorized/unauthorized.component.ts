import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStore } from '../../../store/auth/auth.store';

/**
 * Unauthorized Access Component
 *
 * Displays when user attempts to access a route they don't have permission for.
 * Shows different messages based on authentication status.
 */
@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full text-center">
        <!-- Unauthorized Icon -->
        <div class="mb-8">
          <svg
            class="mx-auto h-32 w-32 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>

        <!-- Error Message -->
        <h1 class="text-6xl font-extrabold text-gray-900 mb-4">403</h1>
        <h2 class="text-3xl font-bold text-gray-700 mb-4">Access Denied</h2>
        <p class="text-lg text-gray-600 mb-8">
          @if (isAuthenticated()) {
          You don't have permission to access this page. This area is restricted to study hall owners.
          } @else {
          You need to be logged in to access this page.
          }
        </p>

        <!-- User Info (if authenticated) -->
        @if (isAuthenticated() && userEmail()) {
        <div class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p class="text-sm text-yellow-800">
            Logged in as:
            <span class="font-semibold">{{ userEmail() }}</span>
          </p>
          <p class="text-xs text-yellow-700 mt-1">
            Role:
            <span class="font-semibold">{{ userRole() || 'Unknown' }}</span>
          </p>
        </div>
        }

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          @if (isAuthenticated()) {
          <button
            type="button"
            (click)="goBack()"
            class="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <svg
              class="mr-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Go Back
          </button>
          <button
            type="button"
            (click)="logout()"
            class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            <svg
              class="mr-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
          } @else {
          <a
            routerLink="/login"
            class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <svg
              class="mr-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
            Login
          </a>
          }
        </div>

        <!-- Help Text -->
        <div class="mt-12 text-sm text-gray-500">
          <p>
            If you need access to this area, please
            <a href="mailto:support@studymate.com" class="text-indigo-600 hover:text-indigo-500">
              contact your administrator
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  `,
})
export class UnauthorizedComponent {
  private router = inject(Router);
  private defaultAuthStore = inject(AuthStore);

  // Expose auth state
  isAuthenticated = this.defaultAuthStore.selectIsAuthenticated;
  userEmail = () => this.defaultAuthStore.selectUser()?.email;
  userRole = this.defaultAuthStore.selectUserRole;

  /**
   * Navigate back to previous page
   */
  goBack(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/']);
    }
  }

  /**
   * Logout and redirect to login page
   */
  logout(): void {
    this.defaultAuthStore.logout();
    this.router.navigate(['/login']);
  }
}
