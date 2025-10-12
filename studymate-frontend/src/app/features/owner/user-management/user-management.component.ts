import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * User Management Component (Placeholder)
 *
 * TODO: Implement user management functionality
 * This is a placeholder component for Story 1.17 routing configuration.
 */
@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">User Management</h1>
      <p class="text-gray-600">
        Manage students, staff, and access permissions for your study hall.
      </p>
      <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <p class="text-blue-800 text-sm">
          🚧 This feature is under development and will be implemented in a future story.
        </p>
      </div>
    </div>
  `,
})
export class UserManagementComponent {}
