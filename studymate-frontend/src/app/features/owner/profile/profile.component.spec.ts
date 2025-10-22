import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { ProfileComponent } from './profile.component';
import { ProfileService } from '../../../core/services/profile.service';
import { ToastService } from '../../../shared/services/toast.service';
import { OwnerProfile } from '../../../core/models/profile.model';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let profileService: jasmine.SpyObj<ProfileService>;
  let toastService: jasmine.SpyObj<ToastService>;

  const mockProfile: OwnerProfile = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '(123) 456-7890',
    profilePictureUrl: 'https://example.com/avatar.jpg',
    studyHallName: 'Downtown Study Hall',
    createdAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(async () => {
    const profileServiceSpy = jasmine.createSpyObj('ProfileService', [
      'getProfile',
      'updateProfile',
      'uploadAvatar',
    ]);
    const toastServiceSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'info']);

    await TestBed.configureTestingModule({
      imports: [ProfileComponent, ReactiveFormsModule],
      providers: [
        { provide: ProfileService, useValue: profileServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
      ],
    }).compileComponents();

    profileService = TestBed.inject(ProfileService) as jasmine.SpyObj<ProfileService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;

    profileService.getProfile.and.returnValue(of(mockProfile));

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize form with correct fields', () => {
      fixture.detectChanges();
      expect(component.profileForm.get('firstName')).toBeTruthy();
      expect(component.profileForm.get('lastName')).toBeTruthy();
      expect(component.profileForm.get('phone')).toBeTruthy();
    });

    it('should initialize form in disabled state (display mode)', () => {
      fixture.detectChanges();
      expect(component.profileForm.disabled).toBeTrue();
      expect(component.editMode()).toBeFalse();
    });

    it('should set firstName and lastName as required', () => {
      fixture.detectChanges();
      // Enable form to test validators
      component.profileForm.enable();

      const firstName = component.profileForm.get('firstName');
      const lastName = component.profileForm.get('lastName');

      firstName?.setValue('');
      lastName?.setValue('');

      expect(firstName?.hasError('required')).toBeTrue();
      expect(lastName?.hasError('required')).toBeTrue();
    });

    it('should set phone as optional', () => {
      fixture.detectChanges();
      // Enable form to test validators
      component.profileForm.enable();

      const phone = component.profileForm.get('phone');
      phone?.setValue('');
      expect(phone?.valid).toBeTrue();
    });
  });

  describe('Profile Data Loading', () => {
    it('should load profile data on init', () => {
      fixture.detectChanges();
      expect(profileService.getProfile).toHaveBeenCalled();
      expect(component.profile()).toEqual(mockProfile);
    });

    it('should populate form with loaded profile data', () => {
      fixture.detectChanges();
      expect(component.profileForm.get('firstName')?.value).toBe('John');
      expect(component.profileForm.get('lastName')?.value).toBe('Doe');
      expect(component.profileForm.get('phone')?.value).toBe('(123) 456-7890');
    });

    it('should set loading state during profile fetch', () => {
      expect(component.loading()).toBeFalse();
      fixture.detectChanges();
      // Loading should be set to false after successful load
      expect(component.loading()).toBeFalse();
    });

    it('should handle profile load error', () => {
      spyOn(console, 'error'); // Suppress console.error in test
      profileService.getProfile.and.returnValue(throwError(() => new Error('Load error')));
      fixture.detectChanges();
      expect(toastService.error).toHaveBeenCalledWith('Failed to load profile. Please try again.');
      expect(component.loading()).toBeFalse();
    });
  });

  describe('Edit Mode Toggle', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should enter edit mode when toggleEditMode is called', () => {
      component.toggleEditMode();
      expect(component.editMode()).toBeTrue();
      expect(component.profileForm.enabled).toBeTrue();
    });

    it('should exit edit mode and revert changes when toggleEditMode is called again', () => {
      component.toggleEditMode();
      component.profileForm.patchValue({ firstName: 'Changed' });

      component.toggleEditMode();

      expect(component.editMode()).toBeFalse();
      expect(component.profileForm.disabled).toBeTrue();
      expect(component.profileForm.get('firstName')?.value).toBe('John');
    });

    it('should cancel edit and revert changes', () => {
      component.toggleEditMode();
      component.profileForm.patchValue({
        firstName: 'Changed',
        lastName: 'Name',
      });

      component.cancelEdit();

      expect(component.editMode()).toBeFalse();
      expect(component.profileForm.get('firstName')?.value).toBe('John');
      expect(component.profileForm.get('lastName')?.value).toBe('Doe');
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.toggleEditMode();
    });

    it('should validate required fields', () => {
      const firstName = component.profileForm.get('firstName');
      const lastName = component.profileForm.get('lastName');

      firstName?.setValue('');
      lastName?.setValue('');

      expect(firstName?.hasError('required')).toBeTrue();
      expect(lastName?.hasError('required')).toBeTrue();
      expect(component.profileForm.invalid).toBeTrue();
    });

    it('should validate maximum length for firstName', () => {
      const firstName = component.profileForm.get('firstName');
      firstName?.setValue('a'.repeat(101));
      expect(firstName?.hasError('maxlength')).toBeTrue();
    });

    it('should validate maximum length for lastName', () => {
      const lastName = component.profileForm.get('lastName');
      lastName?.setValue('a'.repeat(101));
      expect(lastName?.hasError('maxlength')).toBeTrue();
    });

    it('should validate phone format (XXX) XXX-XXXX', () => {
      const phone = component.profileForm.get('phone');

      phone?.setValue('(123) 456-7890');
      expect(phone?.valid).toBeTrue();

      phone?.setValue('1234567890');
      expect(phone?.hasError('invalidPhone')).toBeTrue();
    });

    it('should validate phone format +1-XXX-XXX-XXXX', () => {
      const phone = component.profileForm.get('phone');

      phone?.setValue('+1-123-456-7890');
      expect(phone?.valid).toBeTrue();
    });

    it('should reject invalid phone formats', () => {
      const phone = component.profileForm.get('phone');

      phone?.setValue('123-456-7890');
      expect(phone?.hasError('invalidPhone')).toBeTrue();

      phone?.setValue('(123)456-7890');
      expect(phone?.hasError('invalidPhone')).toBeTrue();
    });
  });

  describe('Profile Save', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.toggleEditMode();
      profileService.updateProfile.and.returnValue(of({ ...mockProfile, firstName: 'Updated' }));
    });

    it('should save profile when form is valid', () => {
      component.profileForm.patchValue({
        firstName: 'Updated',
        lastName: 'Name',
        phone: '(555) 555-5555',
      });

      component.saveProfile();

      expect(profileService.updateProfile).toHaveBeenCalledWith({
        firstName: 'Updated',
        lastName: 'Name',
        phone: '(555) 555-5555',
      });
    });

    it('should show success toast after successful save', () => {
      component.profileForm.patchValue({
        firstName: 'Updated',
        lastName: 'Name',
      });

      component.saveProfile();

      expect(toastService.success).toHaveBeenCalledWith('Profile updated successfully');
    });

    it('should exit edit mode after successful save', () => {
      component.saveProfile();
      expect(component.editMode()).toBeFalse();
      expect(component.profileForm.disabled).toBeTrue();
    });

    it('should not save when form is invalid', () => {
      component.profileForm.patchValue({
        firstName: '',
        lastName: '',
      });

      component.saveProfile();

      expect(profileService.updateProfile).not.toHaveBeenCalled();
    });

    it('should mark fields as touched when attempting to save invalid form', () => {
      component.profileForm.patchValue({ firstName: '' });
      const firstName = component.profileForm.get('firstName');

      component.saveProfile();

      expect(firstName?.touched).toBeTrue();
    });

    it('should handle 400 error (validation error)', () => {
      const error = { status: 400, error: { message: 'Validation failed' } };
      profileService.updateProfile.and.returnValue(throwError(() => error));

      component.saveProfile();

      expect(toastService.error).toHaveBeenCalledWith('Validation failed');
    });

    it('should handle 401 error (unauthorized)', () => {
      const error = { status: 401 };
      profileService.updateProfile.and.returnValue(throwError(() => error));

      component.saveProfile();

      expect(toastService.error).toHaveBeenCalledWith('Session expired. Please log in again.');
    });

    it('should handle generic error', () => {
      spyOn(console, 'error'); // Suppress console.error in test
      profileService.updateProfile.and.returnValue(throwError(() => new Error('Server error')));

      component.saveProfile();

      expect(toastService.error).toHaveBeenCalledWith(
        'Failed to update profile. Please try again.',
      );
    });
  });

  describe('Avatar Upload', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should validate file type', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const event = { target: { files: [file], value: '' } } as any;

      component.onAvatarSelected(event);

      expect(toastService.error).toHaveBeenCalledWith(
        'Invalid file type. Please use JPG, PNG, or WEBP.',
      );
      expect(profileService.uploadAvatar).not.toHaveBeenCalled();
    });

    it('should validate file size (max 5MB)', () => {
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg',
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const event = { target: { files: [largeFile], value: '' } } as any;

      component.onAvatarSelected(event);

      expect(toastService.error).toHaveBeenCalledWith('File size must be less than 5MB.');
      expect(profileService.uploadAvatar).not.toHaveBeenCalled();
    });

    it('should accept valid image files', () => {
      const validFile = new File(['content'], 'avatar.jpg', { type: 'image/jpeg' });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const event = { target: { files: [validFile], value: 'avatar.jpg' } } as any;
      profileService.uploadAvatar.and.returnValue(
        of({ profilePictureUrl: 'https://example.com/new-avatar.jpg' }),
      );

      component.onAvatarSelected(event);

      expect(profileService.uploadAvatar).toHaveBeenCalledWith(validFile);
    });

    it('should show success toast after successful upload', (done) => {
      const validFile = new File(['content'], 'avatar.jpg', { type: 'image/jpeg' });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const event = { target: { files: [validFile], value: '' } } as any;
      profileService.uploadAvatar.and.returnValue(
        of({ profilePictureUrl: 'https://example.com/new-avatar.jpg' }),
      );

      component.onAvatarSelected(event);

      setTimeout(() => {
        expect(toastService.success).toHaveBeenCalledWith('Avatar updated successfully');
        done();
      }, 100);
    });

    it('should handle avatar upload error', (done) => {
      spyOn(console, 'error'); // Suppress console.error in test
      const validFile = new File(['content'], 'avatar.jpg', { type: 'image/jpeg' });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const event = { target: { files: [validFile], value: '' } } as any;
      profileService.uploadAvatar.and.returnValue(throwError(() => new Error('Upload failed')));

      component.onAvatarSelected(event);

      setTimeout(() => {
        expect(toastService.error).toHaveBeenCalledWith(
          'Failed to upload avatar. Please try again.',
        );
        expect(component.avatarUploading()).toBeFalse();
        done();
      }, 100);
    });
  });

  describe('Computed Signals', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should compute user initials correctly', () => {
      expect(component.userInitials()).toBe('JD');
    });

    it('should return empty string for initials when no profile', () => {
      component.profile.set(null);
      expect(component.userInitials()).toBe('');
    });

    it('should compute avatar URL with priority: preview > profile URL > null', () => {
      expect(component.avatarUrl()).toBe('https://example.com/avatar.jpg');

      component.avatarPreview.set('https://example.com/preview.jpg');
      expect(component.avatarUrl()).toBe('https://example.com/preview.jpg');

      component.avatarPreview.set(null);
      component.profile.set({ ...mockProfile, profilePictureUrl: undefined });
      expect(component.avatarUrl()).toBeNull();
    });
  });

  describe('Error Messages', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.toggleEditMode();
    });

    it('should return error message for required fields', () => {
      const firstName = component.profileForm.get('firstName');
      firstName?.setValue('');
      firstName?.markAsTouched();

      expect(component.getErrorMessage('firstName')).toBe('First Name is required');
    });

    it('should return error message for maxLength', () => {
      const firstName = component.profileForm.get('firstName');
      firstName?.setValue('a'.repeat(101));
      firstName?.markAsTouched();

      expect(component.getErrorMessage('firstName')).toBe(
        'First Name must be less than 100 characters',
      );
    });

    it('should return error message for invalid phone', () => {
      const phone = component.profileForm.get('phone');
      phone?.setValue('invalid');
      phone?.markAsTouched();

      expect(component.getErrorMessage('phone')).toBe(
        'Phone must be in format (XXX) XXX-XXXX or +1-XXX-XXX-XXXX',
      );
    });

    it('should return empty string when field is valid', () => {
      const firstName = component.profileForm.get('firstName');
      firstName?.setValue('Valid');
      firstName?.markAsTouched();

      expect(component.getErrorMessage('firstName')).toBe('');
    });

    it('should return empty string when field is not touched', () => {
      const firstName = component.profileForm.get('firstName');
      firstName?.setValue('');

      expect(component.getErrorMessage('firstName')).toBe('');
    });
  });

  describe('hasError method', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.toggleEditMode();
    });

    it('should return true when field has error and is touched', () => {
      const firstName = component.profileForm.get('firstName');
      firstName?.setValue('');
      firstName?.markAsTouched();

      expect(component.hasError('firstName')).toBeTrue();
    });

    it('should return false when field is valid', () => {
      const firstName = component.profileForm.get('firstName');
      firstName?.setValue('Valid');
      firstName?.markAsTouched();

      expect(component.hasError('firstName')).toBeFalse();
    });

    it('should return false when field has error but is not touched', () => {
      const firstName = component.profileForm.get('firstName');
      firstName?.setValue('');

      expect(component.hasError('firstName')).toBeFalse();
    });
  });

  describe('Password Change', () => {
    it('should show info toast when changePassword is called', () => {
      fixture.detectChanges();
      component.changePassword();
      expect(toastService.info).toHaveBeenCalledWith('Password change feature coming soon.');
    });
  });
});
