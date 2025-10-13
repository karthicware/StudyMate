import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <!-- Page Background - Shade 1 (pushed deeper) -->
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">

      <!-- Login Card Container - Shade 2 (neutral base) with Two-Layer Shadow -->
      <div class="max-w-md w-full bg-white rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_3px_6px_rgba(0,0,0,0.15)] p-8">

        <!-- Header Section -->
        <div class="mb-8">
          <h2 class="text-3xl font-bold text-gray-900 text-center font-heading">
            Welcome back
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600 font-body">
            Sign in to your Owner account
          </p>
        </div>

        <!-- Error Message with Airbnb-style Alert -->
        @if (errorMessage()) {
          <div class="mb-6 rounded-lg bg-danger-50 border border-danger-200 p-4">
            <div class="flex">
              <svg class="h-5 w-5 text-danger-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <div class="ml-3">
                <p class="text-sm text-danger-700 font-medium">
                  {{ errorMessage() }}
                </p>
              </div>
            </div>
          </div>
        }

        <!-- Login Form -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">

          <!-- Email Input Field - Airbnb Style -->
          <div>
            <label for="email" class="block text-xs font-medium text-gray-700 mb-2">
              Email address <span class="text-danger-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="you@example.com"
              class="w-full py-3 px-4 rounded-lg border border-gray-400
                     text-base font-normal text-gray-900 placeholder-gray-400
                     transition-all duration-200
                     focus:outline-none focus:border-2 focus:border-black
                     disabled:opacity-50 disabled:cursor-not-allowed"
              [class.border-danger-500]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
              [class.focus:border-danger-500]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
            />
            @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
              <p class="mt-2 text-sm text-danger-500">
                Please enter a valid email address
              </p>
            }
          </div>

          <!-- Password Input Field - Airbnb Style -->
          <div>
            <label for="password" class="block text-xs font-medium text-gray-700 mb-2">
              Password <span class="text-danger-500">*</span>
            </label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="Enter your password"
              class="w-full py-3 px-4 rounded-lg border border-gray-400
                     text-base font-normal text-gray-900 placeholder-gray-400
                     transition-all duration-200
                     focus:outline-none focus:border-2 focus:border-black
                     disabled:opacity-50 disabled:cursor-not-allowed"
              [class.border-danger-500]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
              [class.focus:border-danger-500]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
            />
            @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
              <p class="mt-2 text-sm text-danger-500">
                Password must be at least 6 characters
              </p>
            }
          </div>

          <!-- Primary Action Button with Gradient Enhancement -->
          <button
            type="submit"
            [disabled]="loginForm.invalid || isLoading()"
            class="w-full py-4 px-6 rounded-xl
                   bg-gradient-to-r from-[#ff568c] to-[#ff3f6c]
                   hover:from-[#e31c5f] hover:to-[#c01852]
                   text-white font-semibold text-base
                   shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_3px_6px_rgba(0,0,0,0.15)]
                   hover:shadow-[inset_0_2px_0_rgba(255,255,255,0.4),0_6px_12px_rgba(0,0,0,0.2)]
                   transition-all duration-300 ease-in-out
                   disabled:opacity-50 disabled:cursor-not-allowed
                   focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2"
          >
            @if (isLoading()) {
              <span class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            } @else {
              <span>Sign in</span>
            }
          </button>

          <!-- Divider with "or" -->
          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-4 bg-white text-gray-500 font-medium">or</span>
            </div>
          </div>

          <!-- Register Link -->
          <div class="text-center">
            <p class="text-sm text-gray-600">
              Don't have an owner account?
              <a
                routerLink="/register"
                class="font-semibold text-primary-500 hover:text-primary-600 hover:underline transition-all duration-200 ml-1">
                Register now
              </a>
            </p>
          </div>

          <!-- Additional Links -->
          <div class="pt-4 border-t border-gray-200">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
              <a href="#" class="text-gray-700 hover:text-gray-900 hover:underline transition-all duration-200">
                Forgot password?
              </a>
              <a href="#" class="text-gray-700 hover:text-gray-900 hover:underline transition-all duration-200">
                Need help?
              </a>
            </div>
          </div>
        </form>

        <!-- Footer Note -->
        <div class="mt-8 pt-6 border-t border-gray-200">
          <p class="text-xs text-gray-500 text-center">
            By signing in, you agree to our
            <a href="#" class="text-gray-700 underline hover:text-gray-900">Terms of Service</a> and
            <a href="#" class="text-gray-700 underline hover:text-gray-900">Privacy Policy</a>
          </p>
        </div>

      </div>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isLoading = signal(false);
  errorMessage = signal('');

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        // Get return URL from query params or determine by role
        let returnUrl = this.route.snapshot.queryParams['returnUrl'];

        if (!returnUrl) {
          // Redirect based on user role
          const userRole = response.user.role;
          if (userRole === 'ROLE_OWNER') {
            returnUrl = '/owner/dashboard';
          } else {
            returnUrl = '/dashboard';
          }
        }

        this.router.navigate([returnUrl]);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          error.error?.message || 'Login failed. Please check your credentials.',
        );
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }
}
