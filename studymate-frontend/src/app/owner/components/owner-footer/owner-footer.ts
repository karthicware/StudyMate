import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';

/**
 * Owner Portal Footer Component
 *
 * Displays the footer for the Owner Portal with:
 * - Copyright notice (dynamic year)
 * - Application version (from environment)
 * - Footer navigation links (Terms, Privacy, Contact)
 * - Branding tagline
 * - Sticky footer behavior
 * - Responsive design (desktop/tablet/mobile)
 *
 * @example
 * ```html
 * <app-owner-footer />
 * ```
 */
@Component({
  selector: 'app-owner-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './owner-footer.html',
  styleUrl: './owner-footer.scss',
})
export class OwnerFooterComponent {
  /**
   * Current year for copyright notice
   * Automatically updates each year
   */
  currentYear = new Date().getFullYear();

  /**
   * Application version from environment
   * Defaults to '1.0.0' if not configured
   */
  appVersion = environment.version || '1.0.0';

  /**
   * Footer navigation links configuration
   * - Terms and Privacy open in new tab (external)
   * - Contact Support navigates internally
   */
  footerLinks = [
    {
      label: 'Terms of Service',
      path: '/terms',
      external: true,
      ariaLabel: 'View Terms of Service',
    },
    {
      label: 'Privacy Policy',
      path: '/privacy',
      external: true,
      ariaLabel: 'View Privacy Policy',
    },
    {
      label: 'Contact Support',
      path: '/owner/contact',
      external: false,
      ariaLabel: 'Contact Support',
    },
  ];
}
