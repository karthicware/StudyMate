-- Create owner_settings table for managing owner preferences
-- Story: 1.21 - Owner Settings API Implementation
-- Description: Table stores notification preferences, UI settings, and other owner-specific configurations

CREATE TABLE owner_settings (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Notification preferences
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    push_notifications BOOLEAN DEFAULT TRUE,
    notification_booking BOOLEAN DEFAULT TRUE,
    notification_payment BOOLEAN DEFAULT TRUE,
    notification_system BOOLEAN DEFAULT TRUE,

    -- UI and language preferences
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    default_view VARCHAR(20) DEFAULT 'dashboard',
    profile_visibility VARCHAR(20) DEFAULT 'public',

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    UNIQUE(owner_id)
);

-- Create index for faster lookups by owner_id
CREATE INDEX idx_owner_settings_owner_id ON owner_settings(owner_id);

-- Add comment
COMMENT ON TABLE owner_settings IS 'Stores owner-specific settings and preferences including notifications, UI settings, and language preferences';
