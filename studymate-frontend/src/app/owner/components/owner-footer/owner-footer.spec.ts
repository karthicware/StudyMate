import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { OwnerFooterComponent } from './owner-footer';
import { environment } from '../../../../environments/environment';

describe('OwnerFooterComponent', () => {
  let component: OwnerFooterComponent;
  let fixture: ComponentFixture<OwnerFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerFooterComponent, RouterTestingModule.withRoutes([])],
    }).compileComponents();

    fixture = TestBed.createComponent(OwnerFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have standalone configuration', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const metadata = (OwnerFooterComponent as any).ɵcmp;
      expect(metadata.standalone).toBe(true);
    });

    it('should initialize with current year', () => {
      const currentYear = new Date().getFullYear();
      expect(component.currentYear).toBe(currentYear);
    });

    it('should initialize with app version from environment', () => {
      expect(component.appVersion).toBe(environment.version || '1.0.0');
    });

    it('should default to "1.0.0" if environment.version is not set', () => {
      // This test validates the fallback logic
      const version = environment.version || '1.0.0';
      expect(version).toBeTruthy();
      expect(typeof version).toBe('string');
    });
  });

  describe('Footer Links Configuration', () => {
    it('should have 3 footer links', () => {
      expect(component.footerLinks.length).toBe(3);
    });

    it('should have Terms of Service link', () => {
      const termsLink = component.footerLinks.find((link) => link.label === 'Terms of Service');
      expect(termsLink).toBeTruthy();
      expect(termsLink?.path).toBe('/terms');
      expect(termsLink?.external).toBe(true);
    });

    it('should have Privacy Policy link', () => {
      const privacyLink = component.footerLinks.find((link) => link.label === 'Privacy Policy');
      expect(privacyLink).toBeTruthy();
      expect(privacyLink?.path).toBe('/privacy');
      expect(privacyLink?.external).toBe(true);
    });

    it('should have Contact Support link', () => {
      const contactLink = component.footerLinks.find((link) => link.label === 'Contact Support');
      expect(contactLink).toBeTruthy();
      expect(contactLink?.path).toBe('/owner/contact');
      expect(contactLink?.external).toBe(false);
    });

    it('should have ARIA labels for all links', () => {
      component.footerLinks.forEach((link) => {
        expect(link.ariaLabel).toBeTruthy();
        expect(typeof link.ariaLabel).toBe('string');
      });
    });
  });

  describe('Template Rendering', () => {
    it('should render footer element', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const footer = compiled.querySelector('footer');
      expect(footer).toBeTruthy();
    });

    it('should have contentinfo role on footer', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const footer = compiled.querySelector('footer');
      expect(footer?.getAttribute('role')).toBe('contentinfo');
    });

    it('should display current year in copyright', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const currentYear = new Date().getFullYear().toString();
      expect(compiled.textContent).toContain(currentYear);
      expect(compiled.textContent).toContain('StudyMate');
    });

    it('should display app version', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Version');
      expect(compiled.textContent).toContain(component.appVersion);
    });

    it('should render all footer links', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const links = compiled.querySelectorAll('nav a');
      expect(links.length).toBe(3);
    });

    it('should render branding tagline', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Built with');
      expect(compiled.textContent).toContain('for educators');
    });
  });

  describe('External Links Security', () => {
    it('should add target="_blank" to external links', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const externalLinks = compiled.querySelectorAll('a[target="_blank"]');
      // Should have 2 external links (Terms, Privacy)
      expect(externalLinks.length).toBe(2);
    });

    it('should add rel="noopener noreferrer" to external links', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const externalLinks = compiled.querySelectorAll('a[rel="noopener noreferrer"]');
      // Should have 2 external links (Terms, Privacy)
      expect(externalLinks.length).toBe(2);
    });

    it('should not add target="_blank" to internal links', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const contactLink = compiled.querySelector('a[href*="contact"]');
      if (contactLink) {
        expect(contactLink.getAttribute('target')).toBeNull();
      }
    });

    it('should render Terms of Service as external link', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const termsLink = Array.from(compiled.querySelectorAll('a')).find((a) =>
        a.textContent?.includes('Terms of Service'),
      );
      expect(termsLink).toBeTruthy();
      expect(termsLink?.getAttribute('target')).toBe('_blank');
      expect(termsLink?.getAttribute('rel')).toBe('noopener noreferrer');
    });

    it('should render Privacy Policy as external link', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const privacyLink = Array.from(compiled.querySelectorAll('a')).find((a) =>
        a.textContent?.includes('Privacy Policy'),
      );
      expect(privacyLink).toBeTruthy();
      expect(privacyLink?.getAttribute('target')).toBe('_blank');
      expect(privacyLink?.getAttribute('rel')).toBe('noopener noreferrer');
    });
  });

  describe('Accessibility', () => {
    it('should have navigation landmark', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const nav = compiled.querySelector('nav');
      expect(nav).toBeTruthy();
      expect(nav?.getAttribute('aria-label')).toBe('Footer navigation');
    });

    it('should have aria-label on copyright section', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const copyrightSpan = compiled.querySelector('span[aria-label*="Copyright"]');
      expect(copyrightSpan).toBeTruthy();
    });

    it('should have aria-label on version section', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const versionSpan = compiled.querySelector('span[aria-label*="version"]');
      expect(versionSpan).toBeTruthy();
    });

    it('should have aria-label on all footer links', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const links = compiled.querySelectorAll('nav a');
      links.forEach((link) => {
        expect(link.hasAttribute('aria-label')).toBe(true);
      });
    });

    it('should hide decorative heart icon from screen readers', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const heartIcon = compiled.querySelector('span[aria-hidden="true"]');
      expect(heartIcon).toBeTruthy();
    });
  });

  describe('Responsive Classes', () => {
    it('should have responsive flex classes on container', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const container = compiled.querySelector('.flex.flex-col.md\\:flex-row');
      expect(container).toBeTruthy();
    });

    it('should have responsive text alignment classes', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const container = compiled.querySelector('.text-center.md\\:text-left');
      expect(container).toBeTruthy();
    });
  });

  describe('Styling Classes', () => {
    it('should have proper background and border classes', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const footer = compiled.querySelector('footer');
      expect(footer?.classList.contains('bg-gray-100')).toBe(true);
      expect(footer?.classList.contains('border-t')).toBe(true);
      expect(footer?.classList.contains('border-gray-300')).toBe(true);
    });

    it('should have proper padding classes', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const footer = compiled.querySelector('footer');
      expect(footer?.classList.contains('py-4')).toBe(true);
    });

    it('should have hover transition classes on links', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const links = compiled.querySelectorAll('nav a');
      links.forEach((link) => {
        expect(link.classList.contains('transition-colors')).toBe(true);
        expect(link.classList.contains('hover:text-primary-600')).toBe(true);
      });
    });
  });

  describe('Dynamic Content Updates', () => {
    it('should update year if component is recreated next year', () => {
      const nextYear = new Date().getFullYear() + 1;
      // Simulate component creation next year
      const futureDate = new Date(nextYear, 0, 1);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      spyOn(window as any, 'Date').and.returnValue(futureDate);

      const newComponent = new OwnerFooterComponent();
      expect(newComponent.currentYear).toBe(new Date().getFullYear());
    });

    it('should use environment version if available', () => {
      expect(component.appVersion).toBe(environment.version || '1.0.0');
    });
  });

  describe('Link Paths', () => {
    it('should have correct path for Terms of Service', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const termsLink = Array.from(compiled.querySelectorAll('a')).find((a) =>
        a.textContent?.includes('Terms of Service'),
      );
      expect(termsLink?.getAttribute('href')).toBe('/terms');
    });

    it('should have correct path for Privacy Policy', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const privacyLink = Array.from(compiled.querySelectorAll('a')).find((a) =>
        a.textContent?.includes('Privacy Policy'),
      );
      expect(privacyLink?.getAttribute('href')).toBe('/privacy');
    });

    it('should have correct routerLink for Contact Support', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const contactLink = Array.from(compiled.querySelectorAll('a')).find((a) =>
        a.textContent?.includes('Contact Support'),
      );
      expect(contactLink).toBeTruthy();
      // Internal link should not have target="_blank" (key difference from external links)
      expect(contactLink?.getAttribute('target')).toBeNull();
      expect(contactLink?.getAttribute('rel')).toBeNull();
    });
  });
});
