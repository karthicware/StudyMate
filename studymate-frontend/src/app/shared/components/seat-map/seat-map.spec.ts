import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeatMap } from './seat-map';
import { SeatStatus } from '../../../core/models/dashboard.model';

describe('SeatMap', () => {
  let component: SeatMap;
  let fixture: ComponentFixture<SeatMap>;

  const mockSeats: SeatStatus[] = [
    {
      id: '1',
      seatNumber: 'A1',
      xCoord: 100,
      yCoord: 100,
      status: 'available'
    },
    {
      id: '2',
      seatNumber: 'A2',
      xCoord: 150,
      yCoord: 100,
      status: 'occupied'
    },
    {
      id: '3',
      seatNumber: 'A3',
      xCoord: 200,
      yCoord: 100,
      status: 'reserved'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeatMap]
    }).compileComponents();

    fixture = TestBed.createComponent(SeatMap);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show empty message when no seats provided', () => {
    fixture.componentRef.setInput('seats', []);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('No seat data available');
  });

  it('should render seats as SVG circles', () => {
    fixture.componentRef.setInput('seats', mockSeats);
    fixture.detectChanges();

    const circles = fixture.nativeElement.querySelectorAll('.seat-circle');
    expect(circles.length).toBe(3);
  });

  it('should render seat numbers as text labels', () => {
    fixture.componentRef.setInput('seats', mockSeats);
    fixture.detectChanges();

    const labels = fixture.nativeElement.querySelectorAll('.seat-label');
    expect(labels.length).toBe(3);
    expect(labels[0].textContent.trim()).toBe('A1');
    expect(labels[1].textContent.trim()).toBe('A2');
    expect(labels[2].textContent.trim()).toBe('A3');
  });

  it('should display legend with all seat statuses', () => {
    fixture.componentRef.setInput('seats', mockSeats);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Available');
    expect(compiled.textContent).toContain('Occupied');
    expect(compiled.textContent).toContain('Reserved');
  });

  it('should return correct color for available seats', () => {
    expect(component.getSeatColor('available')).toBe('#10b981');
  });

  it('should return correct color for occupied seats', () => {
    expect(component.getSeatColor('occupied')).toBe('#ef4444');
  });

  it('should return correct color for reserved seats', () => {
    expect(component.getSeatColor('reserved')).toBe('#f59e0b');
  });

  it('should return correct label for each status', () => {
    expect(component.getSeatLabel('available')).toBe('Available');
    expect(component.getSeatLabel('occupied')).toBe('Occupied');
    expect(component.getSeatLabel('reserved')).toBe('Reserved');
  });

  it('should calculate map width based on seat coordinates', () => {
    fixture.componentRef.setInput('seats', mockSeats);
    fixture.detectChanges();

    const width = component.mapWidth();
    expect(width).toBe(300); // Max xCoord (200) + 100
  });

  it('should calculate map height based on seat coordinates', () => {
    fixture.componentRef.setInput('seats', mockSeats);
    fixture.detectChanges();

    const height = component.mapHeight();
    expect(height).toBe(200); // Max yCoord (100) + 100
  });

  it('should use default dimensions when no seats', () => {
    fixture.componentRef.setInput('seats', []);
    fixture.detectChanges();

    expect(component.mapWidth()).toBe(600);
    expect(component.mapHeight()).toBe(400);
  });

  it('should position seats at correct coordinates', () => {
    fixture.componentRef.setInput('seats', mockSeats);
    fixture.detectChanges();

    const circles = fixture.nativeElement.querySelectorAll('.seat-circle');
    expect(circles[0].getAttribute('cx')).toBe('100');
    expect(circles[0].getAttribute('cy')).toBe('100');
    expect(circles[1].getAttribute('cx')).toBe('150');
  });
});
