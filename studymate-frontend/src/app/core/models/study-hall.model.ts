/**
 * Study Hall Models
 */

export interface StudyHall {
  id: string;
  name: string;
  address?: string;
  city?: string;
  basePrice?: number;
  status?: 'active' | 'inactive';
}
