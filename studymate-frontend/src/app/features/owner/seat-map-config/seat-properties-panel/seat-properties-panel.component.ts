import { Component, Input, Output, EventEmitter, OnChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
} from '@angular/forms';
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
        isLadiesOnly: this.seat.isLadiesOnly || false, // NEW: Populate ladies-only field
      });
    }
  }

  private initializeForm(): void {
    this.propertiesForm = this.fb.group({
      seatNumber: [{ value: '', disabled: true }],
      spaceType: ['Cabin', Validators.required],
      customPrice: [null, [this.optionalRangeValidator(50, 1000)]],
      isLadiesOnly: [false], // NEW: Ladies-only checkbox (default false)
    });
  }

  /**
   * Validator for optional numeric fields with min/max range
   * Only validates if value is provided (not null/empty)
   */
  private optionalRangeValidator(min: number, max: number) {
    return (control: AbstractControl) => {
      const value = control.value;

      // Allow null, undefined, or empty string (optional field)
      if (
        value === null ||
        value === undefined ||
        value === '' ||
        (typeof value === 'string' && value.trim() === '')
      ) {
        return null;
      }

      // Apply min/max validation only if value is provided
      const numValue = Number(value);

      // Check if conversion resulted in NaN
      if (isNaN(numValue)) {
        return { invalid: { value } };
      }

      if (numValue < min) {
        return { min: { min, actual: numValue } };
      }
      if (numValue > max) {
        return { max: { max, actual: numValue } };
      }

      return null;
    };
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
      isLadiesOnly: !!formValue.isLadiesOnly, // NEW: Include ladies-only in save (always boolean)
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
