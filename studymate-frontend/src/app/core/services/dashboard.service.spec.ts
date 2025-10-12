import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DashboardService } from './dashboard.service';
import { DashboardMetrics } from '../models/dashboard.model';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  const mockDashboardMetrics: DashboardMetrics = {
    totalSeats: 50,
    occupancyPercentage: 75.5,
    currentRevenue: 15000,
    seatMap: [
      {
        id: '1',
        seatNumber: 'A1',
        xCoord: 100,
        yCoord: 100,
        status: 'available',
      },
      {
        id: '2',
        seatNumber: 'A2',
        xCoord: 150,
        yCoord: 100,
        status: 'occupied',
      },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DashboardService],
    });
    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch dashboard metrics successfully', (done) => {
    const hallId = '123';

    service.getDashboardMetrics(hallId).subscribe({
      next: (metrics) => {
        expect(metrics).toEqual(mockDashboardMetrics);
        expect(metrics.totalSeats).toBe(50);
        expect(metrics.occupancyPercentage).toBe(75.5);
        expect(metrics.seatMap.length).toBe(2);
        done();
      },
    });

    const req = httpMock.expectOne(`/api/owner/dashboard/${hallId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockDashboardMetrics);
  });

  it('should handle 404 error', (done) => {
    const hallId = '999';
    const errorMessage = 'Study hall not found.';

    service.getDashboardMetrics(hallId).subscribe({
      error: (error) => {
        expect(error.message).toBe(errorMessage);
        done();
      },
    });

    const req = httpMock.expectOne(`/api/owner/dashboard/${hallId}`);
    req.flush({}, { status: 404, statusText: 'Not Found' });
  });

  it('should handle 401 unauthorized error', (done) => {
    const hallId = '123';
    const errorMessage = 'Unauthorized. Please log in again.';

    service.getDashboardMetrics(hallId).subscribe({
      error: (error) => {
        expect(error.message).toBe(errorMessage);
        done();
      },
    });

    const req = httpMock.expectOne(`/api/owner/dashboard/${hallId}`);
    req.flush({}, { status: 401, statusText: 'Unauthorized' });
  });

  it('should handle 500 server error', (done) => {
    const hallId = '123';
    const errorMessage = 'Server error. Please try again later.';

    service.getDashboardMetrics(hallId).subscribe({
      error: (error) => {
        expect(error.message).toBe(errorMessage);
        done();
      },
    });

    const req = httpMock.expectOne(`/api/owner/dashboard/${hallId}`);
    req.flush({}, { status: 500, statusText: 'Internal Server Error' });
  });
});
