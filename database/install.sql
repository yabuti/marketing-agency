-- ============================================================
-- All Things Marketing Agency - Full Install
-- Import this single file in phpMyAdmin
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `user_submissions`;
DROP TABLE IF EXISTS `user_profiles`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `client_path_media`;
DROP TABLE IF EXISTS `client_promotion_paths`;
DROP TABLE IF EXISTS `client_media`;
DROP TABLE IF EXISTS `clients`;
DROP TABLE IF EXISTS `news_images`;
DROP TABLE IF EXISTS `news`;
DROP TABLE IF EXISTS `ads`;
DROP TABLE IF EXISTS `contact_submissions`;
DROP TABLE IF EXISTS `team_members`;
DROP TABLE IF EXISTS `admins`;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `admins` (
  `id`         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name`       VARCHAR(100) NOT NULL,
  `email`      VARCHAR(150) NOT NULL UNIQUE,
  `password`   VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `admins` (`name`, `email`, `password`) VALUES
('Admin', 'admin@allthings.com', '$2y$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');

CREATE TABLE `clients` (
  `id`                      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name`                    VARCHAR(200) NOT NULL,
  `name_am`                 VARCHAR(300) DEFAULT '',
  `name_or`                 VARCHAR(300) DEFAULT '',
  `category`                VARCHAR(100) NOT NULL,
  `category_am`             VARCHAR(200) DEFAULT '',
  `category_or`             VARCHAR(200) DEFAULT '',
  `icon`                    VARCHAR(10)  DEFAULT '🏢',
  `description`             TEXT,
  `description_am`          TEXT,
  `description_or`          TEXT,
  `full_description`        TEXT,
  `full_description_am`     TEXT,
  `full_description_or`     TEXT,
  `business_type`           VARCHAR(300) DEFAULT NULL,
  `business_type_am`        VARCHAR(300) DEFAULT '',
  `business_type_or`        VARCHAR(300) DEFAULT '',
  `established`             VARCHAR(20),
  `location`                VARCHAR(200),
  `location_am`             VARCHAR(300) DEFAULT '',
  `location_or`             VARCHAR(300) DEFAULT '',
  `license_number`          VARCHAR(100),
  `logo_path`               VARCHAR(500) DEFAULT NULL,
  `work_images`              TEXT DEFAULT NULL,
  `phone`                   VARCHAR(50),
  `tin_number`              VARCHAR(100) NOT NULL DEFAULT '',
  `business_license_number` VARCHAR(100) NOT NULL DEFAULT '',
  `elmis_registration`      VARCHAR(100) NOT NULL DEFAULT '',
  `website`                 VARCHAR(255),
  `facebook`                VARCHAR(300) DEFAULT NULL,
  `instagram`               VARCHAR(300) DEFAULT NULL,
  `tiktok`                  VARCHAR(300) DEFAULT NULL,
  `telegram`                VARCHAR(300) DEFAULT NULL,
  `followers`               VARCHAR(30)  DEFAULT '0',
  `growth`                  VARCHAR(30)  DEFAULT '0%',
  `engagement`              VARCHAR(30)  DEFAULT '0%',
  `is_active`               TINYINT(1)   DEFAULT 1,
  `created_at`              TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  `updated_at`              TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `client_media` (
  `id`             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `client_id`      INT UNSIGNED NOT NULL,
  `type`           ENUM('image','video') NOT NULL,
  `file_path`      VARCHAR(500) NOT NULL,
  `description`    VARCHAR(500) DEFAULT '',
  `description_am` VARCHAR(500) DEFAULT '',
  `description_or` VARCHAR(500) DEFAULT '',
  `sort_order`     INT DEFAULT 0,
  `created_at`     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `client_promotion_paths` (
  `id`         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `client_id`  INT UNSIGNED NOT NULL,
  `title`      VARCHAR(300) NOT NULL,
  `title_am`   VARCHAR(300) DEFAULT '',
  `title_or`   VARCHAR(300) DEFAULT '',
  `path_date`  DATE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `client_path_media` (
  `id`             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `path_id`        INT UNSIGNED NOT NULL,
  `type`           ENUM('image','video') NOT NULL,
  `file_path`      VARCHAR(500) NOT NULL,
  `description`    VARCHAR(500) DEFAULT '',
  `description_am` VARCHAR(500) DEFAULT '',
  `description_or` VARCHAR(500) DEFAULT '',
  `price`          VARCHAR(100) DEFAULT NULL,
  `sort_order`     INT DEFAULT 0,
  `created_at`     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`path_id`) REFERENCES `client_promotion_paths`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `news` (
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
  `is_published` TINYINT(1)   DEFAULT 1,
  `created_at`   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `news_images` (
  `id`          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `news_id`     INT UNSIGNED NOT NULL,
  `file_path`   VARCHAR(500) NOT NULL,
  `description` VARCHAR(500) DEFAULT '',
  `sort_order`  INT DEFAULT 0,
  `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`news_id`) REFERENCES `news`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ads` (
  `id`             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title`          VARCHAR(300) NOT NULL,
  `title_am`       VARCHAR(300) DEFAULT '',
  `title_or`       VARCHAR(300) DEFAULT '',
  `description`    TEXT,
  `description_am` TEXT,
  `description_or` TEXT,
  `type`           ENUM('general','holiday','company') NOT NULL DEFAULT 'general',
  `holiday_name`   VARCHAR(200) DEFAULT NULL,
  `holiday_date`   DATE         DEFAULT NULL,
  `show_from`      DATE         NOT NULL,
  `show_until`     DATE         NOT NULL,
  `image_path`     VARCHAR(500) DEFAULT NULL,
  `link_url`       VARCHAR(500) DEFAULT NULL,
  `duration_sec`   INT          DEFAULT 15,
  `sort_order`     INT          DEFAULT 0,
  `is_active`      TINYINT(1)   DEFAULT 1,
  `company_name`   VARCHAR(200) DEFAULT NULL,
  `created_at`     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `contact_submissions` (
  `id`                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `full_name`          VARCHAR(200) NOT NULL,
  `email`              VARCHAR(200),
  `phone`              VARCHAR(50)  NOT NULL,
  `business_type`      VARCHAR(300),
  `business_type_am`   VARCHAR(300) DEFAULT '',
  `business_type_or`   VARCHAR(300) DEFAULT '',
  `company_name`       VARCHAR(200),
  `tin_number`         VARCHAR(100),
  `elmis_registration` VARCHAR(100),
  `business_license`   VARCHAR(100),
  `message`            TEXT,
  `message_am`         TEXT,
  `message_or`         TEXT,
  `lang`               VARCHAR(5) DEFAULT 'en',
  `status`             ENUM('new','read','contacted') DEFAULT 'new',
  `created_at`         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `users` (
  `id`                      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `full_name`               VARCHAR(200) NOT NULL,
  `email`                   VARCHAR(200) NOT NULL UNIQUE,
  `password`                VARCHAR(255) NOT NULL,
  `phone`                   VARCHAR(50),
  `company_name`            VARCHAR(200),
  `business_type`           VARCHAR(300),
  `business_type_am`        VARCHAR(300) DEFAULT '',
  `business_type_or`        VARCHAR(300) DEFAULT '',
  `tin_number`              VARCHAR(100),
  `elmis_registration`      VARCHAR(100),
  `business_license_number` VARCHAR(100),
  `location`                VARCHAR(200),
  `website`                 VARCHAR(255),
  `lang`                    VARCHAR(5) DEFAULT 'en',
  `status`                  ENUM('pending','active','suspended') DEFAULT 'pending',
  `created_at`              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `user_profiles` (
  `id`               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id`          INT UNSIGNED NOT NULL UNIQUE,
  `bio`              TEXT,
  `bio_am`           TEXT,
  `bio_or`           TEXT,
  `instagram`        VARCHAR(200),
  `tiktok`           VARCHAR(200),
  `telegram`         VARCHAR(200),
  `facebook`         VARCHAR(200),
  `employees`        VARCHAR(50),
  `established`      VARCHAR(20),
  `services_needed`  TEXT,
  `services_needed_am` TEXT,
  `services_needed_or` TEXT,
  `notes`            TEXT,
  `notes_am`         TEXT,
  `notes_or`         TEXT,
  `updated_at`       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `user_submissions` (
  `id`             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id`        INT UNSIGNED NOT NULL,
  `path_name`      VARCHAR(300) NOT NULL,
  `path_name_am`   VARCHAR(300) DEFAULT '',
  `path_name_or`   VARCHAR(300) DEFAULT '',
  `description`    TEXT,
  `description_am` TEXT,
  `description_or` TEXT,
  `lang`           VARCHAR(5) DEFAULT 'en',
  `status`         ENUM('pending','approved','rejected') DEFAULT 'pending',
  `created_at`     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `team_members` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `team_members` (`full_name`, `position`, `department`, `responsibilities`, `sort_order`) VALUES
('Abebe Kebede', 'Managing Director / General Manager', 'Executive Management', 'Overall strategic leadership, business development, financial oversight, stakeholder relations, decision making', 1),
('Abebe Kebede', 'Operations Manager', 'Executive Management', 'Oversee day-to-day operations, process optimization, ensure smooth workflow', 2),
('Abebe Kebede', 'Marketing & Sales Manager', 'Executive Management', 'Plan and execute marketing campaigns, lead generation, sales strategies, client acquisition', 3),
('Abebe Kebede', 'Creative Director', 'Creative & Digital Marketing', 'Supervises content and design quality, branding strategy, campaign concept creation', 4),
('Abebe Kebede', 'Digital Marketing Specialist', 'Creative & Digital Marketing', 'Social media management, SEO, paid campaigns, content scheduling, analytics tracking', 5),
('Abebe Kebede', 'Graphic Designer & Content Creator', 'Creative & Digital Marketing', 'Design visuals for campaigns, social media posts, website content, flyers, banners, and promotional items', 6),
('Abebe Kebede', 'Copywriter / Content Writer', 'Creative & Digital Marketing', 'Create engaging text content for social media, blogs, email campaigns, advertising copy', 7),
('Abebe Kebede', 'IT & App Support', 'Technology & Platform Support', 'Maintain website and mobile apps, troubleshoot technical issues, and update software', 8),
('Abebe Kebede', 'Web & App Developer', 'Technology & Platform Support', 'Website & mobile app development, feature upgrades, UX/UI improvements', 9),
('Abebe Kebede', 'Analytics & Data Specialist', 'Technology & Platform Support', 'Monitor campaign metrics, prepare performance reports, optimize advertising results', 10),
('Abebe Kebede', 'Finance & Administration Officer', 'Finance & Administration', 'Manage financial records, budgets, payroll, procurement, office administration', 11),
('Abebe Kebede', 'HR Assistant / Office Coordinator', 'Finance & Administration', 'Recruitment support, employee records, office management, staff scheduling', 12),
('Abebe Kebede', 'Customer Support Representative', 'Customer & Sales', 'Respond to client inquiries via website, mobile app, social media, phone, and email', 13),
('Abebe Kebede', 'Sales Associate / Account Manager', 'Customer & Sales', 'Handle client relationships, follow-up on proposals, upsell packages, manage subscription plans', 14);

-- ===================== BAZAAR MIGRATION =====================
-- Digital Bazaar — multi-vendor marketplace tables
-- Tables are created in FK-safe dependency order.
-- =============================================================

-- 1. bazaar_products
CREATE TABLE IF NOT EXISTS `bazaar_products` (
  `id`              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `seller_id`       INT UNSIGNED NOT NULL,           -- FK → users.id
  `name`            VARCHAR(300) NOT NULL,
  `description`     TEXT,
  `price`           DECIMAL(10,2) NOT NULL,          -- ETB, must be > 0
  `category`        VARCHAR(100) NOT NULL,
  `stock_quantity`  INT UNSIGNED NOT NULL DEFAULT 0, -- must be >= 0
  `colors`          VARCHAR(500) DEFAULT NULL,
  `status`          ENUM('pending','active','inactive','removed') DEFAULT 'pending',
  `removal_reason`  TEXT DEFAULT NULL,
  `removed_by`      INT UNSIGNED DEFAULT NULL,       -- FK → admins.id
  `removed_at`      TIMESTAMP DEFAULT NULL,
  `created_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`removed_by`) REFERENCES `admins`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. bazaar_product_photos
CREATE TABLE IF NOT EXISTS `bazaar_product_photos` (
  `id`          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `product_id`  INT UNSIGNED NOT NULL,
  `file_path`   VARCHAR(500) NOT NULL,
  `sort_order`  INT DEFAULT 0,
  `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `bazaar_products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. bazaar_seller_banks
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
CREATE TABLE IF NOT EXISTS `bazaar_orders` (
  `id`           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `customer_id`  INT UNSIGNED DEFAULT NULL,          -- FK → users.id (seller acting as customer)
  `buyer_id`     INT UNSIGNED DEFAULT NULL,          -- FK → buyers.id (registered buyer)
  `seller_id`    INT UNSIGNED NOT NULL,              -- FK → users.id
  `total_amount` DECIMAL(10,2) NOT NULL,
  `status`       ENUM('pending','confirmed','rejected') DEFAULT 'pending',
  `created_at`   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`seller_id`)   REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- bazaar_settings (open/close toggle + countdown date)
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
