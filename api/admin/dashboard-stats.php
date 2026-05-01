<?php
/**
 * Dashboard stat counters.
 *
 * GET /api/admin/dashboard-stats.php
 *
 * Returns the same shape as the frontend's mock-data dashboardStats(),
 * so the dashboard component swaps to fetch with no other changes.
 */

declare(strict_types=1);

require_once __DIR__ . '/../lib/response.php';
require_once __DIR__ . '/../lib/db.php';
require_once __DIR__ . '/../lib/auth.php';

cors_or_die();
require_method('GET');
require_admin();

$stats = [];

$stats['posts']  = (int)db()->query('SELECT COUNT(*) AS n FROM posts WHERE status = "published"')->fetch()['n'];
$stats['drafts'] = (int)db()->query('SELECT COUNT(*) AS n FROM posts WHERE status = "draft"')->fetch()['n'];

$msgCounts = db()->query(
    'SELECT status, COUNT(*) AS n FROM messages GROUP BY status'
)->fetchAll();
$stats['messages']       = 0;
$stats['unreadMessages'] = 0;
foreach ($msgCounts as $c) {
    $stats['messages'] += (int)$c['n'];
    if ($c['status'] === 'unread') {
        $stats['unreadMessages'] = (int)$c['n'];
    }
}

$subCounts = db()->query(
    'SELECT status, COUNT(*) AS n FROM subscribers GROUP BY status'
)->fetchAll();
$stats['subscribers']  = 0;
$stats['pendingSubs']  = 0;
foreach ($subCounts as $c) {
    if ($c['status'] === 'confirmed') $stats['subscribers'] = (int)$c['n'];
    if ($c['status'] === 'pending')   $stats['pendingSubs']  = (int)$c['n'];
}

ok($stats);
