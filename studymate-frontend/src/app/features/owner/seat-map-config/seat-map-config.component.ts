import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDrag, CdkDragEnd } from '@angular/cdk/drag-drop';
import { SeatConfigService } from '../../../core/services/seat-config.service';
import { Seat, Shift } from '../../../core/models/seat-config.model';

/**
 * Seat Map Configuration Component
 * Allows owners to configure seat layout and shift timings
 */
@Component({
  selector: 'app-seat-map-config',
  standalone: true,
  imports: [CommonModule, FormsModule, CdkDrag],
  templateUrl: './seat-map-config.component.html',
  styleUrls: ['./seat-map-config.component.scss'],
})
export class SeatMapConfigComponent implements OnInit {
  private seatConfigService = inject(SeatConfigService);

  // Signals for reactive state management
  seats = signal<Seat[]>([]);
  shifts = signal<Shift[]>([]);
  selectedSeat = signal<Seat | null>(null);
  isLoading = signal(false);
  saveSuccess = signal(false);
  errorMessage = signal<string | null>(null);

  // Form inputs for seat/shift management
  newSeatNumber = signal('');
  editingSeatNumber = signal('');
  showSeatModal = signal(false);
  showShiftModal = signal(false);

  // Shift form inputs
  shiftName = signal('');
  shiftStartTime = signal('');
  shiftEndTime = signal('');
  editingShiftIndex = signal<number | null>(null);

  // Canvas dimensions for seat map
  readonly canvasWidth = 800;
  readonly canvasHeight = 600;
  readonly gridSize = 50; // Grid spacing in pixels

  // Mock hall ID (in production, get from route params or auth service)
  hallId = 'hall-123';

  // Computed values
  seatCount = computed(() => this.seats().length);
  hasUnsavedChanges = signal(false);

  ngOnInit(): void {
    this.loadSeatConfiguration();
    this.loadShiftConfiguration();
  }

  /**
   * Load existing seat configuration
   */
  private loadSeatConfiguration(): void {
    this.isLoading.set(true);
    this.seatConfigService.getSeatConfiguration(this.hallId).subscribe({
      next: (seats) => {
        this.seats.set(seats);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading seats:', err);
        this.errorMessage.set('Failed to load seat configuration');
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Load existing shift configuration
   */
  private loadShiftConfiguration(): void {
    this.seatConfigService.getShiftConfiguration(this.hallId).subscribe({
      next: (_openingHours) => {
        // Extract shifts from opening hours (simplified for now)
        const defaultShifts = this.seatConfigService.getDefaultShifts();
        this.shifts.set(defaultShifts);
      },
      error: (err) => {
        console.error('Error loading shifts:', err);
        // Use default shifts on error
        this.shifts.set(this.seatConfigService.getDefaultShifts());
      },
    });
  }

  /**
   * Handle drag end event for seat positioning
   */
  onSeatDragEnded(event: CdkDragEnd, seat: Seat): void {
    const dropPoint = event.dropPoint;

    // Update seat coordinates
    const updatedSeats = this.seats().map((s) => {
      if (s.seatNumber === seat.seatNumber) {
        return {
          ...s,
          xCoord: Math.round(dropPoint.x / this.gridSize) * this.gridSize,
          yCoord: Math.round(dropPoint.y / this.gridSize) * this.gridSize,
        };
      }
      return s;
    });

    this.seats.set(updatedSeats);
    this.hasUnsavedChanges.set(true);
  }

  /**
   * Calculate seat position style
   */
  getSeatStyle(seat: Seat): { left: string; top: string } {
    return {
      left: `${seat.xCoord}px`,
      top: `${seat.yCoord}px`,
    };
  }

  /**
   * Open modal to add new seat
   */
  openAddSeatModal(): void {
    this.newSeatNumber.set('');
    this.showSeatModal.set(true);
  }

  /**
   * Add new seat to the map
   */
  addSeat(): void {
    const seatNumber = this.newSeatNumber().trim();

    if (!seatNumber) {
      this.errorMessage.set('Seat number is required');
      return;
    }

    // Validate uniqueness
    if (!this.seatConfigService.validateSeatNumberUnique(seatNumber, this.seats())) {
      this.errorMessage.set('Seat number must be unique');
      return;
    }

    // Add seat at default position
    const newSeat: Seat = {
      seatNumber,
      xCoord: 100,
      yCoord: 100,
      status: 'available',
    };

    this.seats.update((seats) => [...seats, newSeat]);
    this.hasUnsavedChanges.set(true);
    this.showSeatModal.set(false);
    this.newSeatNumber.set('');
    this.errorMessage.set(null);
  }

  /**
   * Select seat for editing
   */
  selectSeat(seat: Seat): void {
    this.selectedSeat.set(seat);
    this.editingSeatNumber.set(seat.seatNumber);
  }

  /**
   * Update seat number
   */
  updateSeatNumber(): void {
    const selected = this.selectedSeat();
    if (!selected) return;

    const newNumber = this.editingSeatNumber().trim();
    if (!newNumber) {
      this.errorMessage.set('Seat number cannot be empty');
      return;
    }

    // Validate uniqueness (excluding current seat)
    if (!this.seatConfigService.validateSeatNumberUnique(newNumber, this.seats(), selected.id)) {
      this.errorMessage.set('Seat number must be unique');
      return;
    }

    // Update seat
    const updatedSeats = this.seats().map((s) =>
      s.seatNumber === selected.seatNumber ? { ...s, seatNumber: newNumber } : s,
    );

    this.seats.set(updatedSeats);
    this.hasUnsavedChanges.set(true);
    this.selectedSeat.set(null);
    this.errorMessage.set(null);
  }

  /**
   * Delete seat with confirmation
   */
  deleteSeat(seat: Seat): void {
    if (!confirm(`Are you sure you want to delete seat ${seat.seatNumber}?`)) {
      return;
    }

    const updatedSeats = this.seats().filter((s) => s.seatNumber !== seat.seatNumber);
    this.seats.set(updatedSeats);
    this.hasUnsavedChanges.set(true);

    if (this.selectedSeat()?.seatNumber === seat.seatNumber) {
      this.selectedSeat.set(null);
    }
  }

  /**
   * Save seat configuration to backend
   */
  saveSeatConfiguration(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.seatConfigService.saveSeatConfiguration(this.hallId, this.seats()).subscribe({
      next: (_response) => {
        this.saveSuccess.set(true);
        this.hasUnsavedChanges.set(false);
        this.isLoading.set(false);

        // Hide success message after 3 seconds
        setTimeout(() => this.saveSuccess.set(false), 3000);
      },
      error: (err) => {
        console.error('Error saving seats:', err);
        this.errorMessage.set('Failed to save seat configuration');
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Open modal to add/edit shift
   */
  openShiftModal(index: number | null = null): void {
    if (index !== null) {
      const shift = this.shifts()[index];
      this.shiftName.set(shift.name);
      this.shiftStartTime.set(shift.startTime);
      this.shiftEndTime.set(shift.endTime);
      this.editingShiftIndex.set(index);
    } else {
      this.shiftName.set('');
      this.shiftStartTime.set('');
      this.shiftEndTime.set('');
      this.editingShiftIndex.set(null);
    }
    this.showShiftModal.set(true);
  }

  /**
   * Save shift (add or update)
   */
  saveShift(): void {
    const name = this.shiftName().trim();
    const startTime = this.shiftStartTime();
    const endTime = this.shiftEndTime();

    if (!name || !startTime || !endTime) {
      this.errorMessage.set('All shift fields are required');
      return;
    }

    const newShift: Shift = { name, startTime, endTime };
    const editIndex = this.editingShiftIndex();

    let updatedShifts: Shift[];
    if (editIndex !== null) {
      // Update existing shift
      updatedShifts = this.shifts().map((s, i) => (i === editIndex ? newShift : s));
    } else {
      // Add new shift
      updatedShifts = [...this.shifts(), newShift];
    }

    // Validate no overlaps
    if (!this.seatConfigService.validateShiftTimesNoOverlap(updatedShifts)) {
      this.errorMessage.set('Shift times overlap with existing shifts');
      return;
    }

    this.shifts.set(updatedShifts);
    this.hasUnsavedChanges.set(true);
    this.showShiftModal.set(false);
    this.errorMessage.set(null);
  }

  /**
   * Delete shift
   */
  deleteShift(index: number): void {
    const shift = this.shifts()[index];
    if (!confirm(`Are you sure you want to delete shift "${shift.name}"?`)) {
      return;
    }

    const updatedShifts = this.shifts().filter((_, i) => i !== index);
    this.shifts.set(updatedShifts);
    this.hasUnsavedChanges.set(true);
  }

  /**
   * Save shift configuration to backend
   */
  saveShiftConfiguration(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Convert shifts to OpeningHours format
    const openingHours = {
      monday: { open: '09:00', close: '22:00', shifts: this.shifts() },
    };

    this.seatConfigService.saveShiftConfiguration(this.hallId, openingHours).subscribe({
      next: (_response) => {
        this.saveSuccess.set(true);
        this.hasUnsavedChanges.set(false);
        this.isLoading.set(false);

        setTimeout(() => this.saveSuccess.set(false), 3000);
      },
      error: (err) => {
        console.error('Error saving shifts:', err);
        this.errorMessage.set('Failed to save shift configuration');
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Cancel seat editing
   */
  cancelSeatEdit(): void {
    this.selectedSeat.set(null);
    this.editingSeatNumber.set('');
  }
}
