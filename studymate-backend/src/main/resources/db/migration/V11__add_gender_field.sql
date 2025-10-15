-- V11: Add gender field to users table for ladies-only seat validation
-- Sprint Change Proposal A: Ladies-Only Seats Configuration
-- Story: 0.1.5-backend - Add Gender Field to User Registration (Backend)

-- Add gender column with CHECK constraint
ALTER TABLE users ADD COLUMN gender VARCHAR(20)
  CHECK (gender IN ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'));

-- Create index for gender-based queries
CREATE INDEX idx_users_gender ON users(gender);

-- Add column documentation
COMMENT ON COLUMN users.gender IS 'User gender for ladies-only seat booking validation (optional field). NULL allowed for users who prefer not to specify.';
