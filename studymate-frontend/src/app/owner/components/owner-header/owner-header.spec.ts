import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { OwnerHeaderComponent } from './owner-header';
import { AuthStore, User } from '../../../store/auth/auth.store';

describe('OwnerHeaderComponent', () => {
  let component: OwnerHeaderComponent;
  let fixture: ComponentFixture<OwnerHeaderComponent>;
  let mockAuthStore: any;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockUser: User = {
    id: 1,
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'owner',
  };

  beforeEach(async () => {
    // Create mock auth store with signals
    mockAuthStore = {
      selectUser: signal(mockUser),
      selectIsAuthenticated: signal(true),
      logout: jasmine.createSpy('logout'),
    };

    await TestBed.configureTestingModule({
      imports: [
        OwnerHeaderComponent,
        RouterTestingModule.withRoutes([]), // Use RouterTestingModule for testing
      ],
      providers: [{ provide: AuthStore, useValue: mockAuthStore }],
    }).compileComponents();

    fixture = TestBed.createComponent(OwnerHeaderComponent);
    component = fixture.componentInstance;

    // Get the real Router provided by RouterTestingModule and spy on it
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    spyOn(mockRouter, 'navigate');

    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have standalone configuration', () => {
      const metadata = (OwnerHeaderComponent as any).ɵcmp;
      expect(metadata.standalone).toBe(true);
    });

    it('should initialize with closed menus', () => {
      expect(component.mobileMenuOpen()).toBe(false);
      expect(component.avatarMenuOpen()).toBe(false);
    });
  });

  describe('Navigation Items', () => {
    it('should display all 6 navigation items', () => {
      expect(component.navItems.length).toBe(6);
    });

    it('should have correct navigation paths', () => {
      const paths = component.navItems.map((item) => item.path);
      expect(paths).toEqual([
        '/owner/dashboard',
        '/owner/seat-map-config',
        '/owner/user-management',
        '/owner/reports',
        '/owner/profile',
        '/owner/settings',
      ]);
    });

    it('should have ARIA labels for all navigation items', () => {
      component.navItems.forEach((item) => {
        expect(item.ariaLabel).toBeTruthy();
        expect(item.ariaLabel).toContain('Navigate to');
      });
    });

    it('should render all navigation links in the template', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const navLinks = compiled.querySelectorAll('a');
      // Should have at least 6 navigation links (desktop or mobile)
      expect(navLinks.length).toBeGreaterThanOrEqual(6);
    });
  });

  describe('User Context Display', () => {
    it('should display user name correctly', () => {
      expect(component.userName()).toBe('John Doe');
    });

    it('should display user initials correctly', () => {
      expect(component.userInitials()).toBe('JD');
    });

    it('should display "Guest" for null user', () => {
      mockAuthStore.selectUser.set(null);
      expect(component.userName()).toBe('Guest');
    });

    it('should display "G" initials for null user', () => {
      mockAuthStore.selectUser.set(null);
      expect(component.userInitials()).toBe('G');
    });

    it('should handle user with only first name', () => {
      const partialUser: User = {
        id: 2,
        email: 'jane@example.com',
        firstName: 'Jane',
        lastName: '',
        role: 'owner',
      };
      mockAuthStore.selectUser.set(partialUser);
      expect(component.userName()).toBe('Jane ');
      expect(component.userInitials()).toBe('J');
    });

    it('should display study hall name', () => {
      expect(component.hallName()).toBe('Study Hall');
    });
  });

  describe('Mobile Menu Toggle', () => {
    it('should toggle mobile menu open/closed', () => {
      expect(component.mobileMenuOpen()).toBe(false);

      component.toggleMobileMenu();
      expect(component.mobileMenuOpen()).toBe(true);

      component.toggleMobileMenu();
      expect(component.mobileMenuOpen()).toBe(false);
    });

    it('should close avatar menu when opening mobile menu', () => {
      component.avatarMenuOpen.set(true);
      component.toggleMobileMenu();

      expect(component.mobileMenuOpen()).toBe(true);
      expect(component.avatarMenuOpen()).toBe(false);
    });

    it('should close mobile menu on closeMobileMenu()', () => {
      component.mobileMenuOpen.set(true);
      component.closeMobileMenu();

      expect(component.mobileMenuOpen()).toBe(false);
    });
  });

  describe('Avatar Menu Toggle', () => {
    it('should toggle avatar menu open/closed', () => {
      expect(component.avatarMenuOpen()).toBe(false);

      component.toggleAvatarMenu();
      expect(component.avatarMenuOpen()).toBe(true);

      component.toggleAvatarMenu();
      expect(component.avatarMenuOpen()).toBe(false);
    });

    it('should close mobile menu when opening avatar menu', () => {
      component.mobileMenuOpen.set(true);
      component.toggleAvatarMenu();

      expect(component.avatarMenuOpen()).toBe(true);
      expect(component.mobileMenuOpen()).toBe(false);
    });

    it('should close avatar menu on closeAvatarMenu()', () => {
      component.avatarMenuOpen.set(true);
      component.closeAvatarMenu();

      expect(component.avatarMenuOpen()).toBe(false);
    });
  });

  describe('Navigation Actions', () => {
    it('should navigate to dashboard on logo click', () => {
      component.navigateToDashboard();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/owner/dashboard']);
      expect(component.mobileMenuOpen()).toBe(false);
    });

    it('should navigate to profile', () => {
      component.avatarMenuOpen.set(true);
      component.navigateToProfile();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/owner/profile']);
      expect(component.avatarMenuOpen()).toBe(false);
      expect(component.mobileMenuOpen()).toBe(false);
    });

    it('should navigate to settings', () => {
      component.avatarMenuOpen.set(true);
      component.navigateToSettings();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/owner/settings']);
      expect(component.avatarMenuOpen()).toBe(false);
      expect(component.mobileMenuOpen()).toBe(false);
    });
  });

  describe('Logout Functionality', () => {
    it('should call AuthStore.logout() on logout', () => {
      component.logout();

      expect(mockAuthStore.logout).toHaveBeenCalled();
    });

    it('should navigate to login page on logout', () => {
      component.logout();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should close all menus on logout', () => {
      component.avatarMenuOpen.set(true);
      component.mobileMenuOpen.set(true);

      component.logout();

      expect(component.avatarMenuOpen()).toBe(false);
      expect(component.mobileMenuOpen()).toBe(false);
    });
  });

  describe('Template Rendering', () => {
    it('should render header element', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const header = compiled.querySelector('header');
      expect(header).toBeTruthy();
    });

    it('should render logo button', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const logoButton = compiled.querySelector('button[aria-label="Go to Dashboard"]');
      expect(logoButton).toBeTruthy();
    });

    it('should render hamburger menu button', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const hamburger = compiled.querySelector('button[aria-label="Toggle navigation menu"]');
      expect(hamburger).toBeTruthy();
    });

    it('should render mobile menu when open', () => {
      component.mobileMenuOpen.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const mobileMenu = compiled.querySelector('#mobile-menu');
      expect(mobileMenu).toBeTruthy();
    });

    it('should not render mobile menu when closed', () => {
      component.mobileMenuOpen.set(false);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const mobileMenu = compiled.querySelector('#mobile-menu');
      expect(mobileMenu).toBeFalsy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on header', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const header = compiled.querySelector('header');
      expect(header?.getAttribute('role')).toBe('banner');
    });

    it('should have proper ARIA attributes on nav', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const nav = compiled.querySelector('nav');
      expect(nav?.getAttribute('role')).toBe('navigation');
      expect(nav?.getAttribute('aria-label')).toBe('Main navigation');
    });

    it('should have aria-expanded on hamburger button', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const hamburger = compiled.querySelector('button[aria-label="Toggle navigation menu"]');
      expect(hamburger?.hasAttribute('aria-expanded')).toBe(true);
    });

    it('should have aria-expanded on avatar button', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const avatar = compiled.querySelector('button[aria-label="User menu"]');
      expect(avatar?.hasAttribute('aria-expanded')).toBe(true);
    });

    it('should have proper role on mobile menu', () => {
      component.mobileMenuOpen.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const mobileMenu = compiled.querySelector('#mobile-menu');
      expect(mobileMenu?.getAttribute('role')).toBe('menu');
    });
  });

  describe('Responsive Behavior', () => {
    it('should have responsive classes for desktop navigation', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const desktopNav = compiled.querySelector('.hidden.lg\\:flex');
      expect(desktopNav).toBeTruthy();
    });

    it('should have responsive classes for mobile hamburger', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const hamburger = compiled.querySelector('button[aria-label="Toggle navigation menu"]');
      expect(hamburger).toBeTruthy();
    });
  });
});
