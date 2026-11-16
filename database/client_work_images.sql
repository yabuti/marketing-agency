-- Client work images (max 3)
-- The client detail page shows up to 3 "work samples" above the contact card.
-- They are stored as a JSON array of file paths in clients.work_images
-- (array index = slot). Run this once in phpMyAdmin (Import) on existing
-- databases. Until it runs, the admin API returns a clear
-- "Database migration missing" error instead of a SQL error.
-- Fresh installs from full_install.sql / install.sql / server_import.sql
-- already include this column.

ALTER TABLE `clients`
  ADD COLUMN `work_images` TEXT DEFAULT NULL AFTER `logo_path`;
