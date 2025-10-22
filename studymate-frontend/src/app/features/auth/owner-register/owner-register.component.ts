import { Component, signal, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { OwnerRegistrationRequest, Gender } from '../../../core/models/auth.models';

@Component({
  selector: 'app-owner-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './owner-register.component.html',
  styleUrls: ['./owner-register.component.scss'],
})
export class OwnerRegisterComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signals for reactive state
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  passwordStrength = signal<'weak' | 'medium' | 'strong'>('weak');

  registerForm: FormGroup;
  private passwordSubscription?: Subscription;

  // Gender options for dropdown
  genderOptions = [
    { value: '', label: 'Prefer not to say' },
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
    { value: 'OTHER', label: 'Other' },
  ];

  constructor() {
    this.registerForm = this.fb.group(
      {
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, this.passwordStrengthValidator]],
        confirmPassword: ['', [Validators.required]],
        phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
        gender: [''], // Optional gender field
        businessName: ['', [Validators.required, Validators.minLength(3)]],
        termsAccepted: [false, [Validators.requiredTrue]],
      },
      { validators: this.passwordMatchValidator },
    );

    // Update password strength on password changes
    this.passwordSubscription = this.registerForm
      .get('password')
      ?.valueChanges.subscribe((value) => {
        this.updatePasswordStrength(value || '');
      });

    // Clear error messages on form value changes
    this.registerForm.valueChanges.subscribe(() => {
      if (this.errorMessage()) {
        this.errorMessage.set(null);
      }
    });
  }

  ngOnDestroy(): void {
    this.passwordSubscription?.unsubscribe();
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      this.successMessage.set(null);

      const request: OwnerRegistrationRequest = {
        firstName: this.registerForm.value.firstName,
        lastName: this.registerForm.value.lastName,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        phone: this.registerForm.value.phone,
        businessName: this.registerForm.value.businessName,
      };

      // Include gender only if selected (not empty string)
      if (this.registerForm.value.gender) {
        request.gender = this.registerForm.value.gender as Gender;
      }

      this.authService.registerOwner(request).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.successMessage.set(
            response.message ||
              'Registration successful! Please check your email to verify your account.',
          );
          // Navigate to email verification page after short delay
          setTimeout(() => {
            this.router.navigate(['/auth/verify-email'], {
              queryParams: { email: request.email },
            });
          }, 2000);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.handleError(error);
        },
      });
    } else {
      this.markFormGroupTouched(this.registerForm);
    }
  }

  private passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const isLengthValid = value.length >= 8;

    const passwordValid =
      hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && isLengthValid;

    return passwordValid
      ? null
      : {
          passwordStrength: {
            hasUpperCase,
            hasLowerCase,
            hasNumber,
            hasSpecialChar,
            isLengthValid,
          },
        };
  }

  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  private updatePasswordStrength(password: string): void {
    if (!password) {
      this.passwordStrength.set('weak');
      return;
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLengthValid = password.length >= 8;

    const strength = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar, isLengthValid].filter(
      Boolean,
    ).length;

    if (strength === 5) {
      this.passwordStrength.set('strong');
    } else if (strength >= 3) {
      this.passwordStrength.set('medium');
    } else {
      this.passwordStrength.set('weak');
    }
  }

  private handleError(error: { status: number; error?: { message?: string } }): void {
    if (error.status === 409) {
      this.errorMessage.set(
        'An account with this email already exists. Please use a different email or try logging in.',
      );
    } else if (error.status === 400) {
      this.errorMessage.set(
        error.error?.message || 'Validation failed. Please check your input and try again.',
      );
    } else {
      this.errorMessage.set('An unexpected error occurred. Please try again later.');
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update((value) => !value);
  }

  // Helper methods for template
  get passwordStrengthColor(): string {
    switch (this.passwordStrength()) {
      case 'strong':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      default:
        return 'bg-red-500';
    }
  }

  get passwordStrengthWidth(): string {
    switch (this.passwordStrength()) {
      case 'strong':
        return 'w-full';
      case 'medium':
        return 'w-2/3';
      default:
        return 'w-1/3';
    }
  }

  get passwordStrengthText(): string {
    switch (this.passwordStrength()) {
      case 'strong':
        return 'Strong password';
      case 'medium':
        return 'Medium strength';
      default:
        return 'Weak password';
    }
  }
}
