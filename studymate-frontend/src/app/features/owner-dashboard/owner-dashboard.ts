import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MetricCard } from '../../shared/components/metric-card/metric-card';
import { SeatMapView } from '../owner/dashboard/seat-map-view/seat-map-view';
import { DashboardMetrics } from '../../core/models/dashboard.model';
import { DashboardService } from '../../core/services/dashboard.service';
import { HallManagementService } from '../../core/services/hall-management.service';
import { HallSummary } from '../../core/models/hall.model';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, MetricCard, SeatMapView],
  templateUrl: './owner-dashboard.html',
  styleUrl: './owner-dashboard.scss',
})
export class OwnerDashboard implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dashboardService = inject(DashboardService);
  private hallManagementService = inject(HallManagementService);

  // Signals for reactive state management
  hallId = signal<string>('');
  ownerHalls = signal<HallSummary[]>([]);
  hasHalls = computed(() => this.ownerHalls().length > 0);
  showHallSelector = signal<boolean>(false);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  dashboardMetrics = signal<DashboardMetrics | null>(null);

  // Computed signal for selected hall name
  selectedHallName = computed(() => {
    const halls = this.ownerHalls();
    const currentHallId = this.hallId();
    const hall = halls.find((h) => h.id === currentHallId);
    return hall ? hall.hallName : 'Select Hall';
  });

  // Computed signals for formatted values
  formattedTotalSeats = computed(() => {
    const metrics = this.dashboardMetrics();
    return metrics ? metrics.totalSeats.toString() : '--';
  });

  formattedOccupancy = computed(() => {
    const metrics = this.dashboardMetrics();
    return metrics ? `${metrics.occupancyPercentage.toFixed(1)}%` : '--%';
  });

  formattedRevenue = computed(() => {
    const metrics = this.dashboardMetrics();
    return metrics ? this.formatCurrency(metrics.currentRevenue) : '₹--';
  });

  ngOnInit(): void {
    // First, load owner's halls to check if any exist
    this.loadOwnerHalls();
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  private loadOwnerHalls(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.hallManagementService.getOwnerHalls().subscribe({
      next: (halls) => {
        this.ownerHalls.set(halls);
        this.isLoading.set(false);

        // If owner has halls, load dashboard for the first hall
        // (Task 8 will implement hall selector to choose different halls)
        if (halls.length > 0) {
          const selectedHallId = this.route.snapshot.paramMap.get('hallId') || halls[0].id;
          this.hallId.set(selectedHallId);
          this.loadDashboardData(selectedHallId);
        }
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load your halls');
        this.isLoading.set(false);
      },
    });
  }

  private loadDashboardData(hallId: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.dashboardService.getDashboardMetrics(hallId).subscribe({
      next: (metrics) => {
        this.dashboardMetrics.set(metrics);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load dashboard data');
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Navigate to onboarding wizard to create first hall
   * Triggered by "Create Your First Hall" button in empty state
   */
  navigateToOnboarding(): void {
    this.router.navigate(['/owner/onboarding']);
  }

  /**
   * Toggle hall selector dropdown visibility
   */
  toggleHallSelector(): void {
    this.showHallSelector.update((show) => !show);
  }

  /**
   * Select a different hall and load its dashboard data
   * @param hallId - ID of the hall to select
   */
  selectHall(hallId: string): void {
    this.hallId.set(hallId);
    this.showHallSelector.set(false);
    this.loadDashboardData(hallId);
  }

  /**
   * Navigate to onboarding wizard to add a new hall
   * Triggered by "Add New Hall" button in hall selector dropdown
   */
  navigateToAddNewHall(): void {
    this.showHallSelector.set(false);
    this.router.navigate(['/owner/onboarding']);
  }
}
