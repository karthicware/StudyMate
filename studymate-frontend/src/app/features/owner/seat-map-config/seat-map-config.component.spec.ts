import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SeatMapConfigComponent } from './seat-map-config.component';
import { SeatConfigService } from '../../../core/services/seat-config.service';
import { HallAmenitiesService } from '../../../core/services/hall-amenities.service';
import { of, throwError } from 'rxjs';
import { Seat, Shift, OpeningHours } from '../../../core/models/seat-config.model';
import { HallAmenities } from '../../../core/models/hall-amenities.model';
import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('SeatMapConfigComponent', () => {
  let component: SeatMapConfigComponent;
  let fixture: ComponentFixture<SeatMapConfigComponent>;
  let mockSeatConfigService: jasmine.SpyObj<SeatConfigService>;
  let mockHallAmenitiesService: jasmine.SpyObj<HallAmenitiesService>;

  const mockSeats: Seat[] = [
    {
      id: '1',
      seatNumber: 'A1',
      xCoord: 100,
      yCoord: 150,
      status: 'available',
      spaceType: 'Cabin',
    },
    {
      id: '2',
      seatNumber: 'A2',
      xCoord: 200,
      yCoord: 150,
      status: 'available',
      spaceType: 'Study Pod',
      customPrice: 500,
    },
  ];

  const mockShifts: Shift[] = [
    { id: '1', name: 'Morning', startTime: '06:00', endTime: '12:00' },
    { id: '2', name: 'Afternoon', startTime: '12:00', endTime: '18:00' },
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
      'getDefaultShifts',
    ]);

    const hallAmenitiesServiceSpy = jasmine.createSpyObj('HallAmenitiesService', [
      'getHallAmenities',
      'updateHallAmenities',
    ]);

    await TestBed.configureTestingModule({
      imports: [SeatMapConfigComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SeatConfigService, useValue: seatConfigServiceSpy },
        { provide: HallAmenitiesService, useValue: hallAmenitiesServiceSpy },
      ],
    }).compileComponents();

    mockSeatConfigService = TestBed.inject(SeatConfigService) as jasmine.SpyObj<SeatConfigService>;
    mockHallAmenitiesService = TestBed.inject(
      HallAmenitiesService,
    ) as jasmine.SpyObj<HallAmenitiesService>;
    fixture = TestBed.createComponent(SeatMapConfigComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load study halls on init', () => {
      component.ngOnInit();

      expect(component.studyHalls().length).toBeGreaterThan(0);
      expect(component.editorDisabled()).toBe(true); // No hall selected yet
    });

    it('should handle error when loading seats', () => {
      mockSeatConfigService.getSeatConfiguration.and.returnValue(
        throwError(() => new Error('Load failed')),
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
        throwError(() => new Error('Load failed')),
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
        dropPoint: { x: 250, y: 300 },
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
  });

  describe('Seat Configuration Save', () => {
    it('should save seat configuration successfully', () => {
      const mockResponse = {
        success: true,
        message: 'Saved',
        seats: mockSeats,
        seatCount: 2,
      };
      mockSeatConfigService.saveSeatConfiguration.and.returnValue(of(mockResponse));
      component.seats.set(mockSeats);

      component.saveSeatConfiguration();

      expect(mockSeatConfigService.saveSeatConfiguration).toHaveBeenCalledWith(
        'hall-123',
        mockSeats,
      );
      expect(component.saveSuccess()).toBe(true);
      expect(component.hasUnsavedChanges()).toBe(false);
      expect(component.isLoading()).toBe(false);
    });

    it('should handle save error', () => {
      mockSeatConfigService.saveSeatConfiguration.and.returnValue(
        throwError(() => new Error('Save failed')),
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
        openingHours: {} as OpeningHours,
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
        throwError(() => new Error('Save failed')),
      );
      component.shifts.set(mockShifts);

      component.saveShiftConfiguration();

      expect(component.errorMessage()).toBe('Failed to save shift configuration');
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('Hall Selection (AC1)', () => {
    const mockAmenitiesResponse: HallAmenities = {
      hallId: '1',
      hallName: 'Test Hall',
      amenities: [],
    };

    it('should enable editor after hall selection', () => {
      expect(component.editorDisabled()).toBe(true);

      mockSeatConfigService.getSeatConfiguration.and.returnValue(of(mockSeats));
      mockSeatConfigService.getShiftConfiguration.and.returnValue(of({} as OpeningHours));
      mockSeatConfigService.getDefaultShifts.and.returnValue(mockShifts);
      mockHallAmenitiesService.getHallAmenities.and.returnValue(of(mockAmenitiesResponse));

      component.onHallSelectionChange('1');

      expect(component.selectedHallId()).toBe('1');
      expect(component.editorDisabled()).toBe(false);
    });

    it('should load seat configuration when hall is selected', () => {
      mockSeatConfigService.getSeatConfiguration.and.returnValue(of(mockSeats));
      mockSeatConfigService.getShiftConfiguration.and.returnValue(of({} as OpeningHours));
      mockSeatConfigService.getDefaultShifts.and.returnValue(mockShifts);
      mockHallAmenitiesService.getHallAmenities.and.returnValue(of(mockAmenitiesResponse));

      component.onHallSelectionChange('1');

      expect(mockSeatConfigService.getSeatConfiguration).toHaveBeenCalledWith('1');
      expect(component.seats().length).toBe(2);
    });

    it('should clear canvas when switching halls', () => {
      component.seats.set(mockSeats);
      component.selectedSeat.set(mockSeats[0]);
      component.hasUnsavedChanges.set(true);

      mockSeatConfigService.getSeatConfiguration.and.returnValue(of([]));
      mockSeatConfigService.getShiftConfiguration.and.returnValue(of({} as OpeningHours));
      mockSeatConfigService.getDefaultShifts.and.returnValue([]);
      mockHallAmenitiesService.getHallAmenities.and.returnValue(
        of({ ...mockAmenitiesResponse, hallId: '2' }),
      );

      component.onHallSelectionChange('2');

      expect(component.seats().length).toBe(0);
      expect(component.selectedSeat()).toBeNull();
      expect(component.hasUnsavedChanges()).toBe(false);
    });

    it('should not allow adding seats without hall selection', () => {
      component.selectedHallId.set(null);
      component.newSeatNumber.set('A1');

      component.addSeat();

      expect(component.errorMessage()).toBe('Please select a hall first');
    });
  });

  describe('Space Type Support (AC3)', () => {
    it('should add seat with default space type Cabin', () => {
      component.selectedHallId.set('1');
      component.newSeatNumber.set('A3');
      mockSeatConfigService.validateSeatNumberUnique.and.returnValue(true);

      component.addSeat();

      const newSeat = component.seats()[component.seats().length - 1];
      expect(newSeat.spaceType).toBe('Cabin');
    });

    it('should get space type configuration', () => {
      const config = component.getSpaceTypeConfig('Study Pod');

      expect(config).toBeDefined();
      expect(config.icon).toBeDefined();
      expect(config.bgColor).toBeDefined();
      expect(config.label).toBe('Study Pod');
    });

    it('should handle undefined space type with default', () => {
      const config = component.getSpaceTypeConfig(undefined);

      expect(config.label).toBe('Cabin'); // Default
    });
  });

  describe('Properties Panel Integration (AC3)', () => {
    beforeEach(() => {
      component.selectedHallId.set('1');
      component.seats.set(mockSeats);
    });

    it('should handle save properties from panel', () => {
      const updatedSeat: Seat = {
        ...mockSeats[0],
        spaceType: 'Meeting Room',
        customPrice: 800,
      };

      component.onSaveProperties(updatedSeat);

      expect(component.seats()[0].spaceType).toBe('Meeting Room');
      expect(component.seats()[0].customPrice).toBe(800);
      expect(component.hasUnsavedChanges()).toBe(true);
      expect(component.selectedSeat()).toBeNull();
    });

    it('should handle cancel from properties panel', () => {
      component.selectedSeat.set(mockSeats[0]);

      component.onCancelProperties();

      expect(component.selectedSeat()).toBeNull();
    });
  });

  describe('Save Configuration with Hall ID (AC5, AC6)', () => {
    it('should use selected hall ID when saving', () => {
      mockSeatConfigService.saveSeatConfiguration.and.returnValue(
        of({
          success: true,
          message: 'Saved',
          seats: mockSeats,
          seatCount: 2,
        }),
      );
      mockSeatConfigService.getSeatConfiguration.and.returnValue(of(mockSeats));

      component.selectedHallId.set('5');
      component.seats.set(mockSeats);

      component.saveSeatConfiguration();

      expect(mockSeatConfigService.saveSeatConfiguration).toHaveBeenCalledWith('5', mockSeats);
    });

    it('should not save without hall selection', () => {
      component.selectedHallId.set(null);
      component.seats.set(mockSeats);

      component.saveSeatConfiguration();

      expect(component.errorMessage()).toBe('Please select a hall first');
      expect(mockSeatConfigService.saveSeatConfiguration).not.toHaveBeenCalled();
    });

    it('should reload configuration after successful save', () => {
      mockSeatConfigService.saveSeatConfiguration.and.returnValue(
        of({
          success: true,
          message: 'Saved',
          seats: mockSeats,
          seatCount: 2,
        }),
      );
      mockSeatConfigService.getSeatConfiguration.and.returnValue(of(mockSeats));

      component.selectedHallId.set('1');
      component.seats.set(mockSeats);

      component.saveSeatConfiguration();

      expect(mockSeatConfigService.getSeatConfiguration).toHaveBeenCalledWith('1');
    });
  });

  describe('Hall Amenities Configuration (Story 1.22)', () => {
    const mockAmenities: HallAmenities = {
      hallId: 'test-hall-1',
      hallName: 'Test Hall',
      amenities: ['AC', 'WiFi'],
    };

    beforeEach(() => {
      component.ngOnInit(); // Initialize component including amenities form
      component.selectedHallId.set('test-hall-1');
    });

    it('should initialize amenities form on component init', () => {
      expect(component.amenitiesForm).toBeDefined();
      expect(component.amenitiesForm.get('amenityAC')).toBeDefined();
      expect(component.amenitiesForm.get('amenityWiFi')).toBeDefined();
    });

    it('should load amenities when hall is selected', () => {
      mockHallAmenitiesService.getHallAmenities.and.returnValue(of(mockAmenities));
      mockSeatConfigService.getSeatConfiguration.and.returnValue(of([]));
      mockSeatConfigService.getShiftConfiguration.and.returnValue(of({} as OpeningHours));
      mockSeatConfigService.getDefaultShifts.and.returnValue([]);

      component.onHallSelectionChange('test-hall-1');

      expect(mockHallAmenitiesService.getHallAmenities).toHaveBeenCalledWith('test-hall-1');
    });

    it('should populate form with amenities from API response', fakeAsync(() => {
      mockHallAmenitiesService.getHallAmenities.and.returnValue(of(mockAmenities));

      component['loadAmenities']('test-hall-1');
      tick();

      expect(component.amenitiesForm.value.amenityAC).toBe(true);
      expect(component.amenitiesForm.value.amenityWiFi).toBe(true);
      expect(component.amenitiesLoading()).toBe(false);
    }));

    it('should handle amenities load with only AC', fakeAsync(() => {
      const onlyAC: HallAmenities = {
        hallId: 'test-hall-1',
        hallName: 'Test Hall',
        amenities: ['AC'],
      };
      mockHallAmenitiesService.getHallAmenities.and.returnValue(of(onlyAC));

      component['loadAmenities']('test-hall-1');
      tick();

      expect(component.amenitiesForm.value.amenityAC).toBe(true);
      expect(component.amenitiesForm.value.amenityWiFi).toBe(false);
    }));

    it('should handle amenities load error gracefully', fakeAsync(() => {
      mockHallAmenitiesService.getHallAmenities.and.returnValue(
        throwError(() => new Error('Load failed')),
      );

      component['loadAmenities']('test-hall-1');
      tick();

      expect(component.amenitiesLoading()).toBe(false);
      // Form should remain with default values
      expect(component.amenitiesForm.value.amenityAC).toBe(false);
      expect(component.amenitiesForm.value.amenityWiFi).toBe(false);
    }));

    it('should trigger auto-save on checkbox change after debounce', fakeAsync(() => {
      mockHallAmenitiesService.updateHallAmenities.and.returnValue(of(mockAmenities));

      component.amenitiesForm.patchValue({ amenityAC: true });
      tick(500); // Debounce time

      expect(mockHallAmenitiesService.updateHallAmenities).toHaveBeenCalledWith('test-hall-1', [
        'AC',
      ]);
    }));

    it('should not trigger auto-save before debounce time', fakeAsync(() => {
      mockHallAmenitiesService.updateHallAmenities.and.returnValue(of(mockAmenities));

      component.amenitiesForm.patchValue({ amenityAC: true });
      tick(300); // Less than debounce time

      expect(mockHallAmenitiesService.updateHallAmenities).not.toHaveBeenCalled();
    }));

    it('should save both amenities when both checkboxes checked', fakeAsync(() => {
      mockHallAmenitiesService.updateHallAmenities.and.returnValue(of(mockAmenities));

      component.amenitiesForm.patchValue({ amenityAC: true, amenityWiFi: true });
      tick(500);

      expect(mockHallAmenitiesService.updateHallAmenities).toHaveBeenCalledWith('test-hall-1', [
        'AC',
        'WiFi',
      ]);
    }));

    it('should save empty array when all checkboxes unchecked', fakeAsync(() => {
      const emptyAmenities: HallAmenities = { ...mockAmenities, amenities: [] };
      mockHallAmenitiesService.updateHallAmenities.and.returnValue(of(emptyAmenities));

      component.amenitiesForm.patchValue({ amenityAC: false, amenityWiFi: false });
      tick(500);

      expect(mockHallAmenitiesService.updateHallAmenities).toHaveBeenCalledWith('test-hall-1', []);
    }));

    it('should show saving indicator during save', fakeAsync(() => {
      mockHallAmenitiesService.updateHallAmenities.and.returnValue(of(mockAmenities));

      component['saveAmenities']();

      expect(component.amenitiesSaving()).toBe(true);

      tick();

      expect(component.amenitiesSaving()).toBe(false);
    }));

    it('should show success indicator after successful save', fakeAsync(() => {
      mockHallAmenitiesService.updateHallAmenities.and.returnValue(of(mockAmenities));

      component['saveAmenities']();
      tick();

      expect(component.amenitiesSaveSuccess()).toBe(true);

      tick(2000); // Success indicator timeout

      expect(component.amenitiesSaveSuccess()).toBe(false);
    }));

    it('should handle save error and display error message', fakeAsync(() => {
      mockHallAmenitiesService.updateHallAmenities.and.returnValue(
        throwError(() => new Error('Save failed')),
      );

      component['saveAmenities']();
      tick();

      expect(component.amenitiesSaving()).toBe(false);
      expect(component.errorMessage()).toBe('Failed to save hall amenities');
    }));

    it('should not save amenities when no hall is selected', () => {
      component.selectedHallId.set(null);

      component['saveAmenities']();

      expect(mockHallAmenitiesService.updateHallAmenities).not.toHaveBeenCalled();
    });

    it('should not trigger auto-save on initial form load (emitEvent: false)', fakeAsync(() => {
      mockHallAmenitiesService.getHallAmenities.and.returnValue(of(mockAmenities));
      mockHallAmenitiesService.updateHallAmenities.and.returnValue(of(mockAmenities));

      component['loadAmenities']('test-hall-1');
      tick(1000); // Wait longer than debounce

      // Should not call update because emitEvent: false on load
      expect(mockHallAmenitiesService.updateHallAmenities).not.toHaveBeenCalled();
    }));
  });
});
