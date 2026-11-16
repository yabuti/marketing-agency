-- ============================================================
-- All Things — Multilingual Migration
-- Run after importing allthings_db.sql
-- ============================================================

ALTER TABLE `clients`
  ADD COLUMN `business_type`       VARCHAR(300) DEFAULT NULL,
  ADD COLUMN `facebook`            VARCHAR(300) DEFAULT NULL,
  ADD COLUMN `instagram`           VARCHAR(300) DEFAULT NULL,
  ADD COLUMN `tiktok`              VARCHAR(300) DEFAULT NULL,
  ADD COLUMN `telegram`            VARCHAR(300) DEFAULT NULL,
  ADD COLUMN `name_am`             VARCHAR(300) DEFAULT '',
  ADD COLUMN `name_or`             VARCHAR(300) DEFAULT '',
  ADD COLUMN `category_am`         VARCHAR(200) DEFAULT '',
  ADD COLUMN `category_or`         VARCHAR(200) DEFAULT '',
  ADD COLUMN `description_am`      TEXT,
  ADD COLUMN `description_or`      TEXT,
  ADD COLUMN `full_description_am` TEXT,
  ADD COLUMN `full_description_or` TEXT,
  ADD COLUMN `location_am`         VARCHAR(300) DEFAULT '',
  ADD COLUMN `location_or`         VARCHAR(300) DEFAULT '',
  ADD COLUMN `business_type_am`    VARCHAR(300) DEFAULT '',
  ADD COLUMN `business_type_or`    VARCHAR(300) DEFAULT '';

ALTER TABLE `news`
  ADD COLUMN `source_url`  VARCHAR(500) DEFAULT NULL,
  ADD COLUMN `category_am` VARCHAR(100) DEFAULT '',
  ADD COLUMN `category_or` VARCHAR(100) DEFAULT '';

ALTER TABLE `team_members`
  ADD COLUMN `department_am`       VARCHAR(200) DEFAULT '',
  ADD COLUMN `department_or`       VARCHAR(200) DEFAULT '';

ALTER TABLE `contact_submissions`
  ADD COLUMN `lang`             VARCHAR(5)   DEFAULT 'en',
  ADD COLUMN `business_type_am` VARCHAR(300) DEFAULT '',
  ADD COLUMN `business_type_or` VARCHAR(300) DEFAULT '',
  ADD COLUMN `message_am`       TEXT,
  ADD COLUMN `message_or`       TEXT;

ALTER TABLE `users`
  ADD COLUMN `lang`             VARCHAR(5)   DEFAULT 'en',
  ADD COLUMN `business_type_am` VARCHAR(300) DEFAULT '',
  ADD COLUMN `business_type_or` VARCHAR(300) DEFAULT '';

ALTER TABLE `user_profiles`
  ADD COLUMN `bio_am`             TEXT,
  ADD COLUMN `bio_or`             TEXT,
  ADD COLUMN `services_needed_am` TEXT,
  ADD COLUMN `services_needed_or` TEXT,
  ADD COLUMN `notes_am`           TEXT,
  ADD COLUMN `notes_or`           TEXT;

ALTER TABLE `client_promotion_paths`
  ADD COLUMN `title_am` VARCHAR(300) DEFAULT '',
  ADD COLUMN `title_or` VARCHAR(300) DEFAULT '';

ALTER TABLE `client_media`
  ADD COLUMN `description_am` VARCHAR(500) DEFAULT '',
  ADD COLUMN `description_or` VARCHAR(500) DEFAULT '';

ALTER TABLE `client_path_media`
  ADD COLUMN `description_am` VARCHAR(500) DEFAULT '',
  ADD COLUMN `description_or` VARCHAR(500) DEFAULT '';

ALTER TABLE `ads`
  ADD COLUMN `title_am`       VARCHAR(300) DEFAULT '',
  ADD COLUMN `title_or`       VARCHAR(300) DEFAULT '',
  ADD COLUMN `description`    TEXT,
  ADD COLUMN `description_am` TEXT,
  ADD COLUMN `description_or` TEXT;

ALTER TABLE `user_submissions`
  ADD COLUMN `path_name_am`   VARCHAR(300) DEFAULT '',
  ADD COLUMN `path_name_or`   VARCHAR(300) DEFAULT '',
  ADD COLUMN `description_am` TEXT,
  ADD COLUMN `description_or` TEXT,
  ADD COLUMN `lang`           VARCHAR(5) DEFAULT 'en';

SELECT 'Multilingual migration complete.' AS status;
