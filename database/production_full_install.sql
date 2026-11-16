-- ============================================================
-- All Things — PRODUCTION Full Database Install
-- Generated: 2026-11-05
-- 
-- Includes ALL tables from full_install.sql PLUS every migration:
--   • site_settings
--   • newsletter_subscribers
--   • chat_conversations / chat_messages
--   • user_submission_files
--   • user_logins
--
-- Safe to import on an existing database — uses IF NOT EXISTS
-- and will NOT drop existing tables or data.
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

-- ─── admins ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `admins` (
  `id`         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name`       VARCHAR(100) NOT NULL,
  `email`      VARCHAR(150) NOT NULL UNIQUE,
  `password`   VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `admins` (`name`, `email`, `password`)
SELECT 'Admin', 'admin@allthings.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrm3a.O2'
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `admins` WHERE `email` = 'admin@allthings.com');

-- ─── clients ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `clients` (
  `id`                      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name`                    VARCHAR(200) NOT NULL,
  `category`                VARCHAR(100) NOT NULL,
  `icon`                    VARCHAR(10) DEFAULT '🏢',
  `description`             TEXT,
  `full_description`        TEXT,
  `established`             VARCHAR(20),
  `location`                VARCHAR(200),
  `license_number`          VARCHAR(100),
  `phone`                   VARCHAR(50),
  `tin_number`              VARCHAR(100) NOT NULL DEFAULT '',
  `business_license_number` VARCHAR(100) NOT NULL DEFAULT '',
  `elmis_registration`      VARCHAR(100) NOT NULL DEFAULT '',
  `website`                 VARCHAR(255),
  `followers`               VARCHAR(30) DEFAULT '0',
  `growth`                  VARCHAR(30) DEFAULT '0%',
  `engagement`              VARCHAR(30) DEFAULT '0%',
  `is_active`               TINYINT(1) DEFAULT 1,
  `business_type`           VARCHAR(300) DEFAULT NULL,
  `facebook`                VARCHAR(255) DEFAULT NULL,
  `instagram`               VARCHAR(255) DEFAULT NULL,
  `tiktok`                  VARCHAR(255) DEFAULT NULL,
  `telegram`                VARCHAR(255) DEFAULT NULL,
  `logo_path`               VARCHAR(500) DEFAULT NULL,
  `work_images`             TEXT DEFAULT NULL,
  `name_am`                 VARCHAR(300) DEFAULT '',
  `name_or`                 VARCHAR(300) DEFAULT '',
  `category_am`             VARCHAR(200) DEFAULT '',
  `category_or`             VARCHAR(200) DEFAULT '',
  `description_am`          TEXT,
  `description_or`          TEXT,
  `full_description_am`     TEXT,
  `full_description_or`     TEXT,
  `location_am`             VARCHAR(300) DEFAULT '',
  `location_or`             VARCHAR(300) DEFAULT '',
  `business_type_am`        VARCHAR(300) DEFAULT '',
  `business_type_or`        VARCHAR(300) DEFAULT '',
  `created_at`              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─── client_media ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `client_media` (
  `id`          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `client_id`   INT UNSIGNED NOT NULL,
  `type`        ENUM('image','video') NOT NULL,
  `file_path`   VARCHAR(500) NOT NULL,
  `description` VARCHAR(500) DEFAULT '',
  `sort_order`  INT DEFAULT 0,
  `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─── client_promotion_paths ───────────────────────────────────
CREATE TABLE IF NOT EXISTS `client_promotion_paths` (
  `id`         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `client_id`  INT UNSIGNED NOT NULL,
  `title`      VARCHAR(300) NOT NULL,
  `path_date`  DATE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─── client_path_media ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `client_path_media` (
  `id`          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `path_id`     INT UNSIGNED NOT NULL,
  `type`        ENUM('image','video') NOT NULL,
  `file_path`   VARCHAR(500) NOT NULL,
  `description` VARCHAR(500) DEFAULT '',
  `price`       VARCHAR(100) DEFAULT NULL,
  `sort_order`  INT DEFAULT 0,
  `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`path_id`) REFERENCES `client_promotion_paths`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─── news ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `news` (
  `id`           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title`        VARCHAR(500) NOT NULL,
  `title_am`     VARCHAR(500) DEFAULT '',
  `title_or`     VARCHAR(500) DEFAULT '',
  `content`      LONGTEXT NOT NULL,
  `content_am`   LONGTEXT,
  `content_or`   LONGTEXT,
  `category`     VARCHAR(100) DEFAULT 'General',
  `category_am`  VARCHAR(100) DEFAULT '',
  `category_or`  VARCHAR(100) DEFAULT '',
  `source_url`   VARCHAR(500) DEFAULT NULL,
  `source_urls`  TEXT,
  `is_published` TINYINT(1) DEFAULT 1,
  `created_at`   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─── news_images ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `news_images` (
  `id`          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `news_id`     INT UNSIGNED NOT NULL,
  `file_path`   VARCHAR(500) NOT NULL,
  `description` VARCHAR(500) DEFAULT '',
  `sort_order`  INT DEFAULT 0,
  `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`news_id`) REFERENCES `news`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─── ads ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `ads` (
  `id`             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title`          VARCHAR(300) NOT NULL,
  `title_am`       VARCHAR(300) DEFAULT '',
  `title_or`       VARCHAR(300) DEFAULT '',
  `description`    TEXT,
  `description_am` TEXT,
  `description_or` TEXT,
  `type`           ENUM('general','holiday','company') NOT NULL DEFAULT 'general',
  `holiday_name`   VARCHAR(200) DEFAULT NULL,
  `holiday_date`   DATE DEFAULT NULL,
  `show_from`      DATE NOT NULL,
  `show_until`     DATE NOT NULL,
  `image_path`     VARCHAR(500) DEFAULT NULL,
  `link_url`       VARCHAR(500) DEFAULT NULL,
  `duration_sec`   INT DEFAULT 15,
  `sort_order`     INT DEFAULT 0,
  `is_active`      TINYINT(1) DEFAULT 1,
  `company_name`   VARCHAR(200) DEFAULT NULL,
  `created_at`     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─── contact_submissions ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS `contact_submissions` (
  `id`                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `full_name`          VARCHAR(200) NOT NULL,
  `email`              VARCHAR(200),
  `phone`              VARCHAR(50) NOT NULL,
  `business_type`      VARCHAR(300),
  `company_name`       VARCHAR(200),
  `tin_number`         VARCHAR(100),
  `elmis_registration` VARCHAR(100),
  `business_license`   VARCHAR(100),
  `message`            TEXT,
  `lang`               VARCHAR(5) DEFAULT 'en',
  `status`             ENUM('new','read','contacted') DEFAULT 'new',
  `created_at`         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─── users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `users` (
  `id`                      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `full_name`               VARCHAR(200) NOT NULL,
  `email`                   VARCHAR(200) NOT NULL UNIQUE,
  `password`                VARCHAR(255) NOT NULL,
  `phone`                   VARCHAR(50),
  `company_name`            VARCHAR(200),
  `business_type`           VARCHAR(300),
  `tin_number`              VARCHAR(100),
  `elmis_registration`      VARCHAR(100),
  `business_license_number` VARCHAR(100),
  `location`                VARCHAR(200),
  `website`                 VARCHAR(255),
  `lang`                    VARCHAR(5) DEFAULT 'en',
  `reset_otp`               VARCHAR(6) DEFAULT NULL,
  `reset_otp_expires`       DATETIME DEFAULT NULL,
  `status`                  ENUM('pending','active','suspended') DEFAULT 'pending',
  `created_at`              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─── user_profiles ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `user_profiles` (
  `id`               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id`          INT UNSIGNED NOT NULL UNIQUE,
  `bio`              TEXT,
  `instagram`        VARCHAR(200),
  `tiktok`           VARCHAR(200),
  `telegram`         VARCHAR(200),
  `facebook`         VARCHAR(200),
  `employees`        VARCHAR(50),
  `established`      VARCHAR(20),
  `services_needed`  TEXT,
  `notes`            TEXT,
  `updated_at`       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─── user_submissions ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `user_submissions` (
  `id`          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id`     INT UNSIGNED NOT NULL,
  `path_name`   VARCHAR(300) NOT NULL,
  `description` TEXT,
  `lang`        VARCHAR(5) DEFAULT 'en',
  `status`      ENUM('pending','approved','rejected') DEFAULT 'pending',
  `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─── user_submission_files ────────────────────────────────────
CREATE TABLE IF NOT EXISTS `user_submission_files` (
  `id`            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `submission_id` INT UNSIGNED NOT NULL,
  `type`          ENUM('image','video') NOT NULL,
  `file_path`     VARCHAR(500) NOT NULL,
  `created_at`    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`submission_id`) REFERENCES `user_submissions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─── team_members ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `team_members` (
  `id`                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `full_name`           VARCHAR(200) NOT NULL,
  `position`            VARCHAR(300) NOT NULL,
  `position_am`         VARCHAR(300) DEFAULT '',
  `position_or`         VARCHAR(300) DEFAULT '',
  `department`          VARCHAR(100) NOT NULL,
  `department_am`       VARCHAR(200) DEFAULT '',
  `department_or`       VARCHAR(200) DEFAULT '',
  `responsibilities`    TEXT,
  `responsibilities_am` TEXT,
  `responsibilities_or` TEXT,
  `photo_path`          VARCHAR(500) DEFAULT NULL,
  `sort_order`          INT DEFAULT 0,
  `is_active`           TINYINT(1) DEFAULT 1,
  `created_at`          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─── buyers ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `buyers` (
  `id`                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `full_name`         VARCHAR(200) NOT NULL,
  `email`             VARCHAR(200) DEFAULT NULL,
  `phone`             VARCHAR(50) NOT NULL,
  `password`          VARCHAR(255) NOT NULL,
  `reset_otp`         VARCHAR(6) DEFAULT NULL,
  `reset_otp_expires` DATETIME DEFAULT NULL,
  `created_at`        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `buyers_phone_unique` (`phone`),
  UNIQUE KEY `buyers_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─── bazaar_products ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `bazaar_products` (
  `id`             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `seller_id`      INT UNSIGNED NOT NULL,
  `name`           VARCHAR(300) NOT NULL,
  `description`    TEXT,
  `price`          DECIMAL(10,2) NOT NULL,
  `category`       VARCHAR(100) NOT NULL,
  `stock_quantity` INT UNSIGNED NOT NULL DEFAULT 0,
  `status`         ENUM('active','inactive','removed') DEFAULT 'active',
  `removal_reason` TEXT,
  `removed_by`     INT UNSIGNED DEFAULT NULL,
  `removed_at`     DATETIME DEFAULT NULL,
  `created_at`     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`seller_id`)  REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`removed_by`) REFERENCES `admins`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─── bazaar_product_photos ────────────────────────────────────
CREATE TABLE IF NOT EXISTS `bazaar_product_photos` (
  `id`         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT UNSIGNED NOT NULL,
  `file_path`  VARCHAR(500) NOT NULL,
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `bazaar_products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─── bazaar_seller_banks ──────────────────────────────────────
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─── bazaar_orders ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `bazaar_orders` (
  `id`           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `customer_id`  INT UNSIGNED NULL,
  `buyer_id`     INT UNSIGNED NULL,
  `seller_id`    INT UNSIGNED NOT NULL,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `status`       ENUM('pending','confirmed','rejected') DEFAULT 'pending',
  `created_at`   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`buyer_id`)    REFERENCES `buyers`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`seller_id`)   REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─── bazaar_order_items ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS `bazaar_order_items` (
  `id`         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id`   INT UNSIGNED NOT NULL,
  `product_id` INT UNSIGNED NOT NULL,
  `quantity`   INT UNSIGNED NOT NULL,
  `unit_price` DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (`order_id`)   REFERENCES `bazaar_orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `bazaar_products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─── bazaar_payments ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `bazaar_payments` (
  `id`             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id`       INT UNSIGNED NOT NULL UNIQUE,
  `payment_method` ENUM('cbe','awash','dashen','abyssinia','telebirr') NOT NULL,
  `proof_type`     ENUM('screenshot','reference') NOT NULL,
  `proof_value`    VARCHAR(500) NOT NULL,
  `status`         ENUM('pending','confirmed','rejected') DEFAULT 'pending',
  `created_at`     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `bazaar_orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─── bazaar_delivery_requests ─────────────────────────────────
CREATE TABLE IF NOT EXISTS `bazaar_delivery_requests` (
  `id`                      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id`                INT UNSIGNED NOT NULL UNIQUE,
  `customer_id`             INT UNSIGNED NULL,
  `buyer_id`                INT UNSIGNED NULL,
  `delivery_address`        TEXT NOT NULL,
  `contact_phone`           VARCHAR(50) NOT NULL,
  `preferred_delivery_time` VARCHAR(200),
  `created_at`              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`)    REFERENCES `bazaar_orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`buyer_id`)    REFERENCES `buyers`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─── user_logins ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `user_logins` (
  `id`         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id`    INT UNSIGNED NOT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─── chat_conversations ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS `chat_conversations` (
  `id`          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `seller_id`   INT UNSIGNED NOT NULL,
  `buyer_id`    INT UNSIGNED NULL,
  `user_id`     INT UNSIGNED NULL,
  `product_id`  INT UNSIGNED NULL,
  `status`      ENUM('open','closed') DEFAULT 'open',
  `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`seller_id`)  REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`buyer_id`)   REFERENCES `buyers`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`)    REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `bazaar_products`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─── chat_messages ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `chat_messages` (
  `id`              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `conversation_id` INT UNSIGNED NOT NULL,
  `sender_type`     ENUM('buyer','seller','user') NOT NULL,
  `sender_id`       INT UNSIGNED NOT NULL,
  `message`         TEXT NOT NULL,
  `is_read`         TINYINT(1) DEFAULT 0,
  `created_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`conversation_id`) REFERENCES `chat_conversations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─── newsletter_subscribers ───────────────────────────────────
CREATE TABLE IF NOT EXISTS `newsletter_subscribers` (
  `id`            INT AUTO_INCREMENT PRIMARY KEY,
  `email`         VARCHAR(255) NOT NULL UNIQUE,
  `subscribed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── site_settings ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `site_settings` (
  `id`           INT AUTO_INCREMENT PRIMARY KEY,
  `settings_json` LONGTEXT NOT NULL,
  `updated_at`   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `site_settings` (`id`, `settings_json`) VALUES (1, '{}')
ON DUPLICATE KEY UPDATE `id` = `id`;

SET FOREIGN_KEY_CHECKS = 1;

SELECT 'All Things production database installed successfully.' AS status;
