import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen flex flex-col">
      <!-- Header with Airbnb-inspired Design System -->
      <!-- Shade 2 (neutral base) with Two-Layer Shadow (Small level) -->
      <header
        class="bg-white border-b border-gray-200 py-4 px-6
                     shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_1px_2px_rgba(0,0,0,0.1)]"
      >
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <!-- Logo with Primary Color -->
          <a
            href="/"
            class="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200"
          >
            <!-- Brand Icon with Primary Color -->
            <svg class="h-8 w-8" viewBox="0 0 24 24" fill="#ff3f6c" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span class="text-2xl font-bold text-gray-900 font-heading">StudyMate</span>
          </a>

          <!-- Navigation Links -->
          <nav class="hidden sm:flex items-center gap-6">
            <a
              href="/"
              class="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
            >
              Home
            </a>
            <a
              href="/about"
              class="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
            >
              About
            </a>
            <a
              href="/contact"
              class="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
            >
              Contact
            </a>
          </nav>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1 flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <router-outlet />
      </main>

      <!-- Footer with Airbnb-inspired Design System -->
      <!-- Shade 2 (neutral base) with subtle top border -->
      <footer class="bg-white py-6 px-6 border-t border-gray-200">
        <div class="max-w-7xl mx-auto">
          <!-- Footer Content -->
          <div class="flex flex-col md:flex-row items-center justify-between gap-4">
            <!-- Copyright -->
            <p class="text-sm text-gray-600 font-body">© 2025 StudyMate. All rights reserved.</p>

            <!-- Footer Links -->
            <div class="flex items-center gap-6 text-sm">
              <a
                href="/privacy"
                class="text-gray-700 hover:text-gray-900 hover:underline transition-all duration-200 font-medium"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                class="text-gray-700 hover:text-gray-900 hover:underline transition-all duration-200 font-medium"
              >
                Terms of Service
              </a>
              <a
                href="/contact"
                class="text-gray-700 hover:text-gray-900 hover:underline transition-all duration-200 font-medium"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `,
})
export class AuthLayoutComponent {}
