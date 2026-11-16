-- ===================== BAZAAR CATEGORIES MIGRATION =====================
-- Adds an admin-managed category list for the Digital Bazaar.
-- The same list feeds: bazaar shop-by-category (website), seller product
-- form dropdown, and admin dropdowns.
-- Run this against your existing database.
-- ========================================================================

CREATE TABLE IF NOT EXISTS `bazaar_categories` (
  `id`         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name`       VARCHAR(100) NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `category_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed from distinct categories already in use by existing products
INSERT IGNORE INTO `bazaar_categories` (`name`, `sort_order`)
SELECT DISTINCT TRIM(category), 0
FROM `bazaar_products`
WHERE category IS NOT NULL AND TRIM(category) <> '';

-- Ensure a sensible default sort (alphabetical) for freshly seeded rows
UPDATE `bazaar_categories` SET `sort_order` = `id`;
