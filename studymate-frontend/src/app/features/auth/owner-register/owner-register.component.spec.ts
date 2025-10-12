import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { OwnerRegisterComponent } from './owner-register.component';
import { AuthService } from '../../../core/services/auth.service';
import { AuthResponse } from '../../../core/models/auth.models';

describe('OwnerRegisterComponent', () => {
  let component: OwnerRegisterComponent;
  let fixture: ComponentFixture<OwnerRegisterComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['registerOwner']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [OwnerRegisterComponent, HttpClientTestingModule, RouterLink],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture = TestBed.createComponent(OwnerRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should have invalid form when empty', () => {
      expect(component.registerForm.valid).toBeFalsy();
    });

    it('should validate required fields', () => {
      expect(component.registerForm.get('firstName')?.hasError('required')).toBeTruthy();
      expect(component.registerForm.get('lastName')?.hasError('required')).toBeTruthy();
      expect(component.registerForm.get('email')?.hasError('required')).toBeTruthy();
      expect(component.registerForm.get('password')?.hasError('required')).toBeTruthy();
      expect(component.registerForm.get('phone')?.hasError('required')).toBeTruthy();
      expect(component.registerForm.get('businessName')?.hasError('required')).toBeTruthy();
    });

    it('should validate email format', () => {
      const emailControl = component.registerForm.get('email');
      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBeTruthy();

      emailControl?.setValue('valid@email.com');
      expect(emailControl?.hasError('email')).toBeFalsy();
    });

    it('should validate phone number format', () => {
      const phoneControl = component.registerForm.get('phone');
      phoneControl?.setValue('123'); // Too short
      expect(phoneControl?.hasError('pattern')).toBeTruthy();

      phoneControl?.setValue('9876543210'); // Valid 10-digit
      expect(phoneControl?.hasError('pattern')).toBeFalsy();
    });

    it('should validate business name minimum length', () => {
      const businessNameControl = component.registerForm.get('businessName');
      businessNameControl?.setValue('AB'); // Too short
      expect(businessNameControl?.hasError('minlength')).toBeTruthy();

      businessNameControl?.setValue('ABC'); // Valid
      expect(businessNameControl?.hasError('minlength')).toBeFalsy();
    });
  });

  describe('Password Validation', () => {
    it('should validate password strength - weak password', () => {
      const passwordControl = component.registerForm.get('password');
      passwordControl?.setValue('weak');
      expect(passwordControl?.hasError('passwordStrength')).toBeTruthy();
    });

    it('should validate password strength - missing uppercase', () => {
      const passwordControl = component.registerForm.get('password');
      passwordControl?.setValue('test@1234');
      expect(passwordControl?.hasError('passwordStrength')).toBeTruthy();
      expect(passwordControl?.errors?.['passwordStrength']?.['hasUpperCase']).toBeFalsy();
    });

    it('should validate password strength - strong password', () => {
      const passwordControl = component.registerForm.get('password');
      passwordControl?.setValue('Strong@123');
      expect(passwordControl?.hasError('passwordStrength')).toBeFalsy();
    });

    it('should update password strength indicator', () => {
      const passwordControl = component.registerForm.get('password');

      passwordControl?.setValue('weak');
      expect(component.passwordStrength()).toBe('weak');

      passwordControl?.setValue('Medium@1');
      expect(component.passwordStrength()).toBe('medium');

      passwordControl?.setValue('Strong@123');
      expect(component.passwordStrength()).toBe('strong');
    });

    it('should validate password match', () => {
      component.registerForm.patchValue({
        password: 'Test@1234',
        confirmPassword: 'Different@1234'
      });
      expect(component.registerForm.hasError('passwordMismatch')).toBeTruthy();

      component.registerForm.patchValue({
        confirmPassword: 'Test@1234'
      });
      expect(component.registerForm.hasError('passwordMismatch')).toBeFalsy();
    });
  });

  describe('Form Submission', () => {
    it('should call AuthService.registerOwner with valid form data', fakeAsync(() => {
      const mockResponse: AuthResponse = {
        token: 'mock-token',
        user: {
          id: 1,
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'OWNER'
        },
        message: 'Registration successful'
      };
      authService.registerOwner.and.returnValue(of(mockResponse));

      component.registerForm.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'Strong@123',
        confirmPassword: 'Strong@123',
        phone: '9876543210',
        businessName: 'Test Business',
        termsAccepted: true
      });

      component.onSubmit();

      expect(authService.registerOwner).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'Strong@123',
        phone: '9876543210',
        businessName: 'Test Business'
      });

      tick(2100); // Wait for navigation delay
      expect(router.navigate).toHaveBeenCalledWith(['/auth/verify-email'], {
        queryParams: { email: 'test@example.com' }
      });
    }));

    it('should not submit invalid form', () => {
      component.onSubmit();
      expect(authService.registerOwner).not.toHaveBeenCalled();
    });

    it('should display loading state during submission', () => {
      authService.registerOwner.and.returnValue(of({} as AuthResponse));

      component.registerForm.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'Strong@123',
        confirmPassword: 'Strong@123',
        phone: '9876543210',
        businessName: 'Test Business',
        termsAccepted: true
      });

      component.onSubmit();
      expect(component.isLoading()).toBe(false); // After completion
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      component.registerForm.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'Strong@123',
        confirmPassword: 'Strong@123',
        phone: '9876543210',
        businessName: 'Test Business',
        termsAccepted: true
      });
    });

    it('should handle 409 Conflict error (duplicate email)', () => {
      authService.registerOwner.and.returnValue(
        throwError(() => ({ status: 409 }))
      );

      component.onSubmit();

      expect(component.errorMessage()).toContain('email already exists');
    });

    it('should handle 400 Bad Request error', () => {
      authService.registerOwner.and.returnValue(
        throwError(() => ({
          status: 400,
          error: { message: 'Invalid data' }
        }))
      );

      component.onSubmit();

      expect(component.errorMessage()).toContain('Invalid data');
    });

    it('should handle generic error', () => {
      authService.registerOwner.and.returnValue(
        throwError(() => ({ status: 500 }))
      );

      component.onSubmit();

      expect(component.errorMessage()).toContain('unexpected error');
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility', () => {
      expect(component.showPassword()).toBe(false);
      component.togglePasswordVisibility();
      expect(component.showPassword()).toBe(true);
      component.togglePasswordVisibility();
      expect(component.showPassword()).toBe(false);
    });

    it('should toggle confirm password visibility', () => {
      expect(component.showConfirmPassword()).toBe(false);
      component.toggleConfirmPasswordVisibility();
      expect(component.showConfirmPassword()).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const firstNameInput = compiled.querySelector('#firstName');
      expect(firstNameInput?.getAttribute('aria-required')).toBe('true');
    });
  });
});
