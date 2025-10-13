import { Component, OnInit, inject, signal, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { SettingsService } from '../../../core/services/settings.service';
import { ToastService } from '../../../shared/services/toast.service';

/**
 * SettingsComponent
 *
 * Owner settings page with auto-save functionality, collapsible sections,
 * and comprehensive notification/system preference management.
 *
 * Features:
 * - Auto-save with 500ms debounce
 * - Collapsible accordion sections
 * - Notification preferences (email, SMS, push)
 * - Notification types (booking, payment, system)
 * - System preferences (language, timezone, default view)
 * - Privacy settings (profile visibility)
 * - Restore defaults functionality
 *
 * Story: 1.20 - Owner Settings Page
 */
@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private settingsService = inject(SettingsService);
  private toastService = inject(ToastService);
  private destroy$ = new Subject<void>();

  // Signals for reactive state
  loading = signal(false);
  saving = signal(false);
  saveSuccess = signal(false);
  showConfirmModal = signal(false);
  expandedSections = signal<Record<string, boolean>>({
    notifications: true,
    notificationTypes: false,
    system: false,
    privacy: false
  });

  // Form
  settingsForm!: FormGroup;

  // Dropdown Options
  languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' }
  ];

  timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'UTC', label: 'UTC' }
  ];

  defaultViews = [
    { value: 'dashboard', label: 'Dashboard' },
    { value: 'seat-map', label: 'Seat Map' }
  ];

  ngOnInit(): void {
    this.initForm();
    this.loadSettings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize the settings form with default values
   */
  private initForm(): void {
    this.settingsForm = this.fb.group({
      emailNotifications: [true],
      smsNotifications: [false],
      pushNotifications: [true],
      notificationBooking: [true],
      notificationPayment: [true],
      notificationSystem: [true],
      language: ['en'],
      timezone: ['America/New_York'],
      defaultView: ['dashboard'],
      profileVisibility: ['public']
    });
  }

  /**
   * Load settings from API and populate form
   */
  private loadSettings(): void {
    this.loading.set(true);
    this.settingsService.getSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (settings) => {
          // Patch form without triggering valueChanges
          this.settingsForm.patchValue(settings, { emitEvent: false });
          this.loading.set(false);

          // Setup auto-save after loading initial values
          this.setupAutoSave();
        },
        error: (error) => {
          console.error('Failed to load settings:', error);
          this.toastService.error('Failed to load settings');
          this.loading.set(false);

          // Setup auto-save even if load fails (use defaults)
          this.setupAutoSave();
        }
      });
  }

  /**
   * Setup auto-save with debounce on form value changes
   */
  private setupAutoSave(): void {
    this.settingsForm.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.saveSettings();
      });
  }

  /**
   * Save settings to API
   */
  private saveSettings(): void {
    if (this.settingsForm.invalid) {
      return;
    }

    this.saving.set(true);
    this.saveSuccess.set(false);

    this.settingsService.updateSettings(this.settingsForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.saveSuccess.set(true);

          // Hide success indicator after 2 seconds
          setTimeout(() => this.saveSuccess.set(false), 2000);
        },
        error: (error) => {
          console.error('Failed to save settings:', error);
          this.toastService.error('Failed to save settings');
          this.saving.set(false);
        }
      });
  }

  /**
   * Toggle accordion section
   */
  toggleSection(section: string): void {
    this.expandedSections.update(sections => ({
      ...sections,
      [section]: !sections[section]
    }));
  }

  /**
   * Handle profile visibility toggle change
   */
  onProfileVisibilityChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.checked ? 'public' : 'private';
    this.settingsForm.patchValue({ profileVisibility: value });
  }

  /**
   * Restore defaults - show confirmation modal
   */
  restoreDefaults(): void {
    this.showConfirmModal.set(true);
  }

  /**
   * Confirm restore defaults
   */
  confirmRestore(): void {
    this.showConfirmModal.set(false);

    this.settingsService.restoreDefaults()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (defaults) => {
          // Patch form without triggering auto-save immediately
          this.settingsForm.patchValue(defaults, { emitEvent: false });
          this.toastService.success('Settings restored to defaults');

          // Trigger one manual save
          this.saveSettings();
        },
        error: (error) => {
          console.error('Failed to restore defaults:', error);
          this.toastService.error('Failed to restore defaults');
        }
      });
  }

  /**
   * Cancel restore defaults
   */
  cancelRestore(): void {
    this.showConfirmModal.set(false);
  }
}
