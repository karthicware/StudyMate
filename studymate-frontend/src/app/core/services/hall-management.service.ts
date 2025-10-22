import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Hall, HallCreateRequest, HallListResponse, HallSummary } from '../models/hall.model';
import { environment } from '../../../environments/environment';

/**
 * Service for managing study hall operations
 *
 * Handles CRUD operations for study halls including:
 * - Creating new halls during onboarding
 * - Fetching owner's halls list
 * - Updating hall details
 * - Managing hall status (DRAFT, ACTIVE, INACTIVE)
 */
@Injectable({ providedIn: 'root' })
export class HallManagementService {
  private http = inject(HttpClient);
  // Use /api prefix for dev/unit tests (proxy handles routing), full URL for E2E tests
  private readonly API_URL = environment.apiBaseUrl
    ? `${environment.apiBaseUrl}/owner/halls`  // E2E: 'http://localhost:8081/owner/halls'
    : '/api/owner/halls';                       // Dev/Unit: '/api/owner/halls' -> proxy rewrites to '/owner/halls'

  /**
   * Create a new study hall
   *
   * @param hallData - Hall creation request with required fields
   * @returns Observable<Hall> - Created hall with generated ID and DRAFT status
   *
   * @throws HttpErrorResponse
   * - 400 Bad Request: Validation errors (missing required fields, invalid format)
   * - 401 Unauthorized: Missing or invalid JWT token
   * - 409 Conflict: Hall name already exists for this owner
   */
  createHall(hallData: HallCreateRequest): Observable<Hall> {
    return this.http.post<Hall>(this.API_URL, hallData).pipe(
      map((response) => ({
        ...response,
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
      })),
      catchError(this.handleError),
    );
  }

  /**
   * Get all study halls for authenticated owner
   *
   * @returns Observable<HallSummary[]> - List of owner's halls with summary info
   *
   * @throws HttpErrorResponse
   * - 401 Unauthorized: Missing or invalid JWT token
   */
  getOwnerHalls(): Observable<HallSummary[]> {
    return this.http.get<HallListResponse>(this.API_URL).pipe(
      map((response) =>
        response.halls.map((hall) => ({
          ...hall,
          createdAt: new Date(hall.createdAt),
        })),
      ),
      catchError(this.handleError),
    );
  }

  /**
   * Get hall details by ID
   *
   * @param hallId - UUID of the hall
   * @returns Observable<Hall> - Complete hall details
   *
   * @throws HttpErrorResponse
   * - 401 Unauthorized: Missing or invalid JWT token
   * - 404 Not Found: Hall not found or not owned by current user
   */
  getHallById(hallId: string): Observable<Hall> {
    return this.http.get<Hall>(`${this.API_URL}/${hallId}`).pipe(
      map((response) => ({
        ...response,
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
      })),
      catchError(this.handleError),
    );
  }

  /**
   * Update hall details
   *
   * @param hallId - UUID of the hall to update
   * @param hallData - Partial hall data to update
   * @returns Observable<Hall> - Updated hall details
   *
   * @throws HttpErrorResponse
   * - 400 Bad Request: Validation errors
   * - 401 Unauthorized: Missing or invalid JWT token
   * - 404 Not Found: Hall not found or not owned by current user
   * - 409 Conflict: Hall name already exists for this owner
   */
  updateHall(hallId: string, hallData: Partial<HallCreateRequest>): Observable<Hall> {
    return this.http.put<Hall>(`${this.API_URL}/${hallId}`, hallData).pipe(
      map((response) => ({
        ...response,
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
      })),
      catchError(this.handleError),
    );
  }

  /**
   * Delete hall by ID
   *
   * @param hallId - UUID of the hall to delete
   * @returns Observable<void>
   *
   * @throws HttpErrorResponse
   * - 401 Unauthorized: Missing or invalid JWT token
   * - 404 Not Found: Hall not found or not owned by current user
   */
  deleteHall(hallId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${hallId}`).pipe(catchError(this.handleError));
  }

  /**
   * Error handler for HTTP operations
   *
   * @param error - HttpErrorResponse from API
   * @returns Observable<never> - Throws error with user-friendly message
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Network error: ${error.error.message}`;
    } else {
      // Backend returned an unsuccessful response code
      switch (error.status) {
        case 400:
          errorMessage =
            error.error?.message || 'Invalid input. Please check your form and try again.';
          break;
        case 401:
          errorMessage = 'Unauthorized. Please log in again.';
          break;
        case 403:
          errorMessage = 'You are not authorized to perform this action.';
          break;
        case 404:
          errorMessage = 'Hall not found.';
          break;
        case 409:
          errorMessage = error.error?.message || 'A hall with this name already exists.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = `Error: ${error.message}`;
      }
    }

    console.error('HallManagementService error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
