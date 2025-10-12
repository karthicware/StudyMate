import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

/**
 * 404 Not Found Component
 *
 * Displays when user navigates to a non-existent route.
 * Provides a link back to the dashboard for authenticated users.
 */
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div
      class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div class="max-w-md w-full text-center">
        <!-- 404 Icon -->
        <div class="mb-8">
          <svg
            class="mx-auto h-32 w-32 text-indigo-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <!-- Error Message -->
        <h1 class="text-6xl font-extrabold text-gray-900 mb-4">404</h1>
        <h2 class="text-3xl font-bold text-gray-700 mb-4">Page Not Found</h2>
        <p class="text-lg text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for. The page may have been moved or
          deleted.
        </p>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
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
          <a
            routerLink="/owner/dashboard"
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
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Return to Dashboard
          </a>
        </div>

        <!-- Help Text -->
        <div class="mt-12 text-sm text-gray-500">
          <p>
            If you believe this is an error, please
            <a href="mailto:support@studymate.com" class="text-indigo-600 hover:text-indigo-500">
              contact support
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  `,
})
export class NotFoundComponent {
  constructor(private router: Router) {}

  /**
   * Navigate back to previous page
   */
  goBack(): void {
    // Try to go back in history, or default to dashboard
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/owner/dashboard']);
    }
  }
}
