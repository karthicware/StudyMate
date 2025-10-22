import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HallAmenitiesService } from './hall-amenities.service';
import { HallAmenities } from '../models/hall-amenities.model';
import { environment } from '../../../environments/environment';

/**
 * Unit Tests for HallAmenitiesService
 * Story 1.22: Hall Amenities Configuration UI (Frontend)
 */
describe('HallAmenitiesService', () => {
  let service: HallAmenitiesService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiBaseUrl}/owner/halls`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HallAmenitiesService],
    });

    service = TestBed.inject(HallAmenitiesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getHallAmenities', () => {
    it('should fetch hall amenities successfully', () => {
      const hallId = 'test-hall-123';
      const mockResponse: HallAmenities = {
        hallId: 'test-hall-123',
        hallName: 'Test Hall',
        amenities: ['AC', 'WiFi'],
      };

      service.getHallAmenities(hallId).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(response.amenities.length).toBe(2);
        expect(response.amenities).toContain('AC');
        expect(response.amenities).toContain('WiFi');
      });

      const req = httpMock.expectOne(`${apiUrl}/${hallId}/amenities`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle hall with only AC amenity', () => {
      const hallId = 'test-hall-456';
      const mockResponse: HallAmenities = {
        hallId: 'test-hall-456',
        hallName: 'AC Only Hall',
        amenities: ['AC'],
      };

      service.getHallAmenities(hallId).subscribe((response) => {
        expect(response.amenities).toEqual(['AC']);
        expect(response.amenities.length).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}/${hallId}/amenities`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle hall with no amenities (empty array)', () => {
      const hallId = 'test-hall-789';
      const mockResponse: HallAmenities = {
        hallId: 'test-hall-789',
        hallName: 'No Amenities Hall',
        amenities: [],
      };

      service.getHallAmenities(hallId).subscribe((response) => {
        expect(response.amenities).toEqual([]);
        expect(response.amenities.length).toBe(0);
      });

      const req = httpMock.expectOne(`${apiUrl}/${hallId}/amenities`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle 404 error when hall not found', () => {
      const hallId = 'nonexistent-hall';

      service.getHallAmenities(hallId).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${hallId}/amenities`);
      expect(req.request.method).toBe('GET');
      req.flush('Hall not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle 500 server error', () => {
      const hallId = 'test-hall-123';

      service.getHallAmenities(hallId).subscribe({
        next: () => fail('should have failed with 500 error'),
        error: (error) => {
          expect(error.status).toBe(500);
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${hallId}/amenities`);
      expect(req.request.method).toBe('GET');
      req.flush('Internal server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('updateHallAmenities', () => {
    it('should update hall amenities with both AC and WiFi', () => {
      const hallId = 'test-hall-123';
      const amenities = ['AC', 'WiFi'];
      const mockResponse: HallAmenities = {
        hallId: 'test-hall-123',
        hallName: 'Test Hall',
        amenities: ['AC', 'WiFi'],
      };

      service.updateHallAmenities(hallId, amenities).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(response.amenities).toEqual(['AC', 'WiFi']);
      });

      const req = httpMock.expectOne(`${apiUrl}/${hallId}/amenities`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ amenities: ['AC', 'WiFi'] });
      req.flush(mockResponse);
    });

    it('should update hall amenities with only AC', () => {
      const hallId = 'test-hall-123';
      const amenities = ['AC'];
      const mockResponse: HallAmenities = {
        hallId: 'test-hall-123',
        hallName: 'Test Hall',
        amenities: ['AC'],
      };

      service.updateHallAmenities(hallId, amenities).subscribe((response) => {
        expect(response.amenities).toEqual(['AC']);
      });

      const req = httpMock.expectOne(`${apiUrl}/${hallId}/amenities`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ amenities: ['AC'] });
      req.flush(mockResponse);
    });

    it('should remove all amenities with empty array', () => {
      const hallId = 'test-hall-123';
      const amenities: string[] = [];
      const mockResponse: HallAmenities = {
        hallId: 'test-hall-123',
        hallName: 'Test Hall',
        amenities: [],
      };

      service.updateHallAmenities(hallId, amenities).subscribe((response) => {
        expect(response.amenities).toEqual([]);
        expect(response.amenities.length).toBe(0);
      });

      const req = httpMock.expectOne(`${apiUrl}/${hallId}/amenities`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ amenities: [] });
      req.flush(mockResponse);
    });

    it('should handle 400 bad request for invalid amenity codes', () => {
      const hallId = 'test-hall-123';
      const amenities = ['INVALID_AMENITY'];

      service.updateHallAmenities(hallId, amenities).subscribe({
        next: () => fail('should have failed with 400 error'),
        error: (error) => {
          expect(error.status).toBe(400);
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${hallId}/amenities`);
      expect(req.request.method).toBe('PUT');
      req.flush('Invalid amenity codes', { status: 400, statusText: 'Bad Request' });
    });

    it('should handle 403 forbidden when owner does not own hall', () => {
      const hallId = 'not-my-hall';
      const amenities = ['AC'];

      service.updateHallAmenities(hallId, amenities).subscribe({
        next: () => fail('should have failed with 403 error'),
        error: (error) => {
          expect(error.status).toBe(403);
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${hallId}/amenities`);
      expect(req.request.method).toBe('PUT');
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });

    it('should handle 404 not found when hall does not exist', () => {
      const hallId = 'nonexistent-hall';
      const amenities = ['WiFi'];

      service.updateHallAmenities(hallId, amenities).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${hallId}/amenities`);
      expect(req.request.method).toBe('PUT');
      req.flush('Hall not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle 500 server error during update', () => {
      const hallId = 'test-hall-123';
      const amenities = ['AC', 'WiFi'];

      service.updateHallAmenities(hallId, amenities).subscribe({
        next: () => fail('should have failed with 500 error'),
        error: (error) => {
          expect(error.status).toBe(500);
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${hallId}/amenities`);
      expect(req.request.method).toBe('PUT');
      req.flush('Internal server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });
});
