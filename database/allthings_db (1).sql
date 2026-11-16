-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 06, 2026 at 11:45 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `allthings_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
CREATE TABLE `admins` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `name`, `email`, `password`, `created_at`) VALUES
(2, 'Admin', 'admin@allthings.com', '$2a$10$CDPp6DHj6XsOHpzUyvD/1O66Xaxa4W9hsamRtq3A/RVGT35dXkOci', '2026-03-27 17:07:15');

-- --------------------------------------------------------

--
-- Table structure for table `ads`
--

DROP TABLE IF EXISTS `ads`;
CREATE TABLE `ads` (
  `id` int(10) UNSIGNED NOT NULL,
  `title` varchar(300) NOT NULL,
  `type` enum('general','holiday','company') NOT NULL DEFAULT 'general',
  `holiday_name` varchar(200) DEFAULT NULL,
  `holiday_date` date DEFAULT NULL,
  `show_from` date NOT NULL,
  `show_until` date NOT NULL,
  `image_path` varchar(500) DEFAULT NULL,
  `link_url` varchar(500) DEFAULT NULL,
  `duration_sec` int(11) DEFAULT 15,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `company_name` varchar(200) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ads`
--

INSERT INTO `ads` (`id`, `title`, `type`, `holiday_name`, `holiday_date`, `show_from`, `show_until`, `image_path`, `link_url`, `duration_sec`, `sort_order`, `is_active`, `company_name`, `created_at`, `updated_at`) VALUES
(1, 'Happy Easter 2026', 'holiday', 'Easter', '2026-04-05', '2026-03-29', '2026-04-08', NULL, NULL, 15, 1, 1, 'All Things', '2026-03-27 16:54:02', '2026-03-27 16:54:02'),
(2, 'gebreal', 'holiday', 'gebreal', '2026-07-30', '2026-07-23', '2026-08-02', 'uploads/images/1774642317467-791118472.webp', NULL, 15, 0, 1, NULL, '2026-03-27 20:09:43', '2026-03-27 20:11:57');

-- --------------------------------------------------------

--
-- Table structure for table `clients`
--

DROP TABLE IF EXISTS `clients`;
CREATE TABLE `clients` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(200) NOT NULL,
  `category` varchar(100) NOT NULL,
  `icon` varchar(10) DEFAULT '?',
  `description` text DEFAULT NULL,
  `full_description` text DEFAULT NULL,
  `established` varchar(20) DEFAULT NULL,
  `location` varchar(200) DEFAULT NULL,
  `license_number` varchar(100) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `tin_number` varchar(100) DEFAULT NULL,
  `business_license_number` varchar(100) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `followers` varchar(30) DEFAULT '0',
  `growth` varchar(30) DEFAULT '0%',
  `engagement` varchar(30) DEFAULT '0%',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `business_type` varchar(300) DEFAULT NULL,
  `facebook` varchar(255) DEFAULT NULL,
  `instagram` varchar(255) DEFAULT NULL,
  `tiktok` varchar(255) DEFAULT NULL,
  `telegram` varchar(255) DEFAULT NULL,
  `elmis_registration` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `clients`
--

INSERT INTO `clients` (`id`, `name`, `category`, `icon`, `description`, `full_description`, `established`, `location`, `license_number`, `phone`, `tin_number`, `business_license_number`, `website`, `followers`, `growth`, `engagement`, `is_active`, `created_at`, `updated_at`, `business_type`, `facebook`, `instagram`, `tiktok`, `telegram`, `elmis_registration`) VALUES
(5, 'yabu furniture', 'Manufacturers', '🏢', 'A furniture house is a retail store or showroom where different types of furniture such as chairs, tables, beds, and sofas are displayed and sold to customers.', 'A furniture house is a business establishment that specializes in the design, display, and sale of furniture for homes, offices, and commercial spaces. It serves as a showroom where customers can explore a wide variety of furniture items such as sofas, dining tables, beds, wardrobes, office desks, and decorative pieces.', '2013', 'Addis Ababa', NULL, '+251944060XXX', '0057085098', 'AA/KLK/W02/14/667/89710/1996', 'www.furnitur.com', '0', '0%', '0%', 1, '2026-04-05 12:30:11', '2026-04-06 07:30:15', 'Furniture and home appliance shops', 'www.fes.com', 'www.ins.com', 'www.tiktok.com', 'www.tel.com', 'EMDRK95673'),
(7, 'MESKEREM KOKABE AND THEIR FRI/CAF/A/RES/UN/P/S', 'Hospitality & Tourism', '🏢', 'A coffee house is a place where people gather to enjoy coffee, tea, and light refreshments in a comfortable and relaxing environment. It serves as a social space for meetings, conversations, and leisure', 'A coffee house is a business establishment that specializes in serving coffee and a variety of beverages, along with light snacks such as pastries, sandwiches, and desserts. It provides a warm and inviting atmosphere where customers can relax, socialize, work, or hold informal meetings. Coffee houses often feature comfortable seating, ambient music, and free Wi-Fi, making them popular spaces for both personal and professional activities.\n\nIn addition to beverages, many coffee houses focus on creating a unique customer experience through interior design, quality service, and a welcoming environment. Some may offer specialty coffee made from high-quality beans, including espresso-based drinks like cappuccino and latte, while others highlight local coffee traditions.', '2020', 'Addis Ababa', NULL, '+251943450XXX', '0089680677', 'AA/KLK/W02/14/667/736010/2034', 'www.coffee.com', '20', '10%', '70%', 1, '2026-04-05 13:00:10', '2026-04-05 15:05:43', 'Restaurants and cafes', 'www.fes.com', 'www.ins.com', 'www.tiktok.com', 'www.tel.com', NULL),
(8, 'SURAFEL TEWODROS AND FRIENDS METALS AND WOOD WORK', 'Manufacturers', '🏢', 'Woodwork is the craft of shaping, cutting, and assembling wood to create useful or decorative items such as furniture, doors, and cabinets. It combines skill, creativity, and tools to produce strong and attractive wooden products.', 'Woodwork is a skilled trade and creative craft that involves working with wood to design, build, and repair a wide range of items. It includes activities such as cutting, carving, shaping, joining, and finishing wood to produce products like furniture, doors, windows, cabinets, and decorative pieces. Woodwork is used in homes, offices, and construction projects, making it an essential part of everyday life.\n\nThere are different types of woodwork, including carpentry, joinery, and furniture making. Skilled workers use various hand tools and machines to ensure accuracy, durability, and quality. Modern woodwork may also involve advanced equipment and design techniques, while traditional methods focus on craftsmanship and detail.', '2024', 'Addis Ababa', NULL, '+251978450XXX', '0079905031', 'AA/KLK/W02/14/667/69710/1996', 'www.woodwork.com', '89', '78%', '40%', 1, '2026-04-05 13:18:34', '2026-04-06 07:34:57', 'Metal and wood furniture manufacturers', 'www.fes.com', 'www.ins.com', 'www.tiktok.com', 'www.tel.com', 'EDMRK82604'),
(9, 'Ermias-Seme-Leather-PLC', 'Manufacturers', '🏢', 'Leather is a strong and flexible material made from animal skin, commonly used to produce items such as shoes, bags, belts, and furniture. It is valued for its durability, comfort, and stylish appearance.', 'Leather is a natural material created by processing and treating animal hides and skins, most commonly from cattle, goats, and sheep. The process, known as tanning, preserves the skin and makes it durable, flexible, and resistant to decay. Leather has been used for centuries due to its strength, long lifespan, and ability to develop a unique appearance over time.\n\nLeather is widely used in the production of various goods, including footwear, handbags, jackets, belts, upholstery, and accessories. It is popular in both fashion and furniture industries because of its comfort, elegance, and durability. There are different types of leather, such as full-grain, top-grain, and synthetic leather alternatives, each varying in quality, texture, and price.', '2022', 'Addis Ababa', NULL, '+251998450XXX', '0085718273', 'AA/KLK/W02/14/667/64010/1996', 'www.leather.com', '89', '78%', '40%', 1, '2026-04-05 13:28:11', '2026-04-05 15:16:54', 'Shoe and leather product manufacturers', 'www.fes.com', 'www.ins.com', 'www.tiktok.com', 'www.tel.com', NULL),
(10, 'BAMLAK BETLEHEM AND FIRNDES YEBLETNA WORKES PS', 'Retail & Wholesale', '🏢', 'Food is any substance consumed by living organisms to provide energy, nutrition, and support growth. It is essential for survival and maintaining good health.', 'Food refers to any material, usually of plant or animal origin, that is eaten or drunk by humans and other living organisms to sustain life. It provides essential nutrients such as carbohydrates, proteins, fats, vitamins, and minerals, which are necessary for energy, body growth, repair, and overall health.\n\nFood comes in many forms and varieties, including fruits, vegetables, grains, meat, dairy products, and processed items. Different cultures around the world have unique cuisines and cooking methods that reflect their traditions, environment, and available resources. For example, in Ethiopia, traditional foods like injera and various stews are an important part of daily life and social gatherings.', '2022', 'Addis Ababa', NULL, '+251998920XXX', '0059617701', 'AA/KLK/W02/14/667/736010/2000', 'www.food.com', '89', '78%', '40%', 1, '2026-04-05 14:21:58', '2026-04-05 15:26:49', 'Food and beverage wholesalers', 'www.fes.com', 'www.ins.com', 'www.tiktok.com', 'www.tel.com', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `client_media`
--

DROP TABLE IF EXISTS `client_media`;
CREATE TABLE `client_media` (
  `id` int(10) UNSIGNED NOT NULL,
  `client_id` int(10) UNSIGNED NOT NULL,
  `type` enum('image','video') NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `description` varchar(500) DEFAULT '',
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `client_path_media`
--

DROP TABLE IF EXISTS `client_path_media`;
CREATE TABLE `client_path_media` (
  `id` int(10) UNSIGNED NOT NULL,
  `path_id` int(10) UNSIGNED NOT NULL,
  `type` enum('image','video') NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `description` varchar(500) DEFAULT '',
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `client_path_media`
--

INSERT INTO `client_path_media` (`id`, `path_id`, `type`, `file_path`, `description`, `sort_order`, `created_at`) VALUES
(42, 6, 'image', 'uploads/paths/69d35fdfa15f9.jpg', 'Image 2', 1, '2026-04-06 07:25:19'),
(43, 6, 'image', 'uploads/paths/69d35ff32267e.jpg', 'Image 2', 1, '2026-04-06 07:25:39'),
(44, 6, 'image', 'uploads/paths/69d35fff334f3.jpg', 'Image 3', 2, '2026-04-06 07:25:51'),
(45, 6, 'image', 'uploads/paths/69d3600b2c853.jpg', 'Image 4', 3, '2026-04-06 07:26:03'),
(46, 6, 'image', 'uploads/paths/69d36017a0dd0.jpg', 'Image 5', 4, '2026-04-06 07:26:15'),
(47, 6, 'video', 'uploads/paths/69d36034db47f.mp4', 'Video 1', 0, '2026-04-06 07:26:45'),
(48, 6, 'video', 'uploads/paths/69d36043d867e.mp4', 'Video 2', 1, '2026-04-06 07:26:59'),
(49, 6, 'video', 'uploads/paths/69d36103561a5.mp4', 'Video 3', 2, '2026-04-06 07:30:11'),
(50, 3, 'image', 'uploads/paths/69d3619eee28d.jpg', 'Image 1', 0, '2026-04-06 07:32:47'),
(51, 3, 'image', 'uploads/paths/69d361aaa83c6.jpg', 'Image 2', 1, '2026-04-06 07:32:58'),
(52, 3, 'image', 'uploads/paths/69d361b5bd807.jpg', 'Image 3', 2, '2026-04-06 07:33:09'),
(53, 3, 'image', 'uploads/paths/69d361c84a2e9.jpg', 'Image 4', 3, '2026-04-06 07:33:28'),
(54, 3, 'image', 'uploads/paths/69d361deb0b12.jpg', 'Image 5', 4, '2026-04-06 07:33:50'),
(55, 3, 'video', 'uploads/paths/69d36200330a0.mp4', 'Video 1', 0, '2026-04-06 07:34:24'),
(56, 3, 'video', 'uploads/paths/69d3620d37961.mp4', 'Video 2', 1, '2026-04-06 07:34:37'),
(57, 3, 'video', 'uploads/paths/69d362197ad6d.mp4', 'Video 3', 2, '2026-04-06 07:34:49'),
(58, 4, 'image', 'uploads/paths/69d3627602ea1.jpg', 'Image 1', 0, '2026-04-06 07:36:22'),
(59, 4, 'image', 'uploads/paths/69d3628838095.jpg', 'Image 2', 1, '2026-04-06 07:36:40'),
(60, 4, 'image', 'uploads/paths/69d3629d4684f.jpg', 'Image 3', 2, '2026-04-06 07:37:01'),
(61, 4, 'image', 'uploads/paths/69d362ab4a1ce.jpg', 'Image 4', 3, '2026-04-06 07:37:15'),
(62, 4, 'image', 'uploads/paths/69d362bb2371b.jpg', 'Image 5', 4, '2026-04-06 07:37:31'),
(63, 4, 'video', 'uploads/paths/69d362da01ec0.mp4', 'Video 1', 0, '2026-04-06 07:38:02'),
(64, 4, 'video', 'uploads/paths/69d362e74d023.mp4', 'Video 2', 1, '2026-04-06 07:38:15'),
(65, 4, 'video', 'uploads/paths/69d362f478490.mp4', 'Video 3', 2, '2026-04-06 07:38:28'),
(66, 5, 'image', 'uploads/paths/69d36345ea57c.jpg', 'Image 1', 0, '2026-04-06 07:39:50'),
(67, 5, 'image', 'uploads/paths/69d36351b7005.jpg', 'Image 2', 1, '2026-04-06 07:40:01'),
(68, 5, 'image', 'uploads/paths/69d3635edb88c.jpg', 'Image 3', 2, '2026-04-06 07:40:14'),
(69, 5, 'image', 'uploads/paths/69d36398b7a50.jpg', 'Image 4', 3, '2026-04-06 07:41:12'),
(70, 5, 'image', 'uploads/paths/69d363a5b742b.jpg', 'Image 5', 4, '2026-04-06 07:41:25'),
(71, 5, 'video', 'uploads/paths/69d363c07b8c4.mp4', 'Video 1', 0, '2026-04-06 07:41:52'),
(72, 5, 'video', 'uploads/paths/69d363cba5215.mp4', 'Video 2', 1, '2026-04-06 07:42:03'),
(73, 5, 'video', 'uploads/paths/69d363e366abf.mp4', 'Video 3', 2, '2026-04-06 07:42:27'),
(74, 2, 'image', 'uploads/paths/69d366a6e0bbd.jpg', 'Image 1', 0, '2026-04-06 07:54:14'),
(75, 2, 'image', 'uploads/paths/69d366b428a2a.jpg', 'Image 2', 1, '2026-04-06 07:54:28'),
(76, 2, 'image', 'uploads/paths/69d366c154ff2.jpg', 'Image 3', 2, '2026-04-06 07:54:41'),
(77, 2, 'image', 'uploads/paths/69d366d255243.jpg', 'Image 4', 3, '2026-04-06 07:54:58'),
(78, 2, 'image', 'uploads/paths/69d366e467b3e.jpg', 'Image 5', 4, '2026-04-06 07:55:16'),
(79, 2, 'video', 'uploads/paths/69d36720cef43.mp4', 'Video 1', 0, '2026-04-06 07:56:16'),
(80, 2, 'video', 'uploads/paths/69d3673d2cd38.mp4', 'Video 2', 1, '2026-04-06 07:56:45'),
(81, 2, 'video', 'uploads/paths/69d3674a5cae7.mp4', 'Video 3', 2, '2026-04-06 07:56:58');

-- --------------------------------------------------------

--
-- Table structure for table `client_promotion_paths`
--

DROP TABLE IF EXISTS `client_promotion_paths`;
CREATE TABLE `client_promotion_paths` (
  `id` int(10) UNSIGNED NOT NULL,
  `client_id` int(10) UNSIGNED NOT NULL,
  `title` varchar(300) NOT NULL,
  `path_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `client_promotion_paths`
--

INSERT INTO `client_promotion_paths` (`id`, `client_id`, `title`, `path_date`, `created_at`, `updated_at`) VALUES
(2, 7, 'MESKEREM KOKABE AND THEIR FRI/CAF/A/RES/UN/P/S — Path 1', '2026-04-05', '2026-04-05 13:00:10', '2026-04-05 13:00:10'),
(3, 8, 'SURAFEL TEWODROS AND FRIENDS METALS AND WOOD WORK — Path 1', '2026-04-05', '2026-04-05 13:18:35', '2026-04-05 13:18:35'),
(4, 9, 'Ermias-Seme-Leather-PLC — Path 1', '2026-04-05', '2026-04-05 13:28:12', '2026-04-05 13:28:12'),
(5, 10, 'BAMLAK BETLEHEM AND FIRNDES YEBLETNA WORKES PS — Path 1', '2026-04-05', '2026-04-05 14:21:58', '2026-04-05 14:21:58'),
(6, 5, 'first round', '2026-04-05', '2026-04-05 14:33:16', '2026-04-05 14:33:16');

-- --------------------------------------------------------

--
-- Table structure for table `contact_submissions`
--

DROP TABLE IF EXISTS `contact_submissions`;
CREATE TABLE `contact_submissions` (
  `id` int(10) UNSIGNED NOT NULL,
  `full_name` varchar(200) NOT NULL,
  `email` varchar(200) DEFAULT NULL,
  `phone` varchar(50) NOT NULL,
  `business_type` varchar(300) DEFAULT NULL,
  `company_name` varchar(200) DEFAULT NULL,
  `tin_number` varchar(100) DEFAULT NULL,
  `elmis_registration` varchar(100) DEFAULT NULL,
  `business_license` varchar(100) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `status` enum('new','read','contacted') DEFAULT 'new',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contact_submissions`
--

INSERT INTO `contact_submissions` (`id`, `full_name`, `email`, `phone`, `business_type`, `company_name`, `tin_number`, `elmis_registration`, `business_license`, `message`, `status`, `created_at`) VALUES
(1, 'yeab', 'admin@allthings.com', '0908070504', 'Construction companies', 'yabu furniture', '1234', '738', '23', 'mnjyr jgu jhgyt', 'read', '2026-03-28 09:51:03'),
(2, 'yeab', 'admin@allthings.com', '0908070504', 'Medical clinics and pharmacies', 'yabu furniture', '1234', '738', '23', 'gwhg kjdkeuf dhej', 'read', '2026-03-29 12:00:43');

-- --------------------------------------------------------

--
-- Table structure for table `news`
--

DROP TABLE IF EXISTS `news`;
CREATE TABLE `news` (
  `id` int(10) UNSIGNED NOT NULL,
  `title` varchar(500) NOT NULL,
  `title_am` varchar(500) DEFAULT '',
  `title_or` varchar(500) DEFAULT '',
  `content` longtext NOT NULL,
  `content_am` longtext DEFAULT '',
  `content_or` longtext DEFAULT '',
  `category` varchar(100) DEFAULT 'General',
  `is_published` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `source_url` varchar(500) DEFAULT NULL,
  `source_urls` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `news`
--

INSERT INTO `news` (`id`, `title`, `title_am`, `title_or`, `content`, `content_am`, `content_or`, `category`, `is_published`, `created_at`, `updated_at`, `source_url`, `source_urls`) VALUES
(3, 'Economy & Business', 'ኢኮኖሚ እና ንግድ', 'Diinagdee fi Daldala', 'Ethiopia Expands Digital Market Access for Small Businesses\nThe government and private sector partners are increasing efforts to support micro and small enterprises through digital platforms. New initiatives aim to improve online visibility, mobile payment access, and training for entrepreneurs. Experts say this could significantly boost youth employment and local innovation.', 'ኢትዮጵያ ለአነስተኛ ንግዶች የዲጂታል ገበያ ተደራሽነትን አሰፋች።\nመንግስት እና የግሉ ሴክተር አጋሮች የጥቃቅንና አነስተኛ ኢንተርፕራይዞችን በዲጂታል መድረኮች ለመደገፍ የሚደረገውን ጥረት እያሳደጉ ነው። አዳዲስ ተነሳሽነቶች የመስመር ላይ ታይነትን፣ የሞባይል ክፍያ ተደራሽነትን እና ለስራ ፈጣሪዎች ስልጠናን ለማሻሻል ያለመ ነው። ይህ የወጣቶችን የስራ እድል እና የሀገር ውስጥ ፈጠራን በእጅጉ ሊያሳድግ እንደሚችል ባለሙያዎች ይናገራሉ።', 'Itiyoophiyaan Daldala Xixiqqaatiif Dhaqqabummaa Gabaa Dijitaalaa Babal\'ifte\nMichoonni mootummaa fi damee dhuunfaa dhaabbilee maayikiroo fi xixiqqaa karaa waltajjii dijitaalaatiin deeggaruuf tattaaffii taasifamu dabalaa jiru. Inishiyeetiiwwan haaraan mul’achuu toora interneetii, qaqqabummaa kaffaltii moobaayilaa, fi leenjii abbootii qabeenyaa fooyyessuuf kan kaayyeffatedha. Kun hojii dargaggootaa fi kalaqa biyya keessaa haalaan guddisuu danda’a jedhu ogeeyyiin.', 'General', 0, '2026-03-29 13:31:11', '2026-03-30 07:44:51', NULL, NULL),
(5, '', 'መገቢት 21/2018 ዓ.ም አዲስ አበባ በኢትዮጵያ ታምርት ኤክስፖ 2018 ይሳተፉ', '', '', 'ከሚያዚያ 24-28/2018 ዓ.ም በአዲስ ኮንቬንሽን ማዕከል በመገኘት በኢትዮጵያ ታምርት ኤክስፖ ለመሳተፍ ከታች የተቀመጠውን ሊንክ ተጠቅመው ይመዝገቡ', '', 'Business', 1, '2026-04-06 17:57:02', '2026-04-06 17:57:02', NULL, '[\"https:\\/\\/ethiopiatamrit.et\\/made-in-ethiopia#%E1%88%88%E1%88%81%E1%88%88%E1%8A%95%E1%89%B0%E1%8A%93%E1%8B%8A_%E1%88%89%E1%8B%93%E1%88%8B%E1%8B%8A%E1%8A%90%E1%89%B5%23%E1%8A%A2%E1%89%B5%E1%8B%AE%E1%8C%B5%E1%8B%AB_%E1%89%B3%E1%88%9D%E1%88%AD%E1%89%B5%23%E1%8A%A5%E1%8A%9B%E1%88%9D_%E1%8A%A5%E1%8A%95%E1%88%B8%E1%88%9D%E1%89%B5%23MADEINETHIOPIA\"]'),
(6, '', 'መገቢት28/2018 ዓ.ም አዲስ አበባ በአውደ ርዕይና ባዛር ከ32 ሚሊዮን ብር በላይ የገበያ ትስስር መፍጠር ተቻለ', '', '', 'የአዲስ አበባ ሥራና ክህሎት ቢሮ \"የኢንተርፕራይዞች ምርታማነት ለሀገር ብልጽግና\" በሚል መሪ ቃል በመስቀል አደባባይ ላለፉት አምስት ቀናት ሲካሄድ የቆየው የኢንተርፕራይዞች ሳምንት አውደ ርዕይና ባዛር ተጠናቋል፡፡አውደ ርዕይና ባዛሩ ከ32 ሚሊዮን 509ሺ 606 ብር በላይ የገበያ ትስስር እንደተፈጠረበት የአዲስ አበባ ሥራና ክህሎት ቢሮ አስታውቋል፡፡የከተማዋ አምራች ኢንተርፕራይዞች ያላቸውን እምቅ አቅም ለህዝብ ያሳዩበትና የሀገር በቀል ምርቶች ተመራጭነት በተግባር የተረጋገጠበት ሆኖ ማለፉንም አመላክቷል፡፡በቢሮው የኢንተርፕራይዝና ቴክኖሎጂ ልማት ዘርፍ ኃላፊ  አቶ ሚዴቅሳ ከበደ፤ ሳምንቱ ኢትዮጵያውያን ማምረት እንደሚችሉ እና በሀገር በቀል ምርቶች ላይ ያላቸውን ኩራት ያረጋገጡበት ልዩ መድረክ መሆኑን ገልጸዋል። በከተማዋ የሚታዩ ውብ መንገዶች የብስክሌት መስመሮች እና የአረንጓዴ ልማት ሥራዎች የኢንተርፕራይዞች ውጤት መሆናቸውን ጠቅሰዋል፡፡ዘርፉ የሀገሪቱ የኢኮኖሚ የጀርባ አጥንት በመሆኑ ወደ ትላልቅ ኢንዱስትሪዎች እንዲሸጋገሩ በትኩረት እንደሚሠራም አመላክተዋል።የቢሮው የሥራ ስምሪትና ምግብ ዋስትና ዘርፍ ኃላፊ  አቶ አስፋው ለገሰ በበኩላቸው፤ ኢንተርፕራይዞች ከሥራ ፈላጊነት ተላቀው ጥራት ያላቸውን ምርቶች ለገበያ የሚያቀርቡ አምራቾች መሆናቸው የታየበትና እርስ በእርስ ልምድና እውቀት የተለዋወጡበት ስኬታማ መድረክ መሆኑን ገልጸዋል። ቢሮው የመሥሪያ ቦታ፣ የብድር አቅርቦት እና የማሽን ሊዝ ድጋፎችን ለወደፊቱም አጠናክሮ እንደሚቀጥል በመጠቆም፣ የከተማው ነዋሪ የሀገር በቀል ምርቶችን በመሸመትና በመጠቀም ለኢንተርፕራይዞች መጠናከር የበኩሉን እንዲወጣ ጥሪ አቅርበዋል። በዝግጅቱ ማጠቃለያ ላይ 10,921 ኢንተርፕራይዞች ከጥቃቅን ወደ አነስተኛ ደረጃ መሸጋገራቸው የተገለጸ ሲሆን፣ ባለፉት ዓመታት ብቻ ከ2 ሚሊዮን በላይ የከተማዋ ነዋሪዎች የሥራ ዕድል ተጠቃሚ መሆናቸውም ተመላክቷል።በሳምንቱ በነበረው የተሳትፎ ውድድር ኮልፌ ቀራኒዮ ክፍለ ከተማ 1ኛ በመውጣት አሸናፊ ሲሆን፣ ጉለሌ እና አዲስ ከተማ 2ኛ፣ ቂርቆስ ክፍለ ከተማ ደግሞ 3ኛ ደረጃን በመያዝ እውቅና ተሰጥቷቸዋል። መረጃው የአዲስ አበባ ሥራና ክህሎት ቢሮ ነው፡፡', '', 'Technology', 1, '2026-04-06 18:02:37', '2026-04-06 18:02:37', NULL, '[\"https:\\/\\/web.facebook.com\\/MolsFDRETelegram: https:\\/\\/t.me\\/FDRE_MoLSofficialTikTok: tiktok.com\\/@mols_officialTwitter \\/ X: twitter.com\\/Jobs_\\u121a\\u1292\\u1235\\u1274\\u122dWhatsApp: whatsapp.com\\/channel\\/0029VakCgcYI\"]');

-- --------------------------------------------------------

--
-- Table structure for table `news_images`
--

DROP TABLE IF EXISTS `news_images`;
CREATE TABLE `news_images` (
  `id` int(10) UNSIGNED NOT NULL,
  `news_id` int(10) UNSIGNED NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `description` varchar(500) DEFAULT '',
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `news_images`
--

INSERT INTO `news_images` (`id`, `news_id`, `file_path`, `description`, `sort_order`, `created_at`) VALUES
(5, 5, 'uploads/news/69d3f40d22b74.png', 'Image 1', 0, '2026-04-06 17:57:33'),
(6, 5, 'uploads/news/69d3f41578ee6.png', 'Image 2', 1, '2026-04-06 17:57:41'),
(7, 5, 'uploads/news/69d3f433cc588.png', 'Image 3', 2, '2026-04-06 17:58:11'),
(8, 6, 'uploads/news/69d3f5a9d8cdf.png', 'Image 1', 0, '2026-04-06 18:04:25'),
(9, 6, 'uploads/news/69d3f5b0111fe.png', 'Image 2', 1, '2026-04-06 18:04:32'),
(10, 6, 'uploads/news/69d3f5b6e5bd2.png', 'Image 3', 2, '2026-04-06 18:04:38');

-- --------------------------------------------------------

--
-- Table structure for table `team_members`
--

DROP TABLE IF EXISTS `team_members`;
CREATE TABLE `team_members` (
  `id` int(10) UNSIGNED NOT NULL,
  `full_name` varchar(200) NOT NULL DEFAULT 'Abebe Kebede',
  `position` varchar(300) NOT NULL,
  `department` varchar(100) NOT NULL,
  `responsibilities` text DEFAULT NULL,
  `photo_path` varchar(500) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `team_members`
--

INSERT INTO `team_members` (`id`, `full_name`, `position`, `department`, `responsibilities`, `photo_path`, `sort_order`, `is_active`, `created_at`) VALUES
(1, 'Hailu Bogale', 'Managing Director / General Manager', 'Executive Management', 'Overall strategic leadership, business development, financial oversight, stakeholder relations, decision making', 'uploads/team/69d411c297659.jpg', 1, 1, '2026-03-30 12:58:45'),
(2, 'Yeabsera Getachew', 'Operations Manager', 'Executive Management', 'Oversee day-to-day operations, process optimization, ensure smooth workflow', 'uploads/team/69d411d06cd49.jpg', 2, 1, '2026-03-30 12:58:45'),
(3, 'Yeabsera Terefe', 'Marketing & Sales Manager', 'Executive Management', 'Plan and execute marketing campaigns, lead generation, sales strategies, client acquisition', 'uploads/team/69d411ddafec0.jpg', 3, 1, '2026-03-30 12:58:45'),
(4, 'Abebe Kebede', 'Creative Director', 'Creative & Digital Marketing', 'Supervises content and design quality, branding strategy, campaign concept creation', NULL, 4, 1, '2026-03-30 12:58:45'),
(5, 'Abebe Kebede', 'Digital Marketing Specialist', 'Creative & Digital Marketing', 'Social media management, SEO, paid campaigns, content scheduling, analytics tracking', NULL, 5, 1, '2026-03-30 12:58:45'),
(6, 'Abebe Kebede', 'Digital Marketing Specialist', 'Creative & Digital Marketing', 'Social media management, SEO, paid campaigns, content scheduling, analytics tracking', NULL, 6, 1, '2026-03-30 12:58:45'),
(7, 'Abebe Kebede', 'Graphic Designer & Content Creator', 'Creative & Digital Marketing', 'Design visuals for campaigns, social media posts, website content, flyers, banners, and promotional items', NULL, 7, 1, '2026-03-30 12:58:45'),
(8, 'Abebe Kebede', 'Graphic Designer & Content Creator', 'Creative & Digital Marketing', 'Design visuals for campaigns, social media posts, website content, flyers, banners, and promotional items', NULL, 8, 1, '2026-03-30 12:58:45'),
(9, 'Abebe Kebede', 'Copywriter / Content Writer', 'Creative & Digital Marketing', 'Create engaging text content for social media, blogs, email campaigns, advertising copy', NULL, 9, 1, '2026-03-30 12:58:45'),
(10, 'Abebe Kebede', 'IT & App Support', 'Technology & Platform Support', 'Maintain website and mobile apps, troubleshoot technical issues, and update software', NULL, 10, 1, '2026-03-30 12:58:45'),
(11, 'Abebe Kebede', 'IT & App Support', 'Technology & Platform Support', 'Maintain website and mobile apps, troubleshoot technical issues, and update software', NULL, 11, 1, '2026-03-30 12:58:45'),
(12, 'Abebe Kebede', 'Web & App Developer', 'Technology & Platform Support', 'Website & mobile app development, feature upgrades, UX/UI improvements', NULL, 12, 1, '2026-03-30 12:58:45'),
(13, 'Abebe Kebede', 'Analytics & Data Specialist', 'Technology & Platform Support', 'Monitor campaign metrics, prepare performance reports, optimize advertising results', NULL, 13, 1, '2026-03-30 12:58:45'),
(14, 'Abebe Kebede', 'Finance & Administration Officer', 'Finance & Administration', 'Manage financial records, budgets, payroll, procurement, office administration', NULL, 14, 1, '2026-03-30 12:58:45'),
(15, 'Abebe Kebede', 'HR Assistant / Office Coordinator', 'Finance & Administration', 'Recruitment support, employee records, office management, staff scheduling', NULL, 15, 1, '2026-03-30 12:58:45'),
(16, 'Abebe Kebede', 'Customer Support Representative', 'Customer & Sales', 'Respond to client inquiries via website, mobile app, social media, phone, and email', NULL, 16, 1, '2026-03-30 12:58:45'),
(17, 'Abebe Kebede', 'Customer Support Representative', 'Customer & Sales', 'Respond to client inquiries via website, mobile app, social media, phone, and email', NULL, 17, 1, '2026-03-30 12:58:45'),
(18, 'Abebe Kebede', 'Sales Associate / Account Manager', 'Customer & Sales', 'Handle client relationships, follow-up on proposals, upsell packages, manage subscription plans', NULL, 18, 1, '2026-03-30 12:58:45'),
(19, 'Abebe Kebede', 'Sales Associate / Account Manager', 'Customer & Sales', 'Handle client relationships, follow-up on proposals, upsell packages, manage subscription plans', NULL, 19, 1, '2026-03-30 12:58:45');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `full_name` varchar(200) NOT NULL,
  `email` varchar(200) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `company_name` varchar(200) DEFAULT NULL,
  `business_type` varchar(300) DEFAULT NULL,
  `tin_number` varchar(100) DEFAULT NULL,
  `elmis_registration` varchar(100) DEFAULT NULL,
  `business_license_number` varchar(100) DEFAULT NULL,
  `location` varchar(200) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `status` enum('pending','active','suspended') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `phone`, `company_name`, `business_type`, `tin_number`, `elmis_registration`, `business_license_number`, `location`, `website`, `status`, `created_at`, `updated_at`) VALUES
(2, 'yeab gthh', 'hailubogale3@gmail.com', '$2a$10$TtcVyyNs/M3hXVXnsQGorO8zZR6mxR2wIWIrPSf7KhMokY62PcRbG', '0908070504', 'yabu furniture', 'Other', '1234', '738', '23', 'debrebrihan', 'www.furniture.com', 'active', '2026-03-29 13:56:35', '2026-03-29 13:57:04'),
(3, 'yeabsera getachew', 'yeabse@gmail.com', '$2a$10$KjmjDb2VnrGs0iSL2ZppVuv6NWVOKwgRqBgBiFpe.RVVkPoeqiwQm', '0908070503', 'yabutiiii', 'Cosmetics and beauty product shops', '68972626178191919', '87227', '190', 'Harar', 'www.new.com', 'active', '2026-03-30 11:51:47', '2026-03-30 11:52:38');

-- --------------------------------------------------------

--
-- Table structure for table `user_profiles`
--

DROP TABLE IF EXISTS `user_profiles`;
CREATE TABLE `user_profiles` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `bio` text DEFAULT NULL,
  `instagram` varchar(200) DEFAULT NULL,
  `tiktok` varchar(200) DEFAULT NULL,
  `telegram` varchar(200) DEFAULT NULL,
  `facebook` varchar(200) DEFAULT NULL,
  `employees` varchar(50) DEFAULT NULL,
  `established` varchar(20) DEFAULT NULL,
  `services_needed` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_profiles`
--

INSERT INTO `user_profiles` (`id`, `user_id`, `bio`, `instagram`, `tiktok`, `telegram`, `facebook`, `employees`, `established`, `services_needed`, `notes`, `updated_at`) VALUES
(2, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-29 13:56:35'),
(3, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-30 11:51:47');

-- --------------------------------------------------------

--
-- Table structure for table `user_submissions`
--

DROP TABLE IF EXISTS `user_submissions`;
CREATE TABLE `user_submissions` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `path_name` varchar(300) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('pending','reviewed','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_submission_files`
--

DROP TABLE IF EXISTS `user_submission_files`;
CREATE TABLE `user_submission_files` (
  `id` int(10) UNSIGNED NOT NULL,
  `submission_id` int(10) UNSIGNED NOT NULL,
  `type` enum('image','video') NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `ads`
--
ALTER TABLE `ads`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_clients_license_number` (`license_number`),
  ADD UNIQUE KEY `uq_clients_tin_number` (`tin_number`),
  ADD UNIQUE KEY `uq_clients_business_license_number` (`business_license_number`),
  ADD UNIQUE KEY `uq_clients_elmis_registration` (`elmis_registration`);

--
-- Indexes for table `client_media`
--
ALTER TABLE `client_media`
  ADD PRIMARY KEY (`id`),
  ADD KEY `client_id` (`client_id`);

--
-- Indexes for table `client_path_media`
--
ALTER TABLE `client_path_media`
  ADD PRIMARY KEY (`id`),
  ADD KEY `path_id` (`path_id`);

--
-- Indexes for table `client_promotion_paths`
--
ALTER TABLE `client_promotion_paths`
  ADD PRIMARY KEY (`id`),
  ADD KEY `client_id` (`client_id`);

--
-- Indexes for table `contact_submissions`
--
ALTER TABLE `contact_submissions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `news`
--
ALTER TABLE `news`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `news_images`
--
ALTER TABLE `news_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `news_id` (`news_id`);

--
-- Indexes for table `team_members`
--
ALTER TABLE `team_members`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `users_phone_unique` (`phone`);

--
-- Indexes for table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `user_submissions`
--
ALTER TABLE `user_submissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `user_submission_files`
--
ALTER TABLE `user_submission_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `submission_id` (`submission_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `ads`
--
ALTER TABLE `ads`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `clients`
--
ALTER TABLE `clients`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `client_media`
--
ALTER TABLE `client_media`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `client_path_media`
--
ALTER TABLE `client_path_media`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=82;

--
-- AUTO_INCREMENT for table `client_promotion_paths`
--
ALTER TABLE `client_promotion_paths`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `contact_submissions`
--
ALTER TABLE `contact_submissions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `news`
--
ALTER TABLE `news`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `news_images`
--
ALTER TABLE `news_images`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `team_members`
--
ALTER TABLE `team_members`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `user_profiles`
--
ALTER TABLE `user_profiles`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `user_submissions`
--
ALTER TABLE `user_submissions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_submission_files`
--
ALTER TABLE `user_submission_files`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `client_media`
--
ALTER TABLE `client_media`
  ADD CONSTRAINT `client_media_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `client_path_media`
--
ALTER TABLE `client_path_media`
  ADD CONSTRAINT `client_path_media_ibfk_1` FOREIGN KEY (`path_id`) REFERENCES `client_promotion_paths` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `client_promotion_paths`
--
ALTER TABLE `client_promotion_paths`
  ADD CONSTRAINT `client_promotion_paths_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `news_images`
--
ALTER TABLE `news_images`
  ADD CONSTRAINT `news_images_ibfk_1` FOREIGN KEY (`news_id`) REFERENCES `news` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD CONSTRAINT `user_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_submissions`
--
ALTER TABLE `user_submissions`
  ADD CONSTRAINT `user_submissions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_submission_files`
--
ALTER TABLE `user_submission_files`
  ADD CONSTRAINT `user_submission_files_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `user_submissions` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
