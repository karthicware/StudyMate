import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OwnerHeaderComponent } from '../components/owner-header/owner-header';
import { OwnerFooterComponent } from '../components/owner-footer/owner-footer';

/**
 * Owner Portal Layout Component
 *
 * Provides the foundational layout structure for all Owner Portal pages:
 * - Fixed header with navigation (Story 1.15)
 * - Main content area with router outlet
 * - Sticky footer (Story 1.16)
 *
 * This component serves as the parent component for all Owner Portal routes,
 * ensuring consistent layout and navigation across all pages.
 *
 * Layout Structure:
 * - Uses flexbox for full-height layout
 * - Header: Fixed at top (64px height)
 * - Main: Flexible content area with scrolling
 * - Footer: Sticky at bottom (60px height)
 *
 * @example
 * ```html
 * <!-- Used in routing configuration -->
 * {
 *   path: 'owner',
 *   component: OwnerLayoutComponent,
 *   children: [ ... ]
 * }
 * ```
 */
@Component({
  selector: 'app-owner-layout',
  standalone: true,
  imports: [RouterOutlet, OwnerHeaderComponent, OwnerFooterComponent],
  templateUrl: './owner-layout.component.html',
  styleUrl: './owner-layout.component.scss',
})
export class OwnerLayoutComponent {}
