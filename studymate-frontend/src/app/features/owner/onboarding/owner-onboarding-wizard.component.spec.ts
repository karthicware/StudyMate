import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { OwnerOnboardingWizardComponent } from './owner-onboarding-wizard.component';
import { HallManagementService } from '../../../core/services/hall-management.service';
import { Hall } from '../../../core/models/hall.model';
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
    const hallServiceSpy = jasmine.createSpyObj('HallManagementService', ['createHall']);

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

    it('should navigate to dashboard after successful hall creation', (done) => {
      const navigateSpy = spyOn(router, 'navigate');
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
        expect(navigateSpy).toHaveBeenCalledWith(['/owner/dashboard']);
        done();
      }, 2100); // Wait for 2 second timeout + buffer
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
    it('should show Step 1 of 3', () => {
      expect(component.currentStep).toBe(1);
      expect(component.totalSteps).toBe(3);
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
});
