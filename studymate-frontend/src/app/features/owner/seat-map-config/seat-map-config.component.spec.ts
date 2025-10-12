import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeatMapConfigComponent } from './seat-map-config.component';
import { SeatConfigService } from '../../../core/services/seat-config.service';
import { of, throwError } from 'rxjs';
import { Seat, Shift, OpeningHours } from '../../../core/models/seat-config.model';
import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('SeatMapConfigComponent', () => {
  let component: SeatMapConfigComponent;
  let fixture: ComponentFixture<SeatMapConfigComponent>;
  let mockSeatConfigService: jasmine.SpyObj<SeatConfigService>;

  const mockSeats: Seat[] = [
    { id: '1', seatNumber: 'A1', xCoord: 100, yCoord: 150, status: 'available' },
    { id: '2', seatNumber: 'A2', xCoord: 200, yCoord: 150, status: 'available' }
  ];

  const mockShifts: Shift[] = [
    { id: '1', name: 'Morning', startTime: '06:00', endTime: '12:00' },
    { id: '2', name: 'Afternoon', startTime: '12:00', endTime: '18:00' }
  ];

  beforeEach(async () => {
    const seatConfigServiceSpy = jasmine.createSpyObj('SeatConfigService', [
      'getSeatConfiguration',
      'saveSeatConfiguration',
      'deleteSeat',
      'getShiftConfiguration',
      'saveShiftConfiguration',
      'validateSeatNumberUnique',
      'validateShiftTimesNoOverlap',
      'getDefaultShifts'
    ]);

    await TestBed.configureTestingModule({
      imports: [SeatMapConfigComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SeatConfigService, useValue: seatConfigServiceSpy }
      ]
    }).compileComponents();

    mockSeatConfigService = TestBed.inject(SeatConfigService) as jasmine.SpyObj<SeatConfigService>;
    fixture = TestBed.createComponent(SeatMapConfigComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load seat and shift configuration on init', () => {
      mockSeatConfigService.getSeatConfiguration.and.returnValue(of(mockSeats));
      mockSeatConfigService.getShiftConfiguration.and.returnValue(of({} as OpeningHours));
      mockSeatConfigService.getDefaultShifts.and.returnValue(mockShifts);

      component.ngOnInit();

      expect(mockSeatConfigService.getSeatConfiguration).toHaveBeenCalledWith('hall-123');
      expect(component.seats().length).toBe(2);
      expect(component.shifts().length).toBe(2);
    });

    it('should handle error when loading seats', () => {
      mockSeatConfigService.getSeatConfiguration.and.returnValue(
        throwError(() => new Error('Load failed'))
      );
      mockSeatConfigService.getShiftConfiguration.and.returnValue(of({} as OpeningHours));
      mockSeatConfigService.getDefaultShifts.and.returnValue([]);

      component.ngOnInit();

      expect(component.errorMessage()).toBe('Failed to load seat configuration');
      expect(component.isLoading()).toBe(false);
    });

    it('should use default shifts on shift load error', () => {
      mockSeatConfigService.getSeatConfiguration.and.returnValue(of([]));
      mockSeatConfigService.getShiftConfiguration.and.returnValue(
        throwError(() => new Error('Load failed'))
      );
      mockSeatConfigService.getDefaultShifts.and.returnValue(mockShifts);

      component.ngOnInit();

      expect(component.shifts()).toEqual(mockShifts);
    });
  });

  describe('Seat Management', () => {
    beforeEach(() => {
      component.seats.set(mockSeats);
    });

    it('should calculate seat count correctly', () => {
      expect(component.seatCount()).toBe(2);
    });

    it('should open add seat modal', () => {
      component.openAddSeatModal();

      expect(component.showSeatModal()).toBe(true);
      expect(component.newSeatNumber()).toBe('');
    });

    it('should add new seat with validation', () => {
      component.newSeatNumber.set('A3');
      mockSeatConfigService.validateSeatNumberUnique.and.returnValue(true);

      component.addSeat();

      expect(component.seats().length).toBe(3);
      expect(component.seats()[2].seatNumber).toBe('A3');
      expect(component.hasUnsavedChanges()).toBe(true);
      expect(component.showSeatModal()).toBe(false);
    });

    it('should not add seat with empty number', () => {
      component.newSeatNumber.set('  ');

      component.addSeat();

      expect(component.errorMessage()).toBe('Seat number is required');
      expect(component.seats().length).toBe(2);
    });

    it('should not add duplicate seat number', () => {
      component.newSeatNumber.set('A1');
      mockSeatConfigService.validateSeatNumberUnique.and.returnValue(false);

      component.addSeat();

      expect(component.errorMessage()).toBe('Seat number must be unique');
      expect(component.seats().length).toBe(2);
    });

    it('should select seat for editing', () => {
      const seat = mockSeats[0];

      component.selectSeat(seat);

      expect(component.selectedSeat()).toEqual(seat);
      expect(component.editingSeatNumber()).toBe('A1');
    });

    it('should update seat number', () => {
      component.selectedSeat.set(mockSeats[0]);
      component.editingSeatNumber.set('A5');
      mockSeatConfigService.validateSeatNumberUnique.and.returnValue(true);

      component.updateSeatNumber();

      expect(component.seats()[0].seatNumber).toBe('A5');
      expect(component.hasUnsavedChanges()).toBe(true);
      expect(component.selectedSeat()).toBeNull();
    });

    it('should not update seat number if empty', () => {
      component.selectedSeat.set(mockSeats[0]);
      component.editingSeatNumber.set('  ');

      component.updateSeatNumber();

      expect(component.errorMessage()).toBe('Seat number cannot be empty');
      expect(component.seats()[0].seatNumber).toBe('A1');
    });

    it('should delete seat with confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      const seat = mockSeats[0];

      component.deleteSeat(seat);

      expect(component.seats().length).toBe(1);
      expect(component.seats()[0].seatNumber).toBe('A2');
      expect(component.hasUnsavedChanges()).toBe(true);
    });

    it('should not delete seat if cancelled', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.deleteSeat(mockSeats[0]);

      expect(component.seats().length).toBe(2);
    });

    it('should handle drag end event', () => {
      const seat = mockSeats[0];
      const dragEvent = {
        dropPoint: { x: 250, y: 300 }
      } as CdkDragEnd;

      component.onSeatDragEnded(dragEvent, seat);

      // Should snap to grid (50px)
      expect(component.seats()[0].xCoord).toBe(250);
      expect(component.seats()[0].yCoord).toBe(300);
      expect(component.hasUnsavedChanges()).toBe(true);
    });

    it('should calculate seat style', () => {
      const seat: Seat = { seatNumber: 'A1', xCoord: 100, yCoord: 200 };

      const style = component.getSeatStyle(seat);

      expect(style.left).toBe('100px');
      expect(style.top).toBe('200px');
    });

    it('should cancel seat edit', () => {
      component.selectedSeat.set(mockSeats[0]);
      component.editingSeatNumber.set('A5');

      component.cancelSeatEdit();

      expect(component.selectedSeat()).toBeNull();
      expect(component.editingSeatNumber()).toBe('');
    });
  });

  describe('Seat Configuration Save', () => {
    it('should save seat configuration successfully', () => {
      const mockResponse = {
        success: true,
        message: 'Saved',
        seats: mockSeats,
        seatCount: 2
      };
      mockSeatConfigService.saveSeatConfiguration.and.returnValue(of(mockResponse));
      component.seats.set(mockSeats);

      component.saveSeatConfiguration();

      expect(mockSeatConfigService.saveSeatConfiguration).toHaveBeenCalledWith('hall-123', mockSeats);
      expect(component.saveSuccess()).toBe(true);
      expect(component.hasUnsavedChanges()).toBe(false);
      expect(component.isLoading()).toBe(false);
    });

    it('should handle save error', () => {
      mockSeatConfigService.saveSeatConfiguration.and.returnValue(
        throwError(() => new Error('Save failed'))
      );
      component.seats.set(mockSeats);

      component.saveSeatConfiguration();

      expect(component.errorMessage()).toBe('Failed to save seat configuration');
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('Shift Management', () => {
    beforeEach(() => {
      component.shifts.set(mockShifts);
    });

    it('should open shift modal for adding', () => {
      component.openShiftModal();

      expect(component.showShiftModal()).toBe(true);
      expect(component.shiftName()).toBe('');
      expect(component.editingShiftIndex()).toBeNull();
    });

    it('should open shift modal for editing', () => {
      component.openShiftModal(0);

      expect(component.showShiftModal()).toBe(true);
      expect(component.shiftName()).toBe('Morning');
      expect(component.shiftStartTime()).toBe('06:00');
      expect(component.shiftEndTime()).toBe('12:00');
      expect(component.editingShiftIndex()).toBe(0);
    });

    it('should add new shift', () => {
      component.shiftName.set('Evening');
      component.shiftStartTime.set('18:00');
      component.shiftEndTime.set('22:00');
      component.editingShiftIndex.set(null);
      mockSeatConfigService.validateShiftTimesNoOverlap.and.returnValue(true);

      component.saveShift();

      expect(component.shifts().length).toBe(3);
      expect(component.shifts()[2].name).toBe('Evening');
      expect(component.hasUnsavedChanges()).toBe(true);
      expect(component.showShiftModal()).toBe(false);
    });

    it('should update existing shift', () => {
      component.shiftName.set('Early Morning');
      component.shiftStartTime.set('05:00');
      component.shiftEndTime.set('11:00');
      component.editingShiftIndex.set(0);
      mockSeatConfigService.validateShiftTimesNoOverlap.and.returnValue(true);

      component.saveShift();

      expect(component.shifts()[0].name).toBe('Early Morning');
      expect(component.shifts()[0].startTime).toBe('05:00');
      expect(component.hasUnsavedChanges()).toBe(true);
    });

    it('should not save shift with missing fields', () => {
      component.shiftName.set('');
      component.shiftStartTime.set('06:00');
      component.shiftEndTime.set('12:00');

      component.saveShift();

      expect(component.errorMessage()).toBe('All shift fields are required');
      expect(component.shifts().length).toBe(2);
    });

    it('should not save overlapping shifts', () => {
      component.shiftName.set('Overlap');
      component.shiftStartTime.set('10:00');
      component.shiftEndTime.set('14:00');
      component.editingShiftIndex.set(null);
      mockSeatConfigService.validateShiftTimesNoOverlap.and.returnValue(false);

      component.saveShift();

      expect(component.errorMessage()).toBe('Shift times overlap with existing shifts');
      expect(component.shifts().length).toBe(2);
    });

    it('should delete shift with confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(true);

      component.deleteShift(0);

      expect(component.shifts().length).toBe(1);
      expect(component.shifts()[0].name).toBe('Afternoon');
      expect(component.hasUnsavedChanges()).toBe(true);
    });

    it('should not delete shift if cancelled', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.deleteShift(0);

      expect(component.shifts().length).toBe(2);
    });
  });

  describe('Shift Configuration Save', () => {
    it('should save shift configuration successfully', () => {
      const mockResponse = {
        success: true,
        message: 'Saved',
        openingHours: {} as OpeningHours
      };
      mockSeatConfigService.saveShiftConfiguration.and.returnValue(of(mockResponse));
      component.shifts.set(mockShifts);

      component.saveShiftConfiguration();

      expect(mockSeatConfigService.saveShiftConfiguration).toHaveBeenCalled();
      expect(component.saveSuccess()).toBe(true);
      expect(component.hasUnsavedChanges()).toBe(false);
    });

    it('should handle shift save error', () => {
      mockSeatConfigService.saveShiftConfiguration.and.returnValue(
        throwError(() => new Error('Save failed'))
      );
      component.shifts.set(mockShifts);

      component.saveShiftConfiguration();

      expect(component.errorMessage()).toBe('Failed to save shift configuration');
      expect(component.isLoading()).toBe(false);
    });
  });
});
