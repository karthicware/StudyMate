import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDrag, CdkDragEnd } from '@angular/cdk/drag-drop';
import { SeatConfigService } from '../../../core/services/seat-config.service';
import { Seat, Shift, SpaceType } from '../../../core/models/seat-config.model';
import { StudyHall } from '../../../core/models/study-hall.model';
import { getSpaceTypeConfig } from '../../../core/utils/space-type-icons';
import { SeatPropertiesPanelComponent } from './seat-properties-panel/seat-properties-panel.component';

/**
 * Seat Map Configuration Component
 * Allows owners to configure seat layout and shift timings
 */
@Component({
  selector: 'app-seat-map-config',
  standalone: true,
  imports: [CommonModule, FormsModule, CdkDrag, SeatPropertiesPanelComponent],
  templateUrl: './seat-map-config.component.html',
  styleUrls: ['./seat-map-config.component.scss'],
})
export class SeatMapConfigComponent implements OnInit {
  private seatConfigService = inject(SeatConfigService);

  // Signals for reactive state management
  studyHalls = signal<StudyHall[]>([]);
  selectedHallId = signal<string | null>(null);
  seats = signal<Seat[]>([]);
  shifts = signal<Shift[]>([]);
  selectedSeat = signal<Seat | null>(null);
  isLoading = signal(false);
  editorDisabled = computed(() => !this.selectedHallId());
  saveSuccess = signal(false);
  errorMessage = signal<string | null>(null);

  // Form inputs for seat/shift management
  newSeatNumber = signal('');
  showSeatModal = signal(false);
  showShiftModal = signal(false);

  // Shift form inputs
  shiftName = signal('');
  shiftStartTime = signal('');
  shiftEndTime = signal('');
  editingShiftIndex = signal<number | null>(null);

  // Canvas dimensions for seat map
  readonly canvasWidth = 800; // Updated to match backend validation
  readonly canvasHeight = 600; // Updated to match backend validation
  readonly gridSize = 10; // Grid snapping in pixels
  readonly seatSize = 50; // Seat dimensions

  // Computed values
  seatCount = computed(() => this.seats().length);
  hasUnsavedChanges = signal(false);

  ngOnInit(): void {
    this.loadStudyHalls();
  }

  /**
   * Load study halls for dropdown
   */
  private loadStudyHalls(): void {
    // TODO: Replace with actual API call when study halls service is available
    // For now, using mock data
    this.studyHalls.set([
      { id: '1', name: 'Main Campus Hall', city: 'Mumbai', basePrice: 200, status: 'active' },
      { id: '2', name: 'Downtown Study Center', city: 'Mumbai', basePrice: 250, status: 'active' },
      { id: '3', name: 'East Side Branch', city: 'Pune', basePrice: 180, status: 'active' },
    ]);
  }

  /**
   * Handle hall selection change
   */
  onHallSelectionChange(hallId: string): void {
    this.selectedHallId.set(hallId);
    this.clearCanvas();
    this.loadSeatConfiguration(hallId);
    this.loadShiftConfiguration(hallId);
  }

  /**
   * Clear canvas when switching halls
   */
  private clearCanvas(): void {
    this.seats.set([]);
    this.selectedSeat.set(null);
    this.hasUnsavedChanges.set(false);
  }

  /**
   * Load existing seat configuration for selected hall
   */
  private loadSeatConfiguration(hallId: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.seatConfigService.getSeatConfiguration(hallId).subscribe({
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
   * Load existing shift configuration for selected hall
   */
  private loadShiftConfiguration(hallId: string): void {
    this.seatConfigService.getShiftConfiguration(hallId).subscribe({
      next: (_openingHours) => {
        const defaultShifts = this.seatConfigService.getDefaultShifts();
        this.shifts.set(defaultShifts);
      },
      error: (err) => {
        console.error('Error loading shifts:', err);
        this.shifts.set(this.seatConfigService.getDefaultShifts());
      },
    });
  }

  /**
   * Handle drag end event for seat positioning
   */
  onSeatDragEnded(event: CdkDragEnd, seat: Seat): void {
    const distance = event.distance;

    // Calculate new position based on drag distance from original position
    let newX = seat.xCoord + distance.x;
    let newY = seat.yCoord + distance.y;

    // Snap to grid
    newX = Math.round(newX / this.gridSize) * this.gridSize;
    newY = Math.round(newY / this.gridSize) * this.gridSize;

    // Ensure seat stays within canvas (accounting for seat size)
    newX = Math.max(0, Math.min(newX, this.canvasWidth - this.seatSize));
    newY = Math.max(0, Math.min(newY, this.canvasHeight - this.seatSize));

    // Update seat coordinates
    const updatedSeats = this.seats().map((s) => {
      if (s.seatNumber === seat.seatNumber) {
        return {
          ...s,
          xCoord: newX,
          yCoord: newY,
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
   * Get space type configuration for visual representation
   */
  getSpaceTypeConfig(spaceType: SpaceType | string | undefined) {
    return getSpaceTypeConfig(spaceType);
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
    if (!this.selectedHallId()) {
      this.errorMessage.set('Please select a hall first');
      return;
    }

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

    // Add seat at default position with default space type
    const newSeat: Seat = {
      seatNumber,
      xCoord: 100,
      yCoord: 100,
      spaceType: 'Cabin', // Default space type
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
  }

  /**
   * Handle seat properties save from properties panel
   */
  onSaveProperties(updatedSeat: Seat): void {
    const updatedSeats = this.seats().map((s) =>
      s.seatNumber === updatedSeat.seatNumber ? updatedSeat : s,
    );

    this.seats.set(updatedSeats);
    this.hasUnsavedChanges.set(true);
    this.selectedSeat.set(null);
    this.errorMessage.set(null);
  }

  /**
   * Handle cancel from properties panel
   */
  onCancelProperties(): void {
    this.selectedSeat.set(null);
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
    const hallId = this.selectedHallId();
    if (!hallId) {
      this.errorMessage.set('Please select a hall first');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.seatConfigService.saveSeatConfiguration(hallId, this.seats()).subscribe({
      next: (_response) => {
        this.saveSuccess.set(true);
        this.hasUnsavedChanges.set(false);
        this.isLoading.set(false);

        // Hide success message after 3 seconds
        setTimeout(() => this.saveSuccess.set(false), 3000);

        // Reload configuration to get server-assigned IDs
        this.loadSeatConfiguration(hallId);
      },
      error: (err) => {
        console.error('Error saving seats:', err);
        this.errorMessage.set(err.error?.message || 'Failed to save seat configuration');
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
    const hallId = this.selectedHallId();
    if (!hallId) {
      this.errorMessage.set('Please select a hall first');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Convert shifts to OpeningHours format
    const openingHours = {
      monday: { open: '09:00', close: '22:00', shifts: this.shifts() },
    };

    this.seatConfigService.saveShiftConfiguration(hallId, openingHours).subscribe({
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
}
