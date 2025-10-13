-- V10__add_soft_delete_to_users.sql
-- Add soft delete support to users table
-- Created: 2025-10-13

-- Add deleted_at column for soft delete
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL;

-- Create index on deleted_at for performance (filtering active users)
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;

-- Add hall_id to users for students/staff association with a study hall
ALTER TABLE users ADD COLUMN hall_id BIGINT REFERENCES study_halls(id) ON DELETE SET NULL;

-- Create index on hall_id for filtering users by hall
CREATE INDEX idx_users_hall_id ON users(hall_id);
