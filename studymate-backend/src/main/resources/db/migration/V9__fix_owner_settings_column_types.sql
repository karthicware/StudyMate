-- V9__fix_owner_settings_column_types.sql
-- Fix schema validation error: Change id and owner_id from integer to bigint
-- This aligns the database schema with the Java entity (Long type maps to bigint)

-- Change id from SERIAL (integer) to BIGSERIAL (bigint)
ALTER TABLE owner_settings
ALTER COLUMN id TYPE BIGINT;

-- Update the sequence to bigint as well
ALTER SEQUENCE owner_settings_id_seq AS BIGINT;

-- Change owner_id from INTEGER to BIGINT to match users.id type
ALTER TABLE owner_settings
ALTER COLUMN owner_id TYPE BIGINT;

-- Add comment explaining the fix
COMMENT ON COLUMN owner_settings.id IS 'Primary key (bigint to match Java Long type)';
COMMENT ON COLUMN owner_settings.owner_id IS 'Foreign key to users.id (bigint to match Java Long type)';
