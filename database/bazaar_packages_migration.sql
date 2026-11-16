-- ===================== BAZAAR PACKAGES & DISCOUNT MIGRATION =====================
-- Adds package product support and discount_price to bazaar_products.
-- Run this against your existing database.
-- ================================================================================

-- 1. Add is_package flag
ALTER TABLE `bazaar_products`
  ADD COLUMN `is_package` TINYINT(1) NOT NULL DEFAULT 0
  AFTER `colors`;

-- 2. Add package_items (JSON array of {name, quantity} or null)
ALTER TABLE `bazaar_products`
  ADD COLUMN `package_items` TEXT DEFAULT NULL
  AFTER `is_package`;

-- 3. Add discount_price (sale price, null means no discount)
ALTER TABLE `bazaar_products`
  ADD COLUMN `discount_price` DECIMAL(12,2) DEFAULT NULL
  AFTER `price`;
