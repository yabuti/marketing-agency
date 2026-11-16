-- =============================================================================
-- UNIFY EVERYTHING TO THE 8 CANONICAL BAZAAR CATEGORIES
-- Single source of truth for the home "Shop by Category" grid, bazaar/market
-- filters, seller product form, buyer views and admin dropdowns:
--
--   1. Handmade Crafts   2. Fashion          3. Food & Beverage
--   4. Beauty & Health   5. Home & Living    6. Sports & Outdoors
--   7. Books & Media     8. Services
--
-- Remaps EVERY bazaar_products.category value (including legacy/alt names like
-- "Food & Beverages", "Clothing & Fashion", "Toys & Kids", ...) onto the
-- canonical 8, then empties bazaar_categories and re-seeds exactly the 8.
-- Run this against the project database (DB_NAME in php-backend/.env).
-- Safe to run more than once. Existing products are NEVER deleted.
-- =============================================================================

-- ── 1. Normalize existing product categories (products are never deleted) ──
UPDATE `bazaar_products` SET `category` = 'Food & Beverage'
  WHERE LOWER(`category`) IN (
    'food & beverages', 'food & beverage', 'food', 'agriculture & farm',
    'agriculture', 'beverage', 'food and beverages'
  );

UPDATE `bazaar_products` SET `category` = 'Fashion'
  WHERE LOWER(`category`) IN (
    'clothing & fashion', 'fashion', 'clothing', 'fashion and clothing'
  );

UPDATE `bazaar_products` SET `category` = 'Handmade Crafts'
  WHERE LOWER(`category`) IN (
    'handmade crafts', 'handicrafts', 'crafts', 'handcraft', 'art & crafts', 'craft'
  );

UPDATE `bazaar_products` SET `category` = 'Home & Living'
  WHERE LOWER(`category`) IN (
    'furniture & home', 'home & living', 'home', 'furniture', 'living',
    'toys & kids', 'toys', 'kids', 'children',
    'construction & hardware', 'construction', 'hardware'
  );

UPDATE `bazaar_products` SET `category` = 'Beauty & Health'
  WHERE LOWER(`category`) IN (
    'beauty & personal care', 'beauty & health', 'beauty & personal',
    'health & wellness', 'beauty', 'health', 'personal'
  );

UPDATE `bazaar_products` SET `category` = 'Books & Media'
  WHERE LOWER(`category`) IN ('books & stationery', 'books & media', 'books');

UPDATE `bazaar_products` SET `category` = 'Sports & Outdoors'
  WHERE LOWER(`category`) IN ('sports & fitness', 'sports & outdoors', 'sports');

UPDATE `bazaar_products` SET `category` = 'Services'
  WHERE LOWER(`category`) IN ('services', 'automotive', 'other');

-- ── 2. Replace the categories list with EXACTLY the canonical 8 ───────────
DELETE FROM `bazaar_categories`;

INSERT INTO `bazaar_categories` (`name`, `image`, `sort_order`) VALUES
  ('Handmade Crafts',   '/images/bazaar-arts.jpg',    1),
  ('Fashion',           '/images/bazaar-fashion.jpg', 2),
  ('Food & Beverage',   '/images/bazaar-food.jpg',    3),
  ('Beauty & Health',   '/images/bazaar-beauty.jpg',  4),
  ('Home & Living',     '/images/bazaar-furniture.jpg', 5),
  ('Sports & Outdoors', NULL,                         6),
  ('Books & Media',     NULL,                         7),
  ('Services',          NULL,                         8);

-- ── 3. Make sure the images column exists on the table ────────────────────
SET @sql := (SELECT IF(COUNT(*)=0,
  'ALTER TABLE `bazaar_categories` ADD COLUMN `image` VARCHAR(255) NULL DEFAULT NULL AFTER `name`',
  'SELECT 1')
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bazaar_categories' AND COLUMN_NAME = 'image');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ── 4. Ensure a sensible ordering ──────────────────────────────────────────
UPDATE `bazaar_categories` SET `sort_order` = `id` WHERE `sort_order` = 0;