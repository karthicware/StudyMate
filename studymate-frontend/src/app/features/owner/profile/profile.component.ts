import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../../core/services/profile.service';
import { ToastService } from '../../../shared/services/toast.service';
import { OwnerProfile } from '../../../core/models/profile.model';

/**
 * ProfileComponent
 *
 * Owner profile management page with display and edit modes.
 * Handles profile information updates, avatar uploads, and password changes.
 *
 * Features:
 * - Display mode: Shows current profile information (AC1)
 * - Edit mode: Allows updating firstName, lastName, phone (AC2)
 * - Avatar upload: Support for JPG, PNG, WEBP images up to 5MB (AC3)
 * - Password change section: Link to password management (AC4)
 * - Form validation: Real-time validation with error messages (AC5)
 * - Toast notifications: Success/error messages (AC6)
 * - Responsive design: Mobile, tablet, desktop layouts (AC7)
 */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private toastService = inject(ToastService);

  // Profile form
  profileForm!: FormGroup;

  // State signals
  editMode = signal(false);
  loading = signal(false);
  avatarUploading = signal(false);
  profile = signal<OwnerProfile | null>(null);
  avatarPreview = signal<string | null>(null);

  // Computed signals
  userInitials = computed(() => {
    const p = this.profile();
    if (!p) return '';
    return `${p.firstName.charAt(0)}${p.lastName.charAt(0)}`.toUpperCase();
  });

  avatarUrl = computed(() => {
    // Priority: preview (during upload) > profile URL > null
    return this.avatarPreview() || this.profile()?.profilePictureUrl || null;
  });

  ngOnInit(): void {
    this.initForm();
    this.loadProfile();
  }

  /**
   * Initialize the reactive form with validation rules
   * AC2: Form validation requirements
   * AC5: Real-time validation
   */
  private initForm(): void {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      phone: ['', [this.phoneValidator.bind(this)]]
    });

    // Disable form by default (display mode)
    this.profileForm.disable();
  }

  /**
   * Custom phone validator
   * Validates format: (XXX) XXX-XXXX or +1-XXX-XXX-XXXX
   * AC2: Phone format validation
   */
  private phoneValidator(control: any): { [key: string]: boolean } | null {
    if (!control.value) return null; // Optional field

    const phonePattern1 = /^\(\d{3}\) \d{3}-\d{4}$/; // (123) 456-7890
    const phonePattern2 = /^\+1-\d{3}-\d{3}-\d{4}$/; // +1-123-456-7890

    if (phonePattern1.test(control.value) || phonePattern2.test(control.value)) {
      return null;
    }

    return { invalidPhone: true };
  }

  /**
   * Load profile data from API
   * AC1: Display current profile information
   * AC5: Error handling
   */
  loadProfile(): void {
    this.loading.set(true);
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.profileForm.patchValue({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone || ''
        });
        this.avatarPreview.set(profile.profilePictureUrl || null);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load profile:', error);
        this.toastService.error('Failed to load profile. Please try again.');
        this.loading.set(false);
      }
    });
  }

  /**
   * Toggle between display and edit modes
   * AC2: Edit mode toggle
   */
  toggleEditMode(): void {
    if (this.editMode()) {
      // Cancel edit - revert changes
      this.cancelEdit();
    } else {
      // Enter edit mode
      this.editMode.set(true);
      this.profileForm.enable();
      // Keep email disabled (read-only)
      // Note: Email field not in form, shown separately as read-only
    }
  }

  /**
   * Cancel edit mode and revert changes
   * AC2: Cancel button reverts unsaved changes
   */
  cancelEdit(): void {
    this.editMode.set(false);
    this.profileForm.disable();
    // Reload to discard changes
    const p = this.profile();
    if (p) {
      this.profileForm.patchValue({
        firstName: p.firstName,
        lastName: p.lastName,
        phone: p.phone || ''
      });
    }
  }

  /**
   * Save profile changes
   * AC2: Save button updates profile via PUT /owner/profile
   * AC5: Form validation and error handling
   * AC6: Success/error toast notifications
   */
  saveProfile(): void {
    if (this.profileForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.profileForm.controls).forEach(key => {
        this.profileForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading.set(true);
    const formValue = this.profileForm.value;

    this.profileService.updateProfile(formValue).subscribe({
      next: (updatedProfile) => {
        this.profile.set(updatedProfile);
        this.editMode.set(false);
        this.profileForm.disable();
        this.loading.set(false);
        this.toastService.success('Profile updated successfully');
      },
      error: (error) => {
        console.error('Failed to update profile:', error);
        this.loading.set(false);

        // Handle specific error codes
        if (error.status === 400) {
          this.toastService.error(error.error?.message || 'Invalid profile data. Please check your inputs.');
        } else if (error.status === 401) {
          this.toastService.error('Session expired. Please log in again.');
          // Could redirect to login here
        } else {
          this.toastService.error('Failed to update profile. Please try again.');
        }
      }
    });
  }

  /**
   * Handle avatar file selection
   * AC3: Avatar upload with file validation
   * AC6: Success/error toast notifications
   */
  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      this.toastService.error('Invalid file type. Please use JPG, PNG, or WEBP.');
      input.value = ''; // Clear input
      return;
    }

    // Validate file size (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.toastService.error('File size must be less than 5MB.');
      input.value = ''; // Clear input
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = () => {
      this.avatarPreview.set(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload avatar
    this.uploadAvatar(file);

    // Clear input to allow re-uploading the same file
    input.value = '';
  }

  /**
   * Upload avatar to server
   * AC3: Upload via POST /owner/profile/avatar
   * AC6: Success/error toast notifications
   */
  private uploadAvatar(file: File): void {
    this.avatarUploading.set(true);

    this.profileService.uploadAvatar(file).subscribe({
      next: (response) => {
        // Update profile with new avatar URL
        const currentProfile = this.profile();
        if (currentProfile) {
          this.profile.set({
            ...currentProfile,
            profilePictureUrl: response.profilePictureUrl
          });
        }
        this.avatarPreview.set(response.profilePictureUrl);
        this.avatarUploading.set(false);
        this.toastService.success('Avatar updated successfully');
      },
      error: (error) => {
        console.error('Failed to upload avatar:', error);
        this.avatarUploading.set(false);
        // Revert preview on error
        const currentProfile = this.profile();
        this.avatarPreview.set(currentProfile?.profilePictureUrl || null);
        this.toastService.error('Failed to upload avatar. Please try again.');
      }
    });
  }

  /**
   * Get validation error message for a form field
   * AC5: Error messages displayed inline below fields
   */
  getErrorMessage(fieldName: string): string {
    const control = this.profileForm.get(fieldName);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (control.errors['maxlength']) {
      return `${this.getFieldLabel(fieldName)} must be less than ${control.errors['maxlength'].requiredLength} characters`;
    }
    if (control.errors['invalidPhone']) {
      return 'Phone must be in format (XXX) XXX-XXXX or +1-XXX-XXX-XXXX';
    }

    return '';
  }

  /**
   * Get human-readable field label
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      firstName: 'First Name',
      lastName: 'Last Name',
      phone: 'Phone Number'
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Check if a field has error and should show error message
   * AC5: Real-time validation on blur/change
   */
  hasError(fieldName: string): boolean {
    const control = this.profileForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  /**
   * Trigger file input click
   * AC3: Change Avatar button opens file upload
   */
  triggerFileInput(): void {
    const fileInput = document.getElementById('avatar-upload') as HTMLInputElement;
    fileInput?.click();
  }

  /**
   * Navigate to password change (placeholder for future implementation)
   * AC4: Password change section
   */
  changePassword(): void {
    // TODO: Implement password change modal or navigate to password change page
    this.toastService.info('Password change feature coming soon.');
  }
}
