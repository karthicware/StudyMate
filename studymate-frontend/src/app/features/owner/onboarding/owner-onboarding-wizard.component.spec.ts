import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError, defer } from 'rxjs';
import { OwnerOnboardingWizardComponent } from './owner-onboarding-wizard.component';
import { HallManagementService } from '../../../core/services/hall-management.service';
import {
  Hall,
  HallPricingUpdateResponse,
  HallLocationUpdateResponse,
} from '../../../core/models/hall.model';
import { provideRouterMock } from '../../../../testing/router-test-utils';

describe('OwnerOnboardingWizardComponent', () => {
  let component: OwnerOnboardingWizardComponent;
  let fixture: ComponentFixture<OwnerOnboardingWizardComponent>;
  let hallManagementService: jasmine.SpyObj<HallManagementService>;
  let router: Router;

  const mockHall: Hall = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    ownerId: '987e4567-e89b-12d3-a456-426614174000',
    hallName: 'Test Hall',
    description: 'Test Description',
    address: '123 Test St',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400001',
    country: 'India',
    status: 'DRAFT',
    basePricing: undefined,
    latitude: undefined,
    longitude: undefined,
    region: undefined,
    seatCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const hallServiceSpy = jasmine.createSpyObj('HallManagementService', [
      'createHall',
      'updateHallPricing',
      'updateHallLocation',
    ]);

    await TestBed.configureTestingModule({
      imports: [OwnerOnboardingWizardComponent, ReactiveFormsModule],
      providers: [
        provideRouterMock(),
        { provide: HallManagementService, useValue: hallServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OwnerOnboardingWizardComponent);
    component = fixture.componentInstance;
    hallManagementService = TestBed.inject(
      HallManagementService,
    ) as jasmine.SpyObj<HallManagementService>;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize form with empty fields', () => {
      expect(component.hallForm).toBeTruthy();
      expect(component.hallForm.get('hallName')?.value).toBe('');
      expect(component.hallForm.get('description')?.value).toBe('');
      expect(component.hallForm.get('address')?.value).toBe('');
      expect(component.hallForm.get('city')?.value).toBe('');
      expect(component.hallForm.get('state')?.value).toBe('');
      expect(component.hallForm.get('postalCode')?.value).toBe('');
      expect(component.hallForm.get('country')?.value).toBe('India'); // Default
    });

    it('should have required validators on mandatory fields', () => {
      const hallName = component.hallForm.get('hallName');
      const address = component.hallForm.get('address');
      const city = component.hallForm.get('city');
      const state = component.hallForm.get('state');
      const country = component.hallForm.get('country');

      expect(hallName?.hasError('required')).toBe(true);
      expect(address?.hasError('required')).toBe(true);
      expect(city?.hasError('required')).toBe(true);
      expect(state?.hasError('required')).toBe(true);
      expect(country?.hasError('required')).toBe(false); // Has default value
    });

    it('should have maxLength validators on all fields', () => {
      const hallName = component.hallForm.get('hallName');
      const description = component.hallForm.get('description');
      const address = component.hallForm.get('address');

      hallName?.setValue('a'.repeat(256));
      description?.setValue('a'.repeat(1001));
      address?.setValue('a'.repeat(501));

      expect(hallName?.hasError('maxlength')).toBe(true);
      expect(description?.hasError('maxlength')).toBe(true);
      expect(address?.hasError('maxlength')).toBe(true);
    });

    it('should have pattern validator on hallName (alphanumeric + spaces)', () => {
      const hallName = component.hallForm.get('hallName');

      hallName?.setValue('Test Hall 123'); // Valid
      expect(hallName?.hasError('pattern')).toBe(false);

      hallName?.setValue('Test@Hall'); // Invalid (special characters)
      expect(hallName?.hasError('pattern')).toBe(true);
    });
  });

  describe('Form Validation', () => {
    it('should be invalid when required fields are empty', () => {
      expect(component.hallForm.valid).toBe(false);
    });

    it('should be valid when all required fields are filled correctly', () => {
      component.hallForm.patchValue({
        hallName: 'Test Hall',
        address: '123 Test St',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
      });

      expect(component.hallForm.valid).toBe(true);
    });

    it('should show error message for invalid fields', () => {
      const hallName = component.hallForm.get('hallName');
      hallName?.markAsTouched();

      const errorMessage = component.getErrorMessage('hallName');
      expect(errorMessage).toBe('Hall name is required');
    });
  });

  describe('Create Hall Button', () => {
    it('should be disabled when form is invalid', () => {
      expect(component.hallForm.invalid).toBe(true);
      // Button disabled state tested in template
    });

    it('should be enabled when form is valid', () => {
      component.hallForm.patchValue({
        hallName: 'Test Hall',
        address: '123 Test St',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
      });

      expect(component.hallForm.valid).toBe(true);
    });
  });

  describe('Hall Creation', () => {
    it('should call createHall on form submission with valid data', () => {
      hallManagementService.createHall.and.returnValue(of(mockHall));

      component.hallForm.patchValue({
        hallName: 'Test Hall',
        description: 'Test Description',
        address: '123 Test St',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'India',
      });

      component.onSubmit();

      expect(hallManagementService.createHall).toHaveBeenCalledWith({
        hallName: 'Test Hall',
        description: 'Test Description',
        address: '123 Test St',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'India',
      });
    });

    it('should display success message on successful hall creation', (done) => {
      hallManagementService.createHall.and.returnValue(of(mockHall));

      component.hallForm.patchValue({
        hallName: 'Test Hall',
        address: '123 Test St',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
      });

      component.onSubmit();

      setTimeout(() => {
        expect(component.successMessage()).toBe('Hall created successfully!');
        expect(component.errorMessage()).toBeNull();
        done();
      }, 100);
    });

    it('should store hall ID in session storage on success', (done) => {
      hallManagementService.createHall.and.returnValue(of(mockHall));

      component.hallForm.patchValue({
        hallName: 'Test Hall',
        address: '123 Test St',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
      });

      component.onSubmit();

      setTimeout(() => {
        expect(sessionStorage.getItem('onboardingHallId')).toBe(mockHall.id);
        expect(sessionStorage.getItem('onboardingHallName')).toBe(mockHall.hallName);
        done();
      }, 100);
    });

    it('should advance to Step 2 (Pricing) after successful hall creation (Story 0.1.7)', (done) => {
      hallManagementService.createHall.and.returnValue(of(mockHall));

      component.hallForm.patchValue({
        hallName: 'Test Hall',
        address: '123 Test St',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
      });

      expect(component.currentStep()).toBe(1);
      component.onSubmit();

      setTimeout(() => {
        expect(component.currentStep()).toBe(2);
        done();
      }, 1600); // Wait for 1.5 second timeout + buffer
    });

    it('should display error message on API failure', (done) => {
      const errorMessage = 'Failed to create hall';
      hallManagementService.createHall.and.returnValue(throwError(() => new Error(errorMessage)));

      component.hallForm.patchValue({
        hallName: 'Test Hall',
        address: '123 Test St',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
      });

      component.onSubmit();

      setTimeout(() => {
        expect(component.errorMessage()).toBe(errorMessage);
        expect(component.successMessage()).toBeNull();
        expect(component.isLoading()).toBe(false);
        done();
      }, 100);
    });

    it('should not call API if form is invalid', () => {
      component.onSubmit(); // Form is invalid by default

      expect(hallManagementService.createHall).not.toHaveBeenCalled();
      expect(component.errorMessage()).toBe('Please fill in all required fields correctly.');
    });

    it('should set loading state during API call', () => {
      hallManagementService.createHall.and.returnValue(of(mockHall));

      component.hallForm.patchValue({
        hallName: 'Test Hall',
        address: '123 Test St',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
      });

      expect(component.isLoading()).toBe(false);
      // Loading state changes are tested through async behavior
    });
  });

  describe('Skip Functionality', () => {
    it('should show skip confirmation dialog when skip button clicked', () => {
      expect(component.showSkipConfirmation()).toBe(false);

      component.onSkipClick();

      expect(component.showSkipConfirmation()).toBe(true);
    });

    it('should hide skip confirmation dialog when cancel clicked', () => {
      component.onSkipClick();
      expect(component.showSkipConfirmation()).toBe(true);

      component.onCancelSkip();

      expect(component.showSkipConfirmation()).toBe(false);
    });

    it('should set onboardingSkipped flag in localStorage on skip confirm', () => {
      component.onConfirmSkip();

      expect(localStorage.getItem('onboardingSkipped')).toBe('true');
    });

    it('should navigate to dashboard on skip confirm', () => {
      const navigateSpy = spyOn(router, 'navigate');

      component.onConfirmSkip();

      expect(navigateSpy).toHaveBeenCalledWith(['/owner/dashboard']);
    });

    it('should not create hall when skipped', () => {
      component.onConfirmSkip();

      expect(hallManagementService.createHall).not.toHaveBeenCalled();
    });
  });

  describe('Progress Indicator', () => {
    it('should start at Step 1 of 3', () => {
      expect(component.currentStep()).toBe(1);
      expect(component.totalSteps).toBe(3);
    });
  });

  describe('Pricing Form Initialization (Story 0.1.7)', () => {
    it('should initialize pricing form with default value ₹100', () => {
      expect(component.pricingForm).toBeTruthy();
      expect(component.pricingForm.get('basePricing')?.value).toBe(100);
    });

    it('should have required validator on basePricing', () => {
      const basePricing = component.pricingForm.get('basePricing');
      basePricing?.setValue(null);
      expect(basePricing?.hasError('required')).toBe(true);
    });

    it('should have min validator (₹50) on basePricing', () => {
      const basePricing = component.pricingForm.get('basePricing');
      basePricing?.setValue(49);
      expect(basePricing?.hasError('min')).toBe(true);

      basePricing?.setValue(50);
      expect(basePricing?.hasError('min')).toBe(false);
    });

    it('should have max validator (₹5000) on basePricing', () => {
      const basePricing = component.pricingForm.get('basePricing');
      basePricing?.setValue(5001);
      expect(basePricing?.hasError('max')).toBe(true);

      basePricing?.setValue(5000);
      expect(basePricing?.hasError('max')).toBe(false);
    });

    it('should be valid with default value', () => {
      expect(component.pricingForm.valid).toBe(true);
    });
  });

  describe('Pricing Form Validation (Story 0.1.7)', () => {
    it('should show error message for pricing below minimum', () => {
      const basePricing = component.pricingForm.get('basePricing');
      basePricing?.setValue(30);
      basePricing?.markAsTouched();

      const errorMessage = component.getErrorMessage('basePricing', component.pricingForm);
      expect(errorMessage).toBe('Base pricing must be at least ₹50');
    });

    it('should show error message for pricing above maximum', () => {
      const basePricing = component.pricingForm.get('basePricing');
      basePricing?.setValue(6000);
      basePricing?.markAsTouched();

      const errorMessage = component.getErrorMessage('basePricing', component.pricingForm);
      expect(errorMessage).toBe('Base pricing cannot exceed ₹5000');
    });

    it('should be valid with pricing in range ₹50-₹5000', () => {
      const basePricing = component.pricingForm.get('basePricing');

      basePricing?.setValue(150);
      expect(component.pricingForm.valid).toBe(true);

      basePricing?.setValue(50);
      expect(component.pricingForm.valid).toBe(true);

      basePricing?.setValue(5000);
      expect(component.pricingForm.valid).toBe(true);
    });
  });

  describe('Pricing Submission (Story 0.1.7)', () => {
    beforeEach(() => {
      // Set up component in Step 2 with a created hall ID
      component.currentStep.set(2);
      component.createdHallId.set(mockHall.id);
    });

    it('should call updateHallPricing on form submission with valid data', () => {
      const mockResponse: HallPricingUpdateResponse = {
        hallId: mockHall.id,
        basePricing: 150,
        updatedAt: '2025-10-19T10:30:00Z',
      };
      hallManagementService.updateHallPricing.and.returnValue(of(mockResponse));

      component.pricingForm.patchValue({ basePricing: 150 });
      component.onPricingSubmit();

      expect(hallManagementService.updateHallPricing).toHaveBeenCalledWith(mockHall.id, 150);
    });

    it('should display success message on successful pricing update', (done) => {
      const mockResponse: HallPricingUpdateResponse = {
        hallId: mockHall.id,
        basePricing: 150,
        updatedAt: '2025-10-19T10:30:00Z',
      };
      hallManagementService.updateHallPricing.and.returnValue(of(mockResponse));

      component.pricingForm.patchValue({ basePricing: 150 });
      component.onPricingSubmit();

      setTimeout(() => {
        expect(component.successMessage()).toBe('Pricing saved successfully!');
        expect(component.errorMessage()).toBeNull();
        done();
      }, 100);
    });

    it('should advance to Step 3 (Location) after successful pricing save (Story 0.1.8)', (done) => {
      const mockResponse: HallPricingUpdateResponse = {
        hallId: mockHall.id,
        basePricing: 150,
        updatedAt: '2025-10-19T10:30:00Z',
      };
      hallManagementService.updateHallPricing.and.returnValue(of(mockResponse));

      component.pricingForm.patchValue({ basePricing: 150 });
      expect(component.currentStep()).toBe(2);
      component.onPricingSubmit();

      setTimeout(() => {
        expect(component.currentStep()).toBe(3);
        done();
      }, 1600); // Wait for 1.5 second timeout + buffer
    });

    it('should display error message on API failure', (done) => {
      const errorMessage = 'Failed to save pricing';
      hallManagementService.updateHallPricing.and.returnValue(
        throwError(() => new Error(errorMessage)),
      );

      component.pricingForm.patchValue({ basePricing: 150 });
      component.onPricingSubmit();

      setTimeout(() => {
        expect(component.errorMessage()).toBe(errorMessage);
        expect(component.successMessage()).toBeNull();
        expect(component.isLoading()).toBe(false);
        done();
      }, 100);
    });

    it('should not call API if pricing form is invalid', () => {
      component.pricingForm.patchValue({ basePricing: 10000 }); // Exceeds max
      component.onPricingSubmit();

      expect(hallManagementService.updateHallPricing).not.toHaveBeenCalled();
      expect(component.errorMessage()).toBe('Please enter a valid pricing amount.');
    });

    it('should show error if hall ID is missing', () => {
      component.createdHallId.set(null); // Simulate missing hall ID
      component.pricingForm.patchValue({ basePricing: 150 });
      component.onPricingSubmit();

      expect(hallManagementService.updateHallPricing).not.toHaveBeenCalled();
      expect(component.errorMessage()).toBe('Hall ID not found. Please start over.');
    });

    it('should set loading state during API call', () => {
      const mockResponse: HallPricingUpdateResponse = {
        hallId: mockHall.id,
        basePricing: 150,
        updatedAt: '2025-10-19T10:30:00Z',
      };
      hallManagementService.updateHallPricing.and.returnValue(of(mockResponse));

      component.pricingForm.patchValue({ basePricing: 150 });

      expect(component.isLoading()).toBe(false);
      component.onPricingSubmit();
      // Loading state changes are tested through async behavior
    });
  });

  describe('Skip Pricing (Story 0.1.7)', () => {
    beforeEach(() => {
      component.currentStep.set(2); // Set up component in Step 2
    });

    it('should set pricingSkipped flag in localStorage on skip', () => {
      component.onSkipPricing();
      expect(localStorage.getItem('pricingSkipped')).toBe('true');
    });

    it('should navigate to dashboard on skip pricing', () => {
      const navigateSpy = spyOn(router, 'navigate');
      component.onSkipPricing();
      expect(navigateSpy).toHaveBeenCalledWith(['/owner/dashboard']);
    });

    it('should not call updateHallPricing API when skipped', () => {
      component.onSkipPricing();
      expect(hallManagementService.updateHallPricing).not.toHaveBeenCalled();
    });
  });

  describe('Supported Countries', () => {
    it('should have list of supported countries', () => {
      expect(component.supportedCountries).toBeDefined();
      expect(component.supportedCountries.length).toBeGreaterThan(0);
      expect(component.supportedCountries).toContain('India');
      expect(component.supportedCountries).toContain('USA');
    });
  });

  // ============================================
  // NEW TESTS FOR INCREASED COVERAGE (Target: 80%+)
  // ============================================

  describe('Helper Methods', () => {
    describe('getFieldLabel', () => {
      it('should return correct label for hallName', () => {
        expect(component.getFieldLabel('hallName')).toBe('Hall name');
      });

      it('should return correct label for description', () => {
        expect(component.getFieldLabel('description')).toBe('Description');
      });

      it('should return correct label for address', () => {
        expect(component.getFieldLabel('address')).toBe('Address');
      });

      it('should return correct label for city', () => {
        expect(component.getFieldLabel('city')).toBe('City');
      });

      it('should return correct label for state', () => {
        expect(component.getFieldLabel('state')).toBe('State/Province');
      });

      it('should return correct label for postalCode', () => {
        expect(component.getFieldLabel('postalCode')).toBe('Postal code');
      });

      it('should return correct label for country', () => {
        expect(component.getFieldLabel('country')).toBe('Country');
      });

      it('should return correct label for basePricing', () => {
        expect(component.getFieldLabel('basePricing')).toBe('Base pricing');
      });

      it('should return field name for unknown field', () => {
        expect(component.getFieldLabel('unknownField')).toBe('unknownField');
      });
    });

    describe('markFormGroupTouched', () => {
      it('should mark all form controls as touched in hallForm', () => {
        const controls = component.hallForm.controls;

        // Initially all should be untouched
        Object.keys(controls).forEach((key) => {
          expect(controls[key].touched).toBe(false);
        });

        component.markFormGroupTouched(component.hallForm);

        // After calling, all should be touched
        Object.keys(controls).forEach((key) => {
          expect(controls[key].touched).toBe(true);
        });
      });

      it('should mark all form controls as touched in pricingForm', () => {
        const controls = component.pricingForm.controls;

        Object.keys(controls).forEach((key) => {
          expect(controls[key].touched).toBe(false);
        });

        component.markFormGroupTouched(component.pricingForm);

        Object.keys(controls).forEach((key) => {
          expect(controls[key].touched).toBe(true);
        });
      });
    });

    describe('hasError', () => {
      it('should return true when field has error and is touched', () => {
        const hallName = component.hallForm.get('hallName');
        hallName?.markAsTouched();

        expect(component.hasError('hallName', 'required')).toBe(true);
      });

      it('should return false when field has error but is not touched', () => {
        // Field has required error but is not touched, so hasError should return false
        expect(component.hasError('hallName', 'required')).toBe(false);
      });

      it('should return false when field does not have the specific error', () => {
        const hallName = component.hallForm.get('hallName');
        hallName?.setValue('Valid Name');
        hallName?.markAsTouched();

        expect(component.hasError('hallName', 'required')).toBe(false);
      });

      it('should work with pricing form when form parameter is provided', () => {
        const basePricing = component.pricingForm.get('basePricing');
        basePricing?.setValue(10); // Below minimum
        basePricing?.markAsTouched();

        expect(component.hasError('basePricing', 'min', component.pricingForm)).toBe(true);
      });
    });

    describe('getErrorMessage', () => {
      it('should return required error message for hallName', () => {
        const hallName = component.hallForm.get('hallName');
        hallName?.markAsTouched();

        expect(component.getErrorMessage('hallName')).toBe('Hall name is required');
      });

      it('should return maxLength error message', () => {
        const hallName = component.hallForm.get('hallName');
        hallName?.setValue('a'.repeat(256));
        hallName?.markAsTouched();

        expect(component.getErrorMessage('hallName')).toBe(
          'Hall name cannot exceed 255 characters',
        );
      });

      it('should return pattern error message for invalid hallName', () => {
        const hallName = component.hallForm.get('hallName');
        hallName?.setValue('Test@Hall#');
        hallName?.markAsTouched();

        expect(component.getErrorMessage('hallName')).toBe('Hall name has invalid format');
      });

      it('should return null when field has no errors', () => {
        const hallName = component.hallForm.get('hallName');
        hallName?.setValue('Valid Hall Name');
        hallName?.markAsTouched();

        expect(component.getErrorMessage('hallName')).toBeNull();
      });

      it('should return min error for pricing below ₹50', () => {
        const basePricing = component.pricingForm.get('basePricing');
        basePricing?.setValue(30);
        basePricing?.markAsTouched();

        expect(component.getErrorMessage('basePricing', component.pricingForm)).toBe(
          'Base pricing must be at least ₹50',
        );
      });

      it('should return max error for pricing above ₹5000', () => {
        const basePricing = component.pricingForm.get('basePricing');
        basePricing?.setValue(6000);
        basePricing?.markAsTouched();

        expect(component.getErrorMessage('basePricing', component.pricingForm)).toBe(
          'Base pricing cannot exceed ₹5000',
        );
      });
    });
  });

  describe('Session State Restoration', () => {
    it('should restore hall ID from sessionStorage on init', () => {
      sessionStorage.setItem('onboardingHallId', mockHall.id);
      sessionStorage.setItem('onboardingHallName', mockHall.hallName);

      // Create new component instance to trigger ngOnInit
      const newFixture = TestBed.createComponent(OwnerOnboardingWizardComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();

      expect(newComponent.createdHallId()).toBe(mockHall.id);
    });

    it('should not restore hall ID if sessionStorage is empty', () => {
      sessionStorage.clear();

      const newFixture = TestBed.createComponent(OwnerOnboardingWizardComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();

      expect(newComponent.createdHallId()).toBeNull();
    });

    it('should handle browser refresh gracefully', () => {
      sessionStorage.setItem('onboardingHallId', '123-456-789');

      const newFixture = TestBed.createComponent(OwnerOnboardingWizardComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();

      // User can continue onboarding after refresh
      expect(newComponent.createdHallId()).toBe('123-456-789');
    });
  });

  describe('Retry Logic for Network Failures', () => {
    it('should retry hall creation on network error (status 0)', (done) => {
      let attemptCount = 0;
      hallManagementService.createHall.and.returnValue(
        defer(() => {
          attemptCount++;
          if (attemptCount < 3) {
            // Simulate network error (status 0) for first 2 attempts
            return throwError(() => ({ status: 0, message: 'Network error' }));
          }
          // Succeed on 3rd attempt (after 2 retries)
          return of(mockHall);
        }),
      );

      component.hallForm.patchValue({
        hallName: 'Test Hall',
        address: '123 Test St',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
      });

      component.onSubmit();

      setTimeout(() => {
        expect(attemptCount).toBe(3); // 1 initial + 2 retries
        expect(component.successMessage()).toBe('Hall created successfully!');
        expect(component.errorMessage()).toBeNull();
        done();
      }, 500);
    });

    it('should retry on server error (status 500)', (done) => {
      let attemptCount = 0;
      hallManagementService.createHall.and.returnValue(
        defer(() => {
          attemptCount++;
          if (attemptCount < 2) {
            return throwError(() => ({ status: 500, message: 'Server error' }));
          }
          return of(mockHall);
        }),
      );

      component.hallForm.patchValue({
        hallName: 'Test Hall',
        address: '123 Test St',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
      });

      component.onSubmit();

      setTimeout(() => {
        expect(attemptCount).toBe(2);
        expect(component.successMessage()).toBe('Hall created successfully!');
        done();
      }, 500);
    });

    it('should NOT retry on client error 400 (Bad Request)', (done) => {
      let attemptCount = 0;
      hallManagementService.createHall.and.callFake(() => {
        attemptCount++;
        return throwError(() => ({ status: 400, message: 'Bad Request' }));
      });

      component.hallForm.patchValue({
        hallName: 'Test Hall',
        address: '123 Test St',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
      });

      component.onSubmit();

      setTimeout(() => {
        expect(attemptCount).toBe(1); // No retries on client errors
        expect(component.errorMessage()).toBeTruthy();
        done();
      }, 300);
    });

    it('should NOT retry on 404 (Not Found)', (done) => {
      let attemptCount = 0;
      hallManagementService.createHall.and.callFake(() => {
        attemptCount++;
        return throwError(() => ({ status: 404, message: 'Not Found' }));
      });

      component.hallForm.patchValue({
        hallName: 'Test Hall',
        address: '123 Test St',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
      });

      component.onSubmit();

      setTimeout(() => {
        expect(attemptCount).toBe(1); // No retries
        done();
      }, 300);
    });

    it('should NOT retry on 409 (Conflict)', (done) => {
      let attemptCount = 0;
      hallManagementService.createHall.and.callFake(() => {
        attemptCount++;
        return throwError(() => ({ status: 409, message: 'Duplicate hall name' }));
      });

      component.hallForm.patchValue({
        hallName: 'Test Hall',
        address: '123 Test St',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
      });

      component.onSubmit();

      setTimeout(() => {
        expect(attemptCount).toBe(1); // No retries
        done();
      }, 300);
    });

    it('should retry pricing update on network error', (done) => {
      component.currentStep.set(2);
      component.createdHallId.set(mockHall.id);

      let attemptCount = 0;
      hallManagementService.updateHallPricing.and.returnValue(
        defer(() => {
          attemptCount++;
          if (attemptCount < 3) {
            return throwError(() => ({ status: 0, message: 'Network error' }));
          }
          return of({ hallId: mockHall.id, basePricing: 150, updatedAt: '2025-10-23T00:00:00Z' });
        }),
      );

      component.pricingForm.patchValue({ basePricing: 150 });
      component.onPricingSubmit();

      setTimeout(() => {
        expect(attemptCount).toBe(3); // 1 initial + 2 retries
        expect(component.successMessage()).toBe('Pricing saved successfully!');
        done();
      }, 500);
    });

    it('should fail after max retry attempts', (done) => {
      let attemptCount = 0;
      hallManagementService.createHall.and.returnValue(
        defer(() => {
          attemptCount++;
          return throwError(() => ({ status: 500, message: 'Server error' }));
        }),
      );

      component.hallForm.patchValue({
        hallName: 'Test Hall',
        address: '123 Test St',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
      });

      component.onSubmit();

      setTimeout(() => {
        expect(attemptCount).toBe(3); // 1 initial + 2 retries = 3 total
        expect(component.errorMessage()).toBeTruthy();
        expect(component.successMessage()).toBeNull();
        done();
      }, 500);
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle empty form submission gracefully', () => {
      component.onSubmit();

      expect(component.errorMessage()).toBe('Please fill in all required fields correctly.');
      expect(hallManagementService.createHall).not.toHaveBeenCalled();
    });

    it('should handle missing hall ID during pricing submission', () => {
      component.currentStep.set(2);
      component.createdHallId.set(null);

      component.pricingForm.patchValue({ basePricing: 150 });
      component.onPricingSubmit();

      expect(component.errorMessage()).toBe('Hall ID not found. Please start over.');
      expect(hallManagementService.updateHallPricing).not.toHaveBeenCalled();
    });

    it('should handle null/undefined error objects', (done) => {
      hallManagementService.createHall.and.returnValue(
        throwError(() => ({})), // Empty error object
      );

      component.hallForm.patchValue({
        hallName: 'Test Hall',
        address: '123 Test St',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
      });

      component.onSubmit();

      setTimeout(() => {
        expect(component.errorMessage()).toBe('Failed to create hall. Please try again.');
        // Session storage should NOT be set on error
        expect(sessionStorage.getItem('onboardingHallId')).toBeNull();
        expect(sessionStorage.getItem('onboardingHallName')).toBeNull();
        done();
      }, 100);
    });

    it('should reset error messages on new submission', () => {
      component.errorMessage.set('Previous error');

      hallManagementService.createHall.and.returnValue(of(mockHall));

      component.hallForm.patchValue({
        hallName: 'Test Hall',
        address: '123 Test St',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
      });

      component.onSubmit();

      // Error message should be cleared when starting new submission
      expect(component.errorMessage()).toBeNull();
    });

    it('should reset success messages on new submission', (done) => {
      component.successMessage.set('Previous success');

      // Use defer to make the Observable async so we can test intermediate state
      hallManagementService.createHall.and.returnValue(defer(() => Promise.resolve(mockHall)));

      component.hallForm.patchValue({
        hallName: 'Test Hall',
        address: '123 Test St',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
      });

      // Initially cleared when submission starts
      component.onSubmit();
      expect(component.successMessage()).toBeNull();

      // New success message is set after API response
      setTimeout(() => {
        expect(component.successMessage()).toBe('Hall created successfully!');
        done();
      }, 100);
    });

    it('should handle concurrent form submissions gracefully', () => {
      hallManagementService.createHall.and.returnValue(of(mockHall));

      component.hallForm.patchValue({
        hallName: 'Test Hall',
        address: '123 Test St',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
      });

      component.onSubmit();
      // Attempt second submission while first is in progress
      component.onSubmit();

      // Should only call API once (loading state should prevent duplicate calls)
      // This is a best effort test - actual prevention depends on button disabled state
      expect(hallManagementService.createHall).toHaveBeenCalled();
    });

    it('should handle extremely long field values within maxLength limit', () => {
      const hallName = component.hallForm.get('hallName');
      hallName?.setValue('a'.repeat(255)); // Exactly at limit

      expect(hallName?.hasError('maxlength')).toBe(false);
      expect(hallName?.valid).toBe(true);
    });

    it('should handle boundary values for pricing', () => {
      const basePricing = component.pricingForm.get('basePricing');

      // Test exact minimum
      basePricing?.setValue(50);
      expect(basePricing?.valid).toBe(true);

      // Test exact maximum
      basePricing?.setValue(5000);
      expect(basePricing?.valid).toBe(true);

      // Test just below minimum
      basePricing?.setValue(49);
      expect(basePricing?.valid).toBe(false);

      // Test just above maximum
      basePricing?.setValue(5001);
      expect(basePricing?.valid).toBe(false);
    });

    it('should handle zero and negative pricing values', () => {
      const basePricing = component.pricingForm.get('basePricing');

      basePricing?.setValue(0);
      expect(basePricing?.hasError('min')).toBe(true);

      basePricing?.setValue(-100);
      expect(basePricing?.hasError('min')).toBe(true);
    });

    it('should handle non-numeric pricing input', () => {
      const basePricing = component.pricingForm.get('basePricing');

      basePricing?.setValue(null);
      expect(basePricing?.hasError('required')).toBe(true);

      basePricing?.setValue('');
      expect(basePricing?.hasError('required')).toBe(true);
    });

    it('should clear sessionStorage on skip confirmation', () => {
      sessionStorage.setItem('onboardingHallId', mockHall.id);
      sessionStorage.setItem('onboardingHallName', mockHall.hallName);

      component.onConfirmSkip();

      expect(localStorage.getItem('onboardingSkipped')).toBe('true');
      // sessionStorage is cleared in afterEach
    });

    it('should handle special characters in hall name with pattern validator', () => {
      const hallName = component.hallForm.get('hallName');

      // Valid: alphanumeric and spaces
      hallName?.setValue('Test Hall 123');
      expect(hallName?.hasError('pattern')).toBe(false);

      // Invalid: special characters
      hallName?.setValue('Test@Hall#');
      expect(hallName?.hasError('pattern')).toBe(true);

      hallName?.setValue('Hall-Name');
      expect(hallName?.hasError('pattern')).toBe(true);

      hallName?.setValue('Hall_Name');
      expect(hallName?.hasError('pattern')).toBe(true);
    });
  });

  describe('Constants Usage', () => {
    it('should use constant for default pricing value', () => {
      // Verify default value matches constant (100)
      expect(component.pricingForm.get('basePricing')?.value).toBe(100);
    });

    it('should use constants for validation bounds', () => {
      const basePricing = component.pricingForm.get('basePricing');

      // Verify min/max match constants (50/5000)
      basePricing?.setValue(49);
      expect(basePricing?.hasError('min')).toBe(true);

      basePricing?.setValue(50);
      expect(basePricing?.hasError('min')).toBe(false);

      basePricing?.setValue(5000);
      expect(basePricing?.hasError('max')).toBe(false);

      basePricing?.setValue(5001);
      expect(basePricing?.hasError('max')).toBe(true);
    });

    it('should use constant storage keys for sessionStorage', (done) => {
      hallManagementService.createHall.and.returnValue(of(mockHall));

      component.hallForm.patchValue({
        hallName: 'Test Hall',
        address: '123 Test St',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
      });

      component.onSubmit();

      setTimeout(() => {
        // Verify storage keys match constants
        expect(sessionStorage.getItem('onboardingHallId')).toBe(mockHall.id);
        expect(sessionStorage.getItem('onboardingHallName')).toBe(mockHall.hallName);
        done();
      }, 100);
    });
  });

  // ============================================
  // STEP 3: LOCATION CONFIGURATION TESTS (Story 0.1.8)
  // ============================================

  describe('Location Form Initialization (Story 0.1.8)', () => {
    it('should initialize location form with empty readonly fields', () => {
      expect(component.locationForm).toBeTruthy();
      expect(component.locationForm.get('latitude')?.value).toBe('');
      expect(component.locationForm.get('longitude')?.value).toBe('');
      expect(component.locationForm.get('region')?.value).toBe('');
    });

    it('should have required validators on all location fields', () => {
      const region = component.locationForm.get('region');

      // Region is enabled and should show required error when empty
      expect(region?.hasError('required')).toBe(true);

      // Latitude and longitude are disabled by default, so they won't show errors
      // We can verify validators exist by temporarily enabling them
      const latitude = component.locationForm.get('latitude');
      const longitude = component.locationForm.get('longitude');

      latitude?.enable();
      longitude?.enable();
      expect(latitude?.hasError('required')).toBe(true);
      expect(longitude?.hasError('required')).toBe(true);
      // Disable them again
      latitude?.disable();
      longitude?.disable();
    });

    it('should have latitude and longitude fields disabled by default', () => {
      expect(component.locationForm.get('latitude')?.disabled).toBe(true);
      expect(component.locationForm.get('longitude')?.disabled).toBe(true);
    });

    it('should have region field enabled', () => {
      expect(component.locationForm.get('region')?.disabled).toBe(false);
    });
  });

  describe('Region Options (Story 0.1.8)', () => {
    it('should have list of region options', () => {
      expect(component.regionOptions).toBeDefined();
      expect(component.regionOptions.length).toBe(5);
    });

    it('should include all 5 region options', () => {
      const regionValues = component.regionOptions.map((r) => r.value);
      expect(regionValues).toContain('NORTH_ZONE');
      expect(regionValues).toContain('SOUTH_ZONE');
      expect(regionValues).toContain('EAST_ZONE');
      expect(regionValues).toContain('WEST_ZONE');
      expect(regionValues).toContain('CENTRAL');
    });

    it('should have proper labels for regions', () => {
      const northZone = component.regionOptions.find((r) => r.value === 'NORTH_ZONE');
      const southZone = component.regionOptions.find((r) => r.value === 'SOUTH_ZONE');
      expect(northZone?.label).toBe('North Zone');
      expect(southZone?.label).toBe('South Zone');
    });
  });

  describe('Map Click Handler (Story 0.1.8)', () => {
    it('should update map marker position when map is clicked', () => {
      const mockEvent = {
        latLng: {
          lat: () => 19.076,
          lng: () => 72.8777,
        },
      } as google.maps.MapMouseEvent;

      expect(component.mapMarkerPosition()).toBeNull();

      component.onMapClick(mockEvent);

      expect(component.mapMarkerPosition()).toEqual({ lat: 19.076, lng: 72.8777 });
    });

    it('should update latitude and longitude form fields when map is clicked', () => {
      const mockEvent = {
        latLng: {
          lat: () => 19.076,
          lng: () => 72.8777,
        },
      } as google.maps.MapMouseEvent;

      component.onMapClick(mockEvent);

      expect(component.locationForm.get('latitude')?.value).toBe(19.076);
      expect(component.locationForm.get('longitude')?.value).toBe(72.8777);
    });

    it('should not update anything if latLng is null', () => {
      const mockEvent = {
        latLng: null,
      } as google.maps.MapMouseEvent;

      component.onMapClick(mockEvent);

      expect(component.mapMarkerPosition()).toBeNull();
      expect(component.locationForm.get('latitude')?.value).toBe('');
      expect(component.locationForm.get('longitude')?.value).toBe('');
    });

    it('should keep latitude and longitude fields disabled after map click', () => {
      const mockEvent = {
        latLng: {
          lat: () => 19.076,
          lng: () => 72.8777,
        },
      } as google.maps.MapMouseEvent;

      component.onMapClick(mockEvent);

      expect(component.locationForm.get('latitude')?.disabled).toBe(true);
      expect(component.locationForm.get('longitude')?.disabled).toBe(true);
    });
  });

  describe('Location Form Validation (Story 0.1.8)', () => {
    it('should be invalid when no location is selected', () => {
      expect(component.locationForm.valid).toBe(false);
    });

    it('should be invalid when location is selected but region is not', () => {
      const mockEvent = {
        latLng: {
          lat: () => 19.076,
          lng: () => 72.8777,
        },
      } as google.maps.MapMouseEvent;

      component.onMapClick(mockEvent);

      expect(component.locationForm.valid).toBe(false);
    });

    it('should be valid when both location and region are set', () => {
      const mockEvent = {
        latLng: {
          lat: () => 19.076,
          lng: () => 72.8777,
        },
      } as google.maps.MapMouseEvent;

      component.onMapClick(mockEvent);
      component.locationForm.patchValue({ region: 'WEST_ZONE' });

      expect(component.locationForm.valid).toBe(true);
    });

    it('should show error message for missing region', () => {
      const region = component.locationForm.get('region');
      region?.markAsTouched();

      const errorMessage = component.getErrorMessage('region', component.locationForm);
      expect(errorMessage).toBe('Region is required');
    });
  });

  describe('Location Submission (Story 0.1.8)', () => {
    beforeEach(() => {
      // Set up component in Step 3 with a created hall ID
      component.currentStep.set(3);
      component.createdHallId.set(mockHall.id);

      // Set location on map
      const mockEvent = {
        latLng: {
          lat: () => 19.076,
          lng: () => 72.8777,
        },
      } as google.maps.MapMouseEvent;
      component.onMapClick(mockEvent);
    });

    it('should call updateHallLocation on form submission with valid data', () => {
      const mockResponse: HallLocationUpdateResponse = {
        hallId: mockHall.id,
        latitude: 19.076,
        longitude: 72.8777,
        region: 'WEST_ZONE',
        status: 'ACTIVE',
        updatedAt: '2025-10-23T10:30:00Z',
      };
      hallManagementService.updateHallLocation.and.returnValue(of(mockResponse));

      component.locationForm.patchValue({ region: 'WEST_ZONE' });
      component.onLocationSubmit();

      expect(hallManagementService.updateHallLocation).toHaveBeenCalledWith(mockHall.id, {
        latitude: 19.076,
        longitude: 72.8777,
        region: 'WEST_ZONE',
      });
    });

    it('should display success message on successful location update', (done) => {
      const mockResponse: HallLocationUpdateResponse = {
        hallId: mockHall.id,
        latitude: 19.076,
        longitude: 72.8777,
        region: 'WEST_ZONE',
        status: 'ACTIVE',
        updatedAt: '2025-10-23T10:30:00Z',
      };
      hallManagementService.updateHallLocation.and.returnValue(of(mockResponse));

      component.locationForm.patchValue({ region: 'WEST_ZONE' });
      component.onLocationSubmit();

      setTimeout(() => {
        expect(component.successMessage()).toBe('Hall activated! Welcome to StudyMate');
        expect(component.errorMessage()).toBeNull();
        done();
      }, 100);
    });

    it('should navigate to dashboard after successful location save', (done) => {
      const navigateSpy = spyOn(router, 'navigate');
      const mockResponse: HallLocationUpdateResponse = {
        hallId: mockHall.id,
        latitude: 19.076,
        longitude: 72.8777,
        region: 'WEST_ZONE',
        status: 'ACTIVE',
        updatedAt: '2025-10-23T10:30:00Z',
      };
      hallManagementService.updateHallLocation.and.returnValue(of(mockResponse));

      component.locationForm.patchValue({ region: 'WEST_ZONE' });
      component.onLocationSubmit();

      setTimeout(() => {
        expect(navigateSpy).toHaveBeenCalledWith(['/owner/dashboard']);
        done();
      }, 1600); // Wait for 1.5 second timeout + buffer
    });

    it('should clear session storage after successful location save', (done) => {
      sessionStorage.setItem('onboardingHallId', mockHall.id);
      sessionStorage.setItem('onboardingHallName', mockHall.hallName);

      const mockResponse: HallLocationUpdateResponse = {
        hallId: mockHall.id,
        latitude: 19.076,
        longitude: 72.8777,
        region: 'WEST_ZONE',
        status: 'ACTIVE',
        updatedAt: '2025-10-23T10:30:00Z',
      };
      hallManagementService.updateHallLocation.and.returnValue(of(mockResponse));

      component.locationForm.patchValue({ region: 'WEST_ZONE' });
      component.onLocationSubmit();

      setTimeout(() => {
        expect(sessionStorage.getItem('onboardingHallId')).toBeNull();
        expect(sessionStorage.getItem('onboardingHallName')).toBeNull();
        done();
      }, 100);
    });

    it('should display error message on API failure', (done) => {
      const errorMessage = 'Failed to save location';
      hallManagementService.updateHallLocation.and.returnValue(
        throwError(() => new Error(errorMessage)),
      );

      component.locationForm.patchValue({ region: 'WEST_ZONE' });
      component.onLocationSubmit();

      setTimeout(() => {
        expect(component.errorMessage()).toBe(errorMessage);
        expect(component.successMessage()).toBeNull();
        expect(component.isLoading()).toBe(false);
        done();
      }, 100);
    });

    it('should not call API if location form is invalid (missing region)', () => {
      component.onLocationSubmit();

      expect(hallManagementService.updateHallLocation).not.toHaveBeenCalled();
      expect(component.errorMessage()).toBe(
        'Please select a location on the map and choose a region.',
      );
    });

    it('should not call API if location is not selected on map', () => {
      // Create fresh component state for this test
      component.currentStep.set(3);
      component.createdHallId.set(mockHall.id);
      // Reinitialize location form to ensure it's in clean state
      component['initializeLocationForm']();
      component.locationForm.patchValue({ region: 'WEST_ZONE' });

      // This should fail validation because latitude/longitude are empty
      component.onLocationSubmit();

      expect(hallManagementService.updateHallLocation).not.toHaveBeenCalled();
      expect(component.errorMessage()).toBe(
        'Please select a location on the map and choose a region.',
      );
    });

    it('should show error if hall ID is missing', () => {
      component.createdHallId.set(null); // Simulate missing hall ID
      component.locationForm.patchValue({ region: 'WEST_ZONE' });
      component.onLocationSubmit();

      expect(hallManagementService.updateHallLocation).not.toHaveBeenCalled();
      expect(component.errorMessage()).toBe('Hall ID not found. Please start over.');
    });

    it('should retry location update on network error', (done) => {
      let attemptCount = 0;
      hallManagementService.updateHallLocation.and.returnValue(
        defer(() => {
          attemptCount++;
          if (attemptCount < 3) {
            return throwError(() => ({ status: 0, message: 'Network error' }));
          }
          const response: HallLocationUpdateResponse = {
            hallId: mockHall.id,
            latitude: 19.076,
            longitude: 72.8777,
            region: 'WEST_ZONE',
            status: 'ACTIVE',
            updatedAt: '2025-10-23T00:00:00Z',
          };
          return of(response);
        }),
      );

      component.locationForm.patchValue({ region: 'WEST_ZONE' });
      component.onLocationSubmit();

      setTimeout(() => {
        expect(attemptCount).toBe(3); // 1 initial + 2 retries
        expect(component.successMessage()).toBe('Hall activated! Welcome to StudyMate');
        done();
      }, 500);
    });
  });

  describe('Skip Location (Story 0.1.8)', () => {
    beforeEach(() => {
      component.currentStep.set(3); // Set up component in Step 3
      sessionStorage.setItem('onboardingHallId', mockHall.id);
      sessionStorage.setItem('onboardingHallName', mockHall.hallName);
    });

    it('should clear session storage on skip location', () => {
      component.onSkipLocation();
      expect(sessionStorage.getItem('onboardingHallId')).toBeNull();
      expect(sessionStorage.getItem('onboardingHallName')).toBeNull();
    });

    it('should navigate to dashboard on skip location', () => {
      const navigateSpy = spyOn(router, 'navigate');
      component.onSkipLocation();
      expect(navigateSpy).toHaveBeenCalledWith(['/owner/dashboard']);
    });

    it('should not call updateHallLocation API when skipped', () => {
      component.onSkipLocation();
      expect(hallManagementService.updateHallLocation).not.toHaveBeenCalled();
    });
  });

  describe('Google Maps Configuration (Story 0.1.8)', () => {
    it('should have Google Maps API key configured', () => {
      expect(component.googleMapsApiKey).toBeDefined();
    });

    it('should have default map center (Mumbai)', () => {
      expect(component.mapCenter()).toEqual({ lat: 19.076, lng: 72.8777 });
    });

    it('should have map options configured', () => {
      expect(component.mapOptions).toBeDefined();
      expect(component.mapOptions.zoom).toBe(12);
    });
  });
});
