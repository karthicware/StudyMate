import { Component, inject, signal, computed, HostListener, ElementRef } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStore } from '../../../store/auth/auth.store';

/**
 * Owner Portal Header Component
 *
 * Displays the main navigation header for the Owner Portal with:
 * - Logo and branding
 * - Navigation menu for all owner features
 * - User context (name, avatar, study hall)
 * - Logout functionality
 * - Responsive design (desktop/tablet/mobile)
 *
 * @example
 * ```html
 * <app-owner-header />
 * ```
 */
@Component({
  selector: 'app-owner-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './owner-header.html',
  styleUrl: './owner-header.scss',
})
export class OwnerHeaderComponent {
  private authStore = inject(AuthStore);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  // User state from NgRx Signals
  user = this.authStore.selectUser;
  isAuthenticated = this.authStore.selectIsAuthenticated;

  // Mobile menu state
  mobileMenuOpen = signal(false);

  // Avatar dropdown state
  avatarMenuOpen = signal(false);

  // Computed properties
  userName = computed(() => {
    const currentUser = this.user();
    return currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Guest';
  });

  userInitials = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return 'G';
    const first = currentUser.firstName?.[0] || '';
    const last = currentUser.lastName?.[0] || '';
    return `${first}${last}`.toUpperCase();
  });

  hallName = computed(() => {
    // TODO: Get from user's hall association once backend is implemented
    return 'Study Hall';
  });

  // Navigation items configuration
  navItems = [
    {
      label: 'Dashboard',
      path: '/owner/dashboard',
      icon: 'dashboard',
      ariaLabel: 'Navigate to Dashboard',
    },
    {
      label: 'Seat Map',
      path: '/owner/seat-map-config',
      icon: 'map',
      ariaLabel: 'Navigate to Seat Map Configuration',
    },
    {
      label: 'Users',
      path: '/owner/user-management',
      icon: 'people',
      ariaLabel: 'Navigate to User Management',
    },
    {
      label: 'Reports',
      path: '/owner/reports',
      icon: 'analytics',
      ariaLabel: 'Navigate to Reports',
    },
  ];

  /**
   * Toggle mobile navigation menu
   */
  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
    // Close avatar menu if open
    if (this.avatarMenuOpen()) {
      this.avatarMenuOpen.set(false);
    }
  }

  /**
   * Toggle avatar dropdown menu
   */
  toggleAvatarMenu(): void {
    this.avatarMenuOpen.update((open) => !open);
    // Close mobile menu if open
    if (this.mobileMenuOpen()) {
      this.mobileMenuOpen.set(false);
    }
  }

  /**
   * Close mobile menu (called when navigating)
   */
  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  /**
   * Close avatar menu
   */
  closeAvatarMenu(): void {
    this.avatarMenuOpen.set(false);
  }

  /**
   * Navigate to dashboard (logo click)
   */
  navigateToDashboard(): void {
    this.router.navigate(['/owner/dashboard']);
    this.closeMobileMenu();
  }

  /**
   * Navigate to profile
   */
  navigateToProfile(): void {
    this.router.navigate(['/owner/profile']);
    this.closeAvatarMenu();
    this.closeMobileMenu();
  }

  /**
   * Navigate to settings
   */
  navigateToSettings(): void {
    this.router.navigate(['/owner/settings']);
    this.closeAvatarMenu();
    this.closeMobileMenu();
  }

  /**
   * Logout functionality
   * - Clears auth state via AuthStore
   * - Navigates to login page
   */
  logout(): void {
    // Clear auth state
    this.authStore.logout();

    // Navigate to login
    this.router.navigate(['/login']);

    // Close all menus
    this.closeAvatarMenu();
    this.closeMobileMenu();
  }

  /**
   * Handle clicks outside the component to close menus
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);

    // Close avatar menu if click is outside the component
    if (!clickedInside && this.avatarMenuOpen()) {
      this.closeAvatarMenu();
    }
  }
}
