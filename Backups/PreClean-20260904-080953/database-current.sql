/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.6.27-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: online_leave_approval_system
-- ------------------------------------------------------
-- Server version	10.6.27-MariaDB-ubu2204

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `audit_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `table_name` varchar(100) DEFAULT NULL,
  `record_id` bigint(20) unsigned DEFAULT NULL,
  `detail` longtext DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`audit_id`),
  KEY `idx_audit_logs_user_id` (`user_id`),
  KEY `idx_audit_logs_action` (`action`),
  KEY `idx_audit_logs_table_record` (`table_name`,`record_id`),
  KEY `idx_audit_logs_created_at` (`created_at`),
  KEY `idx_audit_logs_user_created` (`user_id`,`created_at`),
  CONSTRAINT `fk_audit_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=82 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,NULL,'password_reset_otp_requested','password_reset_otps',1,'{\"result\":\"requested\",\"username\":\"pwtest5827235325\",\"adminUserId\":null,\"userAgent\":\"node\"}','172.18.0.6','2026-08-04 14:07:15'),(2,NULL,'password_reset_otp_verified','password_reset_otps',1,'{\"result\":\"verified\",\"username\":\"pwtest5827235325\",\"adminUserId\":null,\"userAgent\":\"node\"}','172.18.0.6','2026-08-04 14:07:16'),(3,NULL,'password_reset_completed','users',10,'{\"result\":\"success\",\"username\":\"pwtest5827235325\",\"adminUserId\":null,\"userAgent\":\"node\"}','172.18.0.6','2026-08-04 14:07:16'),(4,NULL,'password_reset_rate_limited',NULL,NULL,'{\"result\":\"rate_limited\",\"username\":\"\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0\"}','172.18.0.6','2026-08-04 14:21:44'),(10,NULL,'password_reset_rate_limited',NULL,NULL,'{\"result\":\"rate_limited\",\"username\":\"\",\"adminUserId\":null,\"userAgent\":\"node\"}','172.18.0.6','2026-08-04 14:29:40'),(11,NULL,'password_reset_rate_limited',NULL,NULL,'{\"result\":\"rate_limited\",\"username\":\"\",\"adminUserId\":null,\"userAgent\":\"node\"}','172.18.0.6','2026-08-04 14:30:03'),(18,2,'password_reset_otp_requested','password_reset_otps',10,'{\"result\":\"requested\",\"username\":\"employee001\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\"}','172.18.0.6','2026-08-04 14:56:30'),(19,2,'password_reset_otp_verified','password_reset_otps',10,'{\"result\":\"verified\",\"username\":\"employee001\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\"}','172.18.0.6','2026-08-04 14:57:03'),(20,2,'password_reset_otp_requested','password_reset_otps',11,'{\"result\":\"requested\",\"username\":\"employee001\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36\"}','172.18.0.6','2026-08-04 14:57:45'),(21,2,'password_reset_otp_requested','password_reset_otps',12,'{\"result\":\"requested\",\"username\":\"employee001\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0\"}','172.18.0.6','2026-08-04 15:15:33'),(22,2,'password_reset_otp_verified','password_reset_otps',12,'{\"result\":\"verified\",\"username\":\"employee001\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0\"}','172.18.0.6','2026-08-04 15:15:43'),(23,2,'password_reset_otp_requested','password_reset_otps',14,'{\"result\":\"requested\",\"username\":\"employee001\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0\"}','172.18.0.5','2026-08-05 09:12:48'),(24,2,'password_reset_otp_verified','password_reset_otps',14,'{\"result\":\"verified\",\"username\":\"employee001\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0\"}','172.18.0.5','2026-08-05 09:13:04'),(25,2,'password_reset_otp_requested','password_reset_otps',15,'{\"result\":\"requested\",\"username\":\"employee001\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0\"}','172.18.0.5','2026-08-05 09:15:22'),(26,2,'password_reset_otp_verified','password_reset_otps',15,'{\"result\":\"verified\",\"username\":\"employee001\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0\"}','172.18.0.5','2026-08-05 09:15:29'),(27,2,'password_reset_completed','users',2,'{\"result\":\"success\",\"username\":\"employee001\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0\"}','172.18.0.5','2026-08-05 09:16:11'),(28,2,'change_password','users',2,'{\"result\":\"success\",\"username\":\"employee001\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0\"}','172.18.0.5','2026-08-05 09:17:19'),(29,2,'password_reset_otp_requested','password_reset_otps',16,'{\"result\":\"requested\",\"username\":\"employee001\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0\"}','172.18.0.5','2026-08-05 09:30:34'),(30,2,'password_reset_otp_verified','password_reset_otps',16,'{\"result\":\"verified\",\"username\":\"employee001\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0\"}','172.18.0.5','2026-08-05 09:30:43'),(31,2,'password_reset_completed','users',2,'{\"result\":\"success\",\"username\":\"employee001\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0\"}','172.18.0.5','2026-08-05 09:31:07'),(32,2,'change_password','users',2,'{\"result\":\"success\",\"username\":\"employee001\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0\"}','172.18.0.5','2026-08-05 09:32:53'),(33,2,'password_reset_otp_requested','password_reset_otps',17,'{\"result\":\"requested\",\"username\":\"employee001\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0\"}','172.18.0.5','2026-08-05 09:43:48'),(34,2,'password_reset_otp_requested','password_reset_otps',19,'{\"result\":\"requested\",\"username\":\"employee001\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0\"}','172.18.0.5','2026-08-05 10:24:15'),(35,4,'admin_password_reset','users',2,'{\"result\":\"success\",\"username\":\"employee001\",\"adminUserId\":4,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0\"}','172.18.0.5','2026-08-05 10:49:47'),(36,2,'change_password','users',2,'{\"result\":\"success\",\"username\":\"employee001\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0\"}','172.18.0.5','2026-08-05 10:54:56'),(37,1,'leave_approved','leave_requests',5,'{\"result\":\"success\",\"username\":\"\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0\"}','172.18.0.5','2026-08-05 15:15:35'),(39,1,'leave_approved','leave_requests',11,'{\"result\":\"success\",\"username\":\"\",\"adminUserId\":null,\"userAgent\":\"node\"}','127.0.0.1','2026-08-06 10:38:33'),(40,1,'leave_approved','leave_requests',13,'{\"result\":\"success\",\"username\":\"\",\"adminUserId\":null,\"userAgent\":\"node\"}','127.0.0.1','2026-08-06 10:38:57'),(41,1,'leave_rejected','leave_requests',15,'{\"result\":\"success\",\"username\":\"\",\"adminUserId\":null,\"userAgent\":\"node\"}','127.0.0.1','2026-08-06 10:38:57'),(42,2,'password_reset_otp_requested','password_reset_otps',20,'{\"result\":\"requested\",\"username\":\"employee001\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0\"}','172.18.0.6','2026-08-06 14:34:19'),(43,2,'password_reset_otp_requested','password_reset_otps',23,'{\"result\":\"requested\",\"username\":\"employee001\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0\"}','172.18.0.6','2026-08-06 15:06:13'),(44,2,'password_reset_otp_verified','password_reset_otps',23,'{\"result\":\"verified\",\"username\":\"employee001\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0\"}','172.18.0.6','2026-08-06 15:06:32'),(51,2,'password_reset_otp_requested','password_reset_otps',24,'{\"result\":\"requested\",\"username\":\"employee001\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7705\"}','172.18.0.4','2026-08-13 09:11:44'),(58,2,'password_reset_otp_requested','password_reset_otps',25,'{\"result\":\"requested\",\"username\":\"employee001\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0\"}','182.52.149.99','2026-08-24 13:28:05'),(59,2,'password_reset_otp_verified','password_reset_otps',25,'{\"result\":\"verified\",\"username\":\"employee001\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0\"}','182.52.149.99','2026-08-24 13:28:22'),(60,1,'leave_approved','leave_requests',60,'{\"result\":\"success\",\"username\":\"\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0\"}','182.52.149.99','2026-08-24 13:56:58'),(61,1,'leave_rejected','leave_requests',61,'{\"result\":\"success\",\"username\":\"\",\"adminUserId\":null,\"userAgent\":\"node\"}','172.18.0.1','2026-08-24 14:53:44'),(62,21,'leave_rejected','leave_requests',62,'{\"result\":\"success\",\"username\":\"\",\"adminUserId\":null,\"userAgent\":\"node\"}','172.18.0.1','2026-08-24 14:53:44'),(63,1,'leave_rejected','leave_requests',63,'{\"result\":\"success\",\"username\":\"\",\"adminUserId\":null,\"userAgent\":\"node\"}','172.18.0.1','2026-08-24 14:53:44'),(64,1,'leave_rejected','leave_requests',64,'{\"result\":\"success\",\"username\":\"\",\"adminUserId\":null,\"userAgent\":\"node\"}','172.18.0.1','2026-08-24 14:53:44'),(65,2,'password_reset_otp_requested','password_reset_otps',26,'{\"result\":\"requested\",\"username\":\"employee001\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0\"}','172.18.0.6','2026-08-27 13:33:24'),(66,2,'password_reset_otp_verified','password_reset_otps',26,'{\"result\":\"verified\",\"username\":\"employee001\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0\"}','172.18.0.6','2026-08-27 13:33:35'),(67,1,'leave_approved','leave_requests',65,'{\"result\":\"success\",\"username\":\"\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0\"}','172.18.0.4','2026-08-31 10:59:31'),(68,4,'user_created','users',22,'{\"result\":\"success\",\"username\":\"emp006\",\"adminUserId\":4,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0\"}','172.18.0.4','2026-08-31 13:47:01'),(69,22,'change_password','users',22,'{\"result\":\"success\",\"username\":\"emp006\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0\"}','172.18.0.4','2026-08-31 13:49:00'),(70,1,'leave_approved','leave_requests',66,'{\"result\":\"success\",\"username\":\"\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0\"}','172.18.0.4','2026-08-31 14:02:53'),(71,1,'leave_rejected','leave_requests',67,'{\"result\":\"success\",\"username\":\"\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0\"}','172.18.0.4','2026-08-31 14:07:02'),(72,1,'leave_approved','leave_requests',69,'{\"result\":\"success\",\"username\":\"\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0\"}','172.18.0.4','2026-08-31 14:09:31'),(73,3,'leave_approved','leave_requests',71,'{\"result\":\"success\",\"username\":\"\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0\"}','172.18.0.4','2026-08-31 15:26:56'),(74,22,'password_reset_otp_requested','password_reset_otps',27,'{\"result\":\"requested\",\"username\":\"emp006\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0\"}','172.18.0.6','2026-09-01 08:53:21'),(75,22,'password_reset_otp_verified','password_reset_otps',27,'{\"result\":\"verified\",\"username\":\"emp006\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0\"}','172.18.0.6','2026-09-01 08:53:34'),(76,22,'password_reset_otp_requested','password_reset_otps',28,'{\"result\":\"requested\",\"username\":\"emp006\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0\"}','172.18.0.6','2026-09-01 09:02:42'),(77,22,'password_reset_otp_verified','password_reset_otps',28,'{\"result\":\"verified\",\"username\":\"emp006\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0\"}','172.18.0.6','2026-09-01 09:02:58'),(78,22,'password_reset_otp_requested','password_reset_otps',29,'{\"result\":\"requested\",\"username\":\"emp006\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0\"}','172.18.0.6','2026-09-01 09:08:48'),(79,22,'password_reset_otp_verified','password_reset_otps',29,'{\"result\":\"verified\",\"username\":\"emp006\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0\"}','172.18.0.6','2026-09-01 09:09:01'),(80,22,'password_reset_otp_requested','password_reset_otps',30,'{\"result\":\"requested\",\"username\":\"emp006\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0\"}','172.18.0.6','2026-09-01 09:11:36'),(81,22,'password_reset_otp_verified','password_reset_otps',30,'{\"result\":\"verified\",\"username\":\"emp006\",\"adminUserId\":null,\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0\"}','172.18.0.6','2026-09-01 09:11:48');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `department_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `department_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`department_id`),
  UNIQUE KEY `uq_departments_name` (`department_name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,'Information Technology','ฝ่ายเทคโนโลยีสารสนเทศ',1,'2026-07-17 08:13:43','2026-08-10 08:15:56'),(2,'Human Resources','ฝ่ายทรัพยากรบุคคล',1,'2026-07-17 08:13:43','2026-07-17 08:13:43'),(3,'Finance','ฝ่ายการเงิน',1,'2026-07-17 08:13:43','2026-07-17 08:13:43'),(4,'Marketing','ฝ่ายการตลาด',1,'2026-07-17 08:13:43','2026-07-17 08:13:43'),(6,'test department','แผนกสำหรับทดสอบระบบ',1,'2026-08-04 12:51:34','2026-08-04 12:52:28');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `employee_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `employee_code` varchar(20) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `profile_image_url` varchar(255) DEFAULT NULL,
  `department_id` int(10) unsigned NOT NULL,
  `position_id` int(10) unsigned NOT NULL,
  `supervisor_id` int(10) unsigned DEFAULT NULL,
  `hire_date` date NOT NULL,
  `status` enum('active','inactive','resigned') NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`employee_id`),
  UNIQUE KEY `uq_employees_employee_code` (`employee_code`),
  UNIQUE KEY `uq_employees_email` (`email`),
  KEY `idx_employees_department_id` (`department_id`),
  KEY `idx_employees_position_id` (`position_id`),
  KEY `idx_employees_supervisor_id` (`supervisor_id`),
  KEY `idx_employees_status` (`status`),
  CONSTRAINT `fk_employees_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_employees_position` FOREIGN KEY (`position_id`) REFERENCES `positions` (`position_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_employees_supervisor` FOREIGN KEY (`supervisor_id`) REFERENCES `employees` (`employee_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (1,'SUP-001','Supervisor','001','0810000001','supervisor001@organization.co.th',NULL,1,2,22,'2024-01-15','active','2026-07-17 08:17:20','2026-08-24 14:51:44'),(2,'EMP-001','ปิยาภัสร์','นาต๊ะ','0810000002','onlineleavesystem2026@gmail.com',NULL,1,1,1,'2025-01-10','active','2026-07-17 08:17:20','2026-08-28 07:42:48'),(3,'HR-001','HR','001','0810000003','hr001@organization.co.th',NULL,2,3,1,'2023-06-01','active','2026-07-17 08:17:20','2026-08-24 14:51:44'),(4,'ADM-001','Admin','001','0810000004','admin001@organization.co.th',NULL,1,4,1,'2023-01-05','active','2026-07-17 08:17:20','2026-08-24 14:51:44'),(9,'EMP999','Test','Employee','0000000000','testemployee@example.com',NULL,1,1,1,'2026-08-03','active','2026-08-04 10:15:59','2026-08-31 13:41:20'),(22,'SUP-002','Supervisor','002',NULL,'supervisor002@organization.local',NULL,1,2,NULL,'2026-08-24','active','2026-08-24 14:51:43','2026-08-24 14:51:43'),(23,'EMP006','สรวิชญ์','นาต๊ะ','0966741021','piyapat-na@rmutp.ac.th',NULL,1,1,1,'2026-08-31','active','2026-08-31 13:41:11','2026-08-31 13:50:10');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `holidays`
--

DROP TABLE IF EXISTS `holidays`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `holidays` (
  `holiday_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `holiday_date` date NOT NULL,
  `holiday_name` varchar(100) NOT NULL,
  `holiday_type` varchar(50) NOT NULL DEFAULT 'Public Holiday',
  `description` varchar(300) DEFAULT NULL,
  `year` int(10) unsigned NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`holiday_id`),
  UNIQUE KEY `uq_holidays_date` (`holiday_date`),
  KEY `idx_holidays_year` (`year`),
  KEY `idx_holidays_is_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `holidays`
--

LOCK TABLES `holidays` WRITE;
/*!40000 ALTER TABLE `holidays` DISABLE KEYS */;
INSERT INTO `holidays` VALUES (1,'2026-01-01','New Year\'s Day','Public Holiday',NULL,2026,1),(2,'2026-04-13','Songkran Festival Day 1','Public Holiday',NULL,2026,1),(3,'2026-04-14','Songkran Festival Day 2','Public Holiday',NULL,2026,1),(4,'2026-04-15','Songkran Festival Day 3','Public Holiday',NULL,2026,1),(5,'2026-05-01','National Labour Day','Public Holiday',NULL,2026,1),(6,'2026-12-10','Constitution Day','Public Holiday',NULL,2026,1),(7,'2026-12-31','New Year\'s Eve','Public Holiday',NULL,2026,1);
/*!40000 ALTER TABLE `holidays` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_approval_logs`
--

DROP TABLE IF EXISTS `leave_approval_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_approval_logs` (
  `approval_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `leave_request_id` int(10) unsigned NOT NULL,
  `approver_id` int(10) unsigned NOT NULL,
  `action` enum('approved','rejected') NOT NULL,
  `comment` text DEFAULT NULL,
  `acted_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`approval_id`),
  KEY `idx_approval_logs_leave_request_id` (`leave_request_id`),
  KEY `idx_approval_logs_approver_id` (`approver_id`),
  KEY `idx_approval_logs_action` (`action`),
  CONSTRAINT `fk_approval_logs_approver` FOREIGN KEY (`approver_id`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_approval_logs_leave_request` FOREIGN KEY (`leave_request_id`) REFERENCES `leave_requests` (`leave_request_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_approval_logs`
--

LOCK TABLES `leave_approval_logs` WRITE;
/*!40000 ALTER TABLE `leave_approval_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `leave_approval_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_attachments`
--

DROP TABLE IF EXISTS `leave_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_attachments` (
  `attachment_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `leave_request_id` int(10) unsigned NOT NULL,
  `uploaded_by` int(10) unsigned NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `storage_file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_type` varchar(20) NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `file_size_bytes` bigint(20) unsigned NOT NULL,
  `uploaded_at` datetime NOT NULL DEFAULT current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`attachment_id`),
  KEY `idx_attachments_leave_request_id` (`leave_request_id`),
  KEY `idx_attachments_uploaded_by` (`uploaded_by`),
  KEY `idx_attachments_deleted_by` (`deleted_by`),
  CONSTRAINT `fk_attachments_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_attachments_leave_request` FOREIGN KEY (`leave_request_id`) REFERENCES `leave_requests` (`leave_request_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_attachments_uploaded_by` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_attachments`
--

LOCK TABLES `leave_attachments` WRITE;
/*!40000 ALTER TABLE `leave_attachments` DISABLE KEYS */;
/*!40000 ALTER TABLE `leave_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_entitlements`
--

DROP TABLE IF EXISTS `leave_entitlements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_entitlements` (
  `entitlement_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `employee_id` int(10) unsigned NOT NULL,
  `leave_type_id` int(10) unsigned NOT NULL,
  `year` int(10) unsigned NOT NULL,
  `total_days` decimal(5,2) NOT NULL DEFAULT 0.00,
  `used_days` decimal(5,2) NOT NULL DEFAULT 0.00,
  `updated_by` int(10) unsigned DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`entitlement_id`),
  UNIQUE KEY `uq_leave_entitlements_employee_type_year` (`employee_id`,`leave_type_id`,`year`),
  KEY `idx_leave_entitlements_employee_id` (`employee_id`),
  KEY `idx_leave_entitlements_leave_type_id` (`leave_type_id`),
  KEY `idx_leave_entitlements_year` (`year`),
  KEY `idx_leave_entitlements_updated_by` (`updated_by`),
  CONSTRAINT `fk_leave_entitlements_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_leave_entitlements_leave_type` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`leave_type_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_leave_entitlements_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_entitlements`
--

LOCK TABLES `leave_entitlements` WRITE;
/*!40000 ALTER TABLE `leave_entitlements` DISABLE KEYS */;
INSERT INTO `leave_entitlements` VALUES (1,1,1,2026,10.00,0.00,3,'2026-07-17 08:25:18'),(2,1,2,2026,30.00,1.00,3,'2026-08-31 15:26:56'),(3,1,3,2026,5.00,0.00,3,'2026-07-17 08:25:18'),(4,2,1,2026,10.00,4.00,3,'2026-08-24 13:56:58'),(5,2,2,2026,30.00,2.00,3,'2026-08-17 09:57:11'),(6,2,3,2026,5.00,1.00,3,'2026-08-05 15:15:35'),(7,3,1,2026,10.00,0.00,3,'2026-07-17 08:25:18'),(8,3,2,2026,30.00,0.00,3,'2026-07-17 08:25:18'),(9,3,3,2026,5.00,3.00,3,'2026-08-31 10:59:31'),(10,4,1,2026,10.00,0.00,3,'2026-07-17 08:25:18'),(11,4,2,2026,30.00,2.00,3,'2026-08-31 14:09:31'),(12,4,3,2026,5.00,0.00,3,'2026-07-17 08:25:18'),(14,9,1,2026,12.00,0.00,3,'2026-08-04 10:18:36'),(15,23,5,2026,10.00,1.00,3,'2026-08-31 14:02:53');
/*!40000 ALTER TABLE `leave_entitlements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_request_attachments`
--

DROP TABLE IF EXISTS `leave_request_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_request_attachments` (
  `attachment_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `leave_request_id` int(10) unsigned NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `stored_name` varchar(255) NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `file_size` bigint(20) unsigned NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`attachment_id`),
  KEY `idx_leave_attachments_request` (`leave_request_id`),
  CONSTRAINT `fk_leave_attachments_request` FOREIGN KEY (`leave_request_id`) REFERENCES `leave_requests` (`leave_request_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_request_attachments`
--

LOCK TABLES `leave_request_attachments` WRITE;
/*!40000 ALTER TABLE `leave_request_attachments` DISABLE KEYS */;
/*!40000 ALTER TABLE `leave_request_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_requests`
--

DROP TABLE IF EXISTS `leave_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_requests` (
  `leave_request_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `request_no` varchar(30) DEFAULT NULL,
  `employee_id` int(10) unsigned NOT NULL,
  `leave_type_id` int(10) unsigned NOT NULL,
  `approver_employee_id` int(10) unsigned DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `leave_days` decimal(5,2) NOT NULL,
  `reason` text NOT NULL,
  `status` enum('draft','pending','approved','rejected','cancelled') NOT NULL DEFAULT 'draft',
  `submitted_at` datetime DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `rejected_at` datetime DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `cancelled_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`leave_request_id`),
  UNIQUE KEY `uq_leave_requests_request_no` (`request_no`),
  KEY `idx_leave_requests_employee_id` (`employee_id`),
  KEY `idx_leave_requests_leave_type_id` (`leave_type_id`),
  KEY `idx_leave_requests_approver_id` (`approver_employee_id`),
  KEY `idx_leave_requests_status` (`status`),
  KEY `idx_leave_requests_date_range` (`start_date`,`end_date`),
  KEY `idx_leave_requests_employee_status_date` (`employee_id`,`status`,`start_date`),
  KEY `idx_leave_requests_approver_status_submitted` (`approver_employee_id`,`status`,`submitted_at`),
  CONSTRAINT `fk_leave_requests_approver` FOREIGN KEY (`approver_employee_id`) REFERENCES `employees` (`employee_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_leave_requests_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_leave_requests_leave_type` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`leave_type_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_requests`
--

LOCK TABLES `leave_requests` WRITE;
/*!40000 ALTER TABLE `leave_requests` DISABLE KEYS */;
INSERT INTO `leave_requests` VALUES (1,'LR-2026-0001',2,1,1,'2026-08-03','2026-08-05',3.00,'Personal travel','approved','2026-07-17 08:57:49','2026-07-17 09:01:33',NULL,NULL,NULL,'2026-07-17 08:57:49','2026-07-17 09:01:33'),(2,'LR-2026-0002',2,3,1,'2026-08-17','2026-08-18',2.00,'Personal appointment','rejected','2026-07-17 09:03:00',NULL,'2026-07-17 09:04:19',NULL,NULL,'2026-07-17 09:03:00','2026-07-17 09:04:19'),(3,'LR-2026-0003',2,3,1,'2026-08-24','2026-08-24',1.00,'Personal errand','cancelled','2026-07-17 09:05:05',NULL,NULL,NULL,'2026-07-17 09:05:55','2026-07-17 09:05:05','2026-07-17 09:05:55'),(4,'LR-2026-0004',2,1,1,'2026-09-01','2026-09-02',2.00,'Family activity','pending','2026-07-17 09:21:33',NULL,NULL,NULL,NULL,'2026-07-17 09:07:20','2026-07-17 09:21:33'),(5,'LR-20260805-000005',2,3,1,'2026-08-10','2026-08-10',1.00,'Runtime test draft','approved','2026-08-05 14:56:56','2026-08-05 15:15:35',NULL,NULL,NULL,'2026-08-05 14:48:44','2026-08-05 15:15:35'),(8,'LR-20260806-000008',2,2,NULL,'2026-09-08','2026-09-08',1.00,'Runtime pending cancellation','pending','2026-08-06 10:33:44',NULL,NULL,NULL,NULL,'2026-08-06 10:33:44','2026-08-06 10:33:44'),(9,NULL,2,2,NULL,'2026-09-03','2026-09-03',1.00,'Runtime draft verification','draft',NULL,NULL,NULL,NULL,NULL,'2026-08-06 10:34:49','2026-08-06 10:34:49'),(11,'LR-20260806-000011',2,2,1,'2026-09-07','2026-09-07',1.00,'Runtime submitted edited draft','approved','2026-08-06 10:38:32','2026-08-06 10:38:33',NULL,NULL,NULL,'2026-08-06 10:38:32','2026-08-06 10:38:33'),(13,'LR-20260806-000013',2,2,1,'2026-09-09','2026-09-09',1.00,'Runtime submitted edited draft','approved','2026-08-06 10:38:57','2026-08-06 10:38:57',NULL,NULL,NULL,'2026-08-06 10:38:57','2026-08-06 10:38:57'),(14,'LR-20260806-000014',2,2,NULL,'2026-09-10','2026-09-10',1.00,'Runtime pending cancellation','cancelled','2026-08-06 10:38:57',NULL,NULL,NULL,'2026-08-06 10:38:57','2026-08-06 10:38:57','2026-08-06 10:38:57'),(15,'LR-20260806-000015',2,2,1,'2026-09-11','2026-09-11',1.00,'Runtime rejection verification','rejected','2026-08-06 10:38:57',NULL,'2026-08-06 10:38:57','Runtime rejection reason',NULL,'2026-08-06 10:38:57','2026-08-06 10:38:57'),(16,'LR-20260806-000016',1,2,NULL,'2026-09-14','2026-09-14',1.00,'Runtime supervisor own request','cancelled','2026-08-06 10:38:57',NULL,NULL,NULL,'2026-08-31 15:19:31','2026-08-06 10:38:57','2026-08-31 15:19:31'),(21,'LR-20260813-000021',1,2,NULL,'2026-09-15','2026-09-15',1.00,'Runtime supervisor own request','cancelled','2026-08-13 08:44:24',NULL,NULL,NULL,'2026-08-24 13:56:14','2026-08-13 08:44:24','2026-08-24 13:56:14'),(50,NULL,2,2,NULL,'2026-10-05','2026-10-05',1.00,'G42 half day field','draft',NULL,NULL,NULL,NULL,NULL,'2026-08-17 09:57:06','2026-08-17 09:57:06'),(59,'LR-20260818-000059',2,2,NULL,'2026-08-20','2026-08-20',1.00,'123852','pending','2026-08-18 11:27:50',NULL,NULL,NULL,NULL,'2026-08-18 11:27:50','2026-08-18 11:27:50'),(60,'LR-20260824-000060',2,1,1,'2026-08-28','2026-08-29',1.00,'145632.','approved','2026-08-24 13:49:37','2026-08-24 13:56:58',NULL,NULL,NULL,'2026-08-24 13:49:37','2026-08-24 13:56:58'),(65,'LR-20260824-000065',3,3,1,'2026-08-25','2026-08-27',3.00,'021545120','approved','2026-08-24 14:58:35','2026-08-31 10:59:31',NULL,NULL,NULL,'2026-08-24 14:58:35','2026-08-31 10:59:31'),(66,'LR-20260831-000066',23,5,1,'2026-09-01','2026-09-01',1.00,'เทสโหลเทส','approved','2026-08-31 14:00:59','2026-08-31 14:02:53',NULL,NULL,NULL,'2026-08-31 14:00:59','2026-08-31 14:02:53'),(67,'LR-20260831-000067',3,1,1,'2026-09-01','2026-09-04',4.00,'า่้เดก','rejected','2026-08-31 14:06:02',NULL,'2026-08-31 14:07:02','ไม่มีคนทำงาน',NULL,'2026-08-31 14:06:02','2026-08-31 14:07:02'),(68,'LR-20260831-000068',1,3,NULL,'2026-09-01','2026-09-01',1.00,'เทสๆด','cancelled','2026-08-31 14:07:35',NULL,NULL,NULL,'2026-08-31 15:19:29','2026-08-31 14:07:35','2026-08-31 15:19:29'),(69,'LR-20260831-000069',4,2,1,'2026-09-01','2026-09-02',2.00,'ป่วยจ้า','approved','2026-08-31 14:08:21','2026-08-31 14:09:31',NULL,NULL,NULL,'2026-08-31 14:08:21','2026-08-31 14:09:31'),(70,'LR-20260831-000070',1,3,NULL,'2026-09-02','2026-09-02',1.00,'ไม่รู้อะ','cancelled','2026-08-31 15:17:05',NULL,NULL,NULL,'2026-08-31 15:19:27','2026-08-31 15:17:05','2026-08-31 15:19:27'),(71,'LR-20260831-000071',1,2,3,'2026-09-01','2026-09-01',1.00,'ป่วยจ้า','approved','2026-08-31 15:19:49','2026-08-31 15:26:56',NULL,NULL,NULL,'2026-08-31 15:19:49','2026-08-31 15:26:56'),(72,'LR-20260903-000072',1,3,NULL,'2026-09-04','2026-09-07',2.00,'fghjkl','pending','2026-09-03 10:45:20',NULL,NULL,NULL,NULL,'2026-09-03 10:45:20','2026-09-03 10:45:20');
/*!40000 ALTER TABLE `leave_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_types`
--

DROP TABLE IF EXISTS `leave_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_types` (
  `leave_type_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `leave_type_code` varchar(10) NOT NULL,
  `leave_type_name` varchar(100) NOT NULL,
  `description` varchar(300) DEFAULT NULL,
  `annual_quota_days` decimal(5,2) NOT NULL DEFAULT 0.00,
  `minimum_days` decimal(5,2) NOT NULL DEFAULT 1.00,
  `maximum_days_per_request` decimal(5,2) NOT NULL DEFAULT 1.00,
  `requires_attachment` tinyint(1) NOT NULL DEFAULT 0,
  `attachment_required_after_days` decimal(5,2) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`leave_type_id`),
  UNIQUE KEY `uq_leave_types_name` (`leave_type_name`),
  UNIQUE KEY `uq_leave_types_code` (`leave_type_code`),
  KEY `idx_leave_types_is_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_types`
--

LOCK TABLES `leave_types` WRITE;
/*!40000 ALTER TABLE `leave_types` DISABLE KEYS */;
INSERT INTO `leave_types` VALUES (1,'LT001','Annual Leave',NULL,10.00,1.00,10.00,0,NULL,1,'2026-07-17 08:13:43','2026-08-24 14:51:43'),(2,'LT002','Sick Leave',NULL,30.00,1.00,30.00,0,3.00,1,'2026-07-17 08:13:43','2026-08-24 14:51:43'),(3,'LT003','Personal Leave',NULL,5.00,1.00,5.00,0,NULL,1,'2026-07-17 08:13:43','2026-08-24 14:51:43'),(5,'1234','test Leave','ทดสอบ',3.00,1.00,1.00,0,NULL,1,'2026-08-04 10:21:56','2026-08-04 10:22:16'),(6,'PL','ลาคลอด','ลาคลอดบุตร',1.00,1.00,5.00,1,NULL,1,'2026-08-31 13:44:10','2026-08-31 13:44:10');
/*!40000 ALTER TABLE `leave_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `notification_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `leave_request_id` int(10) unsigned DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `notification_type` varchar(50) NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`notification_id`),
  KEY `idx_notifications_user_id` (`user_id`),
  KEY `idx_notifications_leave_request_id` (`leave_request_id`),
  KEY `idx_notifications_is_read` (`is_read`),
  KEY `idx_notifications_created_at` (`created_at`),
  KEY `idx_notifications_user_read_created` (`user_id`,`is_read`,`created_at`),
  CONSTRAINT `fk_notifications_leave_request` FOREIGN KEY (`leave_request_id`) REFERENCES `leave_requests` (`leave_request_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,1,5,'New leave request','Leave request LR-20260805-000005 is waiting for approval.','leave-submitted',1,'2026-08-05 14:56:56'),(2,2,5,'Leave request approved','LR-20260805-000005 was approved.','leave-approved',1,'2026-08-05 15:15:35'),(5,1,8,'New leave request','Leave request LR-20260806-000008 is waiting for approval.','leave-submitted',1,'2026-08-06 10:33:44'),(6,1,11,'New leave request','Leave request LR-20260806-000011 is waiting for approval.','leave-submitted',1,'2026-08-06 10:38:32'),(10,1,14,'New leave request','Leave request LR-20260806-000014 is waiting for approval.','leave-submitted',1,'2026-08-06 10:38:57'),(11,1,15,'New leave request','Leave request LR-20260806-000015 is waiting for approval.','leave-submitted',1,'2026-08-06 10:38:57'),(48,1,59,'New leave request','Leave request LR-20260818-000059 is waiting for approval.','leave-submitted',1,'2026-08-18 11:27:50'),(49,1,60,'New leave request','Leave request LR-20260824-000060 is waiting for approval.','leave-submitted',1,'2026-08-24 13:49:37'),(50,2,60,'Leave request approved','LR-20260824-000060 was approved.','leave-approved',1,'2026-08-24 13:56:58'),(59,1,65,'New leave request','Leave request LR-20260824-000065 is waiting for approval.','leave-submitted',1,'2026-08-24 14:58:35'),(60,3,65,'Leave request approved','LR-20260824-000065 was approved.','leave-approved',1,'2026-08-31 10:59:31'),(61,1,66,'New leave request','Leave request LR-20260831-000066 is waiting for approval.','leave-submitted',1,'2026-08-31 14:00:59'),(62,22,66,'Leave request approved','LR-20260831-000066 was approved.','leave-approved',0,'2026-08-31 14:02:53'),(63,1,67,'New leave request','Leave request LR-20260831-000067 is waiting for approval.','leave-submitted',1,'2026-08-31 14:06:02'),(64,3,67,'Leave request rejected','LR-20260831-000067 was rejected: ไม่มีคนทำงาน','leave-rejected',1,'2026-08-31 14:07:02'),(65,21,68,'New leave request','Leave request LR-20260831-000068 is waiting for approval.','leave-submitted',0,'2026-08-31 14:07:35'),(66,1,69,'New leave request','Leave request LR-20260831-000069 is waiting for approval.','leave-submitted',1,'2026-08-31 14:08:21'),(67,4,69,'Leave request approved','LR-20260831-000069 was approved.','leave-approved',1,'2026-08-31 14:09:31'),(68,21,70,'New leave request','Leave request LR-20260831-000070 is waiting for approval.','leave-submitted',0,'2026-08-31 15:17:05'),(69,21,71,'New leave request','Leave request LR-20260831-000071 is waiting for approval.','leave-submitted',0,'2026-08-31 15:19:49'),(70,3,71,'New leave request','Leave request LR-20260831-000071 is waiting for approval.','leave-submitted',1,'2026-08-31 15:24:02'),(71,1,71,'Leave request approved','LR-20260831-000071 was approved.','leave-approved',1,'2026-08-31 15:26:56'),(72,3,72,'New leave request','Leave request LR-20260903-000072 is waiting for approval.','leave-submitted',0,'2026-09-03 10:45:20');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_otps`
--

DROP TABLE IF EXISTS `password_reset_otps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_otps` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `otp_hash` char(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `verified_at` datetime DEFAULT NULL,
  `used_at` datetime DEFAULT NULL,
  `invalidated_at` datetime DEFAULT NULL,
  `attempt_count` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `resend_count` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `requested_ip` varchar(45) DEFAULT NULL,
  `requested_user_agent` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_password_reset_otps_user_id` (`user_id`),
  KEY `idx_password_reset_otps_expires_at` (`expires_at`),
  CONSTRAINT `fk_password_reset_otps_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_otps`
--

LOCK TABLES `password_reset_otps` WRITE;
/*!40000 ALTER TABLE `password_reset_otps` DISABLE KEYS */;
INSERT INTO `password_reset_otps` VALUES (10,2,'e40cf45955bb2dbaf4b87c3489d711413bd7113d08d75b5d8b6adf794e33eaad','2026-08-04 15:01:30','2026-08-04 14:57:03',NULL,'2026-08-04 14:57:45',0,0,'172.18.0.6','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','2026-08-04 14:56:30','2026-08-04 14:57:45'),(11,2,'822f4feaef3d90b76af5b47cc02a1aae27282df393726daa5b0ae9426c8dc590','2026-08-04 15:02:45',NULL,NULL,'2026-08-04 15:15:33',0,1,'172.18.0.6','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36','2026-08-04 14:57:45','2026-08-04 15:15:33'),(12,2,'1df2f4d2fbf75437736edfd78ea4ad0c657964ee29a10c1fe7382bfbac6381c7','2026-08-04 15:20:33','2026-08-04 15:15:43',NULL,'2026-08-05 09:12:45',0,0,'172.18.0.6','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0','2026-08-04 15:15:33','2026-08-05 09:12:45'),(14,2,'4ba263b299016a4cf3c95d1007ff1e23534407ff1a6b64944530b06e9cbe6c1d','2026-08-05 09:17:45','2026-08-05 09:13:04',NULL,'2026-08-05 09:15:19',0,0,'172.18.0.5','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0','2026-08-05 09:12:45','2026-08-05 09:15:19'),(15,2,'6493760b2c43aebf05bd6471ae85529c1b5e0bdfd4335ae51b7d77c9f9ffb367','2026-08-05 09:20:19','2026-08-05 09:15:29','2026-08-05 09:16:11',NULL,0,0,'172.18.0.5','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0','2026-08-05 09:15:19','2026-08-05 09:16:11'),(16,2,'ed5332401d2e2dd268f72180e78b7b7dc119ad456d049d2e52acd5b38207658b','2026-08-05 09:35:28','2026-08-05 09:30:43','2026-08-05 09:31:07',NULL,0,0,'172.18.0.5','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0','2026-08-05 09:30:28','2026-08-05 09:31:07'),(17,2,'4c615b9d3c3d1b134935a126b2048ca5118025a8058b7d43be875dfd862afe10','2026-08-05 09:48:26',NULL,NULL,'2026-08-05 10:24:03',0,0,'172.18.0.5','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0','2026-08-05 09:43:26','2026-08-05 10:24:03'),(19,2,'a66119e285a518407bc99e197af2f522b2ada77abc02419c0908ccd94ef9d5fa','2026-08-05 10:29:03',NULL,NULL,'2026-08-06 14:34:06',0,0,'172.18.0.5','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0','2026-08-05 10:24:03','2026-08-06 14:34:06'),(20,2,'7e4320da804ee4eddd9b3950ef78d53e28eb64b1d94a54bfda1cd4eb0b6a1cbb','2026-08-06 14:39:06',NULL,NULL,'2026-08-06 15:06:09',0,0,'172.18.0.6','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0','2026-08-06 14:34:06','2026-08-06 15:06:09'),(23,2,'2aab52d452d29522366bcbc4ea10ceb56767d4f2838a8b2c29f06821bf63a636','2026-08-06 15:11:09','2026-08-06 15:06:32',NULL,'2026-08-13 09:11:40',0,0,'172.18.0.6','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0','2026-08-06 15:06:09','2026-08-13 09:11:40'),(24,2,'30cba3cac27da0d1eea75ff63befb0203bf7d7bcd94cdceabc2c1d33809d377c','2026-08-13 09:16:40',NULL,NULL,'2026-08-24 13:28:01',0,0,'172.18.0.4','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7705','2026-08-13 09:11:40','2026-08-24 13:28:01'),(25,2,'50c348ced5e7f21a66f6b97b3ee60bfb7cbb278e1a0668f671b1a97564c6a6f3','2026-08-24 13:33:01','2026-08-24 13:28:22',NULL,'2026-08-27 13:33:20',0,0,'182.52.149.99','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0','2026-08-24 13:28:01','2026-08-27 13:33:20'),(26,2,'12044127555e4846439a6a52d59f80d02e63f15dacac49625d2f32b181ef21af','2026-08-27 13:38:20','2026-08-27 13:33:35',NULL,NULL,0,0,'172.18.0.6','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0','2026-08-27 13:33:20','2026-08-27 13:33:35'),(27,22,'aba13080b7e01445e6db4e0f7ddb015301c7f94d8854dca5aca98db570d86202','2026-09-01 08:58:16','2026-09-01 08:53:34',NULL,'2026-09-01 09:02:38',0,0,'172.18.0.6','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0','2026-09-01 08:53:16','2026-09-01 09:02:38'),(28,22,'a084c115856edce532f0bcc61d30b6b4c1a630b8f16ea50a303801d7ee19c04d','2026-09-01 09:07:38','2026-09-01 09:02:58',NULL,'2026-09-01 09:08:42',0,0,'172.18.0.6','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0','2026-09-01 09:02:38','2026-09-01 09:08:42'),(29,22,'09f42d1ae0a6b205a0d6f231169a5fce1183116955fb135b4fdfb55944828d48','2026-09-01 09:13:42','2026-09-01 09:09:01',NULL,'2026-09-01 09:11:32',0,0,'172.18.0.6','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0','2026-09-01 09:08:42','2026-09-01 09:11:32'),(30,22,'3f6617be0956c219395ba2613ab4f15b8da64513e5d094360c1ed050f278df3f','2026-09-01 09:16:32','2026-09-01 09:11:48',NULL,NULL,0,0,'172.18.0.6','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36 Edg/152.0.0.0','2026-09-01 09:11:32','2026-09-01 09:11:48');
/*!40000 ALTER TABLE `password_reset_otps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `token_hash` char(64) NOT NULL,
  `otp_id` bigint(20) unsigned NOT NULL,
  `expires_at` datetime NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `invalidated_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_password_reset_tokens_token_hash` (`token_hash`),
  KEY `idx_password_reset_tokens_user_id` (`user_id`),
  KEY `idx_password_reset_tokens_expires_at` (`expires_at`),
  KEY `fk_password_reset_tokens_otp` (`otp_id`),
  CONSTRAINT `fk_password_reset_tokens_otp` FOREIGN KEY (`otp_id`) REFERENCES `password_reset_otps` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_password_reset_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
INSERT INTO `password_reset_tokens` VALUES (4,2,'1d2e5517662ee1e9d3d15c000c3667abd18a1c52a510705fa8a8ccbfa72e6fe9',10,'2026-08-04 15:12:03',NULL,'2026-08-04 15:15:43','2026-08-04 14:57:03'),(5,2,'1836dd37c2bb0dfcf37c0c310131c39e3f3633e1ccca88ba66d96b10408fd8b3',12,'2026-08-04 15:30:43',NULL,'2026-08-05 09:13:04','2026-08-04 15:15:43'),(6,2,'5f060dfb372a364baf8749bfddc5501139f37ac44ca9328a4596c7be32f6a195',14,'2026-08-05 09:28:04',NULL,'2026-08-05 09:15:29','2026-08-05 09:13:04'),(7,2,'55fccdcf6b83b90f20c3797c0ffaf437b502ebff5e724280eee86b92897c69ec',15,'2026-08-05 09:30:29','2026-08-05 09:16:11',NULL,'2026-08-05 09:15:29'),(8,2,'24159d891187b5b66c27f8f3aae34d42d5195fa1bb046c097afd420265edc941',16,'2026-08-05 09:45:43','2026-08-05 09:31:07',NULL,'2026-08-05 09:30:43'),(9,2,'7d01ffc53c30b8e143c62ba9c692247154e30e6096aa0b6536f577485043ae49',23,'2026-08-06 15:21:32',NULL,'2026-08-24 13:28:22','2026-08-06 15:06:32'),(10,2,'f905bb1869ef5987caf3588931821de7401196da5443c6807d96786f0f2f9229',25,'2026-08-24 13:43:22',NULL,'2026-08-27 13:33:35','2026-08-24 13:28:22'),(11,2,'61115c5c51edd4e97fa9800cdd2dc7e1140d4ca30873d314fe725e9e091278f2',26,'2026-08-27 13:48:35',NULL,NULL,'2026-08-27 13:33:35'),(12,22,'080e05f9d54395361c92dd022aa6bfa1bb6d9c8eae10888a7e109e921cf575e3',27,'2026-09-01 09:08:34',NULL,'2026-09-01 09:02:58','2026-09-01 08:53:34'),(13,22,'4d398d2149e2f3aa5884158188eed0b7729eb1e464eb78a6535bc7e5fc204d85',28,'2026-09-01 09:17:58',NULL,'2026-09-01 09:09:01','2026-09-01 09:02:58'),(14,22,'a6a78cc425449e9f721942f4d2fbec8e31e35a59cc364503c456cd9c4cd3c4f9',29,'2026-09-01 09:24:01',NULL,'2026-09-01 09:11:48','2026-09-01 09:09:01'),(15,22,'12b324b31d9bddce1c4fbf74cc215a51062ca5e8a31ad1cf719dd74a8ce4685b',30,'2026-09-01 09:26:48',NULL,NULL,'2026-09-01 09:11:48');
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `positions`
--

DROP TABLE IF EXISTS `positions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `positions` (
  `position_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `position_name` varchar(100) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`position_id`),
  UNIQUE KEY `uq_positions_name` (`position_name`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `positions`
--

LOCK TABLES `positions` WRITE;
/*!40000 ALTER TABLE `positions` DISABLE KEYS */;
INSERT INTO `positions` VALUES (1,'Developer',1,'2026-07-17 08:13:43','2026-07-17 08:13:43'),(2,'Supervisor',1,'2026-07-17 08:13:43','2026-07-17 08:13:43'),(3,'Human Resource Officer',1,'2026-07-17 08:13:43','2026-07-17 08:13:43'),(4,'System Administrator',1,'2026-07-17 08:13:43','2026-07-17 08:13:43'),(5,'Accountant',1,'2026-07-17 08:13:43','2026-07-17 08:13:43'),(6,'Marketing Officer',1,'2026-07-17 08:13:43','2026-07-17 08:13:43'),(8,'Test Developer',1,'2026-08-04 12:53:55','2026-08-04 12:54:22');
/*!40000 ALTER TABLE `positions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `role_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `uq_roles_role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Employee','พนักงานทั่วไป สามารถยื่นคำขอลาและตรวจสอบข้อมูลการลาของตนเอง',1),(2,'Supervisor','หัวหน้างาน สามารถพิจารณาอนุมัติหรือปฏิเสธคำขอลาของลูกทีม',1),(3,'HR','ฝ่ายทรัพยากรบุคคล จัดการข้อมูลพนักงาน ประเภทการลา สิทธิ์วันลา วันหยุด และรายงาน',1),(4,'Admin','ผู้ดูแลระบบ จัดการบัญชีผู้ใช้ Role แผนก ตำแหน่ง และตรวจสอบ Audit Log',1);
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `employee_id` int(10) unsigned NOT NULL,
  `role_id` int(10) unsigned NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `status` enum('active','inactive','locked') NOT NULL DEFAULT 'active',
  `last_login_at` datetime DEFAULT NULL,
  `password_changed_at` datetime DEFAULT NULL,
  `must_change_password` tinyint(1) NOT NULL DEFAULT 0,
  `token_version` int(10) unsigned NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uq_users_employee_id` (`employee_id`),
  UNIQUE KEY `uq_users_username` (`username`),
  KEY `idx_users_role_id` (`role_id`),
  KEY `idx_users_status` (`status`),
  CONSTRAINT `fk_users_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,1,2,'supervisor001','$2b$12$VQzPQSz9gQ0PWOE.VgYNpuRe6IEa0WIS81mh5cvBKcA2Fk9EExuO2','active','2026-09-03 10:44:54',NULL,0,0,'2026-07-17 08:21:55','2026-09-03 10:44:54'),(2,2,1,'employee001','$2b$12$JtcFHbmGmfFQkWecxgYH5erJYOrk7gV5tRG5V2dnsp0UK14J9z73y','active','2026-09-04 07:32:35','2026-08-05 10:54:56',0,6,'2026-07-17 08:21:55','2026-09-04 07:32:35'),(3,3,3,'hr001','$2b$12$ZSS3tO.XrAQiHZPQ37nF3OMrGR4G16XwYkLULzTNvAkDxN/p1EjHq','active','2026-09-03 10:45:34','2026-08-04 10:05:17',0,0,'2026-07-17 08:21:55','2026-09-03 10:45:34'),(4,4,4,'admin001','$2b$12$ik6WpN8quVKVFnHN.1fFG.T1Zs3uzo9nw6iRbFMf3zAEjdS2DMkEW','active','2026-09-03 10:45:56',NULL,0,0,'2026-07-17 08:21:55','2026-09-03 10:45:56'),(8,9,1,'test','$2b$12$ShYTtPrz1Zt4xCxidKHh8eiOTOod/HVfTk7xy9C4Rf6vlCYc5PL8S','active',NULL,NULL,0,0,'2026-08-04 12:44:14','2026-08-04 13:00:35'),(21,22,2,'supervisor002','$2b$12$5KPOH9G4PLnWX3TOIo5NZezSGDf7FVt0zYN7cEG5H5qNx/tFpzrOS','active',NULL,NULL,1,0,'2026-08-24 14:51:44','2026-08-24 14:51:44'),(22,23,1,'emp006','$2b$12$yjpp4NzwtWN8JkC0doZUC.Wz/krqRp5UE06mi2kj13qwYRGhQdD8y','active','2026-08-31 14:01:52','2026-08-31 13:49:00',0,1,'2026-08-31 13:47:01','2026-08-31 14:01:52');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary table structure for view `vw_admin_dashboard_summary`
--

DROP TABLE IF EXISTS `vw_admin_dashboard_summary`;
/*!50001 DROP VIEW IF EXISTS `vw_admin_dashboard_summary`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `vw_admin_dashboard_summary` AS SELECT
 NULL AS `total_users`,
 NULL AS `active_users`,
 NULL AS `inactive_users`,
 NULL AS `locked_users`,
 NULL AS `active_departments`,
 NULL AS `active_positions`,
 NULL AS `total_audit_logs` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `vw_audit_log_details`
--

DROP TABLE IF EXISTS `vw_audit_log_details`;
/*!50001 DROP VIEW IF EXISTS `vw_audit_log_details`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `vw_audit_log_details` AS SELECT
 NULL AS `audit_id`,
 NULL AS `user_id`,
 NULL AS `username`,
 NULL AS `employee_id`,
 NULL AS `employee_code`,
 NULL AS `employee_name`,
 NULL AS `role_name`,
 NULL AS `action`,
 NULL AS `table_name`,
 NULL AS `record_id`,
 NULL AS `detail`,
 NULL AS `ip_address`,
 NULL AS `created_at` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `vw_department_management`
--

DROP TABLE IF EXISTS `vw_department_management`;
/*!50001 DROP VIEW IF EXISTS `vw_department_management`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `vw_department_management` AS SELECT
 NULL AS `department_id`,
 NULL AS `department_name`,
 NULL AS `description`,
 NULL AS `is_active`,
 NULL AS `created_at`,
 NULL AS `updated_at`,
 NULL AS `employee_count`,
 NULL AS `active_employee_count`,
 NULL AS `has_been_used` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `vw_employee_dashboard_summary`
--

DROP TABLE IF EXISTS `vw_employee_dashboard_summary`;
/*!50001 DROP VIEW IF EXISTS `vw_employee_dashboard_summary`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `vw_employee_dashboard_summary` AS SELECT
 NULL AS `employee_id`,
 NULL AS `employee_code`,
 NULL AS `employee_name`,
 NULL AS `total_requests`,
 NULL AS `draft_requests`,
 NULL AS `pending_requests`,
 NULL AS `approved_requests`,
 NULL AS `rejected_requests`,
 NULL AS `cancelled_requests`,
 NULL AS `approved_leave_days_this_year` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `vw_employee_management`
--

DROP TABLE IF EXISTS `vw_employee_management`;
/*!50001 DROP VIEW IF EXISTS `vw_employee_management`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `vw_employee_management` AS SELECT
 NULL AS `employee_id`,
 NULL AS `employee_code`,
 NULL AS `first_name`,
 NULL AS `last_name`,
 NULL AS `employee_name`,
 NULL AS `phone`,
 NULL AS `email`,
 NULL AS `hire_date`,
 NULL AS `employee_status`,
 NULL AS `created_at`,
 NULL AS `updated_at`,
 NULL AS `department_id`,
 NULL AS `department_name`,
 NULL AS `position_id`,
 NULL AS `position_name`,
 NULL AS `supervisor_id`,
 NULL AS `supervisor_employee_code`,
 NULL AS `supervisor_name`,
 NULL AS `user_id`,
 NULL AS `username`,
 NULL AS `account_status`,
 NULL AS `role_id`,
 NULL AS `role_name` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `vw_holiday_management`
--

DROP TABLE IF EXISTS `vw_holiday_management`;
/*!50001 DROP VIEW IF EXISTS `vw_holiday_management`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `vw_holiday_management` AS SELECT
 NULL AS `holiday_id`,
 NULL AS `holiday_date`,
 NULL AS `holiday_name`,
 NULL AS `holiday_year`,
 NULL AS `is_active`,
 NULL AS `date_status` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `vw_hr_dashboard_summary`
--

DROP TABLE IF EXISTS `vw_hr_dashboard_summary`;
/*!50001 DROP VIEW IF EXISTS `vw_hr_dashboard_summary`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `vw_hr_dashboard_summary` AS SELECT
 NULL AS `total_active_employees`,
 NULL AS `pending_requests`,
 NULL AS `approved_this_month`,
 NULL AS `rejected_this_month` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `vw_hr_leave_reports`
--

DROP TABLE IF EXISTS `vw_hr_leave_reports`;
/*!50001 DROP VIEW IF EXISTS `vw_hr_leave_reports`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `vw_hr_leave_reports` AS SELECT
 NULL AS `leave_request_id`,
 NULL AS `request_no`,
 NULL AS `employee_id`,
 NULL AS `employee_code`,
 NULL AS `employee_name`,
 NULL AS `department_id`,
 NULL AS `department_name`,
 NULL AS `position_id`,
 NULL AS `position_name`,
 NULL AS `leave_type_id`,
 NULL AS `leave_type_name`,
 NULL AS `start_date`,
 NULL AS `end_date`,
 NULL AS `leave_days`,
 NULL AS `status`,
 NULL AS `submitted_at`,
 NULL AS `approved_at`,
 NULL AS `rejected_at`,
 NULL AS `cancelled_at`,
 NULL AS `approver_employee_id`,
 NULL AS `approver_name` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `vw_leave_balances`
--

DROP TABLE IF EXISTS `vw_leave_balances`;
/*!50001 DROP VIEW IF EXISTS `vw_leave_balances`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `vw_leave_balances` AS SELECT
 NULL AS `entitlement_id`,
 NULL AS `employee_id`,
 NULL AS `employee_code`,
 NULL AS `employee_name`,
 NULL AS `leave_type_id`,
 NULL AS `leave_type_name`,
 NULL AS `year`,
 NULL AS `total_days`,
 NULL AS `used_days`,
 NULL AS `pending_days`,
 NULL AS `remaining_days`,
 NULL AS `available_days` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `vw_leave_entitlement_details`
--

DROP TABLE IF EXISTS `vw_leave_entitlement_details`;
/*!50001 DROP VIEW IF EXISTS `vw_leave_entitlement_details`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `vw_leave_entitlement_details` AS SELECT
 NULL AS `entitlement_id`,
 NULL AS `employee_id`,
 NULL AS `employee_code`,
 NULL AS `employee_name`,
 NULL AS `department_id`,
 NULL AS `department_name`,
 NULL AS `leave_type_id`,
 NULL AS `leave_type_name`,
 NULL AS `year`,
 NULL AS `total_days`,
 NULL AS `used_days`,
 NULL AS `pending_days`,
 NULL AS `remaining_days`,
 NULL AS `available_days`,
 NULL AS `updated_by`,
 NULL AS `updated_by_username`,
 NULL AS `updated_at` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `vw_leave_request_details`
--

DROP TABLE IF EXISTS `vw_leave_request_details`;
/*!50001 DROP VIEW IF EXISTS `vw_leave_request_details`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `vw_leave_request_details` AS SELECT
 NULL AS `leave_request_id`,
 NULL AS `request_no`,
 NULL AS `employee_id`,
 NULL AS `employee_code`,
 NULL AS `employee_name`,
 NULL AS `department_id`,
 NULL AS `department_name`,
 NULL AS `position_id`,
 NULL AS `position_name`,
 NULL AS `leave_type_id`,
 NULL AS `leave_type_name`,
 NULL AS `approver_employee_id`,
 NULL AS `approver_employee_code`,
 NULL AS `approver_name`,
 NULL AS `start_date`,
 NULL AS `end_date`,
 NULL AS `leave_days`,
 NULL AS `reason`,
 NULL AS `status`,
 NULL AS `submitted_at`,
 NULL AS `approved_at`,
 NULL AS `rejected_at`,
 NULL AS `cancelled_at`,
 NULL AS `created_at`,
 NULL AS `updated_at` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `vw_leave_request_timeline`
--

DROP TABLE IF EXISTS `vw_leave_request_timeline`;
/*!50001 DROP VIEW IF EXISTS `vw_leave_request_timeline`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `vw_leave_request_timeline` AS SELECT
 NULL AS `leave_request_id`,
 NULL AS `request_no`,
 NULL AS `event_type`,
 NULL AS `event_title`,
 NULL AS `event_detail`,
 NULL AS `actor_user_id`,
 NULL AS `actor_username`,
 NULL AS `event_at` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `vw_leave_type_management`
--

DROP TABLE IF EXISTS `vw_leave_type_management`;
/*!50001 DROP VIEW IF EXISTS `vw_leave_type_management`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `vw_leave_type_management` AS SELECT
 NULL AS `leave_type_id`,
 NULL AS `leave_type_name`,
 NULL AS `annual_quota_days`,
 NULL AS `requires_attachment`,
 NULL AS `attachment_required_after_days`,
 NULL AS `is_active`,
 NULL AS `created_at`,
 NULL AS `updated_at`,
 NULL AS `entitlement_count`,
 NULL AS `request_count`,
 NULL AS `has_been_used` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `vw_notification_details`
--

DROP TABLE IF EXISTS `vw_notification_details`;
/*!50001 DROP VIEW IF EXISTS `vw_notification_details`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `vw_notification_details` AS SELECT
 NULL AS `notification_id`,
 NULL AS `user_id`,
 NULL AS `username`,
 NULL AS `employee_id`,
 NULL AS `employee_code`,
 NULL AS `employee_name`,
 NULL AS `role_name`,
 NULL AS `leave_request_id`,
 NULL AS `request_no`,
 NULL AS `title`,
 NULL AS `message`,
 NULL AS `notification_type`,
 NULL AS `is_read`,
 NULL AS `created_at` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `vw_pending_approvals`
--

DROP TABLE IF EXISTS `vw_pending_approvals`;
/*!50001 DROP VIEW IF EXISTS `vw_pending_approvals`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `vw_pending_approvals` AS SELECT
 NULL AS `leave_request_id`,
 NULL AS `request_no`,
 NULL AS `supervisor_employee_id`,
 NULL AS `supervisor_employee_code`,
 NULL AS `supervisor_name`,
 NULL AS `employee_id`,
 NULL AS `employee_code`,
 NULL AS `employee_name`,
 NULL AS `department_name`,
 NULL AS `position_name`,
 NULL AS `leave_type_id`,
 NULL AS `leave_type_name`,
 NULL AS `start_date`,
 NULL AS `end_date`,
 NULL AS `leave_days`,
 NULL AS `reason`,
 NULL AS `submitted_at`,
 NULL AS `attachment_count` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `vw_position_management`
--

DROP TABLE IF EXISTS `vw_position_management`;
/*!50001 DROP VIEW IF EXISTS `vw_position_management`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `vw_position_management` AS SELECT
 NULL AS `position_id`,
 NULL AS `position_name`,
 NULL AS `is_active`,
 NULL AS `created_at`,
 NULL AS `updated_at`,
 NULL AS `employee_count`,
 NULL AS `active_employee_count`,
 NULL AS `has_been_used` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `vw_supervisor_leave_summary`
--

DROP TABLE IF EXISTS `vw_supervisor_leave_summary`;
/*!50001 DROP VIEW IF EXISTS `vw_supervisor_leave_summary`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `vw_supervisor_leave_summary` AS SELECT
 NULL AS `supervisor_employee_id`,
 NULL AS `supervisor_employee_code`,
 NULL AS `supervisor_name`,
 NULL AS `report_year`,
 NULL AS `report_month`,
 NULL AS `total_requests`,
 NULL AS `pending_requests`,
 NULL AS `approved_requests`,
 NULL AS `rejected_requests`,
 NULL AS `cancelled_requests` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `vw_user_management`
--

DROP TABLE IF EXISTS `vw_user_management`;
/*!50001 DROP VIEW IF EXISTS `vw_user_management`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `vw_user_management` AS SELECT
 NULL AS `user_id`,
 NULL AS `username`,
 NULL AS `account_status`,
 NULL AS `last_login_at`,
 NULL AS `created_at`,
 NULL AS `updated_at`,
 NULL AS `role_id`,
 NULL AS `role_name`,
 NULL AS `employee_id`,
 NULL AS `employee_code`,
 NULL AS `employee_name`,
 NULL AS `email`,
 NULL AS `employee_status`,
 NULL AS `department_id`,
 NULL AS `department_name`,
 NULL AS `position_id`,
 NULL AS `position_name` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `vw_user_profiles`
--

DROP TABLE IF EXISTS `vw_user_profiles`;
/*!50001 DROP VIEW IF EXISTS `vw_user_profiles`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `vw_user_profiles` AS SELECT
 NULL AS `user_id`,
 NULL AS `username`,
 NULL AS `account_status`,
 NULL AS `last_login_at`,
 NULL AS `role_id`,
 NULL AS `role_name`,
 NULL AS `employee_id`,
 NULL AS `employee_code`,
 NULL AS `first_name`,
 NULL AS `last_name`,
 NULL AS `full_name`,
 NULL AS `phone`,
 NULL AS `email`,
 NULL AS `hire_date`,
 NULL AS `employee_status`,
 NULL AS `department_id`,
 NULL AS `department_name`,
 NULL AS `position_id`,
 NULL AS `position_name`,
 NULL AS `supervisor_id`,
 NULL AS `supervisor_employee_code`,
 NULL AS `supervisor_name` */;
SET character_set_client = @saved_cs_client;

--
-- Dumping events for database 'online_leave_approval_system'
--

--
-- Dumping routines for database 'online_leave_approval_system'
--

--
-- Final view structure for view `vw_admin_dashboard_summary`
--

/*!50001 DROP VIEW IF EXISTS `vw_admin_dashboard_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`leave_app`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_admin_dashboard_summary` AS select count(0) AS `total_users`,sum(case when `users`.`status` = 'active' then 1 else 0 end) AS `active_users`,sum(case when `users`.`status` = 'inactive' then 1 else 0 end) AS `inactive_users`,sum(case when `users`.`status` = 'locked' then 1 else 0 end) AS `locked_users`,(select count(0) from `departments` where `departments`.`is_active` = 1) AS `active_departments`,(select count(0) from `positions` where `positions`.`is_active` = 1) AS `active_positions`,(select count(0) from `audit_logs`) AS `total_audit_logs` from `users` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_audit_log_details`
--

/*!50001 DROP VIEW IF EXISTS `vw_audit_log_details`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`leave_app`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_audit_log_details` AS select `al`.`audit_id` AS `audit_id`,`al`.`user_id` AS `user_id`,`u`.`username` AS `username`,`e`.`employee_id` AS `employee_id`,`e`.`employee_code` AS `employee_code`,concat(`e`.`first_name`,' ',`e`.`last_name`) AS `employee_name`,`r`.`role_name` AS `role_name`,`al`.`action` AS `action`,`al`.`table_name` AS `table_name`,`al`.`record_id` AS `record_id`,`al`.`detail` AS `detail`,`al`.`ip_address` AS `ip_address`,`al`.`created_at` AS `created_at` from (((`audit_logs` `al` left join `users` `u` on(`u`.`user_id` = `al`.`user_id`)) left join `employees` `e` on(`e`.`employee_id` = `u`.`employee_id`)) left join `roles` `r` on(`r`.`role_id` = `u`.`role_id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_department_management`
--

/*!50001 DROP VIEW IF EXISTS `vw_department_management`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`leave_app`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_department_management` AS select `d`.`department_id` AS `department_id`,`d`.`department_name` AS `department_name`,`d`.`description` AS `description`,`d`.`is_active` AS `is_active`,`d`.`created_at` AS `created_at`,`d`.`updated_at` AS `updated_at`,count(`e`.`employee_id`) AS `employee_count`,sum(case when `e`.`status` = 'active' then 1 else 0 end) AS `active_employee_count`,case when count(`e`.`employee_id`) > 0 then 1 else 0 end AS `has_been_used` from (`departments` `d` left join `employees` `e` on(`e`.`department_id` = `d`.`department_id`)) group by `d`.`department_id`,`d`.`department_name`,`d`.`description`,`d`.`is_active`,`d`.`created_at`,`d`.`updated_at` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_employee_dashboard_summary`
--

/*!50001 DROP VIEW IF EXISTS `vw_employee_dashboard_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`leave_app`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_employee_dashboard_summary` AS select `e`.`employee_id` AS `employee_id`,`e`.`employee_code` AS `employee_code`,concat(`e`.`first_name`,' ',`e`.`last_name`) AS `employee_name`,count(`lr`.`leave_request_id`) AS `total_requests`,sum(case when `lr`.`status` = 'draft' then 1 else 0 end) AS `draft_requests`,sum(case when `lr`.`status` = 'pending' then 1 else 0 end) AS `pending_requests`,sum(case when `lr`.`status` = 'approved' then 1 else 0 end) AS `approved_requests`,sum(case when `lr`.`status` = 'rejected' then 1 else 0 end) AS `rejected_requests`,sum(case when `lr`.`status` = 'cancelled' then 1 else 0 end) AS `cancelled_requests`,sum(case when `lr`.`status` = 'approved' and year(`lr`.`start_date`) = year(curdate()) then `lr`.`leave_days` else 0 end) AS `approved_leave_days_this_year` from (`employees` `e` left join `leave_requests` `lr` on(`lr`.`employee_id` = `e`.`employee_id`)) group by `e`.`employee_id`,`e`.`employee_code`,`e`.`first_name`,`e`.`last_name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_employee_management`
--

/*!50001 DROP VIEW IF EXISTS `vw_employee_management`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`leave_app`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_employee_management` AS select `e`.`employee_id` AS `employee_id`,`e`.`employee_code` AS `employee_code`,`e`.`first_name` AS `first_name`,`e`.`last_name` AS `last_name`,concat(`e`.`first_name`,' ',`e`.`last_name`) AS `employee_name`,`e`.`phone` AS `phone`,`e`.`email` AS `email`,`e`.`hire_date` AS `hire_date`,`e`.`status` AS `employee_status`,`e`.`created_at` AS `created_at`,`e`.`updated_at` AS `updated_at`,`d`.`department_id` AS `department_id`,`d`.`department_name` AS `department_name`,`p`.`position_id` AS `position_id`,`p`.`position_name` AS `position_name`,`e`.`supervisor_id` AS `supervisor_id`,`supervisor`.`employee_code` AS `supervisor_employee_code`,concat(`supervisor`.`first_name`,' ',`supervisor`.`last_name`) AS `supervisor_name`,`u`.`user_id` AS `user_id`,`u`.`username` AS `username`,`u`.`status` AS `account_status`,`r`.`role_id` AS `role_id`,`r`.`role_name` AS `role_name` from (((((`employees` `e` join `departments` `d` on(`d`.`department_id` = `e`.`department_id`)) join `positions` `p` on(`p`.`position_id` = `e`.`position_id`)) left join `employees` `supervisor` on(`supervisor`.`employee_id` = `e`.`supervisor_id`)) left join `users` `u` on(`u`.`employee_id` = `e`.`employee_id`)) left join `roles` `r` on(`r`.`role_id` = `u`.`role_id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_holiday_management`
--

/*!50001 DROP VIEW IF EXISTS `vw_holiday_management`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`leave_app`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_holiday_management` AS select `holidays`.`holiday_id` AS `holiday_id`,`holidays`.`holiday_date` AS `holiday_date`,`holidays`.`holiday_name` AS `holiday_name`,`holidays`.`year` AS `holiday_year`,`holidays`.`is_active` AS `is_active`,case when `holidays`.`holiday_date` < curdate() then 'past' when `holidays`.`holiday_date` = curdate() then 'today' else 'upcoming' end AS `date_status` from `holidays` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_hr_dashboard_summary`
--

/*!50001 DROP VIEW IF EXISTS `vw_hr_dashboard_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`leave_app`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_hr_dashboard_summary` AS select count(distinct case when `e`.`status` = 'active' then `e`.`employee_id` end) AS `total_active_employees`,count(distinct case when `lr`.`status` = 'pending' then `lr`.`leave_request_id` end) AS `pending_requests`,count(distinct case when `lr`.`status` = 'approved' and year(`lr`.`approved_at`) = year(curdate()) and month(`lr`.`approved_at`) = month(curdate()) then `lr`.`leave_request_id` end) AS `approved_this_month`,count(distinct case when `lr`.`status` = 'rejected' and year(`lr`.`rejected_at`) = year(curdate()) and month(`lr`.`rejected_at`) = month(curdate()) then `lr`.`leave_request_id` end) AS `rejected_this_month` from (`employees` `e` left join `leave_requests` `lr` on(`lr`.`employee_id` = `e`.`employee_id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_hr_leave_reports`
--

/*!50001 DROP VIEW IF EXISTS `vw_hr_leave_reports`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`leave_app`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_hr_leave_reports` AS select `lr`.`leave_request_id` AS `leave_request_id`,`lr`.`request_no` AS `request_no`,`lr`.`employee_id` AS `employee_id`,`e`.`employee_code` AS `employee_code`,concat(`e`.`first_name`,' ',`e`.`last_name`) AS `employee_name`,`d`.`department_id` AS `department_id`,`d`.`department_name` AS `department_name`,`p`.`position_id` AS `position_id`,`p`.`position_name` AS `position_name`,`lr`.`leave_type_id` AS `leave_type_id`,`lt`.`leave_type_name` AS `leave_type_name`,`lr`.`start_date` AS `start_date`,`lr`.`end_date` AS `end_date`,`lr`.`leave_days` AS `leave_days`,`lr`.`status` AS `status`,`lr`.`submitted_at` AS `submitted_at`,`lr`.`approved_at` AS `approved_at`,`lr`.`rejected_at` AS `rejected_at`,`lr`.`cancelled_at` AS `cancelled_at`,`lr`.`approver_employee_id` AS `approver_employee_id`,concat(`approver`.`first_name`,' ',`approver`.`last_name`) AS `approver_name` from (((((`leave_requests` `lr` join `employees` `e` on(`e`.`employee_id` = `lr`.`employee_id`)) join `departments` `d` on(`d`.`department_id` = `e`.`department_id`)) join `positions` `p` on(`p`.`position_id` = `e`.`position_id`)) join `leave_types` `lt` on(`lt`.`leave_type_id` = `lr`.`leave_type_id`)) left join `employees` `approver` on(`approver`.`employee_id` = `lr`.`approver_employee_id`)) where `lr`.`request_no` is not null */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_leave_balances`
--

/*!50001 DROP VIEW IF EXISTS `vw_leave_balances`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`leave_app`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_leave_balances` AS select `le`.`entitlement_id` AS `entitlement_id`,`le`.`employee_id` AS `employee_id`,`e`.`employee_code` AS `employee_code`,concat(`e`.`first_name`,' ',`e`.`last_name`) AS `employee_name`,`le`.`leave_type_id` AS `leave_type_id`,`lt`.`leave_type_name` AS `leave_type_name`,`le`.`year` AS `year`,`le`.`total_days` AS `total_days`,`le`.`used_days` AS `used_days`,coalesce(`p`.`pending_days`,0.00) AS `pending_days`,`le`.`total_days` - `le`.`used_days` AS `remaining_days`,`le`.`total_days` - `le`.`used_days` - coalesce(`p`.`pending_days`,0.00) AS `available_days` from (((`leave_entitlements` `le` join `employees` `e` on(`e`.`employee_id` = `le`.`employee_id`)) join `leave_types` `lt` on(`lt`.`leave_type_id` = `le`.`leave_type_id`)) left join (select `leave_requests`.`employee_id` AS `employee_id`,`leave_requests`.`leave_type_id` AS `leave_type_id`,year(`leave_requests`.`start_date`) AS `entitlement_year`,sum(`leave_requests`.`leave_days`) AS `pending_days` from `leave_requests` where `leave_requests`.`status` = 'pending' group by `leave_requests`.`employee_id`,`leave_requests`.`leave_type_id`,year(`leave_requests`.`start_date`)) `p` on(`p`.`employee_id` = `le`.`employee_id` and `p`.`leave_type_id` = `le`.`leave_type_id` and `p`.`entitlement_year` = `le`.`year`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_leave_entitlement_details`
--

/*!50001 DROP VIEW IF EXISTS `vw_leave_entitlement_details`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`leave_app`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_leave_entitlement_details` AS select `le`.`entitlement_id` AS `entitlement_id`,`le`.`employee_id` AS `employee_id`,`e`.`employee_code` AS `employee_code`,concat(`e`.`first_name`,' ',`e`.`last_name`) AS `employee_name`,`d`.`department_id` AS `department_id`,`d`.`department_name` AS `department_name`,`le`.`leave_type_id` AS `leave_type_id`,`lt`.`leave_type_name` AS `leave_type_name`,`le`.`year` AS `year`,`le`.`total_days` AS `total_days`,`le`.`used_days` AS `used_days`,coalesce(`p`.`pending_days`,0.00) AS `pending_days`,`le`.`total_days` - `le`.`used_days` AS `remaining_days`,`le`.`total_days` - `le`.`used_days` - coalesce(`p`.`pending_days`,0.00) AS `available_days`,`le`.`updated_by` AS `updated_by`,`updater`.`username` AS `updated_by_username`,`le`.`updated_at` AS `updated_at` from (((((`leave_entitlements` `le` join `employees` `e` on(`e`.`employee_id` = `le`.`employee_id`)) join `departments` `d` on(`d`.`department_id` = `e`.`department_id`)) join `leave_types` `lt` on(`lt`.`leave_type_id` = `le`.`leave_type_id`)) left join `users` `updater` on(`updater`.`user_id` = `le`.`updated_by`)) left join (select `leave_requests`.`employee_id` AS `employee_id`,`leave_requests`.`leave_type_id` AS `leave_type_id`,year(`leave_requests`.`start_date`) AS `entitlement_year`,sum(`leave_requests`.`leave_days`) AS `pending_days` from `leave_requests` where `leave_requests`.`status` = 'pending' group by `leave_requests`.`employee_id`,`leave_requests`.`leave_type_id`,year(`leave_requests`.`start_date`)) `p` on(`p`.`employee_id` = `le`.`employee_id` and `p`.`leave_type_id` = `le`.`leave_type_id` and `p`.`entitlement_year` = `le`.`year`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_leave_request_details`
--

/*!50001 DROP VIEW IF EXISTS `vw_leave_request_details`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`leave_app`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_leave_request_details` AS select `lr`.`leave_request_id` AS `leave_request_id`,`lr`.`request_no` AS `request_no`,`lr`.`employee_id` AS `employee_id`,`employee`.`employee_code` AS `employee_code`,concat(`employee`.`first_name`,' ',`employee`.`last_name`) AS `employee_name`,`department`.`department_id` AS `department_id`,`department`.`department_name` AS `department_name`,`position`.`position_id` AS `position_id`,`position`.`position_name` AS `position_name`,`lr`.`leave_type_id` AS `leave_type_id`,`leave_type`.`leave_type_name` AS `leave_type_name`,`lr`.`approver_employee_id` AS `approver_employee_id`,`approver`.`employee_code` AS `approver_employee_code`,concat(`approver`.`first_name`,' ',`approver`.`last_name`) AS `approver_name`,`lr`.`start_date` AS `start_date`,`lr`.`end_date` AS `end_date`,`lr`.`leave_days` AS `leave_days`,`lr`.`reason` AS `reason`,`lr`.`status` AS `status`,`lr`.`submitted_at` AS `submitted_at`,`lr`.`approved_at` AS `approved_at`,`lr`.`rejected_at` AS `rejected_at`,`lr`.`cancelled_at` AS `cancelled_at`,`lr`.`created_at` AS `created_at`,`lr`.`updated_at` AS `updated_at` from (((((`leave_requests` `lr` join `employees` `employee` on(`employee`.`employee_id` = `lr`.`employee_id`)) join `departments` `department` on(`department`.`department_id` = `employee`.`department_id`)) join `positions` `position` on(`position`.`position_id` = `employee`.`position_id`)) join `leave_types` `leave_type` on(`leave_type`.`leave_type_id` = `lr`.`leave_type_id`)) left join `employees` `approver` on(`approver`.`employee_id` = `lr`.`approver_employee_id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_leave_request_timeline`
--

/*!50001 DROP VIEW IF EXISTS `vw_leave_request_timeline`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`leave_app`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_leave_request_timeline` AS select `lr`.`leave_request_id` AS `leave_request_id`,`lr`.`request_no` AS `request_no`,'submitted' AS `event_type`,'Submitted by employee' AS `event_title`,concat('Leave request ',`lr`.`request_no`,' was submitted by the employee.') AS `event_detail`,`requester`.`user_id` AS `actor_user_id`,`requester`.`username` AS `actor_username`,`lr`.`submitted_at` AS `event_at` from (`leave_requests` `lr` left join `users` `requester` on(`requester`.`employee_id` = `lr`.`employee_id`)) where `lr`.`submitted_at` is not null union all select `lr`.`leave_request_id` AS `leave_request_id`,`lr`.`request_no` AS `request_no`,`lal`.`action` AS `event_type`,case when `lal`.`action` = 'approved' then 'Approved by supervisor' when `lal`.`action` = 'rejected' then 'Rejected by supervisor' end AS `event_title`,case when `lal`.`action` = 'approved' then concat('Leave request ',`lr`.`request_no`,' was approved.') when `lal`.`action` = 'rejected' then concat('Leave request ',`lr`.`request_no`,' was rejected. Reason: ',coalesce(`lal`.`comment`,'-')) end AS `event_detail`,`lal`.`approver_id` AS `actor_user_id`,`approver`.`username` AS `actor_username`,`lal`.`acted_at` AS `event_at` from ((`leave_approval_logs` `lal` join `leave_requests` `lr` on(`lr`.`leave_request_id` = `lal`.`leave_request_id`)) join `users` `approver` on(`approver`.`user_id` = `lal`.`approver_id`)) union all select `lr`.`leave_request_id` AS `leave_request_id`,`lr`.`request_no` AS `request_no`,'cancelled' AS `event_type`,'Cancelled by employee' AS `event_title`,concat('Leave request ',`lr`.`request_no`,' was cancelled by the employee.') AS `event_detail`,`requester`.`user_id` AS `actor_user_id`,`requester`.`username` AS `actor_username`,`lr`.`cancelled_at` AS `event_at` from (`leave_requests` `lr` left join `users` `requester` on(`requester`.`employee_id` = `lr`.`employee_id`)) where `lr`.`cancelled_at` is not null */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_leave_type_management`
--

/*!50001 DROP VIEW IF EXISTS `vw_leave_type_management`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`leave_app`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_leave_type_management` AS select `lt`.`leave_type_id` AS `leave_type_id`,`lt`.`leave_type_name` AS `leave_type_name`,`lt`.`annual_quota_days` AS `annual_quota_days`,`lt`.`requires_attachment` AS `requires_attachment`,`lt`.`attachment_required_after_days` AS `attachment_required_after_days`,`lt`.`is_active` AS `is_active`,`lt`.`created_at` AS `created_at`,`lt`.`updated_at` AS `updated_at`,count(distinct `le`.`entitlement_id`) AS `entitlement_count`,count(distinct `lr`.`leave_request_id`) AS `request_count`,case when count(distinct `le`.`entitlement_id`) > 0 or count(distinct `lr`.`leave_request_id`) > 0 then 1 else 0 end AS `has_been_used` from ((`leave_types` `lt` left join `leave_entitlements` `le` on(`le`.`leave_type_id` = `lt`.`leave_type_id`)) left join `leave_requests` `lr` on(`lr`.`leave_type_id` = `lt`.`leave_type_id`)) group by `lt`.`leave_type_id`,`lt`.`leave_type_name`,`lt`.`annual_quota_days`,`lt`.`requires_attachment`,`lt`.`attachment_required_after_days`,`lt`.`is_active`,`lt`.`created_at`,`lt`.`updated_at` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_notification_details`
--

/*!50001 DROP VIEW IF EXISTS `vw_notification_details`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`leave_app`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_notification_details` AS select `n`.`notification_id` AS `notification_id`,`n`.`user_id` AS `user_id`,`u`.`username` AS `username`,`e`.`employee_id` AS `employee_id`,`e`.`employee_code` AS `employee_code`,concat(`e`.`first_name`,' ',`e`.`last_name`) AS `employee_name`,`r`.`role_name` AS `role_name`,`n`.`leave_request_id` AS `leave_request_id`,`lr`.`request_no` AS `request_no`,`n`.`title` AS `title`,`n`.`message` AS `message`,`n`.`notification_type` AS `notification_type`,`n`.`is_read` AS `is_read`,`n`.`created_at` AS `created_at` from ((((`notifications` `n` join `users` `u` on(`u`.`user_id` = `n`.`user_id`)) join `employees` `e` on(`e`.`employee_id` = `u`.`employee_id`)) join `roles` `r` on(`r`.`role_id` = `u`.`role_id`)) left join `leave_requests` `lr` on(`lr`.`leave_request_id` = `n`.`leave_request_id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_pending_approvals`
--

/*!50001 DROP VIEW IF EXISTS `vw_pending_approvals`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`leave_app`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_pending_approvals` AS select `lr`.`leave_request_id` AS `leave_request_id`,`lr`.`request_no` AS `request_no`,`lr`.`approver_employee_id` AS `supervisor_employee_id`,`supervisor`.`employee_code` AS `supervisor_employee_code`,concat(`supervisor`.`first_name`,' ',`supervisor`.`last_name`) AS `supervisor_name`,`lr`.`employee_id` AS `employee_id`,`employee`.`employee_code` AS `employee_code`,concat(`employee`.`first_name`,' ',`employee`.`last_name`) AS `employee_name`,`department`.`department_name` AS `department_name`,`position`.`position_name` AS `position_name`,`lr`.`leave_type_id` AS `leave_type_id`,`leave_type`.`leave_type_name` AS `leave_type_name`,`lr`.`start_date` AS `start_date`,`lr`.`end_date` AS `end_date`,`lr`.`leave_days` AS `leave_days`,`lr`.`reason` AS `reason`,`lr`.`submitted_at` AS `submitted_at`,coalesce(`attachment_data`.`attachment_count`,0) AS `attachment_count` from ((((((`leave_requests` `lr` join `employees` `employee` on(`employee`.`employee_id` = `lr`.`employee_id`)) join `employees` `supervisor` on(`supervisor`.`employee_id` = `lr`.`approver_employee_id`)) join `departments` `department` on(`department`.`department_id` = `employee`.`department_id`)) join `positions` `position` on(`position`.`position_id` = `employee`.`position_id`)) join `leave_types` `leave_type` on(`leave_type`.`leave_type_id` = `lr`.`leave_type_id`)) left join (select `leave_attachments`.`leave_request_id` AS `leave_request_id`,count(0) AS `attachment_count` from `leave_attachments` where `leave_attachments`.`deleted_at` is null group by `leave_attachments`.`leave_request_id`) `attachment_data` on(`attachment_data`.`leave_request_id` = `lr`.`leave_request_id`)) where `lr`.`status` = 'pending' */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_position_management`
--

/*!50001 DROP VIEW IF EXISTS `vw_position_management`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`leave_app`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_position_management` AS select `p`.`position_id` AS `position_id`,`p`.`position_name` AS `position_name`,`p`.`is_active` AS `is_active`,`p`.`created_at` AS `created_at`,`p`.`updated_at` AS `updated_at`,count(`e`.`employee_id`) AS `employee_count`,sum(case when `e`.`status` = 'active' then 1 else 0 end) AS `active_employee_count`,case when count(`e`.`employee_id`) > 0 then 1 else 0 end AS `has_been_used` from (`positions` `p` left join `employees` `e` on(`e`.`position_id` = `p`.`position_id`)) group by `p`.`position_id`,`p`.`position_name`,`p`.`is_active`,`p`.`created_at`,`p`.`updated_at` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_supervisor_leave_summary`
--

/*!50001 DROP VIEW IF EXISTS `vw_supervisor_leave_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`leave_app`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_supervisor_leave_summary` AS select `lr`.`approver_employee_id` AS `supervisor_employee_id`,`supervisor`.`employee_code` AS `supervisor_employee_code`,concat(`supervisor`.`first_name`,' ',`supervisor`.`last_name`) AS `supervisor_name`,year(coalesce(`lr`.`submitted_at`,`lr`.`created_at`)) AS `report_year`,month(coalesce(`lr`.`submitted_at`,`lr`.`created_at`)) AS `report_month`,count(0) AS `total_requests`,sum(case when `lr`.`status` = 'pending' then 1 else 0 end) AS `pending_requests`,sum(case when `lr`.`status` = 'approved' then 1 else 0 end) AS `approved_requests`,sum(case when `lr`.`status` = 'rejected' then 1 else 0 end) AS `rejected_requests`,sum(case when `lr`.`status` = 'cancelled' then 1 else 0 end) AS `cancelled_requests` from (`leave_requests` `lr` join `employees` `supervisor` on(`supervisor`.`employee_id` = `lr`.`approver_employee_id`)) where `lr`.`request_no` is not null group by `lr`.`approver_employee_id`,`supervisor`.`employee_code`,`supervisor`.`first_name`,`supervisor`.`last_name`,year(coalesce(`lr`.`submitted_at`,`lr`.`created_at`)),month(coalesce(`lr`.`submitted_at`,`lr`.`created_at`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_user_management`
--

/*!50001 DROP VIEW IF EXISTS `vw_user_management`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`leave_app`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_user_management` AS select `u`.`user_id` AS `user_id`,`u`.`username` AS `username`,`u`.`status` AS `account_status`,`u`.`last_login_at` AS `last_login_at`,`u`.`created_at` AS `created_at`,`u`.`updated_at` AS `updated_at`,`r`.`role_id` AS `role_id`,`r`.`role_name` AS `role_name`,`e`.`employee_id` AS `employee_id`,`e`.`employee_code` AS `employee_code`,concat(`e`.`first_name`,' ',`e`.`last_name`) AS `employee_name`,`e`.`email` AS `email`,`e`.`status` AS `employee_status`,`d`.`department_id` AS `department_id`,`d`.`department_name` AS `department_name`,`p`.`position_id` AS `position_id`,`p`.`position_name` AS `position_name` from ((((`users` `u` join `roles` `r` on(`r`.`role_id` = `u`.`role_id`)) join `employees` `e` on(`e`.`employee_id` = `u`.`employee_id`)) join `departments` `d` on(`d`.`department_id` = `e`.`department_id`)) join `positions` `p` on(`p`.`position_id` = `e`.`position_id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_user_profiles`
--

/*!50001 DROP VIEW IF EXISTS `vw_user_profiles`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`leave_app`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_user_profiles` AS select `user_account`.`user_id` AS `user_id`,`user_account`.`username` AS `username`,`user_account`.`status` AS `account_status`,`user_account`.`last_login_at` AS `last_login_at`,`role`.`role_id` AS `role_id`,`role`.`role_name` AS `role_name`,`employee`.`employee_id` AS `employee_id`,`employee`.`employee_code` AS `employee_code`,`employee`.`first_name` AS `first_name`,`employee`.`last_name` AS `last_name`,concat(`employee`.`first_name`,' ',`employee`.`last_name`) AS `full_name`,`employee`.`phone` AS `phone`,`employee`.`email` AS `email`,`employee`.`hire_date` AS `hire_date`,`employee`.`status` AS `employee_status`,`department`.`department_id` AS `department_id`,`department`.`department_name` AS `department_name`,`position`.`position_id` AS `position_id`,`position`.`position_name` AS `position_name`,`employee`.`supervisor_id` AS `supervisor_id`,`supervisor`.`employee_code` AS `supervisor_employee_code`,concat(`supervisor`.`first_name`,' ',`supervisor`.`last_name`) AS `supervisor_name` from (((((`users` `user_account` join `roles` `role` on(`role`.`role_id` = `user_account`.`role_id`)) join `employees` `employee` on(`employee`.`employee_id` = `user_account`.`employee_id`)) join `departments` `department` on(`department`.`department_id` = `employee`.`department_id`)) join `positions` `position` on(`position`.`position_id` = `employee`.`position_id`)) left join `employees` `supervisor` on(`supervisor`.`employee_id` = `employee`.`supervisor_id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-04  8:10:36
