import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SettingsService } from './settings.service';
import { OwnerSettings, SettingsUpdateRequest } from '../models/settings.model';

describe('SettingsService', () => {
  let service: SettingsService;
  let httpMock: HttpTestingController;
  const apiUrl = '/api/v1/owner/settings';

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
    profileVisibility: 'public',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SettingsService],
    });
    service = TestBed.inject(SettingsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getSettings', () => {
    it('should fetch settings data via GET request', () => {
      service.getSettings().subscribe((settings) => {
        expect(settings).toEqual(mockSettings);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockSettings);
    });

    it('should handle error when fetching settings', () => {
      service.getSettings().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        },
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle 401 unauthorized error', () => {
      service.getSettings().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(401);
        },
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush({}, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('updateSettings', () => {
    it('should update settings via PUT request', () => {
      const updateRequest: SettingsUpdateRequest = {
        emailNotifications: false,
        language: 'es',
      };

      const updatedSettings = { ...mockSettings, ...updateRequest };

      service.updateSettings(updateRequest).subscribe((settings) => {
        expect(settings).toEqual(updatedSettings);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateRequest);
      req.flush(updatedSettings);
    });

    it('should support partial updates', () => {
      const partialUpdate: SettingsUpdateRequest = {
        timezone: 'America/Los_Angeles',
      };

      service.updateSettings(partialUpdate).subscribe((settings) => {
        expect(settings.timezone).toBe('America/Los_Angeles');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.body).toEqual(partialUpdate);
      req.flush({ ...mockSettings, timezone: 'America/Los_Angeles' });
    });

    it('should handle validation error (400)', () => {
      const invalidUpdate: SettingsUpdateRequest = {
        language: 'invalid-lang',
      };

      service.updateSettings(invalidUpdate).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        },
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush({ message: 'Invalid language' }, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle unauthorized error (401)', () => {
      const updateRequest: SettingsUpdateRequest = {
        emailNotifications: false,
      };

      service.updateSettings(updateRequest).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(401);
        },
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush({}, { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle server error (500)', () => {
      const updateRequest: SettingsUpdateRequest = {
        emailNotifications: false,
      };

      service.updateSettings(updateRequest).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        },
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('restoreDefaults', () => {
    it('should restore defaults via POST request', () => {
      const defaultSettings: OwnerSettings = {
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: true,
        notificationBooking: true,
        notificationPayment: true,
        notificationSystem: true,
        language: 'en',
        timezone: 'America/New_York',
        defaultView: 'dashboard',
        profileVisibility: 'public',
      };

      service.restoreDefaults().subscribe((settings) => {
        expect(settings).toEqual(defaultSettings);
      });

      const req = httpMock.expectOne(`${apiUrl}/restore-defaults`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(defaultSettings);
    });

    it('should handle error when restoring defaults', () => {
      service.restoreDefaults().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/restore-defaults`);
      req.flush('Failed to restore', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle unauthorized error (401)', () => {
      service.restoreDefaults().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(401);
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/restore-defaults`);
      req.flush({}, { status: 401, statusText: 'Unauthorized' });
    });
  });
});
