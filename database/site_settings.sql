-- Site settings migration
-- Stores one row of site-wide content managed from the admin panel
-- (contact info, socials, home stats, testimonials, about stats, footer links).
CREATE TABLE IF NOT EXISTS site_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  settings_json LONGTEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO site_settings (id, settings_json) VALUES (1, '{}')
ON DUPLICATE KEY UPDATE id = id;