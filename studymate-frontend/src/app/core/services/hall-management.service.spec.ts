import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HallManagementService } from './hall-management.service';
import { Hall, HallCreateRequest, HallListResponse, HallSummary } from '../models/hall.model';

describe('HallManagementService', () => {
  let service: HallManagementService;
  let httpMock: HttpTestingController;

  const mockHallCreateRequest: HallCreateRequest = {
    hallName: 'Downtown Study Center',
    description: 'Quiet study space in downtown area',
    address: '123 Main Street, Floor 2',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400001',
    country: 'India',
  };

  const mockHall: Hall = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    ownerId: '987e4567-e89b-12d3-a456-426614174000',
    hallName: 'Downtown Study Center',
    description: 'Quiet study space in downtown area',
    address: '123 Main Street, Floor 2',
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
    createdAt: new Date('2025-10-19T10:00:00Z'),
    updatedAt: new Date('2025-10-19T10:00:00Z'),
  };

  const mockHallSummaries: HallSummary[] = [
    {
      id: '123e4567-e89b-12d3-a456-426614174000',
      hallName: 'Downtown Study Center',
      status: 'DRAFT',
      city: 'Mumbai',
      createdAt: new Date('2025-10-19T10:00:00Z'),
    },
    {
      id: '223e4567-e89b-12d3-a456-426614174001',
      hallName: 'Library Study Space',
      status: 'ACTIVE',
      city: 'Delhi',
      createdAt: new Date('2025-10-18T10:00:00Z'),
    },
  ];

  const mockHallListResponse: HallListResponse = {
    halls: mockHallSummaries,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HallManagementService],
    });

    service = TestBed.inject(HallManagementService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verify no outstanding HTTP requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createHall', () => {
    it('should create a new hall and return Hall object', (done) => {
      service.createHall(mockHallCreateRequest).subscribe({
        next: (hall) => {
          expect(hall).toEqual(mockHall);
          expect(hall.id).toBe(mockHall.id);
          expect(hall.hallName).toBe('Downtown Study Center');
          expect(hall.status).toBe('DRAFT');
          expect(hall.createdAt).toBeInstanceOf(Date);
          expect(hall.updatedAt).toBeInstanceOf(Date);
          done();
        },
        error: (error) => {
          fail(`Expected success but got error: ${error.message}`);
          done();
        },
      });

      const req = httpMock.expectOne('/api/v1/owner/halls');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockHallCreateRequest);
      req.flush(mockHall);
    });

    it('should handle 400 Bad Request validation error', (done) => {
      const errorResponse = {
        status: 400,
        statusText: 'Bad Request',
        error: { message: 'Hall name is required' },
      };

      service.createHall(mockHallCreateRequest).subscribe({
        next: () => {
          fail('Expected error but got success');
          done();
        },
        error: (error) => {
          expect(error.message).toContain('Hall name is required');
          done();
        },
      });

      const req = httpMock.expectOne('/api/v1/owner/halls');
      req.flush(errorResponse.error, {
        status: errorResponse.status,
        statusText: errorResponse.statusText,
      });
    });

    it('should handle 401 Unauthorized error', (done) => {
      const errorResponse = {
        status: 401,
        statusText: 'Unauthorized',
      };

      service.createHall(mockHallCreateRequest).subscribe({
        next: () => {
          fail('Expected error but got success');
          done();
        },
        error: (error) => {
          expect(error.message).toContain('Unauthorized');
          done();
        },
      });

      const req = httpMock.expectOne('/api/v1/owner/halls');
      req.flush(null, {
        status: errorResponse.status,
        statusText: errorResponse.statusText,
      });
    });

    it('should handle 409 Conflict duplicate name error', (done) => {
      const errorResponse = {
        status: 409,
        statusText: 'Conflict',
        error: { message: 'A hall with this name already exists' },
      };

      service.createHall(mockHallCreateRequest).subscribe({
        next: () => {
          fail('Expected error but got success');
          done();
        },
        error: (error) => {
          expect(error.message).toContain('A hall with this name already exists');
          done();
        },
      });

      const req = httpMock.expectOne('/api/v1/owner/halls');
      req.flush(errorResponse.error, {
        status: errorResponse.status,
        statusText: errorResponse.statusText,
      });
    });
  });

  describe('getOwnerHalls', () => {
    it('should fetch owner halls and return HallSummary array', (done) => {
      service.getOwnerHalls().subscribe({
        next: (halls) => {
          expect(halls.length).toBe(2);
          expect(halls[0].hallName).toBe('Downtown Study Center');
          expect(halls[1].hallName).toBe('Library Study Space');
          expect(halls[0].createdAt).toBeInstanceOf(Date);
          expect(halls[1].createdAt).toBeInstanceOf(Date);
          done();
        },
        error: (error) => {
          fail(`Expected success but got error: ${error.message}`);
          done();
        },
      });

      const req = httpMock.expectOne('/api/v1/owner/halls');
      expect(req.request.method).toBe('GET');
      req.flush(mockHallListResponse);
    });

    it('should handle empty halls list', (done) => {
      const emptyResponse: HallListResponse = { halls: [] };

      service.getOwnerHalls().subscribe({
        next: (halls) => {
          expect(halls.length).toBe(0);
          done();
        },
      });

      const req = httpMock.expectOne('/api/v1/owner/halls');
      req.flush(emptyResponse);
    });

    it('should handle 401 Unauthorized error', (done) => {
      const errorResponse = {
        status: 401,
        statusText: 'Unauthorized',
      };

      service.getOwnerHalls().subscribe({
        next: () => {
          fail('Expected error but got success');
          done();
        },
        error: (error) => {
          expect(error.message).toContain('Unauthorized');
          done();
        },
      });

      const req = httpMock.expectOne('/api/v1/owner/halls');
      req.flush(null, {
        status: errorResponse.status,
        statusText: errorResponse.statusText,
      });
    });
  });

  describe('getHallById', () => {
    it('should fetch hall details by ID', (done) => {
      const hallId = '123e4567-e89b-12d3-a456-426614174000';

      service.getHallById(hallId).subscribe({
        next: (hall) => {
          expect(hall).toEqual(mockHall);
          expect(hall.id).toBe(hallId);
          expect(hall.createdAt).toBeInstanceOf(Date);
          expect(hall.updatedAt).toBeInstanceOf(Date);
          done();
        },
      });

      const req = httpMock.expectOne(`/api/v1/owner/halls/${hallId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockHall);
    });

    it('should handle 404 Not Found error', (done) => {
      const hallId = 'non-existent-id';
      const errorResponse = {
        status: 404,
        statusText: 'Not Found',
      };

      service.getHallById(hallId).subscribe({
        next: () => {
          fail('Expected error but got success');
          done();
        },
        error: (error) => {
          expect(error.message).toContain('Hall not found');
          done();
        },
      });

      const req = httpMock.expectOne(`/api/v1/owner/halls/${hallId}`);
      req.flush(null, {
        status: errorResponse.status,
        statusText: errorResponse.statusText,
      });
    });
  });

  describe('updateHall', () => {
    it('should update hall and return updated Hall object', (done) => {
      const hallId = '123e4567-e89b-12d3-a456-426614174000';
      const updateData: Partial<HallCreateRequest> = {
        description: 'Updated description',
        city: 'Pune',
      };

      const updatedHall: Hall = {
        ...mockHall,
        description: 'Updated description',
        city: 'Pune',
      };

      service.updateHall(hallId, updateData).subscribe({
        next: (hall) => {
          expect(hall.description).toBe('Updated description');
          expect(hall.city).toBe('Pune');
          expect(hall.createdAt).toBeInstanceOf(Date);
          expect(hall.updatedAt).toBeInstanceOf(Date);
          done();
        },
      });

      const req = httpMock.expectOne(`/api/v1/owner/halls/${hallId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush(updatedHall);
    });
  });

  describe('deleteHall', () => {
    it('should delete hall by ID', (done) => {
      const hallId = '123e4567-e89b-12d3-a456-426614174000';

      service.deleteHall(hallId).subscribe({
        next: () => {
          expect(true).toBe(true); // Deletion successful
          done();
        },
      });

      const req = httpMock.expectOne(`/api/v1/owner/halls/${hallId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle 404 Not Found error', (done) => {
      const hallId = 'non-existent-id';
      const errorResponse = {
        status: 404,
        statusText: 'Not Found',
      };

      service.deleteHall(hallId).subscribe({
        next: () => {
          fail('Expected error but got success');
          done();
        },
        error: (error) => {
          expect(error.message).toContain('Hall not found');
          done();
        },
      });

      const req = httpMock.expectOne(`/api/v1/owner/halls/${hallId}`);
      req.flush(null, {
        status: errorResponse.status,
        statusText: errorResponse.statusText,
      });
    });
  });

  describe('HTTP Error Handling', () => {
    it('should handle network errors', (done) => {
      const errorEvent = new ErrorEvent('Network error', {
        message: 'Connection timeout',
      });

      service.createHall(mockHallCreateRequest).subscribe({
        next: () => {
          fail('Expected error but got success');
          done();
        },
        error: (error) => {
          expect(error.message).toContain('Network error');
          done();
        },
      });

      const req = httpMock.expectOne('/api/v1/owner/halls');
      req.error(errorEvent);
    });

    it('should handle 500 Internal Server Error', (done) => {
      const errorResponse = {
        status: 500,
        statusText: 'Internal Server Error',
      };

      service.createHall(mockHallCreateRequest).subscribe({
        next: () => {
          fail('Expected error but got success');
          done();
        },
        error: (error) => {
          expect(error.message).toContain('Server error');
          done();
        },
      });

      const req = httpMock.expectOne('/api/v1/owner/halls');
      req.flush(null, {
        status: errorResponse.status,
        statusText: errorResponse.statusText,
      });
    });
  });
});
