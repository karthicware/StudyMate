import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../core/services/auth.service';
import { AuthStore } from '../../store/auth/auth.store';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  const mockAuthResponse = {
    token: 'mock-token',
    user: {
      id: 1,
      email: 'newuser@example.com',
      firstName: 'New',
      lastName: 'User',
    },
  };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);

    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        AuthStore,
      ],
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router);
    router.initialNavigation(); // Initialize router for RouterLink directive
    spyOn(router, 'navigate');
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.registerForm.get('email')?.value).toBe('');
    expect(component.registerForm.get('password')?.value).toBe('');
    expect(component.registerForm.get('firstName')?.value).toBe('');
    expect(component.registerForm.get('lastName')?.value).toBe('');
    expect(component.registerForm.get('confirmPassword')?.value).toBe('');
  });

  it('should validate required fields', () => {
    expect(component.registerForm.invalid).toBe(true);

    component.registerForm.patchValue({
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      firstName: 'Test',
      lastName: 'User',
    });

    expect(component.registerForm.valid).toBe(true);
  });

  it('should validate email format', () => {
    const emailControl = component.registerForm.get('email');

    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBe(true);

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.valid).toBe(true);
  });

  it('should validate password minimum length', () => {
    const passwordControl = component.registerForm.get('password');

    passwordControl?.setValue('12345');
    expect(passwordControl?.hasError('minlength')).toBe(true);

    passwordControl?.setValue('123456');
    expect(passwordControl?.valid).toBe(true);
  });

  it('should validate password match', () => {
    component.registerForm.patchValue({
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'different',
      firstName: 'Test',
      lastName: 'User',
    });

    expect(component.registerForm.hasError('passwordMismatch')).toBe(true);

    component.registerForm.patchValue({
      confirmPassword: 'password123',
    });

    expect(component.registerForm.hasError('passwordMismatch')).toBe(false);
  });

  it('should not submit invalid form', () => {
    component.onSubmit();
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('should submit valid form and navigate to dashboard', () => {
    authService.register.and.returnValue(of(mockAuthResponse));

    component.registerForm.setValue({
      email: 'newuser@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      firstName: 'New',
      lastName: 'User',
    });

    component.onSubmit();

    expect(authService.register).toHaveBeenCalledWith({
      email: 'newuser@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
    });
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should exclude confirmPassword from registration data', () => {
    authService.register.and.returnValue(of(mockAuthResponse));

    component.registerForm.setValue({
      email: 'newuser@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      firstName: 'New',
      lastName: 'User',
    });

    component.onSubmit();

    const callArgs = authService.register.calls.mostRecent().args[0];
    expect('confirmPassword' in callArgs).toBe(false);
  });

  it('should show error message on registration failure', () => {
    const errorResponse = {
      error: { message: 'Email already exists' },
    };
    authService.register.and.returnValue(throwError(() => errorResponse));

    component.registerForm.setValue({
      email: 'existing@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      firstName: 'Test',
      lastName: 'User',
    });

    component.onSubmit();

    expect(component.errorMessage()).toBe('Email already exists');
    expect(component.isLoading()).toBe(false);
  });

  it('should show loading state during registration', () => {
    authService.register.and.returnValue(of(mockAuthResponse));

    component.registerForm.setValue({
      email: 'newuser@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      firstName: 'New',
      lastName: 'User',
    });

    expect(component.isLoading()).toBe(false);

    component.onSubmit();

    expect(authService.register).toHaveBeenCalled();
  });
});
