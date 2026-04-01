-- ============================================================
-- All Things Marketing Agency - Database
-- Import this file in phpMyAdmin (XAMPP)
-- ============================================================

CREATE DATABASE IF NOT EXISTS `allthings_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `allthings_db`;

-- ───────────────────────────────────────────
-- Table: admins
-- ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `admins` (
  `id`         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name`       VARCHAR(100) NOT NULL,
  `email`      VARCHAR(150) NOT NULL UNIQUE,
  `password`   VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Default admin: email=admin@allthings.com  password=Admin@123
-- (bcrypt hash of "Admin@123")
INSERT INTO `admins` (`name`, `email`, `password`) VALUES
('Admin', 'admin@allthings.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');

-- ─────────────────────────────────────────────
-- Table: clients
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `clients` (
  `id`                     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name`                   VARCHAR(200) NOT NULL,
  `category`               VARCHAR(100) NOT NULL,
  `icon`                   VARCHAR(10)  DEFAULT '🏢',
  `description`            TEXT,
  `full_description`       TEXT,
  `established`            VARCHAR(20),
  `location`               VARCHAR(200),
  `license_number`         VARCHAR(100),
  `phone`                  VARCHAR(50),
  `tin_number`             VARCHAR(100),
  `business_license_number` VARCHAR(100),
  `website`                VARCHAR(255),
  `followers`              VARCHAR(30)  DEFAULT '0',
  `growth`                 VARCHAR(30)  DEFAULT '0%',
  `engagement`             VARCHAR(30)  DEFAULT '0%',
  `is_active`              TINYINT(1)   DEFAULT 1,
  `created_at`             TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  `updated_at`             TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add translation columns to clients table
ALTER TABLE `clients`
  ADD COLUMN IF NOT EXISTS `description_am`      TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS `description_or`      TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS `full_description_am` TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS `full_description_or` TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS `category_am`         VARCHAR(200) DEFAULT '',
  ADD COLUMN IF NOT EXISTS `category_or`         VARCHAR(200) DEFAULT '';

CREATE TABLE IF NOT EXISTS `client_media` (
  `id`          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `client_id`   INT UNSIGNED NOT NULL,
  `type`        ENUM('image', 'video') NOT NULL,
  `file_path`   VARCHAR(500) NOT NULL,
  `description` VARCHAR(500) DEFAULT '',
  `sort_order`  INT DEFAULT 0,
  `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────
-- Table: news
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `news` (
  `id`           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title`        VARCHAR(500) NOT NULL,
  `title_am`     VARCHAR(500) DEFAULT '',
  `title_or`     VARCHAR(500) DEFAULT '',
  `content`      LONGTEXT NOT NULL,
  `content_am`   LONGTEXT DEFAULT '',
  `content_or`   LONGTEXT DEFAULT '',
  `category`     VARCHAR(100) DEFAULT 'General',
  `is_published` TINYINT(1)   DEFAULT 1,
  `created_at`   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────
-- Table: news_images
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `news_images` (
  `id`          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `news_id`     INT UNSIGNED NOT NULL,
  `file_path`   VARCHAR(500) NOT NULL,
  `description` VARCHAR(500) DEFAULT '',
  `sort_order`  INT DEFAULT 0,
  `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`news_id`) REFERENCES `news`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────
-- Table: ads (promotions & holiday ads)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `ads` (
  `id`            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title`         VARCHAR(300) NOT NULL,
  `type`          ENUM('general', 'holiday', 'company') NOT NULL DEFAULT 'general',
  -- For holiday ads: the holiday date
  `holiday_name`  VARCHAR(200) DEFAULT NULL,
  `holiday_date`  DATE         DEFAULT NULL,
  -- show_from / show_until: computed or manually set
  -- For holiday: auto = holiday_date - 7 days  to  holiday_date + 3 days
  -- For general/company: admin sets manually
  `show_from`     DATE         NOT NULL,
  `show_until`    DATE         NOT NULL,
  -- Media
  `image_path`    VARCHAR(500) DEFAULT NULL,
  `link_url`      VARCHAR(500) DEFAULT NULL,
  -- Display settings
  `duration_sec`  INT          DEFAULT 15,   -- countdown seconds
  `sort_order`    INT          DEFAULT 0,    -- for rotation order
  `is_active`     TINYINT(1)   DEFAULT 1,
  -- Company ad info (optional)
  `company_name`  VARCHAR(200) DEFAULT NULL,
  `created_at`    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sample: Easter holiday ad (Easter 2026 = April 5)
INSERT INTO `ads` (`title`, `type`, `holiday_name`, `holiday_date`, `show_from`, `show_until`, `duration_sec`, `sort_order`, `is_active`, `company_name`) VALUES
('Happy Easter 2026', 'holiday', 'Easter', '2026-04-05', '2026-03-29', '2026-04-08', 15, 1, 1, 'All Things');

-- ─────────────────────────────────────────────
-- Table: contact_submissions
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `contact_submissions` (
  `id`                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `full_name`            VARCHAR(200) NOT NULL,
  `email`                VARCHAR(200),
  `phone`                VARCHAR(50)  NOT NULL,
  `business_type`        VARCHAR(300),
  `company_name`         VARCHAR(200),
  `tin_number`           VARCHAR(100),
  `elmis_registration`   VARCHAR(100),
  `business_license`     VARCHAR(100),
  `message`              TEXT,
  `status`               ENUM('new', 'read', 'contacted') DEFAULT 'new',
  `created_at`           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────
-- Table: users (registered business accounts)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `users` (
  `id`                     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `full_name`              VARCHAR(200) NOT NULL,
  `email`                  VARCHAR(200) NOT NULL UNIQUE,
  `password`               VARCHAR(255) NOT NULL,
  `phone`                  VARCHAR(50),
  `company_name`           VARCHAR(200),
  `business_type`          VARCHAR(300),
  `tin_number`             VARCHAR(100),
  `elmis_registration`     VARCHAR(100),
  `business_license_number` VARCHAR(100),
  `location`               VARCHAR(200),
  `website`                VARCHAR(255),
  `status`                 ENUM('pending', 'active', 'suspended') DEFAULT 'pending',
  `created_at`             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`             TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────
-- Table: user_profiles (extra info users fill in)
-- ─────────────────────────────────────────────
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────
-- Table: client_promotion_paths
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `client_promotion_paths` (
  `id`         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `client_id`  INT UNSIGNED NOT NULL,
  `title`      VARCHAR(300) NOT NULL,
  `path_date`  DATE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────
-- Table: client_path_media
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `client_path_media` (
  `id`          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `path_id`     INT UNSIGNED NOT NULL,
  `type`        ENUM('image','video') NOT NULL,
  `file_path`   VARCHAR(500) NOT NULL,
  `description` VARCHAR(500) DEFAULT '',
  `sort_order`  INT DEFAULT 0,
  `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`path_id`) REFERENCES `client_promotion_paths`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────
-- Table: team_members
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `team_members` (
  `id`           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `full_name`    VARCHAR(200) NOT NULL DEFAULT 'Abebe Kebede',
  `position`     VARCHAR(300) NOT NULL,
  `department`   VARCHAR(100) NOT NULL,
  `responsibilities` TEXT,
  `photo_path`   VARCHAR(500) DEFAULT NULL,
  `sort_order`   INT DEFAULT 0,
  `is_active`    TINYINT(1) DEFAULT 1,
  `created_at`   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Default team members
INSERT INTO `team_members` (`full_name`, `position`, `department`, `responsibilities`, `sort_order`) VALUES
('Abebe Kebede', 'Managing Director / General Manager', 'Executive Management', 'Overall strategic leadership, business development, financial oversight, stakeholder relations, decision making', 1),
('Abebe Kebede', 'Operations Manager', 'Executive Management', 'Oversee day-to-day operations, process optimization, ensure smooth workflow', 2),
('Abebe Kebede', 'Marketing & Sales Manager', 'Executive Management', 'Plan and execute marketing campaigns, lead generation, sales strategies, client acquisition', 3),
('Abebe Kebede', 'Creative Director', 'Creative & Digital Marketing', 'Supervises content and design quality, branding strategy, campaign concept creation', 4),
('Abebe Kebede', 'Digital Marketing Specialist', 'Creative & Digital Marketing', 'Social media management, SEO, paid campaigns, content scheduling, analytics tracking', 5),
('Abebe Kebede', 'Digital Marketing Specialist', 'Creative & Digital Marketing', 'Social media management, SEO, paid campaigns, content scheduling, analytics tracking', 6),
('Abebe Kebede', 'Graphic Designer & Content Creator', 'Creative & Digital Marketing', 'Design visuals for campaigns, social media posts, website content, flyers, banners, and promotional items', 7),
('Abebe Kebede', 'Graphic Designer & Content Creator', 'Creative & Digital Marketing', 'Design visuals for campaigns, social media posts, website content, flyers, banners, and promotional items', 8),
('Abebe Kebede', 'Copywriter / Content Writer', 'Creative & Digital Marketing', 'Create engaging text content for social media, blogs, email campaigns, advertising copy', 9),
('Abebe Kebede', 'IT & App Support', 'Technology & Platform Support', 'Maintain website and mobile apps, troubleshoot technical issues, and update software', 10),
('Abebe Kebede', 'IT & App Support', 'Technology & Platform Support', 'Maintain website and mobile apps, troubleshoot technical issues, and update software', 11),
('Abebe Kebede', 'Web & App Developer', 'Technology & Platform Support', 'Website & mobile app development, feature upgrades, UX/UI improvements', 12),
('Abebe Kebede', 'Analytics & Data Specialist', 'Technology & Platform Support', 'Monitor campaign metrics, prepare performance reports, optimize advertising results', 13),
('Abebe Kebede', 'Finance & Administration Officer', 'Finance & Administration', 'Manage financial records, budgets, payroll, procurement, office administration', 14),
('Abebe Kebede', 'HR Assistant / Office Coordinator', 'Finance & Administration', 'Recruitment support, employee records, office management, staff scheduling', 15),
('Abebe Kebede', 'Customer Support Representative', 'Customer & Sales', 'Respond to client inquiries via website, mobile app, social media, phone, and email', 16),
('Abebe Kebede', 'Customer Support Representative', 'Customer & Sales', 'Respond to client inquiries via website, mobile app, social media, phone, and email', 17),
('Abebe Kebede', 'Sales Associate / Account Manager', 'Customer & Sales', 'Handle client relationships, follow-up on proposals, upsell packages, manage subscription plans', 18),
('Abebe Kebede', 'Sales Associate / Account Manager', 'Customer & Sales', 'Handle client relationships, follow-up on proposals, upsell packages, manage subscription plans', 19);
