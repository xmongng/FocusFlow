-- MySQL dump 10.13  Distrib 8.0.46, for macos15 (arm64)
--
-- Host: localhost    Database: personal_calendar_db
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ai_interactions`
--

DROP TABLE IF EXISTS `ai_interactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_interactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `prompt` text NOT NULL,
  `response` text NOT NULL,
  `action_suggested` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `ai_interactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_interactions`
--

LOCK TABLES `ai_interactions` WRITE;
/*!40000 ALTER TABLE `ai_interactions` DISABLE KEYS */;
INSERT INTO `ai_interactions` VALUES (1,1,'Hôm nay tôi có việc gì?','Hôm nay bạn có họp daily, ôn MySQL và một số công việc cần xử lý dashboard.','{\"date\": \"2026-05-12\", \"type\": \"summary\"}','2026-05-12 16:05:06'),(2,1,'Nhắc tôi fix lỗi dashboard','Tôi gợi ý tạo nhắc nhở cho task fix lỗi dashboard lúc 10:00.','{\"task\": \"Fix lỗi dashboard không hiện dữ liệu\", \"type\": \"reminder\"}','2026-05-12 16:05:06'),(3,1,'Tạo lịch học React ngày mai','Tôi gợi ý thêm sự kiện học React component vào tối 13/05.','{\"type\": \"event\", \"title\": \"Học React component\"}','2026-05-12 16:05:06'),(4,1,'Tôi cần hoàn thiện form thêm sự kiện','Bạn nên tạo task ưu tiên cao cho ngày 13/05.','{\"type\": \"task\", \"priority\": \"high\"}','2026-05-12 16:05:06'),(5,1,'Thống kê công việc tuần này','Bạn có các task liên quan đến dashboard, API, SQL và dọn project.','{\"type\": \"summary\", \"range\": \"2026-05-12 to 2026-05-15\"}','2026-05-12 16:05:06'),(6,2,'Nhắc tôi tập gym hôm nay','Tôi gợi ý nhắc bạn trước lịch tập gym 30 phút.','{\"type\": \"reminder\", \"event\": \"Tập gym buổi tối\"}','2026-05-12 16:05:06'),(7,3,'Tôi cần demo chức năng thêm sự kiện','Bạn nên chuẩn bị slide demo và lịch họp trình bày.','{\"type\": \"combined\", \"event\": \"Demo chức năng thêm sự kiện\"}','2026-05-12 16:05:06'),(8,4,'Theo dõi chi tiêu cá nhân','Tôi gợi ý tạo sự kiện kiểm tra ngân sách và task ghi lại chi tiêu.','{\"type\": \"task\", \"category\": \"Tài chính\"}','2026-05-12 16:05:06'),(9,5,'Tối mai có hoạt động giải trí không?','Bạn có lịch xem phim cùng bạn bè vào tối 14/05.','{\"type\": \"event\", \"title\": \"Xem phim cùng bạn bè\"}','2026-05-12 16:05:06'),(10,8,'Tạo lịch chạy bộ','Tôi gợi ý lịch chạy bộ vào sáng 14/05.','{\"type\": \"event\", \"category\": \"Thể thao\"}','2026-05-12 16:05:06'),(11,9,'Nhắc tôi gặp khách hàng','Tôi gợi ý nhắc trước cuộc gặp khách hàng vào ngày 15/05.','{\"type\": \"reminder\", \"event\": \"Gặp khách hàng mới\"}','2026-05-12 16:05:06'),(12,1,'Ngày 15 tôi cần làm gì?','Bạn có tổng kết tiến độ tuần, dọn phòng làm việc và tổng hợp bug còn tồn.','{\"date\": \"2026-05-15\", \"type\": \"summary\"}','2026-05-12 16:05:06'),(13,1,'Tạo nhắc nhở tổng kết tuần','Tôi gợi ý nhắc bạn trước sự kiện tổng kết tiến độ tuần 30 phút.','{\"type\": \"reminder\", \"event\": \"Tổng kết tiến độ tuần\"}','2026-05-12 16:05:06'),(14,1,'Tôi muốn học SQL nâng cao','Tôi gợi ý thêm lịch học SQL nâng cao vào ngày 14/05.','{\"type\": \"event\", \"title\": \"Làm bài tập SQL nâng cao\"}','2026-05-12 16:05:06'),(15,1,'Kiểm tra những việc ưu tiên cao','Các việc ưu tiên cao gồm hoàn thiện form, tổng hợp bug và sửa API thống kê.','{\"type\": \"task_filter\", \"priority\": \"high\"}','2026-05-12 16:05:06');
/*!40000 ALTER TABLE `ai_interactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(50) NOT NULL,
  `color` varchar(20) DEFAULT '#4A90D9',
  `icon` varchar(20) DEFAULT 0xF09F9385,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,1,'Công việc','#E74C3C','💼'),(2,1,'Học tập','#3498DB','📚'),(3,1,'Cá nhân','#9B59B6','🏠'),(4,2,'Sức khỏe','#2ECC71','💪'),(5,2,'Gia đình','#F1C40F','👨‍👩‍👧'),(6,3,'Dự án','#E67E22','🚀'),(7,3,'Du lịch','#1ABC9C','✈️'),(8,4,'Tài chính','#27AE60','💰'),(9,5,'Giải trí','#8E44AD','🎮'),(10,6,'Thói quen','#16A085','✅'),(11,7,'Workshop','#D35400','🛠️'),(12,8,'Thể thao','#2980B9','🏃'),(13,9,'Hẹn gặp','#C0392B','🤝'),(14,10,'Đọc sách','#34495E','📖'),(15,11,'Mua sắm','#F39C12','🛒'),(16,17,'Công ty','#4A90D9','💼'),(17,17,'Thể thao','#4A90D9','🏃'),(18,17,'Bài tập cá nhân','#4A90D9','🎓');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `category_id` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `location` varchar(255) DEFAULT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `is_all_day` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `source` varchar(50) DEFAULT 'Custom',
  `workspace_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `category_id` (`category_id`),
  KEY `workspace_id` (`workspace_id`),
  CONSTRAINT `events_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `events_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `events_ibfk_3` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` VALUES (1,1,1,'Họp daily với team','Cập nhật tiến độ công việc trong ngày','Google Meet','2026-05-12 09:00:00','2026-05-12 09:30:00',0,'2026-05-12 16:05:06','Custom',NULL),(2,1,2,'Ôn tập MySQL','Ôn SELECT, INSERT, UPDATE, DELETE và JOIN','Nhà riêng','2026-05-12 14:00:00','2026-05-12 15:30:00',0,'2026-05-12 16:05:06','Custom',NULL),(3,1,3,'Đi mua đồ cá nhân','Mua sổ tay, bút và vật dụng cần thiết','Nhà sách Fahasa','2026-05-12 17:30:00','2026-05-12 18:30:00',0,'2026-05-12 16:05:06','Custom',NULL),(4,2,4,'Tập gym buổi tối','Tập cardio và vai','California Fitness','2026-05-12 19:00:00','2026-05-12 20:00:00',0,'2026-05-12 16:05:06','Custom',NULL),(5,1,1,'Review giao diện dashboard','Kiểm tra số liệu sự kiện, công việc và trạng thái','Văn phòng','2026-05-13 08:30:00','2026-05-13 09:30:00',0,'2026-05-12 16:05:06','Custom',NULL),(6,1,2,'Học React component','Tách layout thành Header, StatsCard, EventList, TaskList','Nhà riêng','2026-05-13 20:00:00','2026-05-13 21:30:00',0,'2026-05-12 16:05:06','Custom',NULL),(7,3,6,'Demo chức năng thêm sự kiện','Trình bày form thêm sự kiện và validate dữ liệu','Google Meet','2026-05-13 10:00:00','2026-05-13 11:00:00',0,'2026-05-12 16:05:06','Custom',NULL),(8,4,8,'Kiểm tra ngân sách cá nhân','Tổng hợp chi tiêu 2 tuần đầu tháng','Nhà riêng','2026-05-13 19:30:00','2026-05-13 20:30:00',0,'2026-05-12 16:05:06','Custom',NULL),(9,1,1,'Họp fix bug calendar','Rà soát bug lọc dữ liệu theo ngày','Google Meet','2026-05-14 09:00:00','2026-05-14 10:00:00',0,'2026-05-12 16:05:06','Custom',NULL),(10,1,2,'Làm bài tập SQL nâng cao','Luyện GROUP BY, HAVING và subquery','Thư viện','2026-05-14 15:00:00','2026-05-14 17:00:00',0,'2026-05-12 16:05:06','Custom',NULL),(11,5,9,'Xem phim cùng bạn bè','Đặt vé và đi xem phim cuối ngày','CGV Vincom','2026-05-14 19:30:00','2026-05-14 22:00:00',0,'2026-05-12 16:05:06','Custom',NULL),(12,8,12,'Chạy bộ công viên','Chạy bộ 5km buổi sáng','Công viên Gia Định','2026-05-14 05:45:00','2026-05-14 06:45:00',0,'2026-05-12 16:05:06','Custom',NULL),(13,1,1,'Tổng kết tiến độ tuần','Tổng hợp việc đã làm và việc còn tồn','Văn phòng','2026-05-15 16:00:00','2026-05-15 17:00:00',0,'2026-05-12 16:05:06','Custom',NULL),(14,1,3,'Dọn dẹp phòng làm việc','Sắp xếp bàn làm việc và tài liệu học tập','Nhà riêng','2026-05-15 18:30:00','2026-05-15 19:30:00',0,'2026-05-12 16:05:06','Custom',NULL),(15,9,13,'Gặp khách hàng mới','Trao đổi yêu cầu hệ thống đặt lịch cá nhân','Highlands Coffee','2026-05-15 10:00:00','2026-05-15 11:30:00',0,'2026-05-12 16:05:06','Custom',NULL),(16,17,NULL,'Hoàn thành công việc email','Công việc ưu tiên cao, không có thời hạn, cần 2 giờ để hoàn thành',NULL,'2026-05-26 09:00:00','2026-05-26 11:00:00',0,'2026-05-26 04:51:28','AI',NULL),(17,17,NULL,'Đi tập gym','Đảm bảo hoàn thành trước hạn chót 17:45 và không xung đột với các công việc khác',NULL,'2026-05-26 16:30:00','2026-05-26 17:30:00',0,'2026-05-26 04:51:28','AI',NULL);
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text,
  `type` varchar(50) DEFAULT 'Email',
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `reference_id` int DEFAULT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,17,'Thông báo từ email','Công việc \"deadline\" đã được trích xuất từ email của bạn.','Email',1,'2026-05-26 02:49:36',NULL,NULL),(2,17,'Thông báo từ email','Công việc \"Kiểm tra ưu đãi phụ kiện du lịch trong email\" đã được trích xuất từ email của bạn.','Email',1,'2026-05-26 14:39:57',NULL,NULL),(3,17,'Thông báo từ email','Công việc \"Ứng tuyển vị trí Chuyên Gia Nghiên Cứu Viên - Avac Việt Nam\" đã được trích xuất từ email của bạn.','Email',1,'2026-05-28 15:22:01',NULL,NULL),(4,17,'Thông báo từ email','Công việc \"Hoàn thành bài tập\" đã được trích xuất từ email của bạn.','Email',1,'2026-05-29 04:07:40',NULL,NULL),(5,17,'Thông báo từ email','Công việc \"Nộp báo cáo tuần\" đã được trích xuất từ email của bạn.','Email',1,'2026-05-31 22:52:50',NULL,NULL),(6,17,'Thông báo từ email','Công việc \"Tài liệu lập trình tuần này\" đã được trích xuất từ email của bạn.','Email',1,'2026-05-31 22:52:52',NULL,NULL),(7,17,'Thông báo từ email','Công việc \"Hoàn thành báo cáo\" đã được trích xuất từ email của bạn.','Email',1,'2026-05-31 22:52:54',NULL,NULL),(8,17,'Thông báo từ email','Công việc \"Quantize, deploy, and benchmark an open-source LLM\" đã được trích xuất từ email của bạn.','Email',1,'2026-06-04 16:00:59',NULL,NULL),(9,17,'Thông báo từ email','Công việc \"Kỹ Sư AI Thị Giác Máy Tính - Có Xe Đưa Đón\" đã được trích xuất từ email của bạn.','Email',1,'2026-06-06 09:16:47',NULL,NULL),(10,17,'Thông báo từ email','Công việc \"Theo dõi kết quả ứng tuyển vị trí Thực Tập Sinh AI tại Dagoras\" đã được trích xuất từ email của bạn.','Email',1,'2026-06-06 09:16:48',NULL,NULL),(11,17,'Thông báo từ email','Công việc \"Kiểm tra trạng thái hồ sơ Data Science Intern tại FINPROS\" đã được trích xuất từ email của bạn.','Email',1,'2026-06-06 09:16:51',NULL,NULL),(12,17,'Ghi chú mới trong nhóm','Mong Nguyễn (12423TN_NguyenXuanMong) đã bình luận trong \"Khảo sát thông tin người dùng\": Lập google form và đặt ra những câu hỏi cần thiết','Comment',1,'2026-06-07 15:54:06',NULL,NULL),(13,17,'Ghi chú mới trong nhóm','Mong Nguyễn (12423TN_NguyenXuanMong) đã bình luận trong \"Khảo sát thông tin người dùng\": Oke để t thử','Comment',1,'2026-06-07 16:00:43',NULL,NULL),(14,18,'Ghi chú mới trong nhóm','Mong Nguyễn đã bình luận trong \"Khảo sát thông tin người dùng\": nhầm','Comment',1,'2026-06-07 16:00:57',NULL,NULL),(15,18,'Ghi chú mới trong nhóm','Mong Nguyễn đã bình luận trong \"Vẽ sơ đồ phân thích\": hi','Comment',1,'2026-06-07 23:19:00',36,'task_comment');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recurrence_patterns`
--

DROP TABLE IF EXISTS `recurrence_patterns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recurrence_patterns` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `frequency` enum('daily','weekly','monthly','yearly') NOT NULL,
  `interval_value` int DEFAULT '1',
  `days_of_week` varchar(20) DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `event_id` (`event_id`),
  CONSTRAINT `recurrence_patterns_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recurrence_patterns`
--

LOCK TABLES `recurrence_patterns` WRITE;
/*!40000 ALTER TABLE `recurrence_patterns` DISABLE KEYS */;
INSERT INTO `recurrence_patterns` VALUES (1,1,'daily',1,NULL,'2026-05-15'),(2,2,'weekly',1,'2','2026-06-30'),(3,3,'weekly',1,'2','2026-06-30'),(4,4,'weekly',1,'2,4,6','2026-06-30'),(5,5,'weekly',1,'3','2026-06-30'),(6,6,'weekly',1,'3','2026-06-30'),(7,7,'monthly',1,NULL,'2026-08-31'),(8,8,'monthly',1,NULL,'2026-08-31'),(9,9,'weekly',1,'4','2026-06-30'),(10,10,'weekly',1,'4','2026-06-30'),(11,11,'monthly',1,NULL,'2026-08-31'),(12,12,'weekly',1,'4','2026-06-30'),(13,13,'weekly',1,'5','2026-06-30'),(14,14,'weekly',1,'5','2026-06-30'),(15,15,'monthly',1,NULL,'2026-08-31');
/*!40000 ALTER TABLE `recurrence_patterns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reminders`
--

DROP TABLE IF EXISTS `reminders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reminders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `event_id` int DEFAULT NULL,
  `task_id` int DEFAULT NULL,
  `remind_at` datetime NOT NULL,
  `method` enum('email','notification') DEFAULT 'notification',
  `is_sent` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `event_id` (`event_id`),
  KEY `task_id` (`task_id`),
  CONSTRAINT `reminders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reminders_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reminders_ibfk_3` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reminders`
--

LOCK TABLES `reminders` WRITE;
/*!40000 ALTER TABLE `reminders` DISABLE KEYS */;
INSERT INTO `reminders` VALUES (1,1,1,NULL,'2026-05-12 08:50:00','notification',0),(2,1,2,NULL,'2026-05-12 13:45:00','notification',0),(3,1,3,NULL,'2026-05-12 17:00:00','notification',0),(4,1,NULL,1,'2026-05-12 10:00:00','email',0),(5,1,NULL,2,'2026-05-12 11:00:00','notification',0),(6,1,5,NULL,'2026-05-13 08:15:00','notification',0),(7,1,6,NULL,'2026-05-13 19:30:00','notification',0),(8,1,NULL,5,'2026-05-13 09:00:00','email',0),(9,1,NULL,6,'2026-05-13 18:00:00','notification',0),(10,1,9,NULL,'2026-05-14 08:45:00','notification',0),(11,1,10,NULL,'2026-05-14 14:30:00','notification',0),(12,1,NULL,9,'2026-05-14 09:30:00','email',0),(13,1,13,NULL,'2026-05-15 15:30:00','notification',0),(14,1,14,NULL,'2026-05-15 18:00:00','notification',0),(15,1,NULL,13,'2026-05-15 09:00:00','email',0);
/*!40000 ALTER TABLE `reminders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `user_id` int NOT NULL,
  `theme` enum('light','dark','system') DEFAULT 'system',
  `language` varchar(10) DEFAULT 'vi',
  `notifications_enabled` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`user_id`),
  CONSTRAINT `settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES (1,'system','vi',1),(2,'light','vi',1),(3,'dark','vi',1),(4,'system','vi',1),(5,'dark','vi',0),(6,'light','vi',1),(7,'system','vi',1),(8,'dark','vi',1),(9,'light','vi',0),(10,'system','vi',1),(11,'dark','vi',1),(12,'light','vi',1),(13,'system','vi',0),(14,'dark','vi',1),(15,'light','vi',1);
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task_comments`
--

DROP TABLE IF EXISTS `task_comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `task_id` int NOT NULL,
  `user_id` int NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `task_id` (`task_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `task_comments_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `task_comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_comments`
--

LOCK TABLES `task_comments` WRITE;
/*!40000 ALTER TABLE `task_comments` DISABLE KEYS */;
INSERT INTO `task_comments` VALUES (1,34,17,'Phần này khảo sát như nào','2026-06-07 15:45:37'),(2,34,18,'Lập google form và đặt ra những câu hỏi cần thiết','2026-06-07 15:54:06'),(3,34,18,'Oke để t thử','2026-06-07 16:00:43'),(4,34,17,'nhầm','2026-06-07 16:00:57'),(5,36,17,'hi','2026-06-07 23:19:00');
/*!40000 ALTER TABLE `task_comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `category_id` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `status` enum('todo','in_progress','done') DEFAULT 'todo',
  `priority` varchar(50) DEFAULT '2',
  `due_date` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `discord_notified` tinyint(1) DEFAULT '0',
  `email_uid` varchar(255) DEFAULT NULL,
  `source` varchar(50) DEFAULT 'Custom',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `workspace_id` int DEFAULT NULL,
  `assigned_to` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_uid` (`email_uid`),
  KEY `user_id` (`user_id`),
  KEY `category_id` (`category_id`),
  KEY `workspace_id` (`workspace_id`),
  KEY `assigned_to` (`assigned_to`),
  CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tasks_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `tasks_ibfk_3` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE SET NULL,
  CONSTRAINT `tasks_ibfk_4` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` VALUES (1,1,1,'Fix lỗi dashboard không hiện dữ liệu','Kiểm tra API lấy event và task theo ngày hiện tại','todo','1','2026-05-12 00:00:00','2026-05-12 16:05:06',0,NULL,'Custom','2026-05-26 04:36:09',NULL,NULL),(2,1,1,'Test đăng nhập tài khoản demo','Đăng nhập bằng anhminh@example.com và password 123456','in_progress','1','2026-05-12 00:00:00','2026-05-12 16:05:06',0,NULL,'Custom','2026-05-26 04:36:09',NULL,NULL),(3,1,2,'Viết truy vấn lấy sự kiện hôm nay','Dùng DATE(start_time) để lọc sự kiện theo ngày','todo','1','2026-05-12 00:00:00','2026-05-12 16:05:06',0,NULL,'Custom','2026-05-26 04:36:09',NULL,NULL),(5,1,1,'Hoàn thiện form thêm sự kiện','Validate title, start_time và end_time','todo','1','2026-05-13 00:00:00','2026-05-12 16:05:06',0,NULL,'Custom','2026-05-26 04:36:09',NULL,NULL),(6,1,2,'Đọc tài liệu FullCalendar','Tìm hiểu cách render event theo ngày, tuần, tháng','todo','1','2026-05-13 00:00:00','2026-05-12 16:05:06',0,NULL,'Custom','2026-05-26 04:36:09',NULL,NULL),(7,3,6,'Chuẩn bị slide demo','Tạo slide mô tả luồng thêm sự kiện','in_progress','1','2026-05-13 00:00:00','2026-05-12 16:05:06',0,NULL,'Custom','2026-05-26 04:36:09',NULL,NULL),(8,4,8,'Ghi lại chi tiêu hôm nay','Cập nhật bảng chi tiêu cá nhân','todo','1','2026-05-13 00:00:00','2026-05-12 16:05:06',0,NULL,'Custom','2026-05-26 04:36:09',NULL,NULL),(9,1,1,'Sửa API thống kê dashboard','Tính số sự kiện hôm nay, việc cần làm, quá hạn, hoàn thành','todo','1','2026-05-14 00:00:00','2026-05-12 16:05:06',0,NULL,'Custom','2026-05-26 04:36:09',NULL,NULL),(10,1,2,'Làm bài tập database','Thực hành JOIN giữa users, events, tasks và categories','todo','1','2026-05-14 00:00:00','2026-05-12 16:05:06',0,NULL,'Custom','2026-05-26 04:36:09',NULL,NULL),(12,8,12,'Mua giày chạy bộ','Tìm giày phù hợp cho chạy 5km','todo','1','2026-05-14 00:00:00','2026-05-12 16:05:06',0,NULL,'Custom','2026-05-26 04:36:09',NULL,NULL),(13,1,1,'Tổng hợp bug còn tồn','Liệt kê bug UI, API và database cần xử lý','todo','1','2026-05-15 00:00:00','2026-05-12 16:05:06',0,NULL,'Custom','2026-05-26 04:36:09',NULL,NULL),(14,1,3,'Dọn thư mục project','Xóa file thừa và sắp xếp source code','todo','1','2026-05-15 00:00:00','2026-05-12 16:05:06',0,NULL,'Custom','2026-05-26 04:36:09',NULL,NULL),(15,9,13,'Gửi proposal cho khách hàng','Soạn báo giá và mô tả chức năng hệ thống','todo','1','2026-05-15 00:00:00','2026-05-12 16:05:06',0,NULL,'Custom','2026-05-26 04:36:09',NULL,NULL),(17,17,17,'Đi tập gym','','done','2','2026-05-26 17:45:00','2026-05-26 04:37:43',0,NULL,'Custom','2026-05-29 01:56:17',NULL,NULL),(19,17,NULL,'Ứng tuyển vị trí Chuyên Gia Nghiên Cứu Viên - Avac Việt Nam','Công ty Cổ phần Avac Việt Nam, địa điểm Hưng Yên, mức lương thỏa thuận. Nộp đơn qua JobsGO.','done','2','2026-05-28 23:59:00','2026-05-28 15:22:01',0,'email-2343','Email','2026-05-29 01:56:21',NULL,NULL),(20,17,NULL,'Hoàn thành báo cáo bài tập lớn','Môn công nghệ web và ứng dụng','done','1','2026-05-29 11:43:00','2026-05-29 04:03:56',0,NULL,'Custom','2026-05-29 04:18:09',NULL,NULL),(21,17,NULL,'Hoàn thành bài tập','Bài tập môn machine learning cơ bản cần hoàn thành','done','2','2026-05-29 13:10:00','2026-05-29 04:07:40',0,'email-2352','Email','2026-05-31 06:38:20',NULL,NULL),(22,17,NULL,'Nộp báo cáo tuần','Gửi báo cáo tuần này và nộp đúng hạn chót.','done','1','2026-06-01 05:59:00','2026-05-31 22:52:50',0,'email-2373','Email','2026-06-06 09:17:02',NULL,NULL),(23,17,NULL,'Tài liệu lập trình tuần này','Gửi bạn tài liệu học tập của tuần.','done','2','2026-06-01 07:20:00','2026-05-31 22:52:52',0,'email-2374','Email','2026-06-06 09:17:02',NULL,NULL),(24,17,NULL,'Hoàn thành báo cáo','Cần hoàn thành báo cáo.','done','2','2026-06-01 07:30:00','2026-05-31 22:52:54',0,'email-2375','Email','2026-06-06 09:17:03',NULL,NULL),(25,17,18,'Học tiếng anh','Luyện thi reading','done','2','2026-06-01 08:00:00','2026-05-31 22:55:16',0,NULL,'Custom','2026-06-06 09:17:03',NULL,NULL),(26,17,17,'Đi chạy bộ ','Đi chạy bộ ','done','2','2026-06-01 17:00:00','2026-05-31 22:56:04',0,NULL,'Custom','2026-05-31 22:56:23',NULL,NULL),(27,17,NULL,'Luyện nghe tiếng Anh','Khoảng thời gian trống sau các công việc gấp, giúp tập trung vào kỹ năng nghe mà không bị gián đoạn.','done','2','2026-06-01 09:00:00','2026-05-31 23:02:27',0,NULL,'AI','2026-06-06 09:17:03',NULL,NULL),(28,17,NULL,'Học tiếng Anh','Khoảng thời gian rảnh sau khi hoàn thành báo cáo và tài liệu, trước buổi luyện nghe, giúp duy trì liên tục kỹ năng tiếng Anh.','done','2','2026-06-01 08:20:00','2026-06-01 00:30:58',0,NULL,'AI','2026-06-06 09:17:03',NULL,NULL),(29,17,NULL,'Quantize, deploy, and benchmark an open-source LLM','Complete the workflow from the \"Fast & Efficient LLM Inference with vLLM\" short course: reduce the model\'s memory footprint, quantize it with LLM Compressor, serve it using vLLM, and benchmark speed, cost, and accuracy.','done','2','2026-06-04 23:59:00','2026-06-04 16:00:59',0,'email-2389','Email','2026-06-06 09:17:10',NULL,NULL),(30,17,NULL,'Kỹ Sư AI Thị Giác Máy Tính - Có Xe Đưa Đón','Công ty TNHH MEKTEC MANUFACTURING (VIỆT NAM), vị trí Thoả thuận, địa điểm Hưng Yên (mới) & Hà Nội. Còn 14 ngày để ứng tuyển.','todo','2','2026-06-06 23:59:00','2026-06-06 09:16:47',0,'email-2396','Email','2026-06-06 09:16:47',NULL,NULL),(31,17,NULL,'Theo dõi kết quả ứng tuyển vị trí Thực Tập Sinh AI tại Dagoras','Hồ sơ đã được gửi đến Công ty Cp Công nghệ và Truyền thông Dagoras. Kiểm tra trạng thái hồ sơ và chờ nhà tuyển dụng liên hệ.','todo','2','2026-06-06 23:59:00','2026-06-06 09:16:48',0,'email-2401','Email','2026-06-06 09:16:48',NULL,NULL),(32,17,NULL,'Kiểm tra trạng thái hồ sơ Data Science Intern tại FINPROS','Hồ sơ đã được gửi đến Công ty Cổ phần Đầu tư FINPROS. Theo dõi kết quả và liên hệ nếu cần. Xem danh sách việc làm đã ứng tuyển và cân nhắc các vị trí tương tự được đề xuất (ví dụ: Research Programmer Intern).','todo','2','2026-07-01 23:59:00','2026-06-06 09:16:51',0,'email-2402','Email','2026-06-06 09:16:51',NULL,NULL),(34,17,NULL,'Khảo sát thông tin người dùng','','todo','2','2026-06-08 23:59:59','2026-06-07 15:42:50',0,NULL,'Workspace','2026-06-07 15:42:50',2,17),(35,17,NULL,'Phân tích nghiệp vụ bài toán','','done','2','2026-06-08 23:59:59','2026-06-07 15:42:50',0,NULL,'Workspace','2026-06-07 15:43:56',2,18),(36,17,NULL,'Vẽ sơ đồ phân thích','','todo','2','2026-06-08 23:59:59','2026-06-07 15:42:50',0,NULL,'Workspace','2026-06-07 15:42:50',2,18),(37,17,NULL,'Vẽ biểu đồ use case','','todo','2','2026-06-09 23:59:59','2026-06-07 15:42:50',0,NULL,'Workspace','2026-06-07 15:42:50',2,17),(38,17,NULL,'Thiết kế cơ sở dữ liệu','','todo','2','2026-06-08 23:59:59','2026-06-07 15:42:50',0,NULL,'Workspace','2026-06-07 15:42:50',2,18);
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `google_id` varchar(255) DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `display_name` varchar(100) DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `timezone` varchar(50) DEFAULT 'Asia/Ho_Chi_Minh',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `plan` enum('free','pro','enterprise') DEFAULT 'free',
  `ai_request_count` int DEFAULT '0',
  `ai_request_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `google_id` (`google_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,NULL,NULL,NULL,'anhminh','anhminh@example.com','123456','Nguyễn Anh Minh','https://example.com/avatars/anhminh.png','Asia/Ho_Chi_Minh','2026-05-12 16:05:06','free',0,NULL),(2,NULL,NULL,NULL,'baotran','baotran@example.com','123456','Trần Bảo Trân','https://example.com/avatars/baotran.png','Asia/Ho_Chi_Minh','2026-05-12 16:05:06','free',0,NULL),(3,NULL,NULL,NULL,'hoangnam','hoangnam@example.com','123456','Lê Hoàng Nam','https://example.com/avatars/hoangnam.png','Asia/Ho_Chi_Minh','2026-05-12 16:05:06','free',0,NULL),(4,NULL,NULL,NULL,'linhchi','linhchi@example.com','123456','Phạm Linh Chi','https://example.com/avatars/linhchi.png','Asia/Ho_Chi_Minh','2026-05-12 16:05:06','free',0,NULL),(5,NULL,NULL,NULL,'quocviet','quocviet@example.com','123456','Đỗ Quốc Việt','https://example.com/avatars/quocviet.png','Asia/Ho_Chi_Minh','2026-05-12 16:05:06','free',0,NULL),(6,NULL,NULL,NULL,'maianh','maianh@example.com','123456','Vũ Mai Anh','https://example.com/avatars/maianh.png','Asia/Ho_Chi_Minh','2026-05-12 16:05:06','free',0,NULL),(7,NULL,NULL,NULL,'tuananh','tuananh@example.com','123456','Hoàng Tuấn Anh','https://example.com/avatars/tuananh.png','Asia/Ho_Chi_Minh','2026-05-12 16:05:06','free',0,NULL),(8,NULL,NULL,NULL,'ngocanh','ngocanh@example.com','123456','Bùi Ngọc Anh','https://example.com/avatars/ngocanh.png','Asia/Ho_Chi_Minh','2026-05-12 16:05:06','free',0,NULL),(9,NULL,NULL,NULL,'minhkhang','minhkhang@example.com','123456','Phan Minh Khang','https://example.com/avatars/minhkhang.png','Asia/Ho_Chi_Minh','2026-05-12 16:05:06','free',0,NULL),(10,NULL,NULL,NULL,'thuyduong','thuyduong@example.com','123456','Đặng Thùy Dương','https://example.com/avatars/thuyduong.png','Asia/Ho_Chi_Minh','2026-05-12 16:05:06','free',0,NULL),(11,NULL,NULL,NULL,'giahan','giahan@example.com','123456','Ngô Gia Hân','https://example.com/avatars/giahan.png','Asia/Ho_Chi_Minh','2026-05-12 16:05:06','free',0,NULL),(12,NULL,NULL,NULL,'ducphat','ducphat@example.com','123456','Trịnh Đức Phát','https://example.com/avatars/ducphat.png','Asia/Ho_Chi_Minh','2026-05-12 16:05:06','free',0,NULL),(13,NULL,NULL,NULL,'hanhnguyen','hanhnguyen@example.com','123456','Lý Hạnh Nguyên','https://example.com/avatars/hanhnguyen.png','Asia/Ho_Chi_Minh','2026-05-12 16:05:06','free',0,NULL),(14,NULL,NULL,NULL,'khanhvy','khanhvy@example.com','123456','Cao Khánh Vy','https://example.com/avatars/khanhvy.png','Asia/Ho_Chi_Minh','2026-05-12 16:05:06','free',0,NULL),(15,NULL,NULL,NULL,'longpham','longpham@example.com','123456','Phạm Thành Long','https://example.com/avatars/longpham.png','Asia/Ho_Chi_Minh','2026-05-12 16:05:06','free',0,NULL),(16,NULL,NULL,NULL,'xuanmon','xuanmon@gmail.com','$2a$10$/VtOPnL9br.ip4DrT0eAcusIHzzHn1ZDUsW/1F1Rc59k1reZNk.Ua','Mong Nguyễn',NULL,'Asia/Ho_Chi_Minh','2026-05-13 03:07:54','free',0,NULL),(17,NULL,NULL,NULL,'xuanmongng','xuanmongng@gmail.com','$2a$10$zKWrC4a31utrG.nr2VbxYu2qq77jUh4qSt7GGuIYryhjHTtbRfa5K','Mong Nguyễn',NULL,'Asia/Ho_Chi_Minh','2026-05-25 09:21:17','pro',1,'2026-06-07'),(18,'103860914239714876729',NULL,NULL,'nguyenmongmong162005_eq3q6','nguyenmongmong162005@gmail.com',NULL,'Mong Nguyễn (12423TN_NguyenXuanMong)','https://lh3.googleusercontent.com/a/ACg8ocLt7acMQUQtqTllbSE_BlceucTHUiej3lAdipzFvw_pvZNA0w4G=s96-c','Asia/Ho_Chi_Minh','2026-05-31 06:28:21','pro',0,NULL),(19,NULL,NULL,NULL,'testuser2','testuser2@gmail.com','$2a$10$1eXCg29EiVaLMnXOYvg9VOPlUwUoV2fuEYf9NAZX82di9tzYKiYqe','Test User',NULL,'Asia/Ho_Chi_Minh','2026-06-04 16:33:04','pro',0,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workspace_invites`
--

DROP TABLE IF EXISTS `workspace_invites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workspace_invites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `workspace_id` int NOT NULL,
  `email` varchar(255) NOT NULL,
  `invited_by` int NOT NULL,
  `token` varchar(255) NOT NULL,
  `status` enum('pending','accepted','rejected','expired') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `workspace_id` (`workspace_id`),
  KEY `invited_by` (`invited_by`),
  CONSTRAINT `workspace_invites_ibfk_1` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE,
  CONSTRAINT `workspace_invites_ibfk_2` FOREIGN KEY (`invited_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workspace_invites`
--

LOCK TABLES `workspace_invites` WRITE;
/*!40000 ALTER TABLE `workspace_invites` DISABLE KEYS */;
INSERT INTO `workspace_invites` VALUES (4,2,'nguyenmongmong162005@gmail.com',17,'956b3010ecc665fb7b45703c36d04902ba50081616bb8a24f0b272a00749f86f','accepted','2026-06-07 15:31:57','2026-06-14 22:31:57');
/*!40000 ALTER TABLE `workspace_invites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workspace_members`
--

DROP TABLE IF EXISTS `workspace_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workspace_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `workspace_id` int NOT NULL,
  `user_id` int NOT NULL,
  `role` enum('owner','admin','member') DEFAULT 'member',
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_member` (`workspace_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `workspace_members_ibfk_1` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE,
  CONSTRAINT `workspace_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workspace_members`
--

LOCK TABLES `workspace_members` WRITE;
/*!40000 ALTER TABLE `workspace_members` DISABLE KEYS */;
INSERT INTO `workspace_members` VALUES (3,2,17,'owner','2026-06-07 15:31:41'),(4,2,18,'member','2026-06-07 15:32:12');
/*!40000 ALTER TABLE `workspace_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workspaces`
--

DROP TABLE IF EXISTS `workspaces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workspaces` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `owner_id` int NOT NULL,
  `color` varchar(7) DEFAULT '#6366f1',
  `max_members` int DEFAULT '10',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `owner_id` (`owner_id`),
  CONSTRAINT `workspaces_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workspaces`
--

LOCK TABLES `workspaces` WRITE;
/*!40000 ALTER TABLE `workspaces` DISABLE KEYS */;
INSERT INTO `workspaces` VALUES (2,'Project 2','Nhóm làm đồ án 2',17,'#d94a83',10,'2026-06-07 15:31:41','2026-06-07 15:31:41');
/*!40000 ALTER TABLE `workspaces` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-08  8:57:29
