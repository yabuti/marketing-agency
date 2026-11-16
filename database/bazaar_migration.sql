-- ===================== BAZAAR MIGRATION =====================
-- Digital Bazaar — multi-vendor marketplace tables
-- Run this file against an existing allthings_db installation,
-- or it will be included automatically via install.sql on fresh installs.
-- Tables are created in FK-safe dependency order.
-- =============================================================

-- 1. bazaar_products
--    FK → users.id (seller_id)
--    FK → admins.id (removed_by)
CREATE TABLE IF NOT EXISTS `bazaar_products` (
  `id`              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `seller_id`       INT UNSIGNED NOT NULL,
  `name`            VARCHAR(300) NOT NULL,
  `description`     TEXT,
  `price`           DECIMAL(10,2) NOT NULL,
  `category`        VARCHAR(100) NOT NULL,
  `stock_quantity`  INT UNSIGNED NOT NULL DEFAULT 0,
  `colors`          VARCHAR(500) DEFAULT NULL,
  `status`          ENUM('pending','active','inactive','removed') DEFAULT 'pending',
  `removal_reason`  TEXT DEFAULT NULL,
  `removed_by`      INT UNSIGNED DEFAULT NULL,
  `removed_at`      DATETIME DEFAULT NULL,
  `created_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`removed_by`) REFERENCES `admins`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. bazaar_product_photos
--    FK → bazaar_products.id
CREATE TABLE IF NOT EXISTS `bazaar_product_photos` (
  `id`          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `product_id`  INT UNSIGNED NOT NULL,
  `file_path`   VARCHAR(500) NOT NULL,
  `sort_order`  INT DEFAULT 0,
  `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `bazaar_products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. bazaar_seller_banks
--    FK → users.id (seller_id)
--    UNIQUE on (seller_id, bank) — one account per bank per seller
CREATE TABLE IF NOT EXISTS `bazaar_seller_banks` (
  `id`             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `seller_id`      INT UNSIGNED NOT NULL,
  `bank`           ENUM('cbe','awash','dashen','abyssinia','telebirr') NOT NULL,
  `account_number` VARCHAR(100) NOT NULL,
  `account_name`   VARCHAR(200),
  `created_at`     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `seller_bank` (`seller_id`, `bank`),
  FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. bazaar_orders
--    FK → users.id (customer_id)
--    FK → users.id (seller_id)
CREATE TABLE IF NOT EXISTS `bazaar_orders` (
  `id`           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `customer_id`  INT UNSIGNED DEFAULT NULL,
  `buyer_id`     INT UNSIGNED DEFAULT NULL,
  `seller_id`    INT UNSIGNED NOT NULL,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `status`       ENUM('pending','confirmed','rejected') DEFAULT 'pending',
  `created_at`   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`seller_id`)   REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- bazaar_settings
CREATE TABLE IF NOT EXISTS `bazaar_settings` (
  `id`         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `key_name`   VARCHAR(100) NOT NULL UNIQUE,
  `value`      TEXT,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `bazaar_settings` (`key_name`, `value`) VALUES
  ('is_open', '0'),
  ('open_date', NULL);

-- 5. bazaar_order_items
--    FK → bazaar_orders.id
--    FK → bazaar_products.id
CREATE TABLE IF NOT EXISTS `bazaar_order_items` (
  `id`          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id`    INT UNSIGNED NOT NULL,
  `product_id`  INT UNSIGNED NOT NULL,
  `quantity`    INT UNSIGNED NOT NULL,
  `unit_price`  DECIMAL(10,2) NOT NULL,             -- snapshot at time of order
  FOREIGN KEY (`order_id`)   REFERENCES `bazaar_orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `bazaar_products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. bazaar_payments
--    FK → bazaar_orders.id
--    UNIQUE on order_id — one payment record per order
CREATE TABLE IF NOT EXISTS `bazaar_payments` (
  `id`               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id`         INT UNSIGNED NOT NULL UNIQUE,
  `payment_method`   ENUM('cbe','awash','dashen','abyssinia','telebirr') NOT NULL,
  `proof_type`       ENUM('screenshot','reference') NOT NULL,
  `proof_value`      VARCHAR(500) NOT NULL,          -- file path or reference number
  `status`           ENUM('pending','confirmed','rejected') DEFAULT 'pending',
  `created_at`       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `bazaar_orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. bazaar_delivery_requests
--    FK → bazaar_orders.id
--    FK → users.id (customer_id)
--    UNIQUE on order_id — one delivery request per order
CREATE TABLE IF NOT EXISTS `bazaar_delivery_requests` (
  `id`                      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id`                INT UNSIGNED NOT NULL UNIQUE,  -- one delivery per order
  `customer_id`             INT UNSIGNED NOT NULL,
  `delivery_address`        TEXT NOT NULL,
  `contact_phone`           VARCHAR(50) NOT NULL,
  `preferred_delivery_time` VARCHAR(200),
  `created_at`              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`)    REFERENCES `bazaar_orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
