import { Component, OnInit, OnDestroy, inject, signal, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { SeatMapService } from '../../../../core/services/seat-map.service';
import { Seat } from '../../../../core/models/seat-config.model';

/**
 * Seat Map Visualization Component
 * Displays real-time seat map with status indicators and occupancy metrics
 */
@Component({
  selector: 'app-seat-map-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seat-map-view.html',
  styleUrl: './seat-map-view.scss'
})
export class SeatMapView implements OnInit, OnDestroy {
  private seatMapService = inject(SeatMapService);
  private subscription?: Subscription;

  // Input property for hall ID
  hallId = input.required<string>();

  // Reactive state with signals
  seats = signal<Seat[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  // Canvas dimensions matching Story 1.2 specifications
  readonly viewBox = '0 0 800 600';
  readonly canvasWidth = 800;
  readonly canvasHeight = 600;

  // Computed metrics
  totalSeats = computed(() => this.seats().length);

  bookedSeats = computed(() =>
    this.seats().filter(s => s.status === 'booked').length
  );

  availableSeats = computed(() =>
    this.seats().filter(s => s.status === 'available').length
  );

  lockedSeats = computed(() =>
    this.seats().filter(s => s.status === 'locked').length
  );

  maintenanceSeats = computed(() =>
    this.seats().filter(s => s.status === 'maintenance').length
  );

  occupancyPercent = computed(() => {
    const total = this.totalSeats();
    if (total === 0) return '0.0';
    return ((this.bookedSeats() / total) * 100).toFixed(1);
  });

  ngOnInit(): void {
    this.loadSeatsWithPolling();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  /**
   * Load seats with real-time polling (every 10 seconds)
   */
  loadSeatsWithPolling(): void {
    const hallIdValue = this.hallId();

    this.subscription = this.seatMapService
      .getSeatsWithPolling(hallIdValue, 10000)
      .subscribe({
        next: (response) => {
          this.seats.set(response.seats);
          this.isLoading.set(false);
          this.errorMessage.set(null);
        },
        error: (error) => {
          console.error('Failed to load seat map:', error);
          this.errorMessage.set('Failed to load seat map. Please try again.');
          this.isLoading.set(false);
        }
      });
  }

  /**
   * Get color for seat based on status
   * @param status - Seat status
   * @returns Hex color code
   */
  getSeatColor(status: string | undefined): string {
    const colors: Record<string, string> = {
      available: '#10B981',  // Green
      booked: '#EF4444',      // Red
      locked: '#F59E0B',      // Yellow
      maintenance: '#6B7280'  // Gray
    };
    return colors[status || 'available'] || colors['available'];
  }

  /**
   * Get label for seat status (for legend)
   */
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      available: 'Available',
      booked: 'Booked',
      locked: 'Locked',
      maintenance: 'Maintenance'
    };
    return labels[status] || 'Unknown';
  }
}
