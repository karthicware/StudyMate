import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProfileService } from './profile.service';
import { OwnerProfile, OwnerProfileUpdateRequest } from '../models/profile.model';

describe('ProfileService', () => {
  let service: ProfileService;
  let httpMock: HttpTestingController;
  const apiUrl = '/api/v1/owner/profile';

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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProfileService],
    });
    service = TestBed.inject(ProfileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProfile', () => {
    it('should fetch profile data via GET request', () => {
      service.getProfile().subscribe((profile) => {
        expect(profile).toEqual(mockProfile);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockProfile);
    });

    it('should handle error when fetching profile', () => {
      service.getProfile().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush('Profile not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('updateProfile', () => {
    it('should update profile via PUT request', () => {
      const updateRequest: OwnerProfileUpdateRequest = {
        firstName: 'Updated',
        lastName: 'Name',
        phone: '(555) 555-5555',
      };

      const updatedProfile = { ...mockProfile, ...updateRequest };

      service.updateProfile(updateRequest).subscribe((profile) => {
        expect(profile).toEqual(updatedProfile);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateRequest);
      req.flush(updatedProfile);
    });

    it('should handle validation error (400)', () => {
      const updateRequest: OwnerProfileUpdateRequest = {
        firstName: '',
        lastName: '',
        phone: '',
      };

      service.updateProfile(updateRequest).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.error.message).toBe('Validation failed');
        },
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush({ message: 'Validation failed' }, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle unauthorized error (401)', () => {
      const updateRequest: OwnerProfileUpdateRequest = {
        firstName: 'Test',
        lastName: 'User',
      };

      service.updateProfile(updateRequest).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(401);
        },
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush({}, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('uploadAvatar', () => {
    it('should upload avatar via POST request with FormData', () => {
      const file = new File(['content'], 'avatar.jpg', { type: 'image/jpeg' });
      const responseUrl = { profilePictureUrl: 'https://example.com/new-avatar.jpg' };

      service.uploadAvatar(file).subscribe((response) => {
        expect(response).toEqual(responseUrl);
      });

      const req = httpMock.expectOne(`${apiUrl}/avatar`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBeTrue();
      expect(req.request.body.get('avatar')).toBe(file);
      req.flush(responseUrl);
    });

    it('should handle upload error', () => {
      const file = new File(['content'], 'avatar.jpg', { type: 'image/jpeg' });

      service.uploadAvatar(file).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/avatar`);
      req.flush('Upload failed', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle file too large error (413)', () => {
      const file = new File(['x'.repeat(10 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });

      service.uploadAvatar(file).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(413);
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/avatar`);
      req.flush('File too large', { status: 413, statusText: 'Payload Too Large' });
    });
  });
});
