/**
 * Hall Data Models
 *
 * Comprehensive data models for study hall management including creation,
 * updates, and listing operations.
 */

/**
 * Main Hall interface representing a complete study hall entity
 */
export interface Hall {
  id: string;
  ownerId: string;
  hallName: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
  status: HallStatus;
  basePricing?: number;
  latitude?: number;
  longitude?: number;
  region?: string;
  seatCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Hall status enum
 * DRAFT - Initial state after creation during onboarding
 * ACTIVE - Hall is published and accepting bookings
 * INACTIVE - Hall is temporarily not accepting bookings
 */
export type HallStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE';

/**
 * Request payload for creating a new hall
 * Used by POST /owner/halls endpoint
 */
export interface HallCreateRequest {
  hallName: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
}

/**
 * Summary information for hall in list views
 * Used by GET /owner/halls endpoint response
 */
export interface HallSummary {
  id: string;
  hallName: string;
  status: HallStatus;
  city: string;
  createdAt: Date;
}

/**
 * Response from GET /owner/halls endpoint
 * Contains list of halls owned by authenticated user
 */
export interface HallListResponse {
  halls: HallSummary[];
}

/**
 * Supported countries for hall creation
 */
export const SUPPORTED_COUNTRIES = [
  'India',
  'USA',
  'UK',
  'Canada',
  'Australia',
  'Singapore',
  'UAE',
  'Germany',
  'France',
  'Japan',
] as const;

export type SupportedCountry = (typeof SUPPORTED_COUNTRIES)[number];
