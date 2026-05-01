-- ════════════════════════════════════════════════════════════════════
-- GroowFuse — initial schema
-- ════════════════════════════════════════════════════════════════════
-- Apply with:
--   mysql -u <user> -p groowfuse < migrations/001_init.sql
--
-- Or from XAMPP's phpMyAdmin: select the database, Import tab, choose this file.
--
-- All tables use InnoDB + utf8mb4. We never store passwords in plain text;
-- we hash IPs (privacy + GDPR); session tokens are stored as sha256 of
-- the cookie value, never the cookie itself.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ─── Admin users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email           VARCHAR(190) NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  name            VARCHAR(120) NOT NULL DEFAULT 'Admin',
  role            VARCHAR(40)  NOT NULL DEFAULT 'admin',
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at   DATETIME     NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_admin_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Sessions (server-side, opaque token) ───────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  token_hash   CHAR(64)        NOT NULL,
  user_id      INT UNSIGNED    NOT NULL,
  created_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at   DATETIME        NOT NULL,
  ip_hash      CHAR(64)        NULL,
  user_agent   VARCHAR(500)    NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_token_hash (token_hash),
  KEY idx_session_user (user_id),
  KEY idx_session_expires (expires_at),
  CONSTRAINT fk_session_user
    FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Categories ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id     INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug   VARCHAR(60)  NOT NULL,
  label  VARCHAR(120) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_category_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Tags + posts/tags junction ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS tags (
  id     INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug   VARCHAR(60)  NOT NULL,
  label  VARCHAR(120) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_tag_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Posts ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug            VARCHAR(160) NOT NULL,
  title           VARCHAR(255) NOT NULL,
  excerpt         VARCHAR(500) NOT NULL DEFAULT '',
  body            MEDIUMTEXT   NOT NULL,            -- HTML from the rich text editor
  category_id     INT UNSIGNED NULL,
  author_id       INT UNSIGNED NULL,                -- which admin authored
  author_name     VARCHAR(120) NOT NULL DEFAULT 'GroowFuse Editorial',
  author_role     VARCHAR(120) NOT NULL DEFAULT 'Practice Team',
  cover_image     TEXT         NULL,                -- URL or data URI
  cover_alt       VARCHAR(255) NULL,
  status          ENUM('draft','published') NOT NULL DEFAULT 'draft',
  read_minutes    SMALLINT UNSIGNED NOT NULL DEFAULT 5,
  published_at    DATETIME     NULL,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
                                       ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_post_slug (slug),
  KEY idx_post_status (status),
  KEY idx_post_published_at (published_at),
  KEY idx_post_category (category_id),
  CONSTRAINT fk_post_category
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_post_author
    FOREIGN KEY (author_id) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS post_tags (
  post_id INT UNSIGNED NOT NULL,
  tag_id  INT UNSIGNED NOT NULL,
  PRIMARY KEY (post_id, tag_id),
  KEY idx_pt_tag (tag_id),
  CONSTRAINT fk_pt_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_pt_tag  FOREIGN KEY (tag_id)  REFERENCES tags(id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Contact-form messages ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id                  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  contact_name        VARCHAR(160) NOT NULL,
  contact_email       VARCHAR(190) NOT NULL,
  company_name        VARCHAR(190) NOT NULL DEFAULT '',
  company_email       VARCHAR(190) NOT NULL DEFAULT '',
  country             VARCHAR(120) NOT NULL DEFAULT '',
  sector              VARCHAR(120) NOT NULL DEFAULT '',
  service_type        VARCHAR(120) NOT NULL DEFAULT '',
  service_type_other  VARCHAR(255) NOT NULL DEFAULT '',
  message             TEXT         NOT NULL,
  status              ENUM('unread','read','archived') NOT NULL DEFAULT 'unread',
  received_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_hash             CHAR(64)     NULL,
  user_agent          VARCHAR(500) NULL,
  PRIMARY KEY (id),
  KEY idx_msg_status (status),
  KEY idx_msg_received (received_at),
  KEY idx_msg_email (contact_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Newsletter subscribers ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscribers (
  id                  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email               VARCHAR(190) NOT NULL,
  status              ENUM('pending','confirmed','unsubscribed') NOT NULL DEFAULT 'pending',
  source              VARCHAR(60)  NOT NULL DEFAULT 'unknown',
  confirm_token       CHAR(64)     NULL,
  unsubscribe_token   CHAR(64)     NULL,
  subscribed_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  confirmed_at        DATETIME     NULL,
  unsubscribed_at     DATETIME     NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_sub_email (email),
  KEY idx_sub_status (status),
  KEY idx_sub_confirm_token (confirm_token),
  KEY idx_sub_unsub_token (unsubscribe_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Newsletters (sent emails) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS newsletters (
  id                INT UNSIGNED NOT NULL AUTO_INCREMENT,
  subject           VARCHAR(255) NOT NULL,
  preheader         VARCHAR(255) NOT NULL DEFAULT '',
  body              MEDIUMTEXT   NOT NULL,
  audience          ENUM('confirmed','all') NOT NULL DEFAULT 'confirmed',
  sent_by_user_id   INT UNSIGNED NULL,
  sent_by_email     VARCHAR(190) NULL,
  recipient_count   INT UNSIGNED NOT NULL DEFAULT 0,
  sent_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_newsletter_sent_at (sent_at),
  CONSTRAINT fk_newsletter_user
    FOREIGN KEY (sent_by_user_id) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Audit log ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id       INT UNSIGNED NULL,
  user_email    VARCHAR(190) NULL,
  user_name     VARCHAR(120) NULL,
  action        VARCHAR(60)  NOT NULL,
  target_type   VARCHAR(60)  NOT NULL,
  target_id     VARCHAR(190) NULL,
  target_label  VARCHAR(255) NULL,
  meta          JSON         NULL,
  ip_hash       CHAR(64)     NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_audit_created (created_at),
  KEY idx_audit_action (action),
  KEY idx_audit_target (target_type, target_id),
  CONSTRAINT fk_audit_user
    FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
