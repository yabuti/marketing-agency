-- ============================================================
-- Chat System Migration
-- Run after full_install.sql
-- ============================================================

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
