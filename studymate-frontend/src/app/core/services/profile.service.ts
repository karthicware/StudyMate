import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OwnerProfile, OwnerProfileUpdateRequest } from '../models/profile.model';

/**
 * ProfileService
 *
 * Handles all profile-related HTTP operations for owner profile management.
 * Integrates with backend API endpoints for fetching, updating, and avatar upload.
 */
@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private http = inject(HttpClient);
  private readonly apiUrl = '/api/v1/owner/profile';

  /**
   * Fetches the current owner's profile data
   * @returns Observable of OwnerProfile
   */
  getProfile(): Observable<OwnerProfile> {
    return this.http.get<OwnerProfile>(this.apiUrl);
  }

  /**
   * Updates the owner's profile information
   * @param profile - Updated profile data
   * @returns Observable of updated OwnerProfile
   */
  updateProfile(profile: OwnerProfileUpdateRequest): Observable<OwnerProfile> {
    return this.http.put<OwnerProfile>(this.apiUrl, profile);
  }

  /**
   * Uploads a new profile avatar image
   * @param file - Avatar image file (JPG, PNG, WEBP, max 5MB)
   * @returns Observable with uploaded image URL
   */
  uploadAvatar(file: File): Observable<{ profilePictureUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http.post<{ profilePictureUrl: string }>(`${this.apiUrl}/avatar`, formData);
  }
}
