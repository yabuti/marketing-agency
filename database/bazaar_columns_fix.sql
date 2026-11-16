-- ============================================================
-- Bazaar Columns Fix Migration
-- Run this if you installed before these columns were added.
-- Safe to run multiple times (uses IF NOT EXISTS / IGNORE).
-- ============================================================

-- 1. Add 'colors' column to bazaar_products (missing from original schema)
ALTER TABLE `bazaar_products`
  ADD COLUMN IF NOT EXISTS `colors` VARCHAR(500) DEFAULT NULL
  AFTER `stock_quantity`;

-- 2. Add 'buyer_id' column to bazaar_orders (needed for buyer JWT orders)
ALTER TABLE `bazaar_orders`
  ADD COLUMN IF NOT EXISTS `buyer_id` INT UNSIGNED DEFAULT NULL
  AFTER `customer_id`,
  ADD CONSTRAINT IF NOT EXISTS `fk_orders_buyer`
    FOREIGN KEY (`buyer_id`) REFERENCES `buyers`(`id`) ON DELETE SET NULL;

-- 3. Create bazaar_settings table (needed for open/close toggle and countdown)
CREATE TABLE IF NOT EXISTS `bazaar_settings` (
  `id`         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `key_name`   VARCHAR(100) NOT NULL UNIQUE,
  `value`      TEXT,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default settings (bazaar closed by default)
INSERT IGNORE INTO `bazaar_settings` (`key_name`, `value`) VALUES
  ('is_open', '0'),
  ('open_date', NULL);

-- 4. Add 'status' = 'pending' to bazaar_products ENUM if not present
-- (products submitted by sellers start as pending, admin approves them)
-- This is already in the schema but adding the 'pending' value if missing:
ALTER TABLE `bazaar_products`
  MODIFY COLUMN `status` ENUM('pending','active','inactive','removed') DEFAULT 'pending';
