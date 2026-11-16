-- Marketplace subcategory classification
-- Sellers pick a subcategory (e.g. Fashion → "Women's Clothing", "Children's Clothing", ...)
-- The app gracefully falls back when the column is missing, but run this to persist it.
ALTER TABLE bazaar_products ADD COLUMN subcategory VARCHAR(150) DEFAULT NULL AFTER category;