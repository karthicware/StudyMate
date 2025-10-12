import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  SeatConfigRequest,
  SeatConfigResponse,
  ShiftConfigRequest,
  ShiftConfigResponse,
  Seat,
  OpeningHours,
} from '../models/seat-config.model';
import { environment } from '../../../environments/environment';

/**
 * Service for managing seat configuration and shift timing
 */
@Injectable({
  providedIn: 'root',
})
export class SeatConfigService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/owner`;

  /**
   * Save seat configuration for a hall
   * @param hallId - The hall ID
   * @param seats - Array of seat configurations
   * @returns Observable of the save response
   */
  saveSeatConfiguration(hallId: string, seats: Seat[]): Observable<SeatConfigResponse> {
    const request: SeatConfigRequest = { seats };
    return this.http.post<SeatConfigResponse>(`${this.apiUrl}/seats/config/${hallId}`, request);
  }

  /**
   * Get seat configuration for a hall
   * @param hallId - The hall ID
   * @returns Observable of seats array
   */
  getSeatConfiguration(hallId: string): Observable<Seat[]> {
    return this.http.get<Seat[]>(`${this.apiUrl}/seats/config/${hallId}`);
  }

  /**
   * Delete a specific seat
   * @param hallId - The hall ID
   * @param seatId - The seat ID to delete
   * @returns Observable of the delete response
   */
  deleteSeat(hallId: string, seatId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/seats/${hallId}/${seatId}`,
    );
  }

  /**
   * Save shift timing configuration
   * @param hallId - The hall ID
   * @param openingHours - Opening hours configuration
   * @returns Observable of the save response
   */
  saveShiftConfiguration(
    hallId: string,
    openingHours: OpeningHours,
  ): Observable<ShiftConfigResponse> {
    const request: ShiftConfigRequest = { hallId, openingHours };
    return this.http.post<ShiftConfigResponse>(`${this.apiUrl}/shifts/config/${hallId}`, request);
  }

  /**
   * Get shift timing configuration for a hall
   * @param hallId - The hall ID
   * @returns Observable of opening hours
   */
  getShiftConfiguration(hallId: string): Observable<OpeningHours> {
    return this.http.get<OpeningHours>(`${this.apiUrl}/shifts/config/${hallId}`);
  }

  /**
   * Validate seat number uniqueness within a hall
   * @param seatNumber - Seat number to validate
   * @param existingSeats - Current seats array
   * @param excludeSeatId - Optional seat ID to exclude from validation (for edits)
   * @returns true if unique, false otherwise
   */
  validateSeatNumberUnique(
    seatNumber: string,
    existingSeats: Seat[],
    excludeSeatId?: string,
  ): boolean {
    return !existingSeats.some(
      (seat) => seat.seatNumber === seatNumber && (!excludeSeatId || seat.id !== excludeSeatId),
    );
  }

  /**
   * Validate shift times don't overlap
   * @param shifts - Array of shifts to validate
   * @returns true if valid (no overlaps), false otherwise
   */
  validateShiftTimesNoOverlap(shifts: { startTime: string; endTime: string }[]): boolean {
    for (let i = 0; i < shifts.length; i++) {
      for (let j = i + 1; j < shifts.length; j++) {
        const shift1Start = this.timeToMinutes(shifts[i].startTime);
        const shift1End = this.timeToMinutes(shifts[i].endTime);
        const shift2Start = this.timeToMinutes(shifts[j].startTime);
        const shift2End = this.timeToMinutes(shifts[j].endTime);

        // Check for overlap
        if (
          (shift1Start < shift2End && shift1End > shift2Start) ||
          (shift2Start < shift1End && shift2End > shift1Start)
        ) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Convert time string (HH:mm) to minutes since midnight
   * @param time - Time string in HH:mm format
   * @returns Minutes since midnight
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Get default shifts for initial setup
   * @returns Default shift configuration
   */
  getDefaultShifts(): { name: string; startTime: string; endTime: string }[] {
    return [
      { name: 'Morning', startTime: '06:00', endTime: '12:00' },
      { name: 'Afternoon', startTime: '12:00', endTime: '18:00' },
      { name: 'Evening', startTime: '18:00', endTime: '22:00' },
    ];
  }
}
