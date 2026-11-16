-- =============================================================================
-- ONE SOURCE OF TRUTH FOR CATEGORIES (image support + shop-by seed + users)
-- Adds:
--   1. bazaar_categories.image  -> each category gets its own image (set in admin)
--   2. users.category           -> category chosen at registration
--   3. Seeds the 8 shop-by categories (with the images they use on the home page)
-- Safe to run more than once (idempotent). Run against the project database
-- (DB_NAME in php-backend/.env, e.g. allthing_).
-- =============================================================================

-- ── 1. Make sure the categories table exists ────────────────────────────────
CREATE TABLE IF NOT EXISTS `bazaar_categories` (
  `id`         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name`       VARCHAR(100) NOT NULL,
  `image`      VARCHAR(255) NULL DEFAULT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `category_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── 2. Add image column if it does not exist yet (existing installs) ───────
SET @sql := (SELECT IF(COUNT(*)=0,
  'ALTER TABLE `bazaar_categories` ADD COLUMN `image` VARCHAR(255) NULL DEFAULT NULL AFTER `name`',
  'SELECT 1')
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bazaar_categories' AND COLUMN_NAME = 'image');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ── 3. Seed the 8 categories that appear in the shop-by section ────────────
INSERT IGNORE INTO `bazaar_categories` (`name`, `image`, `sort_order`) VALUES
  ('Handmade Crafts',   '/images/bazaar-arts.jpg',    1),
  ('Fashion',           '/images/bazaar-fashion.jpg', 2),
  ('Food & Beverage',   '/images/bazaar-food.jpg',    3),
  ('Beauty & Health',   '/images/bazaar-beauty.jpg',  4),
  ('Home & Living',     '/images/bazaar-furniture.jpg', 5),
  ('Sports & Outdoors', NULL,                         6),
  ('Books & Media',     NULL,                         7),
  ('Services',          NULL,                         8);

-- Backfill images on rows that already existed (re-run safe)
UPDATE `bazaar_categories` SET `image` = CASE `name`
    WHEN 'Handmade Crafts'  THEN '/images/bazaar-arts.jpg'
    WHEN 'Fashion'         THEN '/images/bazaar-fashion.jpg'
    WHEN 'Food & Beverage' THEN '/images/bazaar-food.jpg'
    WHEN 'Beauty & Health' THEN '/images/bazaar-beauty.jpg'
    WHEN 'Home & Living'   THEN '/images/bazaar-furniture.jpg'
    ELSE `image`
  END
WHERE `name` IN ('Handmade Crafts','Fashion','Food & Beverage','Beauty & Health','Home & Living');

-- Ensure a sensible ordering for freshly seeded rows
UPDATE `bazaar_categories` SET `sort_order` = `id` WHERE `sort_order` = 0;

-- ── 4. Add users.category column (registration) if it does not exist ───────
SET @sql := (SELECT IF(COUNT(*)=0,
  'ALTER TABLE `users` ADD COLUMN `category` VARCHAR(100) NULL DEFAULT NULL AFTER `business_type`',
  'SELECT 1')
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'category');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
