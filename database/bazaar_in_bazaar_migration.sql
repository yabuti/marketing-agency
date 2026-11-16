-- Marketplace / Bazaar split
-- in_bazaar = 1 → product also appears in the scheduled Bazaar window
-- in_bazaar = 0 → product only appears on the always-open Market page
ALTER TABLE bazaar_products ADD COLUMN in_bazaar TINYINT(1) NOT NULL DEFAULT 1;
