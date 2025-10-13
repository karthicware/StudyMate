import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';

/**
 * Owner Portal Footer Component
 *
 * Displays the footer for the Owner Portal with:
 * - Multi-column navigation grid (4 columns → 2 columns → 1 column responsive)
 * - Owner Resources, Support, About, and Legal sections
 * - Copyright notice (dynamic year)
 * - Application version (from environment)
 * - Branding tagline
 * - Design System Section 9 compliance
 * - Responsive design (desktop/tablet/mobile)
 *
 * Design System Alignment:
 * - Background: bg-white (Shade 2)
 * - Border: border-t border-gray-200 (subtle top border)
 * - Text: text-gray-600 for links, text-gray-900 for headings
 * - Padding: pt-12 pb-8 (Section 9 specs)
 * - Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8
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
   * Footer navigation columns configuration
   * Organized into 4 categories for Owner Portal:
   * - Owner Resources: Dashboard, Reports, Settings, Profile
   * - Support: Help Center, Contact Support, FAQ
   * - About: Terms of Service, Privacy Policy, Version info
   * - Legal: Additional legal/compliance links
   */
  footerColumns = [
    {
      heading: 'Owner Resources',
      links: [
        {
          label: 'Dashboard',
          path: '/owner/dashboard',
          external: false,
          ariaLabel: 'Navigate to Owner Dashboard',
        },
        {
          label: 'Reports',
          path: '/owner/reports',
          external: false,
          ariaLabel: 'View Reports',
        },
        {
          label: 'Settings',
          path: '/owner/settings',
          external: false,
          ariaLabel: 'Manage Settings',
        },
        {
          label: 'Profile',
          path: '/owner/profile',
          external: false,
          ariaLabel: 'View Profile',
        },
      ],
    },
    {
      heading: 'Support',
      links: [
        {
          label: 'Help Center',
          path: '/help',
          external: false,
          ariaLabel: 'Visit Help Center',
        },
        {
          label: 'Contact Support',
          path: '/owner/contact',
          external: false,
          ariaLabel: 'Contact Support',
        },
        {
          label: 'FAQ',
          path: '/faq',
          external: false,
          ariaLabel: 'Frequently Asked Questions',
        },
      ],
    },
    {
      heading: 'About',
      links: [
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
          label: `Version ${environment.version || '1.0.0'}`,
          path: '#',
          external: false,
          ariaLabel: 'Application version information',
        },
      ],
    },
    {
      heading: 'Legal',
      links: [
        {
          label: 'Accessibility',
          path: '/accessibility',
          external: false,
          ariaLabel: 'Accessibility Statement',
        },
        {
          label: 'Cookie Policy',
          path: '/cookies',
          external: true,
          ariaLabel: 'View Cookie Policy',
        },
        {
          label: 'Sitemap',
          path: '/sitemap',
          external: false,
          ariaLabel: 'View Sitemap',
        },
      ],
    },
  ];
}
