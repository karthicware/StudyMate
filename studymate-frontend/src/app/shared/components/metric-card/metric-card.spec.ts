import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MetricCard } from './metric-card';

describe('MetricCard', () => {
  let component: MetricCard;
  let fixture: ComponentFixture<MetricCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetricCard],
    }).compileComponents();

    fixture = TestBed.createComponent(MetricCard);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display label and value', () => {
    fixture.componentRef.setInput('label', 'Total Seats');
    fixture.componentRef.setInput('value', '50');
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Total Seats');
    expect(compiled.textContent).toContain('50');
  });

  it('should display icon when provided', () => {
    fixture.componentRef.setInput('label', 'Revenue');
    fixture.componentRef.setInput('value', '₹15,000');
    fixture.componentRef.setInput('icon', '💰');
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('💰');
  });

  it('should not display icon section when icon is empty', () => {
    fixture.componentRef.setInput('label', 'Revenue');
    fixture.componentRef.setInput('value', '₹15,000');
    fixture.componentRef.setInput('icon', '');
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const iconElement = compiled.querySelector('.ml-4');
    expect(iconElement).toBeNull();
  });

  it('should apply default variant styling', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('value', '100');
    fixture.componentRef.setInput('variant', 'default');
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector('.metric-card');
    expect(card.className).toContain('shadow-md');
  });

  it('should apply primary variant styling', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('value', '100');
    fixture.componentRef.setInput('variant', 'primary');
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector('.metric-card');
    expect(card.className).toContain('border-blue-500');
  });

  it('should apply success variant styling', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('value', '100');
    fixture.componentRef.setInput('variant', 'success');
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector('.metric-card');
    expect(card.className).toContain('border-green-500');
  });

  it('should apply warning variant styling', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('value', '100');
    fixture.componentRef.setInput('variant', 'warning');
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector('.metric-card');
    expect(card.className).toContain('border-yellow-500');
  });

  it('should handle numeric values', () => {
    fixture.componentRef.setInput('label', 'Count');
    fixture.componentRef.setInput('value', 42);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('42');
  });

  it('should handle string values', () => {
    fixture.componentRef.setInput('label', 'Status');
    fixture.componentRef.setInput('value', 'Active');
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Active');
  });
});
