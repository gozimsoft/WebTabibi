-- ============================================================
-- add_verifications.sql
-- Run this once to add OTP verification support:
--   mysql -u root -p uyyuppcc_DBTabibi < add_verifications.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS `verifications` (
  `id`         char(36)     NOT NULL,
  `user_id`    char(36)     DEFAULT NULL,
  `type`       varchar(10)  NOT NULL comment 'email or phone',
  `target`     varchar(100) NOT NULL comment 'the email or phone being verified',
  `code`       varchar(10)  NOT NULL,
  `expires_at` datetime     NOT NULL,
  `verified`   tinyint(1)   DEFAULT 0,
  `created_at` datetime     DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_type_idx` (`user_id`, `type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
