-- Database initialization script
-- Run this script to set up the URL shortener database

-- STEP 1: First, create the database (if it doesn't exist)
-- Run this command separately as postgres superuser:
-- CREATE DATABASE urlshortener;

-- STEP 2: Connect to the database
-- \c urlshortener

-- STEP 3: Drop existing objects if recreating
DROP TRIGGER IF EXISTS update_urls_updated_at ON urls;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP INDEX IF EXISTS idx_short_code;
DROP TABLE IF EXISTS urls;

-- STEP 4: Create the urls table
CREATE TABLE urls (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    short_code VARCHAR(10) UNIQUE NOT NULL,
    access_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- STEP 5: Create index for faster lookups by short_code
CREATE INDEX idx_short_code ON urls(short_code);

-- STEP 6: Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 7: Create trigger to call the function on UPDATE
CREATE TRIGGER update_urls_updated_at
    BEFORE UPDATE ON urls
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- STEP 8: Verify table creation
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'urls'
ORDER BY ordinal_position;
