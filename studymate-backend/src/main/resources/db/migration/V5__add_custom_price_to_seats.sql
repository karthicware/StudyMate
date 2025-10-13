-- Add custom_price column to seats table
ALTER TABLE seats ADD COLUMN IF NOT EXISTS custom_price DECIMAL(10, 2);

-- Add comment to explain the column
COMMENT ON COLUMN seats.custom_price IS 'Optional custom price for premium seats, overrides base hall price';
