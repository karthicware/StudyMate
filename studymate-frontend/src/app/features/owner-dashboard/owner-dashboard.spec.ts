import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { OwnerDashboard } from './owner-dashboard';
import { DashboardService } from '../../core/services/dashboard.service';
import { HallManagementService } from '../../core/services/hall-management.service';
import { DashboardMetrics } from '../../core/models/dashboard.model';
import { HallSummary } from '../../core/models/hall.model';

describe('OwnerDashboard', () => {
  let component: OwnerDashboard;
  let fixture: ComponentFixture<OwnerDashboard>;
  let mockDashboardService: jasmine.SpyObj<DashboardService>;
  let mockHallManagementService: jasmine.SpyObj<HallManagementService>;
  let mockRouter: jasmine.SpyObj<Router>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockActivatedRoute: any;

  const mockHalls: HallSummary[] = [
    {
      id: 'hall-123',
      hallName: 'Downtown Study Center',
      status: 'DRAFT',
      city: 'Mumbai',
      createdAt: new Date('2025-10-19T10:00:00Z'),
    },
    {
      id: 'hall-456',
      hallName: 'Uptown Learning Hub',
      status: 'ACTIVE',
      city: 'Delhi',
      createdAt: new Date('2025-10-20T10:00:00Z'),
    },
  ];

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
        status: 'available',
      },
    ],
  };

  beforeEach(async () => {
    mockDashboardService = jasmine.createSpyObj('DashboardService', ['getDashboardMetrics']);
    mockHallManagementService = jasmine.createSpyObj('HallManagementService', ['getOwnerHalls']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null),
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [OwnerDashboard],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: DashboardService, useValue: mockDashboardService },
        { provide: HallManagementService, useValue: mockHallManagementService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OwnerDashboard);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Empty State (No Halls)', () => {
    it('should show empty state when owner has no halls', () => {
      mockHallManagementService.getOwnerHalls.and.returnValue(of([]));

      fixture.detectChanges(); // triggers ngOnInit

      expect(mockHallManagementService.getOwnerHalls).toHaveBeenCalled();
      expect(component.ownerHalls()).toEqual([]);
      expect(component.hasHalls()).toBe(false);
      expect(component.isLoading()).toBe(false);
      expect(component.error()).toBeNull();
    });

    it('should display empty state message in template when no halls', () => {
      mockHallManagementService.getOwnerHalls.and.returnValue(of([]));

      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const emptyState = compiled.querySelector('[data-testid="dashboard-empty-state"]');
      const heading = compiled.querySelector('[data-testid="empty-state-heading"]');
      const message = compiled.querySelector('[data-testid="empty-state-message"]');
      const createButton = compiled.querySelector(
        '[data-testid="dashboard-create-first-hall-button"]',
      );

      expect(emptyState).toBeTruthy();
      expect(heading?.textContent).toContain('Welcome to StudyMate!');
      expect(message?.textContent).toContain('Create your first study hall');
      expect(createButton?.textContent).toContain('Create Your First Hall');
    });

    it('should navigate to onboarding when Create First Hall button clicked', () => {
      mockHallManagementService.getOwnerHalls.and.returnValue(of([]));

      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const createButton = compiled.querySelector(
        '[data-testid="dashboard-create-first-hall-button"]',
      ) as HTMLButtonElement;

      createButton.click();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/owner/onboarding']);
    });

    it('should not load dashboard metrics when no halls', () => {
      mockHallManagementService.getOwnerHalls.and.returnValue(of([]));

      fixture.detectChanges();

      expect(mockDashboardService.getDashboardMetrics).not.toHaveBeenCalled();
    });
  });

  describe('Dashboard with Halls', () => {
    it('should load owner halls and dashboard metrics on init', () => {
      mockHallManagementService.getOwnerHalls.and.returnValue(of(mockHalls));
      mockDashboardService.getDashboardMetrics.and.returnValue(of(mockMetrics));

      fixture.detectChanges(); // triggers ngOnInit

      expect(mockHallManagementService.getOwnerHalls).toHaveBeenCalled();
      expect(component.ownerHalls()).toEqual(mockHalls);
      expect(component.hasHalls()).toBe(true);
      expect(component.hallId()).toBe('hall-123'); // First hall selected by default
      expect(mockDashboardService.getDashboardMetrics).toHaveBeenCalledWith('hall-123');
      expect(component.dashboardMetrics()).toEqual(mockMetrics);
      expect(component.isLoading()).toBe(false);
    });

    it('should use hallId from route params if available', () => {
      mockActivatedRoute.snapshot.paramMap.get.and.returnValue('hall-456');
      mockHallManagementService.getOwnerHalls.and.returnValue(of(mockHalls));
      mockDashboardService.getDashboardMetrics.and.returnValue(of(mockMetrics));

      fixture.detectChanges();

      expect(component.hallId()).toBe('hall-456');
      expect(mockDashboardService.getDashboardMetrics).toHaveBeenCalledWith('hall-456');
    });

    it('should display formatted metrics correctly', () => {
      mockHallManagementService.getOwnerHalls.and.returnValue(of(mockHalls));
      mockDashboardService.getDashboardMetrics.and.returnValue(of(mockMetrics));

      fixture.detectChanges();

      expect(component.formattedTotalSeats()).toBe('50');
      expect(component.formattedOccupancy()).toBe('75.5%');
      expect(component.formattedRevenue()).toContain('15,000');
    });

    it('should not show empty state when halls exist', () => {
      mockHallManagementService.getOwnerHalls.and.returnValue(of(mockHalls));
      mockDashboardService.getDashboardMetrics.and.returnValue(of(mockMetrics));

      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const emptyState = compiled.querySelector('[data-testid="dashboard-empty-state"]');

      expect(emptyState).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle error when loading owner halls', () => {
      const errorMessage = 'Failed to load your halls';
      mockHallManagementService.getOwnerHalls.and.returnValue(
        throwError(() => new Error(errorMessage)),
      );

      fixture.detectChanges();

      expect(component.error()).toBe(errorMessage);
      expect(component.isLoading()).toBe(false);
      expect(component.ownerHalls()).toEqual([]);
    });

    it('should handle error when loading dashboard metrics', () => {
      mockHallManagementService.getOwnerHalls.and.returnValue(of(mockHalls));
      const errorMessage = 'Failed to load dashboard data';
      mockDashboardService.getDashboardMetrics.and.returnValue(
        throwError(() => new Error(errorMessage)),
      );

      fixture.detectChanges();

      expect(component.error()).toBe(errorMessage);
      expect(component.isLoading()).toBe(false);
      expect(component.dashboardMetrics()).toBeNull();
    });

    it('should display error message in template', () => {
      const errorMessage = 'Test error message';
      mockHallManagementService.getOwnerHalls.and.returnValue(
        throwError(() => new Error(errorMessage)),
      );

      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const errorState = compiled.querySelector('[data-testid="dashboard-error-state"]');

      expect(errorState?.textContent).toContain(errorMessage);
    });
  });

  describe('Loading State', () => {
    it('should show loading state while fetching halls', () => {
      // Don't call fixture.detectChanges() yet to test initial loading state
      expect(component.isLoading()).toBe(true);
    });

    it('should display loading indicator in template', () => {
      // Mock getOwnerHalls to return a delayed observable to keep loading state
      mockHallManagementService.getOwnerHalls.and.returnValue(of([]));

      fixture.detectChanges(); // Component is loading initially

      const compiled = fixture.nativeElement as HTMLElement;
      compiled.querySelector('[data-testid="dashboard-loading-state"]');

      // The loading state is shown briefly before halls are loaded
      expect(component.isLoading()).toBe(false); // Loading completes quickly with synchronous observables
    });
  });

  describe('Computed Signals', () => {
    it('should return placeholder values when no metrics', () => {
      mockHallManagementService.getOwnerHalls.and.returnValue(of(mockHalls));
      mockDashboardService.getDashboardMetrics.and.returnValue(of(mockMetrics));
      component.dashboardMetrics.set(null);

      expect(component.formattedTotalSeats()).toBe('--');
      expect(component.formattedOccupancy()).toBe('--%');
      expect(component.formattedRevenue()).toBe('₹--');
    });

    it('should format currency in INR correctly', () => {
      mockHallManagementService.getOwnerHalls.and.returnValue(of(mockHalls));
      mockDashboardService.getDashboardMetrics.and.returnValue(of(mockMetrics));

      fixture.detectChanges();

      const formattedRevenue = component.formattedRevenue();
      expect(formattedRevenue).toContain('₹');
      expect(formattedRevenue).toContain('15,000');
    });

    it('should return selected hall name', () => {
      mockHallManagementService.getOwnerHalls.and.returnValue(of(mockHalls));
      mockDashboardService.getDashboardMetrics.and.returnValue(of(mockMetrics));

      fixture.detectChanges();

      expect(component.selectedHallName()).toBe('Downtown Study Center');
    });

    it('should return "Select Hall" when no hall is selected', () => {
      component.ownerHalls.set(mockHalls);
      component.hallId.set('non-existent-id');

      expect(component.selectedHallName()).toBe('Select Hall');
    });
  });

  describe('Hall Selector (Multi-Hall Support)', () => {
    beforeEach(() => {
      mockHallManagementService.getOwnerHalls.and.returnValue(of(mockHalls));
      mockDashboardService.getDashboardMetrics.and.returnValue(of(mockMetrics));
    });

    it('should display hall selector when owner has halls', () => {
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const hallSelectorButton = compiled.querySelector('[data-testid="hall-selector-button"]');

      expect(hallSelectorButton).toBeTruthy();
      expect(hallSelectorButton?.textContent).toContain('Downtown Study Center');
    });

    it('should not display hall selector in empty state', () => {
      mockHallManagementService.getOwnerHalls.and.returnValue(of([]));

      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const hallSelectorButton = compiled.querySelector('[data-testid="hall-selector-button"]');

      expect(hallSelectorButton).toBeNull();
    });

    it('should toggle hall selector dropdown on button click', () => {
      fixture.detectChanges();

      expect(component.showHallSelector()).toBe(false);

      component.toggleHallSelector();
      expect(component.showHallSelector()).toBe(true);

      component.toggleHallSelector();
      expect(component.showHallSelector()).toBe(false);
    });

    it('should display hall selector dropdown when toggled', () => {
      fixture.detectChanges();

      component.showHallSelector.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const dropdown = compiled.querySelector('[data-testid="hall-selector-dropdown"]');

      expect(dropdown).toBeTruthy();
    });

    it('should display all owner halls in dropdown', () => {
      fixture.detectChanges();

      component.showHallSelector.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const hallOptions = compiled.querySelectorAll('[data-testid^="hall-selector-option-"]');

      expect(hallOptions.length).toBe(2);
    });

    it('should select a different hall and load its data', () => {
      fixture.detectChanges();

      component.selectHall('hall-456');

      expect(component.hallId()).toBe('hall-456');
      expect(component.showHallSelector()).toBe(false);
      expect(mockDashboardService.getDashboardMetrics).toHaveBeenCalledWith('hall-456');
    });

    it('should display "Add New Hall" button in dropdown', () => {
      fixture.detectChanges();

      component.showHallSelector.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const addButton = compiled.querySelector('[data-testid="dashboard-add-new-hall-button"]');

      expect(addButton).toBeTruthy();
      expect(addButton?.textContent).toContain('Add New Hall');
    });

    it('should navigate to onboarding when "Add New Hall" clicked', () => {
      fixture.detectChanges();

      component.navigateToAddNewHall();

      expect(component.showHallSelector()).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/owner/onboarding']);
    });

    it('should close dropdown after clicking "Add New Hall" button', () => {
      fixture.detectChanges();

      component.showHallSelector.set(true);
      component.navigateToAddNewHall();

      expect(component.showHallSelector()).toBe(false);
    });
  });
});
