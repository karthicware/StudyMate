import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain(
      'StudyMate - Tailwind CSS Integration',
    );
  });

  it('should have Tailwind CSS classes applied', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const mainElement = compiled.querySelector('main');
    expect(mainElement?.classList.contains('flex')).toBeTruthy();
    expect(mainElement?.classList.contains('min-h-screen')).toBeTruthy();
  });

  it('should render custom theme color cards', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const successCard = compiled.querySelector('.bg-success');
    const warningCard = compiled.querySelector('.bg-warning');
    const errorCard = compiled.querySelector('.bg-error');
    const infoCard = compiled.querySelector('.bg-info');

    expect(successCard).toBeTruthy();
    expect(warningCard).toBeTruthy();
    expect(errorCard).toBeTruthy();
    expect(infoCard).toBeTruthy();
  });
});
