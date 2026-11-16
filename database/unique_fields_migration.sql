-- Migration: Add elmis_registration to clients and enforce uniqueness

ALTER TABLE `clients`
  ADD COLUMN `elmis_registration` VARCHAR(100) NOT NULL DEFAULT '',
  ADD COLUMN `logo_path` VARCHAR(500) DEFAULT NULL,
  MODIFY COLUMN `tin_number`              VARCHAR(100) NOT NULL DEFAULT '',
  MODIFY COLUMN `business_license_number` VARCHAR(100) NOT NULL DEFAULT '';

ALTER TABLE `clients`
  ADD CONSTRAINT `uq_clients_tin_number`               UNIQUE (`tin_number`),
  ADD CONSTRAINT `uq_clients_business_license_number`  UNIQUE (`business_license_number`),
  ADD CONSTRAINT `uq_clients_elmis_registration`       UNIQUE (`elmis_registration`);

ALTER TABLE `team_members`
  ADD COLUMN `position_am`         VARCHAR(300) DEFAULT '',
  ADD COLUMN `position_or`         VARCHAR(300) DEFAULT '',
  ADD COLUMN `responsibilities_am` TEXT,
  ADD COLUMN `responsibilities_or` TEXT;

ALTER TABLE `client_path_media`
  ADD COLUMN `price` VARCHAR(100) DEFAULT NULL;

ALTER TABLE `news`
  ADD COLUMN `source_urls` TEXT DEFAULT NULL;
