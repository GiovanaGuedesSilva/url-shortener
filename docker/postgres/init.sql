-- Docker initialization script
-- Runs automatically on first container start (empty volume)

CREATE TABLE IF NOT EXISTS urls (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    short_code VARCHAR(10) UNIQUE NOT NULL,
    access_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_short_code ON urls(short_code);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_urls_updated_at'
    ) THEN
        CREATE TRIGGER update_urls_updated_at
            BEFORE UPDATE ON urls
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END;
$$;
