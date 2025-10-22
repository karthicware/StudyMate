import { SpaceType } from '../models/seat-config.model';

/**
 * Space Type Visual Configuration
 * Provides icons, colors, and visual styling for different space types
 */

export interface SpaceTypeConfig {
  icon: string; // Fallback emoji
  imageUrl: string; // Image URL for photo representation
  color: string; // Tailwind color class
  bgColor: string; // Background color class
  borderColor: string; // Border color class
  label: string;
}

export const SPACE_TYPE_CONFIGS: Record<SpaceType, SpaceTypeConfig> = {
  Cabin: {
    icon: '🚪',
    imageUrl:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&h=400&fit=crop&crop=focalpoint&fp-x=0.5&fp-y=0.4',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    label: 'Cabin',
  },
  'Seat Row': {
    icon: '💺',
    imageUrl:
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&h=400&fit=crop&crop=focalpoint&fp-x=0.5&fp-y=0.5',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    label: 'Seat Row',
  },
  '4-Person Table': {
    icon: '🪑',
    imageUrl:
      'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=400&h=400&fit=crop&crop=focalpoint&fp-x=0.5&fp-y=0.3',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    label: '4-Person Table',
  },
  'Study Pod': {
    icon: '📚',
    imageUrl:
      'https://images.unsplash.com/photo-1577412647305-991150c7d163?w=400&h=400&fit=crop&crop=focalpoint&fp-x=0.5&fp-y=0.4',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-300',
    label: 'Study Pod',
  },
  'Meeting Room': {
    icon: '🏢',
    imageUrl:
      'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=400&h=400&fit=crop&crop=focalpoint&fp-x=0.5&fp-y=0.3',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-300',
    label: 'Meeting Room',
  },
  'Lounge Area': {
    icon: '🛋️',
    imageUrl:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=focalpoint&fp-x=0.5&fp-y=0.5',
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
