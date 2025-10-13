-- V8__add_auth_fields_and_owner_profiles.sql
-- Add authentication fields to users table and create owner_profiles table
-- For Story 0.1.1-backend: Owner Registration API Implementation

-- Add missing authentication and account management fields to users table
ALTER TABLE users
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN verification_token VARCHAR(255),
ADD COLUMN verification_expiry TIMESTAMP,
ADD COLUMN last_login TIMESTAMP,
ADD COLUMN account_status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (account_status IN ('ACTIVE', 'SUSPENDED', 'LOCKED', 'DELETED')),
ADD COLUMN failed_login_attempts INT DEFAULT 0,
ADD COLUMN lockout_until TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update existing role values to match enum (remove ROLE_ prefix if needed for consistency)
-- Note: Keeping existing ROLE_ prefix for backward compatibility

-- Create owner_profiles table
CREATE TABLE owner_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    business_registration_number VARCHAR(100),
    tax_id VARCHAR(100),
    verification_status VARCHAR(50) DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    verification_documents JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_owner_profiles_user_id ON owner_profiles(user_id);
CREATE INDEX idx_owner_profiles_verification_status ON owner_profiles(verification_status);
CREATE INDEX idx_users_email_verified ON users(email_verified) WHERE email_verified = false;
CREATE INDEX idx_users_account_status ON users(account_status);

-- Add comments for documentation
COMMENT ON COLUMN users.email_verified IS 'Whether user email has been verified';
COMMENT ON COLUMN users.verification_token IS 'Token for email verification';
COMMENT ON COLUMN users.verification_expiry IS 'Expiry time for verification token';
COMMENT ON COLUMN users.last_login IS 'Timestamp of last successful login';
COMMENT ON COLUMN users.account_status IS 'Account status: ACTIVE, SUSPENDED, LOCKED, or DELETED';
COMMENT ON COLUMN users.failed_login_attempts IS 'Number of consecutive failed login attempts';
COMMENT ON COLUMN users.lockout_until IS 'Timestamp until which account is locked';

COMMENT ON TABLE owner_profiles IS 'Profile information for study hall owners';
COMMENT ON COLUMN owner_profiles.business_name IS 'Name of the owner business/study hall';
COMMENT ON COLUMN owner_profiles.verification_status IS 'Verification status of owner account';
