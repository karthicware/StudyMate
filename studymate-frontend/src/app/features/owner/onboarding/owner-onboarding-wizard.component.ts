import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GoogleMapsModule } from '@angular/google-maps';
import { HallManagementService } from '../../../core/services/hall-management.service';
import {
  HallCreateRequest,
  SUPPORTED_COUNTRIES,
  REGION_OPTIONS,
  Region,
  HallLocationUpdateRequest,
} from '../../../core/models/hall.model';
import { retry, catchError } from 'rxjs/operators';
import { throwError, timer } from 'rxjs';
import { environment } from '../../../../environments/environment';

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

// Constants
const SUCCESS_MESSAGE_DURATION_MS = 1500;
const DEFAULT_BASE_PRICING_INR = 100;
const MIN_PRICING_INR = 50;
const MAX_PRICING_INR = 5000;
const MAX_RETRY_ATTEMPTS = 2;
const STORAGE_KEY_HALL_ID = 'onboardingHallId';
const STORAGE_KEY_HALL_NAME = 'onboardingHallName';
const STORAGE_KEY_PRICING_SKIPPED = 'pricingSkipped';
const STORAGE_KEY_ONBOARDING_SKIPPED = 'onboardingSkipped';

@Component({
  selector: 'app-owner-onboarding-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GoogleMapsModule],
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
  currentStep = signal(1); // Multi-step wizard: 1=Hall Setup, 2=Pricing, 3=Location

  // Form groups
  hallForm!: FormGroup;
  pricingForm!: FormGroup;
  locationForm!: FormGroup;

  // Supported countries for dropdown
  supportedCountries = SUPPORTED_COUNTRIES;

  // Region options for dropdown
  regionOptions = REGION_OPTIONS;

  // Total steps
  totalSteps = 3;

  // Created hall ID (for passing between steps)
  createdHallId = signal<string | null>(null);

  // Google Maps configuration
  googleMapsApiKey = environment.googleMapsApiKey;
  mapCenter = signal<google.maps.LatLngLiteral>({ lat: 19.076, lng: 72.8777 }); // Default: Mumbai
  mapMarkerPosition = signal<google.maps.LatLngLiteral | null>(null);
  mapOptions: google.maps.MapOptions = {
    zoom: 12,
    disableDefaultUI: false,
    mapTypeControl: true,
  };

  ngOnInit(): void {
    this.initializeForm();
    this.initializePricingForm();
    this.initializeLocationForm();
    this.restoreOnboardingState();
  }

  /**
   * Restore onboarding state from session storage
   * Handles browser refresh during onboarding flow
   */
  private restoreOnboardingState(): void {
    const savedHallId = sessionStorage.getItem(STORAGE_KEY_HALL_ID);
    if (savedHallId) {
      this.createdHallId.set(savedHallId);
      // If we have a hall ID, we're likely on Step 2 or later
      // User can manually navigate back to Step 1 if needed
      console.log('Restored onboarding state - Hall ID:', savedHallId);
    }
  }

  /**
   * Initialize reactive form with validation rules (Step 1: Hall Setup)
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
   * Initialize pricing form (Step 2: Pricing Configuration)
   */
  private initializePricingForm(): void {
    this.pricingForm = this.fb.group({
      basePricing: [
        DEFAULT_BASE_PRICING_INR,
        [Validators.required, Validators.min(MIN_PRICING_INR), Validators.max(MAX_PRICING_INR)],
      ],
    });
  }

  /**
   * Initialize location form (Step 3: Location Configuration)
   */
  private initializeLocationForm(): void {
    this.locationForm = this.fb.group({
      latitude: [{ value: '', disabled: true }, [Validators.required]],
      longitude: [{ value: '', disabled: true }, [Validators.required]],
      region: ['', [Validators.required]],
    });
  }

  /**
   * Submit hall creation form (Step 1)
   * Includes automatic retry for transient network failures
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

    this.hallManagementService
      .createHall(hallData)
      .pipe(
        retry({
          count: MAX_RETRY_ATTEMPTS,
          delay: (error, retryCount) => {
            // Only retry on network errors (not validation errors like 400, 409)
            if (error.status === 0 || error.status >= 500) {
              console.log(
                `Retrying hall creation (attempt ${retryCount + 1}/${MAX_RETRY_ATTEMPTS})...`,
              );
              // Return a timer to retry immediately
              return timer(0);
            }
            // Don't retry on client errors - throw to stop retry
            throw error;
          },
          resetOnSuccess: true,
        }),
        catchError((error) => throwError(() => error)),
      )
      .subscribe({
        next: (hall) => {
          this.isLoading.set(false);
          this.successMessage.set('Hall created successfully!');
          this.createdHallId.set(hall.id);

          // Store hall ID in session storage for next steps
          sessionStorage.setItem(STORAGE_KEY_HALL_ID, hall.id);
          sessionStorage.setItem(STORAGE_KEY_HALL_NAME, hall.hallName);

          // Advance to Step 2: Pricing Configuration (Story 0.1.7)
          setTimeout(() => {
            this.successMessage.set(null);
            this.currentStep.set(2);
          }, SUCCESS_MESSAGE_DURATION_MS);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.message || 'Failed to create hall. Please try again.');
          console.error('Hall creation error:', error);
        },
      });
  }

  /**
   * Submit pricing form (Step 2)
   * Includes automatic retry for transient network failures
   */
  onPricingSubmit(): void {
    if (this.pricingForm.invalid) {
      this.markFormGroupTouched(this.pricingForm);
      this.errorMessage.set('Please enter a valid pricing amount.');
      return;
    }

    const hallId = this.createdHallId();
    if (!hallId) {
      this.errorMessage.set('Hall ID not found. Please start over.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const basePricing = this.pricingForm.value.basePricing;

    this.hallManagementService
      .updateHallPricing(hallId, basePricing)
      .pipe(
        retry({
          count: MAX_RETRY_ATTEMPTS,
          delay: (error, retryCount) => {
            // Only retry on network errors (not validation errors like 400, 404)
            if (error.status === 0 || error.status >= 500) {
              console.log(
                `Retrying pricing update (attempt ${retryCount + 1}/${MAX_RETRY_ATTEMPTS})...`,
              );
              return timer(0);
            }
            // Don't retry on client errors
            throw error;
          },
        }),
        catchError((error) => throwError(() => error)),
      )
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.successMessage.set('Pricing saved successfully!');

          // Advance to Step 3: Location Configuration (Story 0.1.8)
          setTimeout(() => {
            this.successMessage.set(null);
            this.currentStep.set(3);
          }, SUCCESS_MESSAGE_DURATION_MS);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.message || 'Failed to save pricing. Please try again.');
          console.error('Pricing update error:', error);
        },
      });
  }

  /**
   * Submit location form (Step 3)
   * Includes automatic retry for transient network failures
   * Updates hall status to ACTIVE and redirects to dashboard
   */
  onLocationSubmit(): void {
    // Check if lat/lng have values (disabled fields bypass standard validation)
    const latitude = this.locationForm.get('latitude')?.value;
    const longitude = this.locationForm.get('longitude')?.value;
    const region = this.locationForm.value.region;

    if (!latitude || !longitude || !region) {
      this.markFormGroupTouched(this.locationForm);
      this.errorMessage.set('Please select a location on the map and choose a region.');
      return;
    }

    const hallId = this.createdHallId();
    if (!hallId) {
      this.errorMessage.set('Hall ID not found. Please start over.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const locationData: HallLocationUpdateRequest = {
      latitude,
      longitude,
      region: region as Region,
    };

    this.hallManagementService
      .updateHallLocation(hallId, locationData)
      .pipe(
        retry({
          count: MAX_RETRY_ATTEMPTS,
          delay: (error, retryCount) => {
            // Only retry on network errors (not validation errors like 400, 404)
            if (error.status === 0 || error.status >= 500) {
              console.log(
                `Retrying location update (attempt ${retryCount + 1}/${MAX_RETRY_ATTEMPTS})...`,
              );
              return timer(0);
            }
            // Don't retry on client errors
            throw error;
          },
        }),
        catchError((error) => throwError(() => error)),
      )
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.successMessage.set(`Hall activated! Welcome to StudyMate`);

          // Clear session storage
          sessionStorage.removeItem(STORAGE_KEY_HALL_ID);
          sessionStorage.removeItem(STORAGE_KEY_HALL_NAME);

          // Redirect to dashboard
          setTimeout(() => {
            this.router.navigate(['/owner/dashboard']);
          }, SUCCESS_MESSAGE_DURATION_MS);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.message || 'Failed to save location. Please try again.');
          console.error('Location update error:', error);
        },
      });
  }

  /**
   * Skip pricing step and set hall to DRAFT status
   */
  onSkipPricing(): void {
    // Set flag to indicate pricing was skipped
    localStorage.setItem(STORAGE_KEY_PRICING_SKIPPED, 'true');

    // Navigate to dashboard (hall remains in DRAFT status)
    this.router.navigate(['/owner/dashboard']);
  }

  /**
   * Skip location step and navigate to dashboard
   * Hall remains in current status (after pricing configuration)
   */
  onSkipLocation(): void {
    // Clear session storage
    sessionStorage.removeItem(STORAGE_KEY_HALL_ID);
    sessionStorage.removeItem(STORAGE_KEY_HALL_NAME);

    // Navigate to dashboard (hall remains in current status)
    this.router.navigate(['/owner/dashboard']);
  }

  /**
   * Show skip confirmation dialog (Step 1 only)
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
    localStorage.setItem(STORAGE_KEY_ONBOARDING_SKIPPED, 'true');

    // Navigate to dashboard
    this.router.navigate(['/owner/dashboard']);
  }

  /**
   * Handle map click event to set location
   * Updates latitude, longitude, and map marker
   */
  onMapClick(event: google.maps.MapMouseEvent): void {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();

      // Update map marker position
      this.mapMarkerPosition.set({ lat, lng });

      // Update form values (enable first, then set value, then disable again)
      this.locationForm.get('latitude')?.enable();
      this.locationForm.get('longitude')?.enable();
      this.locationForm.patchValue({
        latitude: lat,
        longitude: lng,
      });
      this.locationForm.get('latitude')?.disable();
      this.locationForm.get('longitude')?.disable();
    }
  }

  /**
   * Check if form field has error (supports all forms)
   */
  hasError(fieldName: string, errorType: string, formGroup?: FormGroup): boolean {
    const form = formGroup || this.hallForm;
    const field = form.get(fieldName);
    return !!(field && field.hasError(errorType) && (field.dirty || field.touched));
  }

  /**
   * Get form field error message (supports all forms)
   */
  getErrorMessage(fieldName: string, formGroup?: FormGroup): string | null {
    const form = formGroup || this.hallForm;
    const field = form.get(fieldName);
    if (!field || !(field.dirty || field.touched)) {
      return null;
    }

    if (field.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (field.hasError('min')) {
      const min = field.errors?.['min'].min;
      return `${this.getFieldLabel(fieldName)} must be at least ₹${min}`;
    }
    if (field.hasError('max')) {
      const max = field.errors?.['max'].max;
      return `${this.getFieldLabel(fieldName)} cannot exceed ₹${max}`;
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
  getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      hallName: 'Hall name',
      description: 'Description',
      address: 'Address',
      city: 'City',
      state: 'State/Province',
      postalCode: 'Postal code',
      country: 'Country',
      basePricing: 'Base pricing',
      latitude: 'Latitude',
      longitude: 'Longitude',
      region: 'Region',
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Mark all form fields as touched to show validation errors
   */
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
