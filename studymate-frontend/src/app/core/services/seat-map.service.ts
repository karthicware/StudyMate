import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, switchMap, startWith } from 'rxjs';
import { Seat } from '../models/seat-config.model';

/**
 * Response structure for seat map data
 */
export interface SeatMapResponse {
  seats: Seat[];
}

/**
 * Service for fetching and managing seat map visualization data
 */
@Injectable({
  providedIn: 'root'
})
export class SeatMapService {
  private http = inject(HttpClient);
  private readonly apiUrl = '/api/owner/seats';

  /**
   * Fetch all seats for a specific hall
   * @param hallId - UUID of the study hall
   * @returns Observable of seat map response
   */
  getSeats(hallId: string): Observable<SeatMapResponse> {
    return this.http.get<SeatMapResponse>(`${this.apiUrl}/${hallId}`);
  }

  /**
   * Get seats with automatic polling for real-time updates
   * @param hallId - UUID of the study hall
   * @param pollingInterval - Interval in milliseconds (default: 10000ms = 10s)
   * @returns Observable that emits seat data at regular intervals
   */
  getSeatsWithPolling(hallId: string, pollingInterval: number = 10000): Observable<SeatMapResponse> {
    return interval(pollingInterval).pipe(
      startWith(0), // Emit immediately on subscription
      switchMap(() => this.getSeats(hallId))
    );
  }
}
