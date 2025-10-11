import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MetricCard } from '../../shared/components/metric-card/metric-card';
import { SeatMap } from '../../shared/components/seat-map/seat-map';
import { DashboardMetrics } from '../../core/models/dashboard.model';
import { DashboardService } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, MetricCard, SeatMap],
  templateUrl: './owner-dashboard.html',
  styleUrl: './owner-dashboard.scss'
})
export class OwnerDashboard implements OnInit {
  private route = inject(ActivatedRoute);
  private dashboardService = inject(DashboardService);

  // Signals for reactive state management
  hallId = signal<string>('');
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  dashboardMetrics = signal<DashboardMetrics | null>(null);

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
    // Get hallId from route params
    const id = this.route.snapshot.paramMap.get('hallId');
    if (id) {
      this.hallId.set(id);
      this.loadDashboardData(id);
    } else {
      this.error.set('Hall ID is required');
      this.isLoading.set(false);
    }
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
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
      }
    });
  }
}
