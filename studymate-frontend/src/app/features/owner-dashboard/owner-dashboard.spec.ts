import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { OwnerDashboard } from './owner-dashboard';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardMetrics } from '../../core/models/dashboard.model';

describe('OwnerDashboard', () => {
  let component: OwnerDashboard;
  let fixture: ComponentFixture<OwnerDashboard>;
  let mockDashboardService: jasmine.SpyObj<DashboardService>;
  let mockActivatedRoute: any;

  const mockMetrics: DashboardMetrics = {
    totalSeats: 50,
    occupancyPercentage: 75.5,
    currentRevenue: 15000,
    seatMap: [
      {
        id: '1',
        seatNumber: 'A1',
        xCoord: 100,
        yCoord: 100,
        status: 'available'
      }
    ]
  };

  beforeEach(async () => {
    mockDashboardService = jasmine.createSpyObj('DashboardService', [
      'getDashboardMetrics'
    ]);

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('123')
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [OwnerDashboard],
      providers: [
        { provide: DashboardService, useValue: mockDashboardService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OwnerDashboard);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load dashboard metrics on init', () => {
    mockDashboardService.getDashboardMetrics.and.returnValue(of(mockMetrics));

    fixture.detectChanges(); // triggers ngOnInit

    expect(mockDashboardService.getDashboardMetrics).toHaveBeenCalledWith('123');
    expect(component.dashboardMetrics()).toEqual(mockMetrics);
    expect(component.isLoading()).toBe(false);
    expect(component.error()).toBeNull();
  });

  it('should display formatted metrics correctly', () => {
    mockDashboardService.getDashboardMetrics.and.returnValue(of(mockMetrics));

    fixture.detectChanges();

    expect(component.formattedTotalSeats()).toBe('50');
    expect(component.formattedOccupancy()).toBe('75.5%');
    expect(component.formattedRevenue()).toContain('15,000');
  });

  it('should handle error when loading dashboard metrics', () => {
    const errorMessage = 'Failed to load data';
    mockDashboardService.getDashboardMetrics.and.returnValue(
      throwError(() => new Error(errorMessage))
    );

    fixture.detectChanges();

    expect(component.error()).toBe(errorMessage);
    expect(component.isLoading()).toBe(false);
    expect(component.dashboardMetrics()).toBeNull();
  });

  it('should show error when hallId is missing', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(null);

    fixture.detectChanges();

    expect(component.error()).toBe('Hall ID is required');
    expect(component.isLoading()).toBe(false);
  });

  it('should format currency in INR', () => {
    mockDashboardService.getDashboardMetrics.and.returnValue(of(mockMetrics));

    fixture.detectChanges();

    const formattedRevenue = component.formattedRevenue();
    expect(formattedRevenue).toContain('₹');
    expect(formattedRevenue).toContain('15,000');
  });

  it('should display placeholder values when no metrics', () => {
    mockDashboardService.getDashboardMetrics.and.returnValue(of(mockMetrics));
    component.dashboardMetrics.set(null);

    expect(component.formattedTotalSeats()).toBe('--');
    expect(component.formattedOccupancy()).toBe('--%');
    expect(component.formattedRevenue()).toBe('₹--');
  });
});
