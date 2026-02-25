-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: localhost    Database: catalog_studio_db
-- ------------------------------------------------------
-- Server version	8.0.45-0ubuntu0.24.04.1

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
-- Table structure for table `account_emailaddress`
--

DROP TABLE IF EXISTS `account_emailaddress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account_emailaddress` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(254) COLLATE utf8mb4_unicode_ci NOT NULL,
  `verified` tinyint(1) NOT NULL,
  `primary` tinyint(1) NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `account_emailaddress_user_id_email_987c8728_uniq` (`user_id`,`email`),
  KEY `account_emailaddress_email_03be32b2` (`email`),
  CONSTRAINT `account_emailaddress_user_id_2c513194_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account_emailaddress`
--

LOCK TABLES `account_emailaddress` WRITE;
/*!40000 ALTER TABLE `account_emailaddress` DISABLE KEYS */;
INSERT INTO `account_emailaddress` VALUES (4,'khushi12@gmail.com',0,1,8),(5,'bhavanbadhe@gmail.com',0,1,9);
/*!40000 ALTER TABLE `account_emailaddress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `account_emailconfirmation`
--

DROP TABLE IF EXISTS `account_emailconfirmation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account_emailconfirmation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `created` datetime(6) NOT NULL,
  `sent` datetime(6) DEFAULT NULL,
  `key` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_address_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`),
  KEY `account_emailconfirm_email_address_id_5b7f8c58_fk_account_e` (`email_address_id`),
  CONSTRAINT `account_emailconfirm_email_address_id_5b7f8c58_fk_account_e` FOREIGN KEY (`email_address_id`) REFERENCES `account_emailaddress` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account_emailconfirmation`
--

LOCK TABLES `account_emailconfirmation` WRITE;
/*!40000 ALTER TABLE `account_emailconfirmation` DISABLE KEYS */;
/*!40000 ALTER TABLE `account_emailconfirmation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group`
--

DROP TABLE IF EXISTS `auth_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group`
--

LOCK TABLES `auth_group` WRITE;
/*!40000 ALTER TABLE `auth_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group_permissions`
--

DROP TABLE IF EXISTS `auth_group_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group_permissions`
--

LOCK TABLES `auth_group_permissions` WRITE;
/*!40000 ALTER TABLE `auth_group_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_permission`
--

DROP TABLE IF EXISTS `auth_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_permission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content_type_id` int NOT NULL,
  `codename` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES (1,'Can add log entry',1,'add_logentry'),(2,'Can change log entry',1,'change_logentry'),(3,'Can delete log entry',1,'delete_logentry'),(4,'Can view log entry',1,'view_logentry'),(5,'Can add permission',3,'add_permission'),(6,'Can change permission',3,'change_permission'),(7,'Can delete permission',3,'delete_permission'),(8,'Can view permission',3,'view_permission'),(9,'Can add group',2,'add_group'),(10,'Can change group',2,'change_group'),(11,'Can delete group',2,'delete_group'),(12,'Can view group',2,'view_group'),(13,'Can add content type',4,'add_contenttype'),(14,'Can change content type',4,'change_contenttype'),(15,'Can delete content type',4,'delete_contenttype'),(16,'Can view content type',4,'view_contenttype'),(17,'Can add session',5,'add_session'),(18,'Can change session',5,'change_session'),(19,'Can delete session',5,'delete_session'),(20,'Can view session',5,'view_session'),(21,'Can add site',6,'add_site'),(22,'Can change site',6,'change_site'),(23,'Can delete site',6,'delete_site'),(24,'Can view site',6,'view_site'),(25,'Can add Token',7,'add_token'),(26,'Can change Token',7,'change_token'),(27,'Can delete Token',7,'delete_token'),(28,'Can view Token',7,'view_token'),(29,'Can add Token',8,'add_tokenproxy'),(30,'Can change Token',8,'change_tokenproxy'),(31,'Can delete Token',8,'delete_tokenproxy'),(32,'Can view Token',8,'view_tokenproxy'),(33,'Can add email address',9,'add_emailaddress'),(34,'Can change email address',9,'change_emailaddress'),(35,'Can delete email address',9,'delete_emailaddress'),(36,'Can view email address',9,'view_emailaddress'),(37,'Can add email confirmation',10,'add_emailconfirmation'),(38,'Can change email confirmation',10,'change_emailconfirmation'),(39,'Can delete email confirmation',10,'delete_emailconfirmation'),(40,'Can view email confirmation',10,'view_emailconfirmation'),(41,'Can add social account',11,'add_socialaccount'),(42,'Can change social account',11,'change_socialaccount'),(43,'Can delete social account',11,'delete_socialaccount'),(44,'Can view social account',11,'view_socialaccount'),(45,'Can add social application',12,'add_socialapp'),(46,'Can change social application',12,'change_socialapp'),(47,'Can delete social application',12,'delete_socialapp'),(48,'Can view social application',12,'view_socialapp'),(49,'Can add social application token',13,'add_socialtoken'),(50,'Can change social application token',13,'change_socialtoken'),(51,'Can delete social application token',13,'delete_socialtoken'),(52,'Can view social application token',13,'view_socialtoken'),(53,'Can add user',14,'add_user'),(54,'Can change user',14,'change_user'),(55,'Can delete user',14,'delete_user'),(56,'Can view user',14,'view_user'),(57,'Can add category',15,'add_category'),(58,'Can change category',15,'change_category'),(59,'Can delete category',15,'delete_category'),(60,'Can view category',15,'view_category'),(61,'Can add product',16,'add_product'),(62,'Can change product',16,'change_product'),(63,'Can delete product',16,'delete_product'),(64,'Can view product',16,'view_product'),(65,'Can add media item',17,'add_mediaitem'),(66,'Can change media item',17,'change_mediaitem'),(67,'Can delete media item',17,'delete_mediaitem'),(68,'Can view media item',17,'view_mediaitem'),(69,'Can add catalog',18,'add_catalog'),(70,'Can change catalog',18,'change_catalog'),(71,'Can delete catalog',18,'delete_catalog'),(72,'Can view catalog',18,'view_catalog'),(73,'Can add catalog page',19,'add_catalogpage'),(74,'Can change catalog page',19,'change_catalogpage'),(75,'Can delete catalog page',19,'delete_catalogpage'),(76,'Can view catalog page',19,'view_catalogpage'),(77,'Can add theme',20,'add_theme'),(78,'Can change theme',20,'change_theme'),(79,'Can delete theme',20,'delete_theme'),(80,'Can view theme',20,'view_theme'),(81,'Can add password reset otp',21,'add_passwordresetotp'),(82,'Can change password reset otp',21,'change_passwordresetotp'),(83,'Can delete password reset otp',21,'delete_passwordresetotp'),(84,'Can view password reset otp',21,'view_passwordresetotp'),(85,'Can add business template',22,'add_businesstemplate'),(86,'Can change business template',22,'change_businesstemplate'),(87,'Can delete business template',22,'delete_businesstemplate'),(88,'Can view business template',22,'view_businesstemplate'),(89,'Can add subscription plan',23,'add_subscriptionplan'),(90,'Can change subscription plan',23,'change_subscriptionplan'),(91,'Can delete subscription plan',23,'delete_subscriptionplan'),(92,'Can view subscription plan',23,'view_subscriptionplan'),(93,'Can add user subscription',24,'add_usersubscription'),(94,'Can change user subscription',24,'change_usersubscription'),(95,'Can delete user subscription',24,'delete_usersubscription'),(96,'Can view user subscription',24,'view_usersubscription');
/*!40000 ALTER TABLE `auth_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `authtoken_token`
--

DROP TABLE IF EXISTS `authtoken_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `authtoken_token` (
  `key` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created` datetime(6) NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`key`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `authtoken_token_user_id_35299eff_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `authtoken_token`
--

LOCK TABLES `authtoken_token` WRITE;
/*!40000 ALTER TABLE `authtoken_token` DISABLE KEYS */;
/*!40000 ALTER TABLE `authtoken_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `catalogs_catalog`
--

DROP TABLE IF EXISTS `catalogs_catalog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `catalogs_catalog` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uuid` char(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `settings` json NOT NULL,
  `product_ids` json NOT NULL,
  `selected_category_ids` json NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `owner_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `catalogs_catalog_owner_id_f1adbafd_fk_users_user_id` (`owner_id`),
  CONSTRAINT `catalogs_catalog_owner_id_f1adbafd_fk_users_user_id` FOREIGN KEY (`owner_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `catalogs_catalog`
--

LOCK TABLES `catalogs_catalog` WRITE;
/*!40000 ALTER TABLE `catalogs_catalog` DISABLE KEYS */;
/*!40000 ALTER TABLE `catalogs_catalog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `catalogs_catalogpage`
--

DROP TABLE IF EXISTS `catalogs_catalogpage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `catalogs_catalogpage` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `page_number` int NOT NULL,
  `type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `layout_data` json NOT NULL,
  `catalog_id` bigint NOT NULL,
  `category_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `catalogs_catalogpage_catalog_id_fff02045_fk` (`catalog_id`),
  KEY `catalogs_catalogpage_category_id_6b53b257_fk` (`category_id`),
  CONSTRAINT `catalogs_catalogpage_catalog_id_fff02045_fk` FOREIGN KEY (`catalog_id`) REFERENCES `catalogs_catalog` (`id`),
  CONSTRAINT `catalogs_catalogpage_category_id_6b53b257_fk` FOREIGN KEY (`category_id`) REFERENCES `products_category` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `catalogs_catalogpage`
--

LOCK TABLES `catalogs_catalogpage` WRITE;
/*!40000 ALTER TABLE `catalogs_catalogpage` DISABLE KEYS */;
/*!40000 ALTER TABLE `catalogs_catalogpage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `catalogs_theme`
--

DROP TABLE IF EXISTS `catalogs_theme`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `catalogs_theme` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uuid` char(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `background_color` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `heading_color` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body_color` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `accent_color` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `font_collection` json NOT NULL,
  `preview_image` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `catalogs_theme`
--

LOCK TABLES `catalogs_theme` WRITE;
/*!40000 ALTER TABLE `catalogs_theme` DISABLE KEYS */;
/*!40000 ALTER TABLE `catalogs_theme` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_admin_log`
--

DROP TABLE IF EXISTS `django_admin_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_admin_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext COLLATE utf8mb4_unicode_ci,
  `object_repr` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action_flag` smallint unsigned NOT NULL,
  `change_message` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `content_type_id` int DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_users_user_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`),
  CONSTRAINT `django_admin_log_chk_1` CHECK ((`action_flag` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_admin_log`
--

LOCK TABLES `django_admin_log` WRITE;
/*!40000 ALTER TABLE `django_admin_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_admin_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_content_type`
--

DROP TABLE IF EXISTS `django_content_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_content_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES (9,'account','emailaddress'),(10,'account','emailconfirmation'),(1,'admin','logentry'),(2,'auth','group'),(3,'auth','permission'),(7,'authtoken','token'),(8,'authtoken','tokenproxy'),(18,'catalogs','catalog'),(19,'catalogs','catalogpage'),(20,'catalogs','theme'),(4,'contenttypes','contenttype'),(17,'media','mediaitem'),(15,'products','category'),(16,'products','product'),(5,'sessions','session'),(6,'sites','site'),(11,'socialaccount','socialaccount'),(12,'socialaccount','socialapp'),(13,'socialaccount','socialtoken'),(22,'users','businesstemplate'),(21,'users','passwordresetotp'),(23,'users','subscriptionplan'),(14,'users','user'),(24,'users','usersubscription');
/*!40000 ALTER TABLE `django_content_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_migrations`
--

DROP TABLE IF EXISTS `django_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_migrations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `app` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_migrations`
--

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
INSERT INTO `django_migrations` VALUES (1,'contenttypes','0001_initial','2026-02-16 07:04:47.444391'),(2,'contenttypes','0002_remove_content_type_name','2026-02-16 07:04:47.592098'),(3,'auth','0001_initial','2026-02-16 07:04:48.063680'),(4,'auth','0002_alter_permission_name_max_length','2026-02-16 07:04:48.171001'),(5,'auth','0003_alter_user_email_max_length','2026-02-16 07:04:48.183384'),(6,'auth','0004_alter_user_username_opts','2026-02-16 07:04:48.194404'),(7,'auth','0005_alter_user_last_login_null','2026-02-16 07:04:48.206359'),(8,'auth','0006_require_contenttypes_0002','2026-02-16 07:04:48.210956'),(9,'auth','0007_alter_validators_add_error_messages','2026-02-16 07:04:48.219715'),(10,'auth','0008_alter_user_username_max_length','2026-02-16 07:04:48.232277'),(11,'auth','0009_alter_user_last_name_max_length','2026-02-16 07:04:48.245170'),(12,'auth','0010_alter_group_name_max_length','2026-02-16 07:04:48.277613'),(13,'auth','0011_update_proxy_permissions','2026-02-16 07:04:48.300570'),(14,'auth','0012_alter_user_first_name_max_length','2026-02-16 07:04:48.323300'),(15,'users','0001_initial','2026-02-16 07:04:48.833391'),(16,'account','0001_initial','2026-02-16 07:04:49.132345'),(17,'account','0002_email_max_length','2026-02-16 07:04:49.156357'),(18,'account','0003_alter_emailaddress_create_unique_verified_email','2026-02-16 07:04:49.237705'),(19,'account','0004_alter_emailaddress_drop_unique_email','2026-02-16 07:04:49.299288'),(20,'account','0005_emailaddress_idx_upper_email','2026-02-16 07:04:49.338086'),(21,'account','0006_emailaddress_lower','2026-02-16 07:04:49.353418'),(22,'account','0007_emailaddress_idx_email','2026-02-16 07:04:49.433895'),(23,'account','0008_emailaddress_unique_primary_email_fixup','2026-02-16 07:04:49.454995'),(24,'account','0009_emailaddress_unique_primary_email','2026-02-16 07:04:49.464379'),(25,'admin','0001_initial','2026-02-16 07:04:49.728449'),(26,'admin','0002_logentry_remove_auto_add','2026-02-16 07:04:49.739851'),(27,'admin','0003_logentry_add_action_flag_choices','2026-02-16 07:04:49.753679'),(28,'authtoken','0001_initial','2026-02-16 07:04:49.929807'),(29,'authtoken','0002_auto_20160226_1747','2026-02-16 07:04:50.026869'),(30,'authtoken','0003_tokenproxy','2026-02-16 07:04:50.032193'),(31,'authtoken','0004_alter_tokenproxy_options','2026-02-16 07:04:50.047433'),(32,'products','0001_initial','2026-02-16 07:04:50.300354'),(33,'catalogs','0001_initial','2026-02-16 07:04:50.429182'),(34,'catalogs','0002_initial','2026-02-16 07:04:50.742507'),(35,'media','0001_initial','2026-02-16 07:04:50.789291'),(36,'media','0002_initial','2026-02-16 07:04:50.915834'),(37,'sessions','0001_initial','2026-02-16 07:04:51.015359'),(38,'sites','0001_initial','2026-02-16 07:04:51.052677'),(39,'sites','0002_alter_domain_unique','2026-02-16 07:04:51.106180'),(40,'socialaccount','0001_initial','2026-02-16 07:04:51.822603'),(41,'socialaccount','0002_token_max_lengths','2026-02-16 07:04:51.929174'),(42,'socialaccount','0003_extra_data_default_dict','2026-02-16 07:04:51.945311'),(43,'socialaccount','0004_app_provider_id_settings','2026-02-16 07:04:52.285505'),(44,'socialaccount','0005_socialtoken_nullable_app','2026-02-16 07:04:52.527578'),(45,'socialaccount','0006_alter_socialaccount_extra_data','2026-02-16 07:04:52.699529'),(46,'media','0003_alter_mediaitem_file','2026-02-18 05:37:43.537014'),(47,'products','0002_category_user_product_user_alter_category_thumbnail_and_more','2026-02-18 05:37:43.948361'),(48,'users','0002_user_business_id_user_business_name_passwordresetotp','2026-02-18 06:52:57.986802'),(49,'users','0003_businesstemplate','2026-02-20 05:15:29.344447'),(50,'users','0004_subscriptionplan_usersubscription','2026-02-20 09:48:11.332814'),(51,'products','0003_category_parent','2026-02-21 07:11:54.918241'),(52,'catalogs','0003_alter_catalog_id_alter_catalogpage_id_alter_theme_id','2026-02-23 12:38:48.703493'),(53,'catalogs','0004_alter_catalog_id_alter_catalogpage_id_alter_theme_id','2026-02-23 12:38:49.421282'),(54,'media','0004_alter_mediaitem_id','2026-02-23 12:38:49.549735'),(55,'media','0005_alter_mediaitem_id','2026-02-23 12:38:49.674974'),(56,'products','0004_alter_category_id_alter_product_id','2026-02-23 12:38:50.699911'),(57,'products','0005_alter_category_id_alter_product_id','2026-02-23 12:38:51.674526');
/*!40000 ALTER TABLE `django_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_session`
--

DROP TABLE IF EXISTS `django_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_session` (
  `session_key` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `session_data` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_session`
--

LOCK TABLES `django_session` WRITE;
/*!40000 ALTER TABLE `django_session` DISABLE KEYS */;
INSERT INTO `django_session` VALUES ('3avo9l4ufjpie3es4kaealt0ua3j6x7v','.eJxVjMEOgjAQRP-lZ9OUdUvBm_xIs93uBiIpiZST8d8Fw0GP82bmvUykrY5xW-UZp2xuBszllyXih5SjoHk-sCXmZSvVfjdnvdr7nqTUialOSxnO159qpHXcPUKetHfQeB_aPoOyI_QqIaASoDrKOfWpQ5-8KAZgl7HVKzjpEBo27w_NCDyi:1vt1gs:N_P-HANewJR3PSH1J13eAsxZIE8rGrtSlBwK6sdix8k','2026-03-05 10:55:26.990061'),('513556wuaufqb0xdl2qzmxfeme8bitb5','.eJxVjMEOgyAQRP-Fc2MWZFF7a3-ELLsQTA0mFU5N_73aeGiP82bmvZSnVrNvW3z6WdRVaXX5ZYH4EctR0LIcuCPmtZXafTdnvXW3PcVSZ6Y6r-V-vv5Umba8e4w1ZJNAsjY6HDVObjA9DkYkBAYnCTAFYJgwifSJUbCPGkYAE8BM6v0Br6w8Ag:1vtQ0r:srj4VcslC4l98ijYvX4Q_H_qDHt8aC-5B24n6JjMA-s','2026-03-06 12:53:41.944689'),('83vg98ifiuhmr8842pl3qyoqwu5noo4p','.eJxVjMEOgjAQRP-lZ0PWQrviTX-EzC5t2khKIuVk_HfBcNDjvJl5LzNgrWlYl_Ac8miuxprTLxPoI5S9wDTtuIHqvJbafDdHvTS3LYVSs6LmudyP158qYUmbx_kugL2NCKQ9RyG98Jklim9HFu4A8ixwrtVRyQYQK0kk20vnWpj3B9NVPO8:1vt0eK:W8Pf9EpOS2s7uL6yKlcREst-JLwUnBOP48STuaVwpWc','2026-03-05 09:48:44.112095'),('any0dqkgaqinsuz4h3xz7wa2zzarqs2b','.eJxVjMEOwiAQRP-FsyGFLQLe7I-QZVnSxoYmAifjv9uaHvQ4b2beSwTsbQ698jMsSdyEFZdfFpEeXI4C1_XAEom2Xpr8bs66yvueuLSFsC1bmc7Xn2rGOu-eZJRlzc5lNGoguFJUToNO6MEnayAbZDMQGQcDZBgtKY4RADzxOFrx_gC4ZjwY:1vt1YI:jNM5OSumDeFFKM9TIooHjuvSCuzODtIH4O27hvuu4VI','2026-03-05 10:46:34.867364'),('asgfrg2y3z7w6jy1thrws15spknr7qyk','.eJxVjM0OwiAQhN-Fs2n4EVa86YuQZbsEYkMTgZPx3W1ND3qcb2a-lwg4eg6j8TOUWVyFFqdfFpEeXPcCl2XHExKto_bpuznqNt22xLUXwl7Wej9ef6qMLW8eR5FYJUvkIEltGIxloxQbaxA9SdARIqnkPcMlOimt9oAwWzpDVCDeH8quPEc:1vt15p:zneQuRP_vA_gpN4iUBJj-qEEPvptsn2p7bIN_x6aI3Q','2026-03-05 10:17:09.079963'),('bxgzm8ewtcelciqacitl4eu44dgv09no','.eJxVjEEOgjAQRe_StWnKOKXUpXvOQKadGYsaSCisjHdXEha6_e-9_zIDbWsZtirLMLK5GDCn3y1Rfsi0A77TdJttnqd1GZPdFXvQavuZ5Xk93L-DQrV8ayFPGh003oc2Mmh2hF4lBFQCVEfMKaYOffKiGCA7xlbP4KRDaLJ5fwD1Ajgu:1vt1BN:SSqbNW6ZvHPYAt3xS2WoU7cYLEE-vro1bFHCiyacaJ8','2026-03-05 10:22:53.608043'),('d018orqz5uh6pr5isuacz8a8pr527vwg','.eJxVjMEOwiAQRP-FsyFlC6V40x9pFnYJxIYmAifjv9uaHvQ4b2beSyzYW1p65eeSSVwFiMsv8xgeXI4C1_XAEkPYemnyuznrKm974tJywJa3cj9ff6qENe0e9hSBTLBWeRsYXJw0jCbqqJShYVQ0OxyJZ-sYjNbToKKBCcir2fmoxfsDx3k8Iw:1vtK1c:22kn2rrvPK4VTzsh1LfE0tF3rUK10x2Dc4O3OvVBnxM','2026-03-06 06:30:04.113830'),('fdkihesungh4u8o0y9gs7jzho57lje86','.eJxVjMsOwiAQRf-FtWl4TtGd_REyTGkgNjQRWBn_XTBd6Ormvs6LOWw1ulbC06WV3Zhkl9_MIz1CHgXu-4gnJDpartN3c9ZluncXck2ENR15OV9_qIglds5sr16B0nIOZJT0ZIQPGrTfLAdpuFj1pqwwqrNhSJ9xLYCjBwIp2PsDmbs7aw:1vt0fK:GxRwNejKa8qUWpPzABrgp_6Q_ItAW5a7I8aHdEPoi7M','2026-03-05 09:49:46.534284'),('g5yzust9an8bh9ipwun2vri1wtj65s93','.eJxVjMEOgjAQRP-lZ9OUdUvBm_xIs93uBiIpiZST8d8Fw0GP82bmvUykrY5xW-UZp2xuBszllyXih5SjoHk-sCXmZSvVfjdnvdr7nqTUialOSxnO159qpHXcPUKetHfQeB_aPoOyI_QqIaASoDrKOfWpQ5-8KAZgl7HVKzjpEBo27w_NCDyi:1vt1nP:kfh65pDZlx968-9CAY2s3z_NGfm0UrFIXBiIv0f5Ovc','2026-03-05 11:02:11.218114'),('iehq9qacwdkdsgfjuekrkl1p36q4fvim','.eJxVjMEOgjAQRP-lZ9OUdUvBm_xIs93uBiIpiZST8d8Fw0GP82bmvUykrY5xW-UZp2xuBszllyXih5SjoHk-sCXmZSvVfjdnvdr7nqTUialOSxnO159qpHXcPUKetHfQeB_aPoOyI_QqIaASoDrKOfWpQ5-8KAZgl7HVKzjpEBo27w_NCDyi:1vt1hE:JZVMIwIz3hOw83yhVXRQBuEnZj2Li75Q2Fwjn5V4y2A','2026-03-05 10:55:48.847964'),('ifetzogch7cw9e8iobfn7oo2npv9hjwq','.eJxVjU0OwiAQhe_C2jSUoYVxZy_SDAMEYkMTgZXx7lrThS7f9_6eYqXe0tpreKzZi6tAcflljvgeymHQth14IOa9lzZ8M6ddh9tHhdIyU8t7Wc7W31Simo4DQ1Eq7SdA7yhaBDYORiuVNxj9iFbPE8xkFWiIiKMk1g5nE6RnCyReb66UO9Q:1vtidk:oXliK5d7bt8OoPuNkKMfEpUF9cC6Rpq06bcXM50nuQE','2026-03-07 08:47:04.965975'),('j7atmym4bcu0l99l0arwfhns268sb027','.eJxVjMEOwiAQRP-Fs2koLAW86Y-Qhd0GYkMToSfjv9uaHvQ0mXkz8xIBt57D1vgZComrmMTlN4uYHlwPgMtyxAOmtG61D9_Oidtw2x3XXhL2stb7ufq7ytjy_jNrhZO3k4zKjTLC7CmCdKOx4K0GdI6818gQJZFJkoCNBoWwq2WexfsDnkY79Q:1vseW5:zKr2Um-CboO9_b04nF8w72VQBsM6oqpjniGnfvVKvG0','2026-03-04 10:10:45.017247'),('l4gums0q3k541ii7rcbd59svx5xfva2h','.eJxVjMEOgyAQRP-Fc2MWZFF7a3-ELLsQTA0mFU5N_73aeGiP82bmvZSnVrNvW3z6WdRVaXX5ZYH4EctR0LIcuCPmtZXafTdnvXW3PcVSZ6Y6r-V-vv5Umba8e4w1ZJNAsjY6HDVObjA9DkYkBAYnCTAFYJgwifSJUbCPGkYAE8BM6v0Br6w8Ag:1vthUg:PEtIUmzbl0tnhyYgUmkMMsS0MhqcqySFykQwOsjWj3Q','2026-03-07 07:33:38.759135'),('qiefaolieo5xxibtujwgyo7db8d4710w','.eJxVjM0OwiAQhN-Fs2m2_NjFm32RZlkgEBuaCJyM725retDjfDPzvcRCvaWl1_Bcshc3IcXllzniRyhHQet64IGYt17a8N2cdR3uewqlZaaWtzKfrz9Vopp2Dwc9Kg1jjIoNEqJnb3nyBlQ0UoE0E2g_gXQcA4K-OoveotTasQGH4v0Bs4E76A:1vt0du:aiQ84v4d7_1xyO3NXxGblgYQoO7MeeUJCKJa1VkEh7s','2026-03-05 09:48:18.826099'),('tnnu7j30swt5eo8m7gfy006hx7w3gok9','.eJxVjMEOgjAQRP-lZ9OUdUvBm_xIs93uBiIpiZST8d8Fw0GP82bmvUykrY5xW-UZp2xuBszllyXih5SjoHk-sCXmZSvVfjdnvdr7nqTUialOSxnO159qpHXcPUKetHfQeB_aPoOyI_QqIaASoDrKOfWpQ5-8KAZgl7HVKzjpEBo27w_NCDyi:1vt1ht:q3UDLNAxJ1CKPwPPp3RYeg5ipkZQz6hq3I8bVXGpl-Y','2026-03-05 10:56:29.783768'),('vg6scdkin09p405tvjoa6lfv6hmphddc','.eJxVjMEOgjAQRP-lZ9OUdUvBm_xIs93uBiIpiZST8d8Fw0GP82bmvUykrY5xW-UZp2xuBszllyXih5SjoHk-sCXmZSvVfjdnvdr7nqTUialOSxnO159qpHXcPUKetHfQeB_aPoOyI_QqIaASoDrKOfWpQ5-8KAZgl7HVKzjpEBo27w_NCDyi:1vt1nC:ARwTjuHgeXoy4qKd_WKAft2lbw2ELfKLI0hbH-BUdgg','2026-03-05 11:01:58.472041'),('xa1maljdq9n1w9an9t1jcvtlgdngjc89','.eJxVjMEOgjAQRP-lZ9OUdUvBm_xIs93uBiIpiZST8d8Fw0GP82bmvUykrY5xW-UZp2xuBszllyXih5SjoHk-sCXmZSvVfjdnvdr7nqTUialOSxnO159qpHXcPUKetHfQeB_aPoOyI_QqIaASoDrKOfWpQ5-8KAZgl7HVKzjpEBo27w_NCDyi:1vt1dn:1KeYFomgE6y0z575EbKJk3oArDd1jKzGUHb5Fnvel0s','2026-03-05 10:52:15.787529'),('zoxny5mxq1ne92jwfqednafzfos21e4h','.eJxVjMEOgzAMQ_-l56mCJIWw2_YjKIQg0FCR1nKa9u8rE4ftZNnP9sv1sue535M9-2V0V9e5y282iD4sHkDW9Yi9qG57zP7bOXHyt-Is5kUlL1u8n6u_q1nSXH4UBp504gohkCAhtSINYFMDcBGpqpHRhKlFsCZMhXdoHIyotlHd-wOddTuG:1vukir:6Plf9ZxbvwDYKtGlSDrJOixeXmN4e1hjDaXvR7ueT3E','2026-03-10 05:12:37.970819'),('zy2hdjl27piibq09ukpndhey01ihzmx6','.eJxVjMEOwiAQRP-FsyFYFla92R8hy7INxIYmFk7Gf7c1Pehx3sy8lwrUWw59lWcoSd3UoE6_LBI_pO4FzfOONTEvvTb93Rz1qu9bktoKUytLHY_XnyrTmjfPmY0hQUzC1hq6OAYS5-012jRZsGLQATgPiFNy3sQohgGBkyQeCNX7A70CPJo:1vt17R:7hEGQqJTsvXD_dgQM9jJaXieEPAPjVgDHJonKNySLOM','2026-03-05 10:18:49.845895');
/*!40000 ALTER TABLE `django_session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_site`
--

DROP TABLE IF EXISTS `django_site`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_site` (
  `id` int NOT NULL AUTO_INCREMENT,
  `domain` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_site_domain_a2e37b91_uniq` (`domain`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_site`
--

LOCK TABLES `django_site` WRITE;
/*!40000 ALTER TABLE `django_site` DISABLE KEYS */;
INSERT INTO `django_site` VALUES (1,'example.com','example.com');
/*!40000 ALTER TABLE `django_site` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `media_mediaitem`
--

DROP TABLE IF EXISTS `media_mediaitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `media_mediaitem` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uuid` char(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `width` int DEFAULT NULL,
  `height` int DEFAULT NULL,
  `size_bytes` int DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `media_mediaitem_user_id_9071276c_fk_users_user_id` (`user_id`),
  CONSTRAINT `media_mediaitem_user_id_9071276c_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media_mediaitem`
--

LOCK TABLES `media_mediaitem` WRITE;
/*!40000 ALTER TABLE `media_mediaitem` DISABLE KEYS */;
/*!40000 ALTER TABLE `media_mediaitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products_category`
--

DROP TABLE IF EXISTS `products_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products_category` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uuid` char(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `rank` int NOT NULL,
  `color` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL,
  `thumbnail` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `user_id` bigint DEFAULT NULL,
  `parent_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `products_category_user_id_18da710e_fk_users_user_id` (`user_id`),
  KEY `products_category_parent_id_3388f6c9_fk` (`parent_id`),
  CONSTRAINT `products_category_parent_id_3388f6c9_fk` FOREIGN KEY (`parent_id`) REFERENCES `products_category` (`id`),
  CONSTRAINT `products_category_user_id_18da710e_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products_category`
--

LOCK TABLES `products_category` WRITE;
/*!40000 ALTER TABLE `products_category` DISABLE KEYS */;
INSERT INTO `products_category` VALUES (1,'3c368905459a44f7bbc243804938418e','Test Category 123','Test Desc',0,'#000000','','2026-02-19 13:15:18.331201',1,NULL);
/*!40000 ALTER TABLE `products_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products_product`
--

DROP TABLE IF EXISTS `products_product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products_product` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uuid` char(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `image` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `category_id` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `products_product_sku_3c51a516` (`sku`),
  KEY `products_product_user_id_e04f062e_fk_users_user_id` (`user_id`),
  KEY `products_product_category_id_9b594869_fk` (`category_id`),
  CONSTRAINT `products_product_category_id_9b594869_fk` FOREIGN KEY (`category_id`) REFERENCES `products_category` (`id`),
  CONSTRAINT `products_product_user_id_e04f062e_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products_product`
--

LOCK TABLES `products_product` WRITE;
/*!40000 ALTER TABLE `products_product` DISABLE KEYS */;
/*!40000 ALTER TABLE `products_product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `socialaccount_socialaccount`
--

DROP TABLE IF EXISTS `socialaccount_socialaccount`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `socialaccount_socialaccount` (
  `id` int NOT NULL AUTO_INCREMENT,
  `provider` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `uid` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_login` datetime(6) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  `extra_data` json NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `socialaccount_socialaccount_provider_uid_fc810c6e_uniq` (`provider`,`uid`),
  KEY `socialaccount_socialaccount_user_id_8146e70c_fk_users_user_id` (`user_id`),
  CONSTRAINT `socialaccount_socialaccount_user_id_8146e70c_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `socialaccount_socialaccount`
--

LOCK TABLES `socialaccount_socialaccount` WRITE;
/*!40000 ALTER TABLE `socialaccount_socialaccount` DISABLE KEYS */;
/*!40000 ALTER TABLE `socialaccount_socialaccount` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `socialaccount_socialapp`
--

DROP TABLE IF EXISTS `socialaccount_socialapp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `socialaccount_socialapp` (
  `id` int NOT NULL AUTO_INCREMENT,
  `provider` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `secret` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `key` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `provider_id` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `settings` json NOT NULL DEFAULT (_utf8mb4'{}'),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `socialaccount_socialapp`
--

LOCK TABLES `socialaccount_socialapp` WRITE;
/*!40000 ALTER TABLE `socialaccount_socialapp` DISABLE KEYS */;
/*!40000 ALTER TABLE `socialaccount_socialapp` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `socialaccount_socialapp_sites`
--

DROP TABLE IF EXISTS `socialaccount_socialapp_sites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `socialaccount_socialapp_sites` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `socialapp_id` int NOT NULL,
  `site_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `socialaccount_socialapp_sites_socialapp_id_site_id_71a9a768_uniq` (`socialapp_id`,`site_id`),
  KEY `socialaccount_socialapp_sites_site_id_2579dee5_fk_django_site_id` (`site_id`),
  CONSTRAINT `socialaccount_social_socialapp_id_97fb6e7d_fk_socialacc` FOREIGN KEY (`socialapp_id`) REFERENCES `socialaccount_socialapp` (`id`),
  CONSTRAINT `socialaccount_socialapp_sites_site_id_2579dee5_fk_django_site_id` FOREIGN KEY (`site_id`) REFERENCES `django_site` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `socialaccount_socialapp_sites`
--

LOCK TABLES `socialaccount_socialapp_sites` WRITE;
/*!40000 ALTER TABLE `socialaccount_socialapp_sites` DISABLE KEYS */;
/*!40000 ALTER TABLE `socialaccount_socialapp_sites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `socialaccount_socialtoken`
--

DROP TABLE IF EXISTS `socialaccount_socialtoken`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `socialaccount_socialtoken` (
  `id` int NOT NULL AUTO_INCREMENT,
  `token` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `token_secret` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime(6) DEFAULT NULL,
  `account_id` int NOT NULL,
  `app_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `socialaccount_socialtoken_app_id_account_id_fca4e0ac_uniq` (`app_id`,`account_id`),
  KEY `socialaccount_social_account_id_951f210e_fk_socialacc` (`account_id`),
  CONSTRAINT `socialaccount_social_account_id_951f210e_fk_socialacc` FOREIGN KEY (`account_id`) REFERENCES `socialaccount_socialaccount` (`id`),
  CONSTRAINT `socialaccount_social_app_id_636a42d7_fk_socialacc` FOREIGN KEY (`app_id`) REFERENCES `socialaccount_socialapp` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `socialaccount_socialtoken`
--

LOCK TABLES `socialaccount_socialtoken` WRITE;
/*!40000 ALTER TABLE `socialaccount_socialtoken` DISABLE KEYS */;
/*!40000 ALTER TABLE `socialaccount_socialtoken` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_businesstemplate`
--

DROP TABLE IF EXISTS `users_businesstemplate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_businesstemplate` (
  `id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `schema` json NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_businesstemplate`
--

LOCK TABLES `users_businesstemplate` WRITE;
/*!40000 ALTER TABLE `users_businesstemplate` DISABLE KEYS */;
INSERT INTO `users_businesstemplate` VALUES ('biz-1771650949041','Electronics','','[{\"id\": \"field-1771650732514\", \"type\": \"text\", \"label\": \"Product Name\", \"section\": \"basic\", \"required\": false}, {\"id\": \"field-1771650747320\", \"type\": \"text\", \"label\": \"Brand\", \"section\": \"basic\", \"required\": false}, {\"id\": \"field-1771650762182\", \"type\": \"number\", \"label\": \"Model Number\", \"section\": \"basic\", \"required\": false}, {\"id\": \"field-1771650824154\", \"type\": \"text\", \"label\": \"Product Video URL\", \"section\": \"basic\", \"required\": false}, {\"id\": \"field-1771650898373\", \"type\": \"image\", \"label\": \"Gallery Images (Multiple)\", \"section\": \"basic\", \"required\": false}, {\"id\": \"field-1771650916634\", \"type\": \"image\", \"label\": \"Main Product Image\", \"section\": \"basic\", \"required\": false}, {\"id\": \"field-1771655782024\", \"type\": \"number\", \"label\": \"Weight\", \"section\": \"basic\", \"required\": false}]',1,'2026-02-21 05:15:49.148763','2026-02-21 06:36:40.690586');
/*!40000 ALTER TABLE `users_businesstemplate` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_passwordresetotp`
--

DROP TABLE IF EXISTS `users_passwordresetotp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_passwordresetotp` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `otp` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `expires_at` datetime(6) NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `users_passwordresetotp_user_id_4009c96d_fk_users_user_id` (`user_id`),
  CONSTRAINT `users_passwordresetotp_user_id_4009c96d_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_passwordresetotp`
--

LOCK TABLES `users_passwordresetotp` WRITE;
/*!40000 ALTER TABLE `users_passwordresetotp` DISABLE KEYS */;
/*!40000 ALTER TABLE `users_passwordresetotp` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_subscriptionplan`
--

DROP TABLE IF EXISTS `users_subscriptionplan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_subscriptionplan` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `currency` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL,
  `features` json NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_subscriptionplan`
--

LOCK TABLES `users_subscriptionplan` WRITE;
/*!40000 ALTER TABLE `users_subscriptionplan` DISABLE KEYS */;
INSERT INTO `users_subscriptionplan` VALUES (4,'Starter Plan (Basic)','starter',499.00,'INR','{\"ai_enabled\": false, \"max_catalogs\": 5, \"max_products\": 100, \"max_categories\": 5, \"max_storage_mb\": 100}',1,'2026-02-20 09:52:25.047191'),(5,'Growth Plan (Most Popular)','growth',999.00,'INR','{\"ai_enabled\": true, \"max_catalogs\": 10, \"max_products\": 500, \"max_categories\": 20, \"max_storage_mb\": 1024}',1,'2026-02-20 09:52:25.051994'),(6,'Pro Plan (Advanced Business)','pro',1999.00,'INR','{\"ai_enabled\": true, \"max_catalogs\": 50, \"max_products\": 10000, \"max_categories\": -1, \"max_storage_mb\": 10240}',1,'2026-02-20 09:52:25.056360');
/*!40000 ALTER TABLE `users_subscriptionplan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_user`
--

DROP TABLE IF EXISTS `users_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `password` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(254) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_verified` tinyint(1) NOT NULL,
  `business_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `business_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_user`
--

LOCK TABLES `users_user` WRITE;
/*!40000 ALTER TABLE `users_user` DISABLE KEYS */;
INSERT INTO `users_user` VALUES (1,'pbkdf2_sha256$1200000$4ucX3m1Eom1p7lY7GkIlYC$eUS1o0HJ5Mj1dzNE96FVzQ/HSB+qLuHE5AKXY2bch7M=','2026-02-21 07:33:38.677544',1,'bgtdeveloper','','','blueglobalcloud@gmail.com',1,1,'2026-02-16 10:06:58.043500','','',0,'updated-biz-id-123','Updated Business Name'),(8,'pbkdf2_sha256$1200000$8L4iVvAKVh8XKXfeclNnfG$zkvo5a0RXLkrl5h/D7CGLv/Vhb5pSPr0Fp0z2c/XR0A=','2026-02-20 05:25:17.214891',0,'khushi12@gmail.com','','','khushi12@gmail.com',0,1,'2026-02-20 05:24:30.265655','khushi','',0,NULL,'abc'),(9,'pbkdf2_sha256$1000000$zHv7KCLi7QfpyWPg0kyhx6$Vd9HLTi5ZM8lI9+/SM+FOuv+qYHmQtZXG3AJXKpImZ8=','2026-02-24 05:12:37.833295',0,'bhavanbadhe@gmail.com','','','bhavanbadhe@gmail.com',0,1,'2026-02-20 07:16:00.981650','Bhavan Badhe','',0,'biz-1771650949041','Vtac');
/*!40000 ALTER TABLE `users_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_user_groups`
--

DROP TABLE IF EXISTS `users_user_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_user_groups` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `group_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_user_groups_user_id_group_id_b88eab82_uniq` (`user_id`,`group_id`),
  KEY `users_user_groups_group_id_9afc8d0e_fk_auth_group_id` (`group_id`),
  CONSTRAINT `users_user_groups_group_id_9afc8d0e_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  CONSTRAINT `users_user_groups_user_id_5f6f5a90_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_user_groups`
--

LOCK TABLES `users_user_groups` WRITE;
/*!40000 ALTER TABLE `users_user_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `users_user_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_user_user_permissions`
--

DROP TABLE IF EXISTS `users_user_user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_user_user_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_user_user_permissions_user_id_permission_id_43338c45_uniq` (`user_id`,`permission_id`),
  KEY `users_user_user_perm_permission_id_0b93982e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `users_user_user_perm_permission_id_0b93982e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `users_user_user_permissions_user_id_20aca447_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_user_user_permissions`
--

LOCK TABLES `users_user_user_permissions` WRITE;
/*!40000 ALTER TABLE `users_user_user_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `users_user_user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_usersubscription`
--

DROP TABLE IF EXISTS `users_usersubscription`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users_usersubscription` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `start_date` datetime(6) NOT NULL,
  `end_date` datetime(6) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  `plan_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `users_usersubscripti_plan_id_eec03b7b_fk_users_sub` (`plan_id`),
  CONSTRAINT `users_usersubscripti_plan_id_eec03b7b_fk_users_sub` FOREIGN KEY (`plan_id`) REFERENCES `users_subscriptionplan` (`id`),
  CONSTRAINT `users_usersubscription_user_id_6d079829_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_usersubscription`
--

LOCK TABLES `users_usersubscription` WRITE;
/*!40000 ALTER TABLE `users_usersubscription` DISABLE KEYS */;
INSERT INTO `users_usersubscription` VALUES (1,'2026-02-20 12:25:54.895553','2026-03-22 12:25:54.908602',1,5,9);
/*!40000 ALTER TABLE `users_usersubscription` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-24 13:22:53
