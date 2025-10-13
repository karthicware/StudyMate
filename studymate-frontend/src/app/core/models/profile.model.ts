/**
 * Profile Model
 *
 * Represents owner profile data structure
 */

export interface OwnerProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profilePictureUrl?: string;
  studyHallName: string;
  createdAt: string;
}

export interface OwnerProfileUpdateRequest {
  firstName: string;
  lastName: string;
  phone?: string;
}
