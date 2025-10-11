-- V2__add_user_account_status.sql
-- Add account status fields to users table for authentication
-- Story 0.20: User Entity and Repository enhancements
-- Created: 2025-10-11

-- Add enabled column (for account activation)
ALTER TABLE users
ADD COLUMN enabled BOOLEAN NOT NULL DEFAULT true;

-- Add locked column (for security/account locking)
ALTER TABLE users
ADD COLUMN locked BOOLEAN NOT NULL DEFAULT false;

-- Update role values to include ROLE_ prefix for Spring Security
UPDATE users SET role = 'ROLE_' || role WHERE role NOT LIKE 'ROLE_%';

-- Update CHECK constraint for role to accept ROLE_ prefix
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users
ADD CONSTRAINT users_role_check
CHECK (role IN ('ROLE_OWNER', 'ROLE_STUDENT'));

-- Create index for enabled users (for performance)
CREATE INDEX idx_users_enabled ON users(enabled) WHERE enabled = true;

-- Comments
COMMENT ON COLUMN users.enabled IS 'Whether the user account is enabled/active';
COMMENT ON COLUMN users.locked IS 'Whether the user account is locked (for security)';
