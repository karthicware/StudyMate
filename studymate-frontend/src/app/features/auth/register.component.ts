import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Gender } from '../../core/models/auth.models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <!-- Page Background - Shade 1 (pushed deeper) -->
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">

      <!-- Register Card Container - Shade 2 (neutral base) with Two-Layer Shadow -->
      <div class="max-w-md w-full bg-white rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_3px_6px_rgba(0,0,0,0.15)] p-8">

        <!-- Header Section -->
        <div class="mb-8">
          <h2 class="text-3xl font-bold text-gray-900 text-center font-heading">
            Create your account
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600 font-body">
            Join StudyMate today
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

        <!-- Register Form -->
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-6">

          <!-- Form Fields -->
          <div class="space-y-5">
            <!-- First Name Input Field - Airbnb Style -->
            <div>
              <label for="firstName" class="block text-xs font-medium text-gray-700 mb-2">
                First Name <span class="text-danger-500">*</span>
              </label>
              <input
                id="firstName"
                type="text"
                formControlName="firstName"
                placeholder="John"
                class="w-full py-3 px-4 rounded-lg border border-gray-400
                       text-base font-normal text-gray-900 placeholder-gray-400
                       transition-all duration-200
                       focus:outline-none focus:border-2 focus:border-black
                       disabled:opacity-50 disabled:cursor-not-allowed"
                [class.border-danger-500]="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched"
                [class.focus:border-danger-500]="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched"
              />
              @if (registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched) {
                <p class="mt-2 text-sm text-danger-500">First name is required</p>
              }
            </div>

            <!-- Last Name Input Field - Airbnb Style -->
            <div>
              <label for="lastName" class="block text-xs font-medium text-gray-700 mb-2">
                Last Name <span class="text-danger-500">*</span>
              </label>
              <input
                id="lastName"
                type="text"
                formControlName="lastName"
                placeholder="Doe"
                class="w-full py-3 px-4 rounded-lg border border-gray-400
                       text-base font-normal text-gray-900 placeholder-gray-400
                       transition-all duration-200
                       focus:outline-none focus:border-2 focus:border-black
                       disabled:opacity-50 disabled:cursor-not-allowed"
                [class.border-danger-500]="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched"
                [class.focus:border-danger-500]="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched"
              />
              @if (registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched) {
                <p class="mt-2 text-sm text-danger-500">Last name is required</p>
              }
            </div>

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
                [class.border-danger-500]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
                [class.focus:border-danger-500]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
              />
              @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
                <p class="mt-2 text-sm text-danger-500">Please enter a valid email address</p>
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
                placeholder="Enter your password (min 6 characters)"
                class="w-full py-3 px-4 rounded-lg border border-gray-400
                       text-base font-normal text-gray-900 placeholder-gray-400
                       transition-all duration-200
                       focus:outline-none focus:border-2 focus:border-black
                       disabled:opacity-50 disabled:cursor-not-allowed"
                [class.border-danger-500]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
                [class.focus:border-danger-500]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
              />
              @if (registerForm.get('password')?.invalid && registerForm.get('password')?.touched) {
                <p class="mt-2 text-sm text-danger-500">Password must be at least 6 characters</p>
              }
            </div>

            <!-- Confirm Password Input Field - Airbnb Style -->
            <div>
              <label for="confirmPassword" class="block text-xs font-medium text-gray-700 mb-2">
                Confirm Password <span class="text-danger-500">*</span>
              </label>
              <input
                id="confirmPassword"
                type="password"
                formControlName="confirmPassword"
                placeholder="Confirm your password"
                class="w-full py-3 px-4 rounded-lg border border-gray-400
                       text-base font-normal text-gray-900 placeholder-gray-400
                       transition-all duration-200
                       focus:outline-none focus:border-2 focus:border-black
                       disabled:opacity-50 disabled:cursor-not-allowed"
                [class.border-danger-500]="registerForm.errors?.['passwordMismatch'] && registerForm.get('confirmPassword')?.touched"
                [class.focus:border-danger-500]="registerForm.errors?.['passwordMismatch'] && registerForm.get('confirmPassword')?.touched"
              />
              @if (registerForm.errors?.['passwordMismatch'] && registerForm.get('confirmPassword')?.touched) {
                <p class="mt-2 text-sm text-danger-500">Passwords do not match</p>
              }
            </div>

            <!-- Gender Dropdown - Optional -->
            <div>
              <label for="gender" class="block text-xs font-medium text-gray-700 mb-2">
                Gender (Optional)
              </label>
              <select
                id="gender"
                formControlName="gender"
                class="w-full py-3 px-4 rounded-lg border border-gray-400
                       text-base font-normal text-gray-900
                       transition-all duration-200
                       focus:outline-none focus:border-2 focus:border-black
                       disabled:opacity-50 disabled:cursor-not-allowed
                       appearance-none cursor-pointer bg-white"
                aria-describedby="gender-help"
              >
                @for (option of genderOptions; track option.value) {
                  <option [value]="option.value">{{ option.label }}</option>
                }
              </select>
              <p id="gender-help" class="mt-2 text-xs text-gray-500">
                Used for ladies-only seat booking validation
              </p>
            </div>
          </div>

          <!-- Primary Action Button with Gradient Enhancement -->
          <button
            type="submit"
            [disabled]="registerForm.invalid || isLoading()"
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
                Creating account...
              </span>
            } @else {
              <span>Create account</span>
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

          <!-- Login Link -->
          <div class="text-center">
            <p class="text-sm text-gray-600">
              Already have an account?
              <a
                routerLink="/login"
                class="font-semibold text-primary-500 hover:text-primary-600 hover:underline transition-all duration-200 ml-1">
                Sign in
              </a>
            </p>
          </div>

          <!-- Footer Note -->
          <div class="pt-4 border-t border-gray-200">
            <p class="text-xs text-gray-500 text-center">
              By creating an account, you agree to our
              <a href="#" class="text-gray-700 underline hover:text-gray-900">Terms of Service</a> and
              <a href="#" class="text-gray-700 underline hover:text-gray-900">Privacy Policy</a>
            </p>
          </div>
        </form>

      </div>
    </div>
  `,
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal('');

  // Gender options for dropdown
  genderOptions = [
    { value: '', label: 'Prefer not to say' },
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
    { value: 'OTHER', label: 'Other' }
  ];

  registerForm: FormGroup = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      gender: [''], // Optional gender field
    },
    { validators: this.passwordMatchValidator },
  );

  /**
   * Custom validator to check if password and confirmPassword match
   */
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    // Remove confirmPassword before sending to API
    const { confirmPassword, ...registerData } = this.registerForm.value;

    // Remove gender if empty string (not selected)
    if (registerData.gender === '') {
      delete registerData.gender;
    }

    this.authService.register(registerData).subscribe({
      next: () => {
        // Navigate to dashboard after successful registration
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.error?.message || 'Registration failed. Please try again.');
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }
}
