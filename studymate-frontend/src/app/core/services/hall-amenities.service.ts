import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HallAmenities, UpdateHallAmenitiesRequest } from '../models/hall-amenities.model';
import { environment } from '../../../environments/environment';

/**
 * Hall Amenities Service
 *
 * Service for managing hall amenities configuration (AC, Wi-Fi)
 * Story: 1.22 - Hall Amenities Configuration UI (Frontend)
 */
@Injectable({
  providedIn: 'root'
})
export class HallAmenitiesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/owner/halls`;

  /**
   * Get hall amenities configuration
   * @param hallId - The hall ID
   * @returns Observable of HallAmenities DTO
   */
  getHallAmenities(hallId: string): Observable<HallAmenities> {
    return this.http.get<HallAmenities>(`${this.apiUrl}/${hallId}/amenities`);
  }

  /**
   * Update hall amenities configuration
   * @param hallId - The hall ID
   * @param amenities - Array of amenity codes (["AC", "WiFi"])
   * @returns Observable of HallAmenities DTO
   */
  updateHallAmenities(hallId: string, amenities: string[]): Observable<HallAmenities> {
    const request: UpdateHallAmenitiesRequest = { amenities };
    return this.http.put<HallAmenities>(`${this.apiUrl}/${hallId}/amenities`, request);
  }
}
