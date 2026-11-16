-- ===================== BUYER MIGRATION =====================
-- Adds the buyers table and extends bazaar_orders and
-- bazaar_delivery_requests to support buyer accounts.
-- Run this file against an existing allthings_db installation.
-- ============================================================

-- 1. buyers table
--    Stores regular buyer accounts (separate from sellers in `users`).
--    Email is nullable; MySQL UNIQUE on a nullable column allows multiple NULLs.
CREATE TABLE IF NOT EXISTS `buyers` (
  `id`         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `full_name`  VARCHAR(200) NOT NULL,
  `email`      VARCHAR(200) DEFAULT NULL,
  `phone`      VARCHAR(50)  NOT NULL,
  `password`   VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `buyers_phone_unique` (`phone`),
  UNIQUE KEY `buyers_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. bazaar_orders — make customer_id nullable, add buyer_id FK
--    Exactly one of customer_id / buyer_id must be non-null per row.
ALTER TABLE `bazaar_orders`
  MODIFY COLUMN `customer_id` INT UNSIGNED NULL,
  ADD COLUMN `buyer_id` INT UNSIGNED NULL AFTER `customer_id`,
  ADD CONSTRAINT `fk_orders_buyer`
    FOREIGN KEY (`buyer_id`) REFERENCES `buyers`(`id`) ON DELETE CASCADE;

-- CHECK constraint: exactly one of customer_id / buyer_id is non-null.
-- MariaDB 10.2+ and MySQL 8.0.16+ enforce CHECK constraints.
ALTER TABLE `bazaar_orders`
  ADD CONSTRAINT `chk_orders_one_customer`
    CHECK (
      (`customer_id` IS NOT NULL AND `buyer_id` IS NULL) OR
      (`customer_id` IS NULL  AND `buyer_id` IS NOT NULL)
    );

-- 3. bazaar_delivery_requests — make customer_id nullable, add buyer_id FK
ALTER TABLE `bazaar_delivery_requests`
  MODIFY COLUMN `customer_id` INT UNSIGNED NULL,
  ADD COLUMN `buyer_id` INT UNSIGNED NULL AFTER `customer_id`,
  ADD CONSTRAINT `fk_delivery_buyer`
    FOREIGN KEY (`buyer_id`) REFERENCES `buyers`(`id`) ON DELETE CASCADE;
