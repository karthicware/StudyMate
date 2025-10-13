import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OwnerSettings, SettingsUpdateRequest } from '../models/settings.model';

/**
 * SettingsService
 *
 * Handles all settings-related HTTP operations for owner settings management.
 * Integrates with backend API endpoints for fetching, updating, and restoring defaults.
 */
@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private http = inject(HttpClient);
  private readonly apiUrl = '/api/v1/owner/settings';

  /**
   * Fetches the current owner's settings data
   * @returns Observable of OwnerSettings
   */
  getSettings(): Observable<OwnerSettings> {
    return this.http.get<OwnerSettings>(this.apiUrl);
  }

  /**
   * Updates the owner's settings (supports partial updates)
   * @param settings - Updated settings data (partial)
   * @returns Observable of updated OwnerSettings
   */
  updateSettings(settings: SettingsUpdateRequest): Observable<OwnerSettings> {
    return this.http.put<OwnerSettings>(this.apiUrl, settings);
  }

  /**
   * Restores all settings to default values
   * @returns Observable of default OwnerSettings
   */
  restoreDefaults(): Observable<OwnerSettings> {
    return this.http.post<OwnerSettings>(`${this.apiUrl}/restore-defaults`, {});
  }
}
