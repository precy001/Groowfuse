-- ════════════════════════════════════════════════════════════════════
-- GroowFuse — migration 003
-- ════════════════════════════════════════════════════════════════════
-- Adds:
--   1. Role enforcement on admin_users (owner | admin)
--   2. admin@groowfuse.com as the ultimate owner
--   3. page_views table for self-hosted analytics
--
-- Apply with:
--   mysql -u <user> -p groowfuse < migrations/003_roles_and_analytics.sql
--
-- Idempotent — safe to re-run.

SET NAMES utf8mb4;

-- ─── Roles ──────────────────────────────────────────────────────────
-- Switch the role column to a strict ENUM so invalid values can't slip in.
-- Existing rows with role='admin' (the old default) stay valid.
ALTER TABLE admin_users
  MODIFY COLUMN role ENUM('owner', 'admin') NOT NULL DEFAULT 'admin';

-- ─── Seed the ultimate admin ────────────────────────────────────────
-- Password: admin101 (CHANGE IMMEDIATELY ON FIRST LOGIN)
-- Hash generated with: php -r "echo password_hash('admin101', PASSWORD_BCRYPT);"
INSERT INTO admin_users (email, password_hash, name, role)
VALUES (
  'admin@groowfuse.com',
  '$2y$10$QvNu3laSEbiDYUXbtE0CZeftMYgmEq4nlg8bMyeN1b5/2LZRvacia',
  'Site Owner',
  'owner'
)
ON DUPLICATE KEY UPDATE
  -- If the row already exists, just promote it to owner (don't overwrite the password)
  role = 'owner';

-- ─── Page-view analytics ────────────────────────────────────────────
-- One row per page view. Self-hosted, cookie-free, no PII.
--
-- visitor_hash:
--   HMAC-SHA256 of (ip + user_agent + APP_SECRET + YYYY-MM-DD).
--   Rotates daily so the same visitor counts as one unique per day,
--   but the hash is unrecoverable to identify the actual person.
--
-- The path is stored as it came in (always starts with /), the referrer
-- is the full URL the visitor arrived from (or empty for direct visits).
CREATE TABLE IF NOT EXISTS page_views (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  path          VARCHAR(500)    NOT NULL,
  referrer      VARCHAR(500)    NOT NULL DEFAULT '',
  visitor_hash  CHAR(64)        NOT NULL,
  user_agent    VARCHAR(500)    NULL,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_pv_created (created_at),
  KEY idx_pv_path    (path),
  KEY idx_pv_visitor (visitor_hash, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
