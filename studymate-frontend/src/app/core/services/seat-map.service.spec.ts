import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SeatMapService, SeatMapResponse } from './seat-map.service';
import { Seat } from '../models/seat-config.model';

describe('SeatMapService', () => {
  let service: SeatMapService;
  let httpMock: HttpTestingController;

  const mockHallId = 'test-hall-123';
  const mockSeats: Seat[] = [
    {
      id: 'seat-1',
      hallId: mockHallId,
      seatNumber: 'A1',
      xCoord: 100,
      yCoord: 150,
      status: 'available'
    },
    {
      id: 'seat-2',
      hallId: mockHallId,
      seatNumber: 'A2',
      xCoord: 200,
      yCoord: 150,
      status: 'booked'
    }
  ];

  const mockResponse: SeatMapResponse = {
    seats: mockSeats
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SeatMapService]
    });
    service = TestBed.inject(SeatMapService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getSeats', () => {
    it('should fetch seats for a given hall ID', (done) => {
      service.getSeats(mockHallId).subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          expect(response.seats.length).toBe(2);
          expect(response.seats[0].seatNumber).toBe('A1');
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne(`/api/owner/seats/${mockHallId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle empty seat list', (done) => {
      const emptyResponse: SeatMapResponse = { seats: [] };

      service.getSeats(mockHallId).subscribe({
        next: (response) => {
          expect(response.seats).toEqual([]);
          expect(response.seats.length).toBe(0);
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne(`/api/owner/seats/${mockHallId}`);
      req.flush(emptyResponse);
    });

    it('should handle HTTP errors', (done) => {
      const errorMessage = 'Hall not found';

      service.getSeats(mockHallId).subscribe({
        next: () => done.fail('should have failed with 404 error'),
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.error).toBe(errorMessage);
          done();
        }
      });

      const req = httpMock.expectOne(`/api/owner/seats/${mockHallId}`);
      req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('getSeatsWithPolling', () => {
    it('should emit immediately on subscription', (done) => {
      service.getSeatsWithPolling(mockHallId, 1000).subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne(`/api/owner/seats/${mockHallId}`);
      req.flush(mockResponse);
    });

    it('should use default polling interval of 10000ms', (done) => {
      const subscription = service.getSeatsWithPolling(mockHallId).subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          subscription.unsubscribe();
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne(`/api/owner/seats/${mockHallId}`);
      req.flush(mockResponse);
    });

    it('should use custom polling interval', (done) => {
      const customInterval = 5000;
      const subscription = service.getSeatsWithPolling(mockHallId, customInterval).subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          subscription.unsubscribe();
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne(`/api/owner/seats/${mockHallId}`);
      req.flush(mockResponse);
    });
  });
});
