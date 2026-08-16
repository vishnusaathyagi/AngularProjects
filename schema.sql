-- MySQL dump 10.13  Distrib 9.7.1, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: dynamic_forms_db
-- ------------------------------------------------------
-- Server version	9.7.1

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
-- Table structure for table `form_submissions`
--

DROP TABLE IF EXISTS `form_submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `form_submissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `form_id` int NOT NULL,
  `submission_data` json NOT NULL,
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `form_id` (`form_id`),
  CONSTRAINT `form_submissions_ibfk_1` FOREIGN KEY (`form_id`) REFERENCES `forms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `form_submissions`
--

LOCK TABLES `form_submissions` WRITE;
/*!40000 ALTER TABLE `form_submissions` DISABLE KEYS */;
INSERT INTO `form_submissions` VALUES (3,3,'{\"Name\": \"Vishnukumar MB\", \"Mobile number\": \"9876543210\"}','2026-08-13 13:46:21'),(5,6,'{\"Name\": \"\"}','2026-08-14 14:25:41'),(6,6,'{\"Name\": \"Hello\", \"Email\": \"hello@hhh.com\"}','2026-08-15 12:43:57'),(7,8,'{\"City\": \"Banglore\", \"Pincode\": \"560016\", \"Floor number\": \"1\", \"Street details\": \"asf,gfsv,svadsf\", \"Flat or Door Number\": \"23\"}','2026-08-16 06:43:46'),(8,8,'{\"City\": \"Banglore\", \"Pincode\": \"560016\", \"Floor number\": \"1\", \"Street details\": \"asf,gfsv,svadsf\", \"Flat or Door Number\": \"23\"}','2026-08-16 07:52:56'),(9,7,'{\"age\": \"23\", \"phone number\": \"9876543210\", \"Did you like mobile?\": \"Yes\"}','2026-08-16 07:53:09');
/*!40000 ALTER TABLE `form_submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forms`
--

DROP TABLE IF EXISTS `forms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `form_name` varchar(100) NOT NULL,
  `description` text,
  `status` varchar(20) DEFAULT 'active',
  `fields` json NOT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `form_name` (`form_name`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forms`
--

LOCK TABLES `forms` WRITE;
/*!40000 ALTER TABLE `forms` DISABLE KEYS */;
INSERT INTO `forms` VALUES (3,'Login Form','This is login Form','active','[{\"name\": \"Name\", \"type\": \"text\", \"label\": \"Name\", \"required\": true, \"placeholder\": \"Please enter the name\"}, {\"name\": \"Phone number\", \"type\": \"number\", \"label\": \"Phone number\", \"required\": false, \"placeholder\": \"Please enter the Phone number\"}]',1,NULL,'2026-08-12 14:25:29','2026-08-16 08:00:40'),(6,'Contact Form','This is Contact Form','active','[{\"name\": \"Name\", \"type\": \"text\", \"label\": \"Name\", \"required\": true, \"placeholder\": \"Enter the name\"}, {\"name\": \"Email\", \"type\": \"email\", \"label\": \"Email\", \"required\": true, \"placeholder\": \"Enter email\"}]',1,NULL,'2026-08-14 14:19:48','2026-08-15 12:44:27'),(7,'Marketing form','This is marketing form','active','[{\"name\": \"phone number\", \"type\": \"tel\", \"label\": \"phone number\", \"required\": false, \"maxLength\": 10, \"minLength\": 5, \"placeholder\": \"Enter phone number\"}, {\"name\": \"Did you like mobile?\", \"type\": \"select\", \"label\": \"Did you like mobile?\", \"options\": [\"Yes\", \"No\"], \"required\": true, \"placeholder\": \"Did you like mobile?\"}, {\"max\": 60, \"min\": 5, \"name\": \"age\", \"type\": \"number\", \"label\": \"age\", \"required\": false, \"placeholder\": \"age\"}]',1,NULL,'2026-08-16 06:11:24','2026-08-16 06:21:28'),(8,'Address form','This is address form','active','[{\"name\": \"Flat or Door Number\", \"type\": \"number\", \"label\": \"Flat or Door Number\", \"required\": true, \"placeholder\": \"Enter Flat or Door Number\"}, {\"name\": \"Floor number\", \"type\": \"number\", \"label\": \"Floor number\", \"required\": true, \"placeholder\": \"Enter Floor number\"}, {\"name\": \"Street details\", \"type\": \"text\", \"label\": \"Street details\", \"required\": true, \"placeholder\": \"Enter Street details\"}, {\"name\": \"City\", \"type\": \"text\", \"label\": \"City\", \"required\": true, \"placeholder\": \"Enter City\"}, {\"name\": \"Pincode\", \"type\": \"text\", \"label\": \"Pincode\", \"pattern\": \"^56[0-2]\\\\d{3}$\", \"required\": true, \"maxLength\": 6, \"placeholder\": \"Enter Pincode\"}]',1,NULL,'2026-08-16 06:43:19','2026-08-16 06:43:19');
/*!40000 ALTER TABLE `forms` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-16 14:19:08
