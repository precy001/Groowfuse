<?php
/**
 * Read the audit log.
 *
 * GET /api/admin/audit-log.php
 *   ?limit=N             default 20, max 100
 *   ?targetType=post     filter by type
 *   ?targetId=<id>       filter by id (requires targetType)
 *
 * Returns entries newest-first in the same shape the frontend's
 * src/admin/lib/audit-log.js exposes, so swap-out is a one-liner.
 */

declare(strict_types=1);

require_once __DIR__ . '/../lib/response.php';
require_once __DIR__ . '/../lib/db.php';
require_once __DIR__ . '/../lib/auth.php';

cors_or_die();
require_method('GET');
require_admin();

$limit      = max(1, min(100, (int)($_GET['limit'] ?? 20)));
$targetType = isset($_GET['targetType'])
            ? preg_replace('/[^a-z_]/i', '', $_GET['targetType']) : null;
$targetId   = isset($_GET['targetId']) ? (string)$_GET['targetId'] : null;

$where  = [];
$params = [];

if ($targetType) {
    $where[]              = 'target_type = :tt';
    $params[':tt']        = $targetType;
}
if ($targetType && $targetId !== null && $targetId !== '') {
    $where[]              = 'target_id = :ti';
    $params[':ti']        = $targetId;
}

$sql = 'SELECT id, user_id, user_email, user_name, action,
               target_type, target_id, target_label, meta, created_at
          FROM audit_log';
if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
$sql .= " ORDER BY created_at DESC LIMIT {$limit}";

$stmt = db()->prepare($sql);
$stmt->execute($params);

$rows = array_map(function ($r) {
    return [
        'id'     => 'act_' . $r['id'],
        'at'     => $r['created_at'],
        'user'   => [
            'email' => $r['user_email'],
            'name'  => $r['user_name'],
        ],
        'action' => $r['action'],
        'target' => [
            'type'  => $r['target_type'],
            'id'    => $r['target_id'],
            'label' => $r['target_label'],
        ],
        'meta'   => $r['meta'] ? json_decode($r['meta'], true) : null,
    ];
}, $stmt->fetchAll());

ok(['actions' => $rows]);
