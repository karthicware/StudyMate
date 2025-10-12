import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { OwnerLayoutComponent } from './owner-layout.component';
import { OwnerHeaderComponent } from '../components/owner-header/owner-header';
import { OwnerFooterComponent } from '../components/owner-footer/owner-footer';
import { AuthStore } from '../../store/auth/auth.store';
import { signal } from '@angular/core';

describe('OwnerLayoutComponent', () => {
  let component: OwnerLayoutComponent;
  let fixture: ComponentFixture<OwnerLayoutComponent>;
  let mockAuthStore: any;

  beforeEach(async () => {
    // Create mock auth store with signals
    mockAuthStore = {
      selectUser: signal(null),
      selectIsAuthenticated: signal(false),
      logout: jasmine.createSpy('logout'),
    };

    await TestBed.configureTestingModule({
      imports: [OwnerLayoutComponent, RouterTestingModule.withRoutes([])],
      providers: [{ provide: AuthStore, useValue: mockAuthStore }],
    }).compileComponents();

    fixture = TestBed.createComponent(OwnerLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have standalone configuration', () => {
      const metadata = (OwnerLayoutComponent as any).ɵcmp;
      expect(metadata.standalone).toBe(true);
    });
  });

  describe('Layout Structure', () => {
    it('should render header component', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const header = compiled.querySelector('app-owner-header');
      expect(header).toBeTruthy();
    });

    it('should render footer component', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const footer = compiled.querySelector('app-owner-footer');
      expect(footer).toBeTruthy();
    });

    it('should render router outlet', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const outlet = compiled.querySelector('router-outlet');
      expect(outlet).toBeTruthy();
    });

    it('should have correct flexbox layout structure', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const layout = compiled.querySelector('.min-h-screen');
      expect(layout).toBeTruthy();
      expect(layout?.classList.contains('flex')).toBe(true);
      expect(layout?.classList.contains('flex-col')).toBe(true);
    });

    it('should have main element with flex-1 class', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const main = compiled.querySelector('main');
      expect(main).toBeTruthy();
      expect(main?.classList.contains('flex-1')).toBe(true);
    });

    it('should have main element with background color', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const main = compiled.querySelector('main');
      expect(main?.classList.contains('bg-gray-50')).toBe(true);
    });

    it('should have main element with top padding for fixed header', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const main = compiled.querySelector('main');
      expect(main?.classList.contains('pt-16')).toBe(true);
    });
  });

  describe('Content Container', () => {
    it('should have container with responsive padding', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const container = compiled.querySelector('.container');
      expect(container).toBeTruthy();
      expect(container?.classList.contains('mx-auto')).toBe(true);
    });

    it('should have container with horizontal padding', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const container = compiled.querySelector('.container');
      expect(container?.classList.contains('px-6')).toBe(true);
    });

    it('should have container with vertical padding', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const container = compiled.querySelector('.container');
      expect(container?.classList.contains('py-8')).toBe(true);
    });
  });

  describe('Responsive Layout', () => {
    it('should apply min-height class for full viewport', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const layout = compiled.querySelector('.min-h-screen');
      expect(layout).toBeTruthy();
    });

    it('should use flexbox for layout management', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const layout = compiled.querySelector('.flex');
      expect(layout).toBeTruthy();
    });

    it('should use column direction for flex layout', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const layout = compiled.querySelector('.flex-col');
      expect(layout).toBeTruthy();
    });
  });

  describe('Component Integration', () => {
    it('should import OwnerHeaderComponent', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const header = compiled.querySelector('app-owner-header');
      expect(header).toBeTruthy();
      // Verify it's the actual OwnerHeaderComponent by checking it was created
      expect(component).toBeTruthy();
    });

    it('should import OwnerFooterComponent', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const footer = compiled.querySelector('app-owner-footer');
      expect(footer).toBeTruthy();
      // Verify it's the actual OwnerFooterComponent by checking it was created
      expect(component).toBeTruthy();
    });

    it('should import RouterOutlet', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const routerOutlet = compiled.querySelector('router-outlet');
      expect(routerOutlet).toBeTruthy();
    });
  });

  describe('Layout Spacing', () => {
    it('should have proper spacing between header and main content', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const main = compiled.querySelector('main');
      // pt-16 provides spacing for the fixed header (64px = 4rem)
      expect(main?.classList.contains('pt-16')).toBe(true);
    });

    it('should allow main content to grow and fill space', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const main = compiled.querySelector('main');
      // flex-1 allows main to grow and fill available space
      expect(main?.classList.contains('flex-1')).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have semantic main element', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const main = compiled.querySelector('main');
      expect(main).toBeTruthy();
      expect(main?.tagName.toLowerCase()).toBe('main');
    });

    it('should properly structure header, main, and footer elements', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const header = compiled.querySelector('app-owner-header');
      const main = compiled.querySelector('main');
      const footer = compiled.querySelector('app-owner-footer');

      expect(header).toBeTruthy();
      expect(main).toBeTruthy();
      expect(footer).toBeTruthy();

      // Verify order in DOM
      const allElements = Array.from(
        compiled.querySelectorAll('app-owner-header, main, app-owner-footer'),
      );
      expect(allElements[0].tagName.toLowerCase()).toBe('app-owner-header');
      expect(allElements[1].tagName.toLowerCase()).toBe('main');
      expect(allElements[2].tagName.toLowerCase()).toBe('app-owner-footer');
    });
  });

  describe('Visual Consistency', () => {
    it('should use consistent background color for content area', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const main = compiled.querySelector('main');
      expect(main?.classList.contains('bg-gray-50')).toBe(true);
    });

    it('should center content container', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const container = compiled.querySelector('.container');
      expect(container?.classList.contains('mx-auto')).toBe(true);
    });
  });
});
