/**
 * Seat Configuration Models
 * Defines data structures for seat map configuration and shift timing management
 */

/**
 * Represents a seat in the configuration system
 */
export interface Seat {
  id?: string;
  hallId?: string;
  seatNumber: string;
  xCoord: number;
  yCoord: number;
  status?: 'available' | 'booked' | 'locked' | 'maintenance';
  customPrice?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Request payload for saving seat configuration
 */
export interface SeatConfigRequest {
  seats: Seat[];
}

/**
 * Response from seat configuration save operation
 */
export interface SeatConfigResponse {
  success: boolean;
  message: string;
  seats: Seat[];
  seatCount: number;
}

/**
 * Represents a shift timing configuration
 */
export interface Shift {
  id?: string;
  name: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

/**
 * Opening hours configuration stored in study_halls.opening_hours (JSONB)
 */
export type OpeningHours = Record<string, DaySchedule>;

/**
 * Daily schedule with shifts
 */
export interface DaySchedule {
  open: string;
  close: string;
  shifts?: Shift[];
}

/**
 * Request payload for saving shift configuration
 */
export interface ShiftConfigRequest {
  hallId: string;
  openingHours: OpeningHours;
}

/**
 * Response from shift configuration save operation
 */
export interface ShiftConfigResponse {
  success: boolean;
  message: string;
  openingHours: OpeningHours;
}

/**
 * Validation error response
 */
export interface ValidationError {
  field: string;
  message: string;
}
