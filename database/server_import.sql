SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

DROP TABLE IF EXISTS `user_submissions`;
DROP TABLE IF EXISTS `user_profiles`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `client_path_media`;
DROP TABLE IF EXISTS `client_promotion_paths`;
DROP TABLE IF EXISTS `client_media`;
DROP TABLE IF EXISTS `clients`;
DROP TABLE IF EXISTS `news_images`;
DROP TABLE IF EXISTS `news`;
DROP TABLE IF EXISTS `ads`;
DROP TABLE IF EXISTS `contact_submissions`;
DROP TABLE IF EXISTS `team_members`;
DROP TABLE IF EXISTS `admins`;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `admins` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `admins` (`name`, `email`, `password`) VALUES
('Admin', 'admin@allthings.com', '$2a$10$CDPp6DHj6XsOHpzUyvD/1O66Xaxa4W9hsamRtq3A/RVGT35dXkOci');

CREATE TABLE `clients` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(200) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `icon` VARCHAR(10) DEFAULT '🏢',
  `description` TEXT,
  `full_description` TEXT,
  `established` VARCHAR(20),
  `location` VARCHAR(200),
  `license_number` VARCHAR(100),
  `phone` VARCHAR(50),
  `tin_number` VARCHAR(100) NOT NULL DEFAULT '',
  `business_license_number` VARCHAR(100) NOT NULL DEFAULT '',
  `elmis_registration` VARCHAR(100) NOT NULL DEFAULT '',
  `website` VARCHAR(255),
  `followers` VARCHAR(30) DEFAULT '0',
  `growth` VARCHAR(30) DEFAULT '0%',
  `engagement` VARCHAR(30) DEFAULT '0%',
  `is_active` TINYINT(1) DEFAULT 1,
  `business_type` VARCHAR(300) DEFAULT NULL,
  `facebook` VARCHAR(255) DEFAULT NULL,
  `instagram` VARCHAR(255) DEFAULT NULL,
  `tiktok` VARCHAR(255) DEFAULT NULL,
  `telegram` VARCHAR(255) DEFAULT NULL,
  `logo_path` VARCHAR(500) DEFAULT NULL,
  `work_images` TEXT DEFAULT NULL,
  `name_am` VARCHAR(300) DEFAULT '',
  `name_or` VARCHAR(300) DEFAULT '',
  `category_am` VARCHAR(200) DEFAULT '',
  `category_or` VARCHAR(200) DEFAULT '',
  `description_am` TEXT,
  `description_or` TEXT,
  `full_description_am` TEXT,
  `full_description_or` TEXT,
  `location_am` VARCHAR(300) DEFAULT '',
  `location_or` VARCHAR(300) DEFAULT '',
  `business_type_am` VARCHAR(300) DEFAULT '',
  `business_type_or` VARCHAR(300) DEFAULT '',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `clients` (`id`, `name`, `category`, `icon`, `description`, `full_description`, `established`, `location`, `license_number`, `phone`, `tin_number`, `business_license_number`, `elmis_registration`, `website`, `followers`, `growth`, `engagement`, `is_active`, `business_type`, `facebook`, `instagram`, `tiktok`, `telegram`) VALUES
(5, 'yabu furniture', 'Manufacturers', '🏢', 'A furniture house is a retail store or showroom where different types of furniture such as chairs, tables, beds, and sofas are displayed and sold to customers.', 'A furniture house is a business establishment that specializes in the design, display, and sale of furniture for homes, offices, and commercial spaces.', '2013', 'Addis Ababa', NULL, '+251944060XXX', '0057085098', 'AA/KLK/W02/14/667/89710/1996', 'EMDRK95673', 'www.furnitur.com', '0', '0%', '0%', 1, 'Furniture and home appliance shops', 'www.fes.com', 'www.ins.com', 'www.tiktok.com', 'www.tel.com'),
(7, 'MESKEREM KOKABE AND THEIR FRI/CAF/A/RES/UN/P/S', 'Hospitality & Tourism', '🏢', 'A coffee house is a place where people gather to enjoy coffee, tea, and light refreshments in a comfortable and relaxing environment.', 'A coffee house is a business establishment that specializes in serving coffee and a variety of beverages, along with light snacks.', '2020', 'Addis Ababa', NULL, '+251943450XXX', '0089680677', 'AA/KLK/W02/14/667/736010/2034', '', 'www.coffee.com', '20', '10%', '70%', 1, 'Restaurants and cafes', 'www.fes.com', 'www.ins.com', 'www.tiktok.com', 'www.tel.com'),
(8, 'SURAFEL TEWODROS AND FRIENDS METALS AND WOOD WORK', 'Manufacturers', '🏢', 'Woodwork is the craft of shaping, cutting, and assembling wood to create useful or decorative items such as furniture, doors, and cabinets.', 'Woodwork is a skilled trade and creative craft that involves working with wood to design, build, and repair a wide range of items.', '2024', 'Addis Ababa', NULL, '+251978450XXX', '0079905031', 'AA/KLK/W02/14/667/69710/1996', 'EDMRK82604', 'www.woodwork.com', '89', '78%', '40%', 1, 'Metal and wood furniture manufacturers', 'www.fes.com', 'www.ins.com', 'www.tiktok.com', 'www.tel.com'),
(9, 'Ermias-Seme-Leather-PLC', 'Manufacturers', '🏢', 'Leather is a strong and flexible material made from animal skin, commonly used to produce items such as shoes, bags, belts, and furniture.', 'Leather is a natural material created by processing and treating animal hides and skins, most commonly from cattle, goats, and sheep.', '2022', 'Addis Ababa', NULL, '+251998450XXX', '0085718273', 'AA/KLK/W02/14/667/64010/1996', '', 'www.leather.com', '89', '78%', '40%', 1, 'Shoe and leather product manufacturers', 'www.fes.com', 'www.ins.com', 'www.tiktok.com', 'www.tel.com'),
(10, 'BAMLAK BETLEHEM AND FIRNDES YEBLETNA WORKES PS', 'Retail & Wholesale', '🏢', 'Food is any substance consumed by living organisms to provide energy, nutrition, and support growth.', 'Food refers to any material, usually of plant or animal origin, that is eaten or drunk by humans and other living organisms to sustain life.', '2022', 'Addis Ababa', NULL, '+251998920XXX', '0059617701', 'AA/KLK/W02/14/667/736010/2000', '', 'www.food.com', '89', '78%', '40%', 1, 'Food and beverage wholesalers', 'www.fes.com', 'www.ins.com', 'www.tiktok.com', 'www.tel.com');

CREATE TABLE `client_media` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `client_id` INT UNSIGNED NOT NULL,
  `type` ENUM('image','video') NOT NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `description` VARCHAR(500) DEFAULT '',
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `client_promotion_paths` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `client_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(300) NOT NULL,
  `path_date` DATE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `client_promotion_paths` (`id`, `client_id`, `title`, `path_date`) VALUES
(2, 7, 'MESKEREM KOKABE AND THEIR FRI/CAF/A/RES/UN/P/S — Path 1', '2026-04-05'),
(3, 8, 'SURAFEL TEWODROS AND FRIENDS METALS AND WOOD WORK — Path 1', '2026-04-05'),
(4, 9, 'Ermias-Seme-Leather-PLC — Path 1', '2026-04-05'),
(5, 10, 'BAMLAK BETLEHEM AND FIRNDES YEBLETNA WORKES PS — Path 1', '2026-04-05'),
(6, 5, 'first round', '2026-04-05');

CREATE TABLE `client_path_media` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `path_id` INT UNSIGNED NOT NULL,
  `type` ENUM('image','video') NOT NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `description` VARCHAR(500) DEFAULT '',
  `price` VARCHAR(100) DEFAULT NULL,
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`path_id`) REFERENCES `client_promotion_paths`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `client_path_media` (`id`, `path_id`, `type`, `file_path`, `description`, `sort_order`) VALUES
(42, 6, 'image', 'uploads/paths/69d35fdfa15f9.jpg', 'Image 2', 1),
(43, 6, 'image', 'uploads/paths/69d35ff32267e.jpg', 'Image 2', 1),
(44, 6, 'image', 'uploads/paths/69d35fff334f3.jpg', 'Image 3', 2),
(45, 6, 'image', 'uploads/paths/69d3600b2c853.jpg', 'Image 4', 3),
(46, 6, 'image', 'uploads/paths/69d36017a0dd0.jpg', 'Image 5', 4),
(47, 6, 'video', 'uploads/paths/69d36034db47f.mp4', 'Video 1', 0),
(48, 6, 'video', 'uploads/paths/69d36043d867e.mp4', 'Video 2', 1),
(49, 6, 'video', 'uploads/paths/69d36103561a5.mp4', 'Video 3', 2),
(50, 3, 'image', 'uploads/paths/69d3619eee28d.jpg', 'Image 1', 0),
(51, 3, 'image', 'uploads/paths/69d361aaa83c6.jpg', 'Image 2', 1),
(52, 3, 'image', 'uploads/paths/69d361b5bd807.jpg', 'Image 3', 2),
(53, 3, 'image', 'uploads/paths/69d361c84a2e9.jpg', 'Image 4', 3),
(54, 3, 'image', 'uploads/paths/69d361deb0b12.jpg', 'Image 5', 4),
(55, 3, 'video', 'uploads/paths/69d36200330a0.mp4', 'Video 1', 0),
(56, 3, 'video', 'uploads/paths/69d3620d37961.mp4', 'Video 2', 1),
(57, 3, 'video', 'uploads/paths/69d362197ad6d.mp4', 'Video 3', 2),
(58, 4, 'image', 'uploads/paths/69d3627602ea1.jpg', 'Image 1', 0),
(59, 4, 'image', 'uploads/paths/69d3628838095.jpg', 'Image 2', 1),
(60, 4, 'image', 'uploads/paths/69d3629d4684f.jpg', 'Image 3', 2),
(61, 4, 'image', 'uploads/paths/69d362ab4a1ce.jpg', 'Image 4', 3),
(62, 4, 'image', 'uploads/paths/69d362bb2371b.jpg', 'Image 5', 4),
(63, 4, 'video', 'uploads/paths/69d362da01ec0.mp4', 'Video 1', 0),
(64, 4, 'video', 'uploads/paths/69d362e74d023.mp4', 'Video 2', 1),
(65, 4, 'video', 'uploads/paths/69d362f478490.mp4', 'Video 3', 2),
(66, 5, 'image', 'uploads/paths/69d36345ea57c.jpg', 'Image 1', 0),
(67, 5, 'image', 'uploads/paths/69d36351b7005.jpg', 'Image 2', 1),
(68, 5, 'image', 'uploads/paths/69d3635edb88c.jpg', 'Image 3', 2),
(69, 5, 'image', 'uploads/paths/69d36398b7a50.jpg', 'Image 4', 3),
(70, 5, 'image', 'uploads/paths/69d363a5b742b.jpg', 'Image 5', 4),
(71, 5, 'video', 'uploads/paths/69d363c07b8c4.mp4', 'Video 1', 0),
(72, 5, 'video', 'uploads/paths/69d363cba5215.mp4', 'Video 2', 1),
(73, 5, 'video', 'uploads/paths/69d363e366abf.mp4', 'Video 3', 2),
(74, 2, 'image', 'uploads/paths/69d366a6e0bbd.jpg', 'Image 1', 0),
(75, 2, 'image', 'uploads/paths/69d366b428a2a.jpg', 'Image 2', 1),
(76, 2, 'image', 'uploads/paths/69d366c154ff2.jpg', 'Image 3', 2),
(77, 2, 'image', 'uploads/paths/69d366d255243.jpg', 'Image 4', 3),
(78, 2, 'image', 'uploads/paths/69d366e467b3e.jpg', 'Image 5', 4),
(79, 2, 'video', 'uploads/paths/69d36720cef43.mp4', 'Video 1', 0),
(80, 2, 'video', 'uploads/paths/69d3673d2cd38.mp4', 'Video 2', 1),
(81, 2, 'video', 'uploads/paths/69d3674a5cae7.mp4', 'Video 3', 2);

CREATE TABLE `news` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(500) NOT NULL,
  `title_am` VARCHAR(500) DEFAULT '',
  `title_or` VARCHAR(500) DEFAULT '',
  `content` LONGTEXT NOT NULL,
  `content_am` LONGTEXT,
  `content_or` LONGTEXT,
  `category` VARCHAR(100) DEFAULT 'General',
  `category_am` VARCHAR(100) DEFAULT '',
  `category_or` VARCHAR(100) DEFAULT '',
  `source_url` VARCHAR(500) DEFAULT NULL,
  `source_urls` TEXT,
  `is_published` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `news` (`id`, `title`, `title_am`, `title_or`, `content`, `content_am`, `content_or`, `category`, `is_published`, `source_urls`) VALUES
(5, '', 'መገቢት 21/2018 ዓ.ም አዲስ አበባ በኢትዮጵያ ታምርት ኤክስፖ 2018 ይሳተፉ', '', '', 'ከሚያዚያ 24-28/2018 ዓ.ም በአዲስ ኮንቬንሽን ማዕከል በመገኘት በኢትዮጵያ ታምርት ኤክስፖ ለመሳተፍ ከታች የተቀመጠውን ሊንክ ተጠቅመው ይመዝገቡ', '', 'Business', 1, '["https://ethiopiatamrit.et/made-in-ethiopia"]'),
(6, '', 'መገቢት28/2018 ዓ.ም አዲስ አበባ በአውደ ርዕይና ባዛር ከ32 ሚሊዮን ብር በላይ የገበያ ትስስር መፍጠር ተቻለ', '', '', 'የአዲስ አበባ ሥራና ክህሎት ቢሮ የኢንተርፕራይዞች ሳምንት አውደ ርዕይና ባዛር ተጠናቋል።', '', 'Technology', 1, NULL);

CREATE TABLE `news_images` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `news_id` INT UNSIGNED NOT NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `description` VARCHAR(500) DEFAULT '',
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`news_id`) REFERENCES `news`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `news_images` (`id`, `news_id`, `file_path`, `description`, `sort_order`) VALUES
(5, 5, 'uploads/news/69d3f40d22b74.png', 'Image 1', 0),
(6, 5, 'uploads/news/69d3f41578ee6.png', 'Image 2', 1),
(7, 5, 'uploads/news/69d3f433cc588.png', 'Image 3', 2),
(8, 6, 'uploads/news/69d3f5a9d8cdf.png', 'Image 1', 0),
(9, 6, 'uploads/news/69d3f5b0111fe.png', 'Image 2', 1),
(10, 6, 'uploads/news/69d3f5b6e5bd2.png', 'Image 3', 2);

CREATE TABLE `ads` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(300) NOT NULL,
  `title_am` VARCHAR(300) DEFAULT '',
  `title_or` VARCHAR(300) DEFAULT '',
  `description` TEXT,
  `description_am` TEXT,
  `description_or` TEXT,
  `type` ENUM('general','holiday','company') NOT NULL DEFAULT 'general',
  `holiday_name` VARCHAR(200) DEFAULT NULL,
  `holiday_date` DATE DEFAULT NULL,
  `show_from` DATE NOT NULL,
  `show_until` DATE NOT NULL,
  `image_path` VARCHAR(500) DEFAULT NULL,
  `link_url` VARCHAR(500) DEFAULT NULL,
  `duration_sec` INT DEFAULT 15,
  `sort_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `company_name` VARCHAR(200) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `ads` (`id`, `title`, `type`, `holiday_name`, `holiday_date`, `show_from`, `show_until`, `image_path`, `duration_sec`, `sort_order`, `is_active`, `company_name`) VALUES
(1, 'Happy Easter 2026', 'holiday', 'Easter', '2026-04-05', '2026-03-29', '2026-04-08', NULL, 15, 1, 1, 'All Things'),
(2, 'gebreal', 'holiday', 'gebreal', '2026-07-30', '2026-07-23', '2026-08-02', 'uploads/images/1774642317467-791118472.webp', 15, 0, 1, NULL);

CREATE TABLE `contact_submissions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(200) NOT NULL,
  `email` VARCHAR(200),
  `phone` VARCHAR(50) NOT NULL,
  `business_type` VARCHAR(300),
  `company_name` VARCHAR(200),
  `tin_number` VARCHAR(100),
  `elmis_registration` VARCHAR(100),
  `business_license` VARCHAR(100),
  `message` TEXT,
  `lang` VARCHAR(5) DEFAULT 'en',
  `status` ENUM('new','read','contacted') DEFAULT 'new',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(200) NOT NULL,
  `email` VARCHAR(200) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50),
  `company_name` VARCHAR(200),
  `business_type` VARCHAR(300),
  `tin_number` VARCHAR(100),
  `elmis_registration` VARCHAR(100),
  `business_license_number` VARCHAR(100),
  `location` VARCHAR(200),
  `website` VARCHAR(255),
  `lang` VARCHAR(5) DEFAULT 'en',
  `status` ENUM('pending','active','suspended') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `user_profiles` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL UNIQUE,
  `bio` TEXT,
  `instagram` VARCHAR(200),
  `tiktok` VARCHAR(200),
  `telegram` VARCHAR(200),
  `facebook` VARCHAR(200),
  `employees` VARCHAR(50),
  `established` VARCHAR(20),
  `services_needed` TEXT,
  `notes` TEXT,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `user_submissions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `path_name` VARCHAR(300) NOT NULL,
  `description` TEXT,
  `lang` VARCHAR(5) DEFAULT 'en',
  `status` ENUM('pending','approved','rejected') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `team_members` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(200) NOT NULL,
  `position` VARCHAR(300) NOT NULL,
  `position_am` VARCHAR(300) DEFAULT '',
  `position_or` VARCHAR(300) DEFAULT '',
  `department` VARCHAR(100) NOT NULL,
  `department_am` VARCHAR(200) DEFAULT '',
  `department_or` VARCHAR(200) DEFAULT '',
  `responsibilities` TEXT,
  `responsibilities_am` TEXT,
  `responsibilities_or` TEXT,
  `photo_path` VARCHAR(500) DEFAULT NULL,
  `sort_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `team_members` (`id`, `full_name`, `position`, `department`, `responsibilities`, `photo_path`, `sort_order`, `is_active`) VALUES
(1, 'Hailu Bogale', 'Managing Director / General Manager', 'Executive Management', 'Overall strategic leadership, business development, financial oversight, stakeholder relations, decision making', 'uploads/team/69d411c297659.jpg', 1, 1),
(2, 'Yeabsera Getachew', 'Operations Manager', 'Executive Management', 'Oversee day-to-day operations, process optimization, ensure smooth workflow', 'uploads/team/69d411d06cd49.jpg', 2, 1),
(3, 'Yeabsera Terefe', 'Marketing & Sales Manager', 'Executive Management', 'Plan and execute marketing campaigns, lead generation, sales strategies, client acquisition', 'uploads/team/69d411ddafec0.jpg', 3, 1),
(4, 'Abebe Kebede', 'Creative Director', 'Creative & Digital Marketing', 'Supervises content and design quality, branding strategy, campaign concept creation', NULL, 4, 1),
(5, 'Abebe Kebede', 'Digital Marketing Specialist', 'Creative & Digital Marketing', 'Social media management, SEO, paid campaigns, content scheduling, analytics tracking', NULL, 5, 1),
(6, 'Abebe Kebede', 'Digital Marketing Specialist', 'Creative & Digital Marketing', 'Social media management, SEO, paid campaigns, content scheduling, analytics tracking', NULL, 6, 1),
(7, 'Abebe Kebede', 'Graphic Designer & Content Creator', 'Creative & Digital Marketing', 'Design visuals for campaigns, social media posts, website content, flyers, banners, and promotional items', NULL, 7, 1),
(8, 'Abebe Kebede', 'Graphic Designer & Content Creator', 'Creative & Digital Marketing', 'Design visuals for campaigns, social media posts, website content, flyers, banners, and promotional items', NULL, 8, 1),
(9, 'Abebe Kebede', 'Copywriter / Content Writer', 'Creative & Digital Marketing', 'Create engaging text content for social media, blogs, email campaigns, advertising copy', NULL, 9, 1),
(10, 'Abebe Kebede', 'IT & App Support', 'Technology & Platform Support', 'Maintain website and mobile apps, troubleshoot technical issues, and update software', NULL, 10, 1),
(11, 'Abebe Kebede', 'IT & App Support', 'Technology & Platform Support', 'Maintain website and mobile apps, troubleshoot technical issues, and update software', NULL, 11, 1),
(12, 'Abebe Kebede', 'Web & App Developer', 'Technology & Platform Support', 'Website & mobile app development, feature upgrades, UX/UI improvements', NULL, 12, 1),
(13, 'Abebe Kebede', 'Analytics & Data Specialist', 'Technology & Platform Support', 'Monitor campaign metrics, prepare performance reports, optimize advertising results', NULL, 13, 1),
(14, 'Abebe Kebede', 'Finance & Administration Officer', 'Finance & Administration', 'Manage financial records, budgets, payroll, procurement, office administration', NULL, 14, 1),
(15, 'Abebe Kebede', 'HR Assistant / Office Coordinator', 'Finance & Administration', 'Recruitment support, employee records, office management, staff scheduling', NULL, 15, 1),
(16, 'Abebe Kebede', 'Customer Support Representative', 'Customer & Sales', 'Respond to client inquiries via website, mobile app, social media, phone, and email', NULL, 16, 1),
(17, 'Abebe Kebede', 'Customer Support Representative', 'Customer & Sales', 'Respond to client inquiries via website, mobile app, social media, phone, and email', NULL, 17, 1),
(18, 'Abebe Kebede', 'Sales Associate / Account Manager', 'Customer & Sales', 'Handle client relationships, follow-up on proposals, upsell packages, manage subscription plans', NULL, 18, 1),
(19, 'Abebe Kebede', 'Sales Associate / Account Manager', 'Customer & Sales', 'Handle client relationships, follow-up on proposals, upsell packages, manage subscription plans', NULL, 19, 1);
