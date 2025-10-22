import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HallManagementService } from '../../../core/services/hall-management.service';
import { HallCreateRequest, SUPPORTED_COUNTRIES } from '../../../core/models/hall.model';

/**
 * Owner Onboarding Wizard Component
 *
 * Multi-step wizard for onboarding new owners:
 * - Step 1: Hall Setup (this component)
 * - Step 2: Pricing Configuration (Story 0.1.7)
 * - Step 3: Location Configuration (Story 0.1.8)
 *
 * Displays automatically on first login after owner registration.
 * Owner can skip onboarding and create hall later from dashboard.
 */
@Component({
  selector: 'app-owner-onboarding-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './owner-onboarding-wizard.component.html',
  styleUrls: ['./owner-onboarding-wizard.component.scss'],
})
export class OwnerOnboardingWizardComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private hallManagementService = inject(HallManagementService);

  // Signals for reactive state
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  showSkipConfirmation = signal(false);

  // Form group
  hallForm!: FormGroup;

  // Supported countries for dropdown
  supportedCountries = SUPPORTED_COUNTRIES;

  // Current step (1 of 3)
  currentStep = 1;
  totalSteps = 3;

  // Created hall ID (for passing to next step)
  createdHallId = signal<string | null>(null);

  ngOnInit(): void {
    this.initializeForm();
  }

  /**
   * Initialize reactive form with validation rules
   */
  private initializeForm(): void {
    this.hallForm = this.fb.group({
      hallName: [
        '',
        [
          Validators.required,
          Validators.maxLength(255),
          Validators.pattern(/^[a-zA-Z0-9\s]+$/), // Alphanumeric + spaces only
        ],
      ],
      description: ['', [Validators.maxLength(1000)]],
      address: ['', [Validators.required, Validators.maxLength(500)]],
      city: ['', [Validators.required, Validators.maxLength(100)]],
      state: ['', [Validators.required, Validators.maxLength(100)]],
      postalCode: [
        '',
        [
          Validators.maxLength(20),
          Validators.pattern(/^[a-zA-Z0-9\s-]+$/), // Postal code format
        ],
      ],
      country: ['India', [Validators.required]], // Default to India
    });
  }

  /**
   * Submit hall creation form
   */
  onSubmit(): void {
    if (this.hallForm.invalid) {
      this.markFormGroupTouched(this.hallForm);
      this.errorMessage.set('Please fill in all required fields correctly.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const hallData: HallCreateRequest = this.hallForm.value;

    this.hallManagementService.createHall(hallData).subscribe({
      next: (hall) => {
        this.isLoading.set(false);
        this.successMessage.set('Hall created successfully!');
        this.createdHallId.set(hall.id);

        // Store hall ID in session/localStorage for next steps
        sessionStorage.setItem('onboardingHallId', hall.id);
        sessionStorage.setItem('onboardingHallName', hall.hallName);

        // TODO: Advance to next onboarding step (pricing - Story 0.1.7)
        // For now, redirect to dashboard as placeholder
        setTimeout(() => {
          this.router.navigate(['/owner/dashboard']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.message || 'Failed to create hall. Please try again.');
        console.error('Hall creation error:', error);
      },
    });
  }

  /**
   * Show skip confirmation dialog
   */
  onSkipClick(): void {
    this.showSkipConfirmation.set(true);
  }

  /**
   * Cancel skip action
   */
  onCancelSkip(): void {
    this.showSkipConfirmation.set(false);
  }

  /**
   * Confirm skip and navigate to dashboard
   */
  onConfirmSkip(): void {
    // Set flag in localStorage to indicate onboarding was skipped
    localStorage.setItem('onboardingSkipped', 'true');

    // Navigate to dashboard
    this.router.navigate(['/owner/dashboard']);
  }

  /**
   * Check if form field has error
   */
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.hallForm.get(fieldName);
    return !!(field && field.hasError(errorType) && (field.dirty || field.touched));
  }

  /**
   * Get form field error message
   */
  getErrorMessage(fieldName: string): string | null {
    const field = this.hallForm.get(fieldName);
    if (!field || !(field.dirty || field.touched)) {
      return null;
    }

    if (field.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (field.hasError('maxlength')) {
      const maxLength = field.errors?.['maxlength'].requiredLength;
      return `${this.getFieldLabel(fieldName)} cannot exceed ${maxLength} characters`;
    }
    if (field.hasError('pattern')) {
      return `${this.getFieldLabel(fieldName)} has invalid format`;
    }

    return null;
  }

  /**
   * Get human-readable field label
   */
  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      hallName: 'Hall name',
      description: 'Description',
      address: 'Address',
      city: 'City',
      state: 'State/Province',
      postalCode: 'Postal code',
      country: 'Country',
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Mark all form fields as touched to show validation errors
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
