<?php
/**
 * Audit log helper.
 * --------------------------------------------------------
 * Records every admin write action with attribution.
 *
 * Uses the same shape as the frontend audit log (src/admin/lib/audit-log.js)
 * so swapping the frontend's localStorage layer for a fetch becomes a
 * one-liner: GET /api/admin/audit-log.php returns this same data.
 *
 * Callers should pass the current admin (from require_admin()) so we
 * always have a user to attribute, plus the action verb and target.
 */

declare(strict_types=1);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/config.php';

/**
 * Log an admin action.
 *
 * @param array  $admin    Result of require_admin() — needs id, email, name
 * @param string $action   Verb, e.g. 'post.publish' (see frontend for the set)
 * @param array  $target   ['type' => 'post', 'id' => '123', 'label' => 'My post']
 * @param array  $meta     Optional bag of extras (audience, recipient_count, etc.)
 */
function audit_log(array $admin, string $action, array $target, array $meta = []): void {
    db()->prepare(
        'INSERT INTO audit_log
            (user_id, user_email, user_name, action,
             target_type, target_id, target_label,
             meta, ip_hash, created_at)
         VALUES
            (:uid, :email, :name, :action,
             :ttype, :tid, :tlabel,
             :meta, :ip, NOW())'
    )->execute([
        ':uid'    => $admin['id'] ?? null,
        ':email'  => $admin['email'] ?? null,
        ':name'   => $admin['name']  ?? null,
        ':action' => $action,
        ':ttype'  => $target['type'] ?? 'unknown',
        ':tid'    => isset($target['id']) ? (string)$target['id'] : null,
        ':tlabel' => $target['label'] ?? null,
        ':meta'   => $meta ? json_encode($meta) : null,
        ':ip'     => hash_ip(client_ip()),
    ]);
}
