-- =============================================================================
-- BAZAAR CATEGORIES — DISPLAY NAME
-- Adds bazaar_categories.display_name so admins can rename a category as it
-- appears on the website (shop-by-category tiles, nav labels, dropdowns)
-- WITHOUT touching bazaar_categories.name.
--
-- Why a separate column:
--   `name` is the canonical key that products are stored against. The website
--   normalises every product/legacy name onto the canonical 8, so a `name` that
--   drifts away from the canonical list makes the category disappear from the
--   market page and stops matching its own products. `display_name` is purely
--   cosmetic and falls back to `name` when empty.
--
-- Safe to run more than once (idempotent).
-- =============================================================================

-- ── 1. Add display_name if it does not exist yet ───────────────────────────
SET @sql := (SELECT IF(COUNT(*)=0,
  'ALTER TABLE `bazaar_categories` ADD COLUMN `display_name` VARCHAR(100) NULL DEFAULT NULL AFTER `name`',
  'SELECT 1')
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bazaar_categories' AND COLUMN_NAME = 'display_name');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ── 2. Backfill: leave existing rows falling back to `name` (NULL) ─────────
-- Intentionally a no-op so an admin-set display name is never overwritten.
UPDATE `bazaar_categories` SET `display_name` = NULL WHERE `display_name` = '';