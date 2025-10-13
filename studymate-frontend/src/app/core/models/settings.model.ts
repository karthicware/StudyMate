/**
 * Owner Settings Model
 *
 * Defines the structure for owner settings data including
 * notification preferences, system settings, and privacy options.
 */
export interface OwnerSettings {
  // Notification Channels
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;

  // Notification Types
  notificationBooking: boolean;
  notificationPayment: boolean;
  notificationSystem: boolean;

  // System Preferences
  language: string;
  timezone: string;
  defaultView: string;

  // Privacy Settings
  profileVisibility: string;
}

/**
 * Settings Update Request
 * Allows partial updates to settings
 */
export type SettingsUpdateRequest = Partial<OwnerSettings>;
