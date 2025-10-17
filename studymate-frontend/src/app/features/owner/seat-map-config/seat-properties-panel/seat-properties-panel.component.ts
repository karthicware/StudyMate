import { Component, Input, Output, EventEmitter, OnChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Seat, SpaceType } from '../../../../core/models/seat-config.model';

/**
 * Seat Properties Panel Component
 * Presentational component for editing seat properties
 */
@Component({
  selector: 'app-seat-properties-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './seat-properties-panel.component.html',
  styleUrls: ['./seat-properties-panel.component.scss'],
})
export class SeatPropertiesPanelComponent implements OnChanges {
  @Input() seat: Seat | null = null;
  @Output() saveProperties = new EventEmitter<Seat>();
  @Output() cancel = new EventEmitter<void>();

  propertiesForm!: FormGroup;
  errorMessage = signal<string | null>(null);

  // Space type options
  readonly spaceTypes: SpaceType[] = [
    'Cabin',
    'Seat Row',
    '4-Person Table',
    'Study Pod',
    'Meeting Room',
    'Lounge Area',
  ];

  constructor(private fb: FormBuilder) {
    this.initializeForm();
  }

  ngOnChanges(): void {
    if (this.seat) {
      this.propertiesForm.patchValue({
        seatNumber: this.seat.seatNumber,
        spaceType: this.seat.spaceType || 'Cabin',
        customPrice: this.seat.customPrice || null,
      });
    }
  }

  private initializeForm(): void {
    this.propertiesForm = this.fb.group({
      seatNumber: [{ value: '', disabled: true }],
      spaceType: ['Cabin', Validators.required],
      customPrice: [null, [Validators.min(50), Validators.max(1000)]],
    });
  }

  /**
   * Save seat properties
   */
  onSave(): void {
    if (!this.seat) {
      this.errorMessage.set('No seat selected');
      return;
    }

    if (this.propertiesForm.invalid) {
      this.errorMessage.set('Please fix validation errors');
      return;
    }

    const formValue = this.propertiesForm.value;
    const updatedSeat: Seat = {
      ...this.seat,
      spaceType: formValue.spaceType,
      customPrice: formValue.customPrice || undefined,
    };

    this.errorMessage.set(null);
    this.saveProperties.emit(updatedSeat);
  }

  /**
   * Cancel editing
   */
  onCancel(): void {
    this.errorMessage.set(null);
    this.cancel.emit();
  }

  /**
   * Get validation error message for custom price
   */
  get customPriceError(): string | null {
    const control = this.propertiesForm.get('customPrice');
    if (control?.hasError('min')) {
      return 'Price must be at least ₹50';
    }
    if (control?.hasError('max')) {
      return 'Price cannot exceed ₹1000';
    }
    return null;
  }
}
