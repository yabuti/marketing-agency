-- Bazaar Schedule — weekly open/close countdown
-- Adds default schedule settings for the Bazaar open/close countdown feature.
-- Admin edits these from Admin → Bazaar Schedule (or Bazaar Settings page).
--
-- Keys:
--   schedule_enabled '1'/'0'  -> use the recurring weekly schedule below
--   open_day   (0=Sunday .. 6=Saturday)
--   open_time  'HH:MM' (Ethiopia time)
--   close_day  (0=Sunday .. 6=Saturday)
--   close_time 'HH:MM' (Ethiopia time)
--   is_open    '1'/'0'  -> manual-mode toggle (used when schedule_enabled != '1')
--   open_date  -> one-off reopen datetime for manual mode countdown
--   close_date -> one-off close datetime for manual mode countdown

CREATE TABLE IF NOT EXISTS `bazaar_settings` (
  `id`         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `key_name`   VARCHAR(100) NOT NULL UNIQUE,
  `value`      TEXT,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `bazaar_settings` (`key_name`, `value`) VALUES
  ('schedule_enabled', '0'),
  ('open_day', '0'),
  ('open_time', '09:00'),
  ('close_day', '0'),
  ('close_time', '17:00'),
  ('is_open', '0'),
  ('open_date', NULL),
  ('close_date', NULL);
