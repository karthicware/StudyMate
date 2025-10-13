import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../../core/services/settings.service';
import { ToastService } from '../../../shared/services/toast.service';
import { OwnerSettings } from '../../../core/models/settings.model';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let settingsService: jasmine.SpyObj<SettingsService>;
  let toastService: jasmine.SpyObj<ToastService>;

  const mockSettings: OwnerSettings = {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    notificationBooking: true,
    notificationPayment: true,
    notificationSystem: true,
    language: 'en',
    timezone: 'America/New_York',
    defaultView: 'dashboard',
    profileVisibility: 'public'
  };

  beforeEach(async () => {
    const settingsServiceSpy = jasmine.createSpyObj('SettingsService', [
      'getSettings',
      'updateSettings',
      'restoreDefaults'
    ]);
    const toastServiceSpy = jasmine.createSpyObj('ToastService', [
      'success',
      'error',
      'info',
      'warning'
    ]);

    await TestBed.configureTestingModule({
      imports: [SettingsComponent, ReactiveFormsModule],
      providers: [
        { provide: SettingsService, useValue: settingsServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    }).compileComponents();

    settingsService = TestBed.inject(SettingsService) as jasmine.SpyObj<SettingsService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
  });

  beforeEach(() => {
    settingsService.getSettings.and.returnValue(of(mockSettings));
    settingsService.updateSettings.and.returnValue(of(mockSettings));

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize form with default values', () => {
      // Don't call ngOnInit yet
      component['initForm']();

      expect(component.settingsForm).toBeDefined();
      expect(component.settingsForm.get('emailNotifications')?.value).toBe(true);
      expect(component.settingsForm.get('language')?.value).toBe('en');
    });

    it('should load settings on init', fakeAsync(() => {
      fixture.detectChanges(); // Triggers ngOnInit
      tick();

      expect(settingsService.getSettings).toHaveBeenCalled();
      expect(component.loading()).toBe(false);
      expect(component.settingsForm.value).toEqual(mockSettings);
    }));

    it('should handle settings load error', fakeAsync(() => {
      settingsService.getSettings.and.returnValue(
        throwError(() => ({ status: 500, message: 'Server error' }))
      );

      fixture.detectChanges();
      tick();

      expect(toastService.error).toHaveBeenCalledWith('Failed to load settings');
      expect(component.loading()).toBe(false);
    }));

    it('should set loading state while fetching settings', () => {
      component.loading.set(true);
      expect(component.loading()).toBe(true);
    });
  });

  describe('Form Controls', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should have all required form controls', () => {
      expect(component.settingsForm.get('emailNotifications')).toBeDefined();
      expect(component.settingsForm.get('smsNotifications')).toBeDefined();
      expect(component.settingsForm.get('pushNotifications')).toBeDefined();
      expect(component.settingsForm.get('notificationBooking')).toBeDefined();
      expect(component.settingsForm.get('notificationPayment')).toBeDefined();
      expect(component.settingsForm.get('notificationSystem')).toBeDefined();
      expect(component.settingsForm.get('language')).toBeDefined();
      expect(component.settingsForm.get('timezone')).toBeDefined();
      expect(component.settingsForm.get('defaultView')).toBeDefined();
      expect(component.settingsForm.get('profileVisibility')).toBeDefined();
    });

    it('should populate form with loaded settings', () => {
      expect(component.settingsForm.value).toEqual(mockSettings);
    });
  });

  describe('Auto-save functionality', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
      settingsService.updateSettings.calls.reset(); // Reset after initial load
    }));

    it('should trigger save after debounce period (500ms)', fakeAsync(() => {
      component.settingsForm.patchValue({ emailNotifications: false });
      tick(499); // Just before debounce

      expect(settingsService.updateSettings).not.toHaveBeenCalled();

      tick(1); // Complete debounce
      expect(settingsService.updateSettings).toHaveBeenCalled();
    }));

    it('should debounce multiple rapid changes', fakeAsync(() => {
      component.settingsForm.patchValue({ emailNotifications: false });
      tick(300);
      component.settingsForm.patchValue({ smsNotifications: true });
      tick(300);
      component.settingsForm.patchValue({ pushNotifications: false });
      tick(500);

      // Should only save once after all changes settle
      expect(settingsService.updateSettings).toHaveBeenCalledTimes(1);
    }));

    it('should set saving and success states correctly', fakeAsync(() => {
      component.settingsForm.patchValue({ emailNotifications: false });
      tick(500);

      expect(component.saving()).toBe(false);
      expect(component.saveSuccess()).toBe(true);

      tick(2000); // Wait for success indicator timeout
      expect(component.saveSuccess()).toBe(false);
    }));

    it('should handle save error', fakeAsync(() => {
      settingsService.updateSettings.and.returnValue(
        throwError(() => ({ status: 500, message: 'Save failed' }))
      );

      component.settingsForm.patchValue({ emailNotifications: false });
      tick(500);

      expect(toastService.error).toHaveBeenCalledWith('Failed to save settings');
      expect(component.saving()).toBe(false);
    }));

    it('should not save if form is invalid', fakeAsync(() => {
      settingsService.updateSettings.calls.reset(); // Reset after initial load

      // Mark form as invalid
      component.settingsForm.setErrors({ invalid: true });

      // Manually call saveSettings since form changes won't trigger with errors
      component['saveSettings']();

      expect(settingsService.updateSettings).not.toHaveBeenCalled();
    }));
  });

  describe('Accordion sections', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should have notifications section expanded by default', () => {
      expect(component.expandedSections()['notifications']).toBe(true);
    });

    it('should have other sections collapsed by default', () => {
      expect(component.expandedSections()['notificationTypes']).toBe(false);
      expect(component.expandedSections()['system']).toBe(false);
      expect(component.expandedSections()['privacy']).toBe(false);
    });

    it('should toggle section when clicked', () => {
      const initialState = component.expandedSections()['notificationTypes'];
      component.toggleSection('notificationTypes');

      expect(component.expandedSections()['notificationTypes']).toBe(!initialState);
    });

    it('should toggle section multiple times', () => {
      component.toggleSection('system');
      expect(component.expandedSections()['system']).toBe(true);

      component.toggleSection('system');
      expect(component.expandedSections()['system']).toBe(false);

      component.toggleSection('system');
      expect(component.expandedSections()['system']).toBe(true);
    });
  });

  describe('Profile visibility toggle', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should set profileVisibility to "public" when checked', () => {
      const event = { target: { checked: true } } as any;
      component.onProfileVisibilityChange(event);

      expect(component.settingsForm.value.profileVisibility).toBe('public');
    });

    it('should set profileVisibility to "private" when unchecked', () => {
      const event = { target: { checked: false } } as any;
      component.onProfileVisibilityChange(event);

      expect(component.settingsForm.value.profileVisibility).toBe('private');
    });
  });

  describe('Restore defaults', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should show confirmation modal when restore defaults clicked', () => {
      component.restoreDefaults();
      expect(component.showConfirmModal()).toBe(true);
    });

    it('should cancel restore and hide modal', () => {
      component.showConfirmModal.set(true);
      component.cancelRestore();

      expect(component.showConfirmModal()).toBe(false);
    });

    it('should restore defaults on confirmation', fakeAsync(() => {
      const defaultSettings: OwnerSettings = {
        ...mockSettings,
        emailNotifications: true,
        smsNotifications: true
      };

      settingsService.restoreDefaults.and.returnValue(of(defaultSettings));

      component.confirmRestore();
      tick();

      expect(settingsService.restoreDefaults).toHaveBeenCalled();
      expect(toastService.success).toHaveBeenCalledWith('Settings restored to defaults');
      expect(component.showConfirmModal()).toBe(false);
    }));

    it('should handle restore defaults error', fakeAsync(() => {
      settingsService.restoreDefaults.and.returnValue(
        throwError(() => ({ status: 500, message: 'Restore failed' }))
      );

      component.confirmRestore();
      tick();

      expect(toastService.error).toHaveBeenCalledWith('Failed to restore defaults');
    }));
  });

  describe('Dropdown options', () => {
    it('should have correct language options', () => {
      expect(component.languages).toEqual([
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Spanish' },
        { value: 'fr', label: 'French' }
      ]);
    });

    it('should have correct timezone options', () => {
      expect(component.timezones.length).toBe(5);
      expect(component.timezones[0]).toEqual({
        value: 'America/New_York',
        label: 'Eastern Time (ET)'
      });
    });

    it('should have correct default view options', () => {
      expect(component.defaultViews).toEqual([
        { value: 'dashboard', label: 'Dashboard' },
        { value: 'seat-map', label: 'Seat Map' }
      ]);
    });
  });

  describe('Component cleanup', () => {
    it('should unsubscribe on destroy', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const destroySpy = spyOn(component['destroy$'], 'next');
      const completeSpy = spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(destroySpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    }));
  });

  describe('Template rendering', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should display loading state', () => {
      component.loading.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('.loading-state')).toBeTruthy();
    });

    it('should display settings form when not loading', () => {
      component.loading.set(false);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('.settings-form')).toBeTruthy();
    });

    it('should display saving indicator when saving', () => {
      component.saving.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const saveIndicator = compiled.querySelector('.save-indicator.saving');
      expect(saveIndicator).toBeTruthy();
      expect(saveIndicator.textContent).toContain('Saving');
    });

    it('should display success indicator after save', () => {
      component.saveSuccess.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const successIndicator = compiled.querySelector('.save-indicator.success');
      expect(successIndicator).toBeTruthy();
      expect(successIndicator.textContent).toContain('Saved');
    });

    it('should display confirmation modal when showConfirmModal is true', () => {
      component.showConfirmModal.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('.modal-overlay')).toBeTruthy();
      expect(compiled.querySelector('.modal-title').textContent).toContain('Restore Default Settings');
    });
  });
});
