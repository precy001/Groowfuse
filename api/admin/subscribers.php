<?php
/**
 * Admin newsletter subscribers.
 *
 * GET    /api/admin/subscribers.php          list all
 *          ?status=confirmed|pending|unsubscribed
 * DELETE /api/admin/subscribers.php?id=<id>  remove
 */

declare(strict_types=1);

require_once __DIR__ . '/../lib/response.php';
require_once __DIR__ . '/../lib/db.php';
require_once __DIR__ . '/../lib/auth.php';
require_once __DIR__ . '/../lib/audit.php';

cors_or_die();
$admin = require_admin();

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$id     = isset($_GET['id']) ? (int)$_GET['id'] : 0;

switch ($method) {
    case 'GET':    handle_list();                         break;
    case 'DELETE': $id ? handle_delete($admin, $id) : fail('Missing id.', 400); break;
    default:       fail('Method not allowed.', 405);
}

function handle_list(): never {
    $filter = strtolower(trim((string)($_GET['status'] ?? '')));
    $sql    = 'SELECT id, email, status, source, subscribed_at, confirmed_at, unsubscribed_at
                 FROM subscribers';
    $params = [];

    if (in_array($filter, ['confirmed', 'pending', 'unsubscribed'], true)) {
        $sql            .= ' WHERE status = :s';
        $params[':s']    = $filter;
    }

    $sql .= ' ORDER BY subscribed_at DESC LIMIT 1000';

    $stmt = db()->prepare($sql);
    $stmt->execute($params);

    $rows = array_map(fn($r) => [
        'id'             => (int)$r['id'],
        'email'          => $r['email'],
        'status'         => $r['status'],
        'source'         => $r['source'],
        'subscribedAt'   => $r['subscribed_at'],
        'confirmedAt'    => $r['confirmed_at'],
        'unsubscribedAt' => $r['unsubscribed_at'],
    ], $stmt->fetchAll());

    // Counts for the tabs
    $counts = db()->query(
        'SELECT status, COUNT(*) AS n FROM subscribers GROUP BY status'
    )->fetchAll();
    $countMap = ['confirmed' => 0, 'pending' => 0, 'unsubscribed' => 0, 'total' => 0];
    foreach ($counts as $c) {
        $countMap[$c['status']] = (int)$c['n'];
        $countMap['total']     += (int)$c['n'];
    }

    ok(['subscribers' => $rows, 'counts' => $countMap]);
}

function handle_delete(array $admin, int $id): never {
    $stmt = db()->prepare('SELECT id, email FROM subscribers WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    if (!$row) fail('Subscriber not found.', 404);

    db()->prepare('DELETE FROM subscribers WHERE id = :id')->execute([':id' => $id]);

    audit_log($admin, 'subscriber.remove', [
        'type'  => 'subscriber',
        'id'    => (string)$id,
        'label' => $row['email'],
    ]);

    ok(['deleted' => $id]);
}
