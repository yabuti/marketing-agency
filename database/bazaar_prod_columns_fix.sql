-- PRODUCTION FIX — allthings.com.et (plain MySQL ALTER)
--
-- The live `bazaar_products` table is missing five columns that the product
-- LIST endpoints (market list, trending, best-deals) compute on, so every list
-- request returns HTTP 500 and the web app shows an empty Market/Bazaar.
-- Product DETAILS still work, so no data is lost — this migration just adds
-- the columns.
--
-- NOTE: this host's user (allthing_) has no information_schema privileges and
-- MySQL has no "ADD COLUMN IF NOT EXISTS", so these are plain ALTERs meant to
-- be run once. Re-running will throw "#1060 Duplicate column name" for the
-- columns that already exist — ignore those messages, column(s) are present.
--
-- How to apply (Plesk): Websites & Domains → DB Servers / phpMyAdmin → select
-- the All Things database → SQL tab → paste the whole file → Go.

ALTER TABLE bazaar_products ADD COLUMN discount_price DECIMAL(12,2) DEFAULT NULL AFTER price;
ALTER TABLE bazaar_products ADD COLUMN views INT NOT NULL DEFAULT 0 AFTER discount_price;
ALTER TABLE bazaar_products ADD COLUMN likes INT NOT NULL DEFAULT 0 AFTER views;
ALTER TABLE bazaar_products ADD COLUMN in_bazaar TINYINT(1) NOT NULL DEFAULT 1 AFTER likes;
ALTER TABLE bazaar_products ADD COLUMN subcategory VARCHAR(150) DEFAULT NULL AFTER category;