-- V6__add_phone_and_profile_picture_to_users.sql
-- Add phone and profile_picture_url columns to users table for owner profile management

ALTER TABLE users
ADD COLUMN phone VARCHAR(20),
ADD COLUMN profile_picture_url VARCHAR(500);

-- Add comment for documentation
COMMENT ON COLUMN users.phone IS 'User phone number (optional)';
COMMENT ON COLUMN users.profile_picture_url IS 'URL to user profile picture/avatar';
