import { SpaceType } from '../models/seat-config.model';

/**
 * Space Type Visual Configuration
 * Provides icons, colors, and visual styling for different space types
 */

export interface SpaceTypeConfig {
  icon: string; // SVG path or emoji
  color: string; // Tailwind color class
  bgColor: string; // Background color class
  borderColor: string; // Border color class
  label: string;
}

export const SPACE_TYPE_CONFIGS: Record<SpaceType, SpaceTypeConfig> = {
  Cabin: {
    icon: '🚪',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    label: 'Cabin',
  },
  'Seat Row': {
    icon: '💺',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    label: 'Seat Row',
  },
  '4-Person Table': {
    icon: '🪑',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    label: '4-Person Table',
  },
  'Study Pod': {
    icon: '📚',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-300',
    label: 'Study Pod',
  },
  'Meeting Room': {
    icon: '🏢',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-300',
    label: 'Meeting Room',
  },
  'Lounge Area': {
    icon: '🛋️',
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    borderColor: 'border-pink-300',
    label: 'Lounge Area',
  },
};

/**
 * Get visual configuration for a space type
 */
export function getSpaceTypeConfig(spaceType: SpaceType | string | undefined): SpaceTypeConfig {
  return SPACE_TYPE_CONFIGS[(spaceType as SpaceType) || 'Cabin'];
}

/**
 * Get all space type options for dropdowns
 */
export function getAllSpaceTypes(): SpaceType[] {
  return Object.keys(SPACE_TYPE_CONFIGS) as SpaceType[];
}
