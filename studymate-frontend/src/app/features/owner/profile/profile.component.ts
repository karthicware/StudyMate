import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Owner Profile Component (Placeholder)
 *
 * TODO: Story 1.18 - Implement profile management functionality
 * This is a placeholder component for Story 1.17 routing configuration.
 */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">My Profile</h1>
      <p class="text-gray-600">Manage your personal information and account details.</p>
      <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <p class="text-blue-800 text-sm">
          🚧 This feature will be implemented in Story 1.18 - Profile Management.
        </p>
      </div>
    </div>
  `,
})
export class ProfileComponent {}
