import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Seat Map Configuration Component (Placeholder)
 *
 * TODO: Implement seat map configuration functionality
 * This is a placeholder component for Story 1.17 routing configuration.
 */
@Component({
  selector: 'app-seat-map-config',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">Seat Map Configuration</h1>
      <p class="text-gray-600">
        Configure seating arrangements and availability for your study hall.
      </p>
      <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <p class="text-blue-800 text-sm">
          🚧 This feature is under development and will be implemented in a future story.
        </p>
      </div>
    </div>
  `,
})
export class SeatMapConfigComponent {}
