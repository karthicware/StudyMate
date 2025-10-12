import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SeatConfigService } from './seat-config.service';
import { Seat, OpeningHours } from '../models/seat-config.model';
import { environment } from '../../../environments/environment';

describe('SeatConfigService', () => {
  let service: SeatConfigService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiBaseUrl}/owner`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SeatConfigService]
    });
    service = TestBed.inject(SeatConfigService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('saveSeatConfiguration', () => {
    it('should save seat configuration via POST request', () => {
      const hallId = 'hall-123';
      const seats: Seat[] = [
        { seatNumber: 'A1', xCoord: 100, yCoord: 150 },
        { seatNumber: 'A2', xCoord: 200, yCoord: 150 }
      ];
      const mockResponse = {
        success: true,
        message: 'Seats saved successfully',
        seats,
        seatCount: 2
      };

      service.saveSeatConfiguration(hallId, seats).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.success).toBe(true);
        expect(response.seatCount).toBe(2);
      });

      const req = httpMock.expectOne(`${apiUrl}/seats/config/${hallId}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ seats });
      req.flush(mockResponse);
    });
  });

  describe('getSeatConfiguration', () => {
    it('should get seat configuration via GET request', () => {
      const hallId = 'hall-123';
      const mockSeats: Seat[] = [
        { id: '1', hallId, seatNumber: 'A1', xCoord: 100, yCoord: 150, status: 'available' }
      ];

      service.getSeatConfiguration(hallId).subscribe(seats => {
        expect(seats).toEqual(mockSeats);
        expect(seats.length).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}/seats/config/${hallId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSeats);
    });
  });

  describe('deleteSeat', () => {
    it('should delete seat via DELETE request', () => {
      const hallId = 'hall-123';
      const seatId = 'seat-456';
      const mockResponse = { success: true, message: 'Seat deleted' };

      service.deleteSeat(hallId, seatId).subscribe(response => {
        expect(response.success).toBe(true);
      });

      const req = httpMock.expectOne(`${apiUrl}/seats/${hallId}/${seatId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('saveShiftConfiguration', () => {
    it('should save shift configuration via POST request', () => {
      const hallId = 'hall-123';
      const openingHours: OpeningHours = {
        monday: { open: '09:00', close: '22:00' }
      };
      const mockResponse = {
        success: true,
        message: 'Shifts saved',
        openingHours
      };

      service.saveShiftConfiguration(hallId, openingHours).subscribe(response => {
        expect(response.success).toBe(true);
      });

      const req = httpMock.expectOne(`${apiUrl}/shifts/config/${hallId}`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('getShiftConfiguration', () => {
    it('should get shift configuration via GET request', () => {
      const hallId = 'hall-123';
      const mockHours: OpeningHours = {
        monday: { open: '09:00', close: '22:00' }
      };

      service.getShiftConfiguration(hallId).subscribe(hours => {
        expect(hours).toEqual(mockHours);
      });

      const req = httpMock.expectOne(`${apiUrl}/shifts/config/${hallId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockHours);
    });
  });

  describe('validateSeatNumberUnique', () => {
    it('should return true for unique seat number', () => {
      const existingSeats: Seat[] = [
        { seatNumber: 'A1', xCoord: 100, yCoord: 150 }
      ];
      expect(service.validateSeatNumberUnique('A2', existingSeats)).toBe(true);
    });

    it('should return false for duplicate seat number', () => {
      const existingSeats: Seat[] = [
        { seatNumber: 'A1', xCoord: 100, yCoord: 150 }
      ];
      expect(service.validateSeatNumberUnique('A1', existingSeats)).toBe(false);
    });

    it('should exclude specific seat ID from validation', () => {
      const existingSeats: Seat[] = [
        { id: 'seat-1', seatNumber: 'A1', xCoord: 100, yCoord: 150 }
      ];
      expect(service.validateSeatNumberUnique('A1', existingSeats, 'seat-1')).toBe(true);
    });
  });

  describe('validateShiftTimesNoOverlap', () => {
    it('should return true for non-overlapping shifts', () => {
      const shifts = [
        { startTime: '06:00', endTime: '12:00' },
        { startTime: '12:00', endTime: '18:00' }
      ];
      expect(service.validateShiftTimesNoOverlap(shifts)).toBe(true);
    });

    it('should return false for overlapping shifts', () => {
      const shifts = [
        { startTime: '06:00', endTime: '13:00' },
        { startTime: '12:00', endTime: '18:00' }
      ];
      expect(service.validateShiftTimesNoOverlap(shifts)).toBe(false);
    });

    it('should return true for single shift', () => {
      const shifts = [{ startTime: '09:00', endTime: '17:00' }];
      expect(service.validateShiftTimesNoOverlap(shifts)).toBe(true);
    });
  });

  describe('getDefaultShifts', () => {
    it('should return default shift configuration', () => {
      const defaults = service.getDefaultShifts();
      expect(defaults.length).toBe(3);
      expect(defaults[0].name).toBe('Morning');
      expect(defaults[1].name).toBe('Afternoon');
      expect(defaults[2].name).toBe('Evening');
    });
  });
});
