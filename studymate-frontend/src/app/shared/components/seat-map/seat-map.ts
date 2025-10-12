import { Component, input, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeatStatus } from '../../../core/models/dashboard.model';

@Component({
  selector: 'app-seat-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seat-map.html',
  styleUrl: './seat-map.scss',
})
export class SeatMap {
  // Signal inputs for seat data
  seats = input.required<SeatStatus[]>();

  // Computed values for map dimensions
  mapWidth = computed(() => {
    const seatsList = this.seats();
    if (seatsList.length === 0) return 600;
    return Math.max(...seatsList.map((s) => s.xCoord)) + 100;
  });

  mapHeight = computed(() => {
    const seatsList = this.seats();
    if (seatsList.length === 0) return 400;
    return Math.max(...seatsList.map((s) => s.yCoord)) + 100;
  });

  /**
   * Returns the color for a seat based on its status
   */
  getSeatColor(status: 'available' | 'occupied' | 'reserved'): string {
    switch (status) {
      case 'available':
        return '#10b981'; // Green
      case 'occupied':
        return '#ef4444'; // Red
      case 'reserved':
        return '#f59e0b'; // Amber/Orange
      default:
        return '#6b7280'; // Gray
    }
  }

  /**
   * Returns the label for a seat based on its status
   */
  getSeatLabel(status: 'available' | 'occupied' | 'reserved'): string {
    switch (status) {
      case 'available':
        return 'Available';
      case 'occupied':
        return 'Occupied';
      case 'reserved':
        return 'Reserved';
      default:
        return 'Unknown';
    }
  }
}
