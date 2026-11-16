-- Migration: user_submission_files
--
-- The campaign submission feature (routes/submissions.php) writes uploaded
-- images/videos to this table, but full_install.sql never created it, so
-- every submission insert failed with "Table doesn't exist".
--
-- Safe to run more than once.

CREATE TABLE IF NOT EXISTS `user_submission_files` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `submission_id` int(10) UNSIGNED NOT NULL,
  `type` enum('image','video') NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `submission_id` (`submission_id`),
  CONSTRAINT `user_submission_files_ibfk_1`
    FOREIGN KEY (`submission_id`) REFERENCES `user_submissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
