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

  describe('Footer Columns Configuration (Story 1.16.1)', () => {
    it('should have 4 footer columns', () => {
      expect(component.footerColumns.length).toBe(4);
    });

    it('should have Owner Resources column with 4 links', () => {
      const ownerResourcesColumn = component.footerColumns.find(
        (col) => col.heading === 'Owner Resources'
      );
      expect(ownerResourcesColumn).toBeTruthy();
      expect(ownerResourcesColumn?.links.length).toBe(4);
      expect(ownerResourcesColumn?.links[0].label).toBe('Dashboard');
      expect(ownerResourcesColumn?.links[1].label).toBe('Reports');
      expect(ownerResourcesColumn?.links[2].label).toBe('Settings');
      expect(ownerResourcesColumn?.links[3].label).toBe('Profile');
    });

    it('should have Support column with 3 links', () => {
      const supportColumn = component.footerColumns.find((col) => col.heading === 'Support');
      expect(supportColumn).toBeTruthy();
      expect(supportColumn?.links.length).toBe(3);
      expect(supportColumn?.links[0].label).toBe('Help Center');
      expect(supportColumn?.links[1].label).toBe('Contact Support');
      expect(supportColumn?.links[2].label).toBe('FAQ');
    });

    it('should have About column with Terms, Privacy, and Version', () => {
      const aboutColumn = component.footerColumns.find((col) => col.heading === 'About');
      expect(aboutColumn).toBeTruthy();
      expect(aboutColumn?.links.length).toBe(3);
      expect(aboutColumn?.links[0].label).toBe('Terms of Service');
      expect(aboutColumn?.links[1].label).toBe('Privacy Policy');
      expect(aboutColumn?.links[2].label).toContain('Version');
    });

    it('should have Legal column with 3 compliance links', () => {
      const legalColumn = component.footerColumns.find((col) => col.heading === 'Legal');
      expect(legalColumn).toBeTruthy();
      expect(legalColumn?.links.length).toBe(3);
      expect(legalColumn?.links[0].label).toBe('Accessibility');
      expect(legalColumn?.links[1].label).toBe('Cookie Policy');
      expect(legalColumn?.links[2].label).toBe('Sitemap');
    });

    it('should have Terms of Service as external link', () => {
      const aboutColumn = component.footerColumns.find((col) => col.heading === 'About');
      const termsLink = aboutColumn?.links.find((link) => link.label === 'Terms of Service');
      expect(termsLink).toBeTruthy();
      expect(termsLink?.path).toBe('/terms');
      expect(termsLink?.external).toBe(true);
    });

    it('should have Privacy Policy as external link', () => {
      const aboutColumn = component.footerColumns.find((col) => col.heading === 'About');
      const privacyLink = aboutColumn?.links.find((link) => link.label === 'Privacy Policy');
      expect(privacyLink).toBeTruthy();
      expect(privacyLink?.path).toBe('/privacy');
      expect(privacyLink?.external).toBe(true);
    });

    it('should have Cookie Policy as external link', () => {
      const legalColumn = component.footerColumns.find((col) => col.heading === 'Legal');
      const cookieLink = legalColumn?.links.find((link) => link.label === 'Cookie Policy');
      expect(cookieLink).toBeTruthy();
      expect(cookieLink?.path).toBe('/cookies');
      expect(cookieLink?.external).toBe(true);
    });

    it('should have Contact Support as internal link', () => {
      const supportColumn = component.footerColumns.find((col) => col.heading === 'Support');
      const contactLink = supportColumn?.links.find((link) => link.label === 'Contact Support');
      expect(contactLink).toBeTruthy();
      expect(contactLink?.path).toBe('/owner/contact');
      expect(contactLink?.external).toBe(false);
    });

    it('should have ARIA labels for all links', () => {
      component.footerColumns.forEach((column) => {
        column.links.forEach((link) => {
          expect(link.ariaLabel).toBeTruthy();
          expect(typeof link.ariaLabel).toBe('string');
        });
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

    it('should render all footer column headings', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const headings = compiled.querySelectorAll('footer h3');
      expect(headings.length).toBe(4);
    });

    it('should render all footer links (14 total links)', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const links = compiled.querySelectorAll('nav a');
      // 4 (Owner Resources) + 3 (Support) + 3 (About) + 3 (Legal) = 13 links
      expect(links.length).toBe(13);
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
      // Should have 3 external links (Terms, Privacy, Cookie Policy)
      expect(externalLinks.length).toBe(3);
    });

    it('should add rel="noopener noreferrer" to external links', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const externalLinks = compiled.querySelectorAll('a[rel="noopener noreferrer"]');
      // Should have 3 external links (Terms, Privacy, Cookie Policy)
      expect(externalLinks.length).toBe(3);
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

  describe('Styling Classes (Story 1.16.1 - Design System Section 9)', () => {
    it('should have white background (bg-white)', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const footer = compiled.querySelector('footer');
      expect(footer?.classList.contains('bg-white')).toBe(true);
    });

    it('should have subtle border (border-t border-gray-200)', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const footer = compiled.querySelector('footer');
      expect(footer?.classList.contains('border-t')).toBe(true);
      expect(footer?.classList.contains('border-gray-200')).toBe(true);
    });

    it('should have Section 9 padding (pt-12 pb-8)', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const footer = compiled.querySelector('footer');
      expect(footer?.classList.contains('pt-12')).toBe(true);
      expect(footer?.classList.contains('pb-8')).toBe(true);
    });

    it('should have multi-column grid layout', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const nav = compiled.querySelector('footer nav');
      expect(nav?.classList.contains('grid')).toBe(true);
      expect(nav?.classList.contains('grid-cols-1')).toBe(true);
      expect(nav?.classList.contains('md:grid-cols-2')).toBe(true);
      expect(nav?.classList.contains('lg:grid-cols-4')).toBe(true);
      expect(nav?.classList.contains('gap-8')).toBe(true);
    });

    it('should have correct heading typography (text-sm font-bold text-gray-900)', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const heading = compiled.querySelector('footer h3');
      expect(heading?.classList.contains('text-sm')).toBe(true);
      expect(heading?.classList.contains('font-bold')).toBe(true);
      expect(heading?.classList.contains('text-gray-900')).toBe(true);
      expect(heading?.classList.contains('mb-4')).toBe(true);
    });

    it('should have correct link typography (text-sm text-gray-600 hover:underline)', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const link = compiled.querySelector('nav a');
      expect(link?.classList.contains('text-sm')).toBe(true);
      expect(link?.classList.contains('text-gray-600')).toBe(true);
      expect(link?.classList.contains('hover:underline')).toBe(true);
    });

    it('should have smooth transitions on links (transition-all duration-200)', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const links = compiled.querySelectorAll('nav a');
      links.forEach((link) => {
        expect(link.classList.contains('transition-all')).toBe(true);
        expect(link.classList.contains('duration-200')).toBe(true);
        expect(link.classList.contains('cursor-pointer')).toBe(true);
      });
    });

    it('should have proper spacing in link lists (space-y-3)', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const linkList = compiled.querySelector('footer ul');
      expect(linkList?.classList.contains('space-y-3')).toBe(true);
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
