/**
 * Hall Amenities Model
 *
 * Interfaces for hall amenities configuration
 * Story: 1.22 - Hall Amenities Configuration UI (Frontend)
 */

/**
 * Hall Amenities DTO
 * Response from GET /owner/halls/{hallId}/amenities
 */
export interface HallAmenities {
  hallId: string;
  hallName: string;
  amenities: string[];  // ["AC", "WiFi"]
}

/**
 * Update Hall Amenities Request DTO
 * Request body for PUT /owner/halls/{hallId}/amenities
 */
export interface UpdateHallAmenitiesRequest {
  amenities: string[];  // ["AC", "WiFi"]
}
