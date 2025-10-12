import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen flex flex-col">
      <!-- Header -->
      <header class="bg-white shadow-sm py-4 px-6">
        <div class="max-w-7xl mx-auto">
          <a href="/" class="text-2xl font-bold text-blue-600 hover:text-blue-700">StudyMate</a>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1 flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <router-outlet />
      </main>

      <!-- Footer -->
      <footer class="bg-white py-4 px-6 border-t border-gray-200">
        <div class="max-w-7xl mx-auto text-center">
          <p class="text-sm text-gray-600">© 2025 StudyMate. All rights reserved.</p>
          <div class="mt-2 space-x-4 text-sm">
            <a href="/privacy" class="text-blue-600 hover:text-blue-800">Privacy Policy</a>
            <span class="text-gray-400">|</span>
            <a href="/terms" class="text-blue-600 hover:text-blue-800">Terms of Service</a>
            <span class="text-gray-400">|</span>
            <a href="/contact" class="text-blue-600 hover:text-blue-800">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  `,
})
export class AuthLayoutComponent {}
