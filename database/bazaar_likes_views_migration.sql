-- Views + likes counters for bazaar products
-- NOTE: If you have already run an older version, ignore "duplicate column" errors.
ALTER TABLE bazaar_products ADD COLUMN views INT NOT NULL DEFAULT 0;
ALTER TABLE bazaar_products ADD COLUMN likes INT NOT NULL DEFAULT 0;
