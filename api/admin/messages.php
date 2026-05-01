<?php
/**
 * Admin messages.
 *
 * GET    /api/admin/messages.php                 list (with optional filter)
 *          ?status=unread|read|archived          (default: all non-archived)
 * GET    /api/admin/messages.php?id=<id>         single (also marks as read)
 * PATCH  /api/admin/messages.php?id=<id>         { status: read|archived|unread }
 * DELETE /api/admin/messages.php?id=<id>         hard delete
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
    case 'GET':    $id ? handle_show($admin, $id)     : handle_list();          break;
    case 'PATCH':  $id ? handle_patch($admin, $id)    : fail('Missing id.', 400); break;
    case 'DELETE': $id ? handle_delete($admin, $id)   : fail('Missing id.', 400); break;
    default:       fail('Method not allowed.', 405);
}

// ═══════════════════════════════════════════════════════════════════

function handle_list(): never {
    $filter = strtolower(trim((string)($_GET['status'] ?? '')));
    $sql    = 'SELECT id, contact_name, contact_email, company_name,
                      country, sector, service_type, service_type_other,
                      message, status, received_at
                 FROM messages';
    $params = [];

    if (in_array($filter, ['unread', 'read', 'archived'], true)) {
        $sql            .= ' WHERE status = :s';
        $params[':s']    = $filter;
    } elseif ($filter === 'inbox' || $filter === '') {
        $sql .= ' WHERE status != "archived"';
    }
    // Otherwise: 'all' returns everything

    $sql .= ' ORDER BY received_at DESC LIMIT 500';

    $stmt = db()->prepare($sql);
    $stmt->execute($params);

    $rows = array_map('format_message', $stmt->fetchAll());

    // Counts for the tab badges, served alongside
    $counts = db()->query(
        'SELECT status, COUNT(*) AS n FROM messages GROUP BY status'
    )->fetchAll();
    $countMap = ['unread' => 0, 'read' => 0, 'archived' => 0, 'total' => 0];
    foreach ($counts as $c) {
        $countMap[$c['status']] = (int)$c['n'];
        $countMap['total']     += (int)$c['n'];
    }

    ok(['messages' => $rows, 'counts' => $countMap]);
}

function handle_show(array $admin, int $id): never {
    $stmt = db()->prepare(
        'SELECT id, contact_name, contact_email, company_name, company_email,
                country, sector, service_type, service_type_other,
                message, status, received_at
           FROM messages
          WHERE id = :id LIMIT 1'
    );
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    if (!$row) fail('Message not found.', 404);

    // Auto-mark unread → read on view
    if ($row['status'] === 'unread') {
        db()->prepare('UPDATE messages SET status = "read" WHERE id = :id')
            ->execute([':id' => $id]);
        $row['status'] = 'read';
        audit_log($admin, 'message.read', [
            'type'  => 'message',
            'id'    => (string)$id,
            'label' => $row['contact_name'] . ' (' . $row['company_name'] . ')',
        ]);
    }

    ok(['message' => format_message($row, full: true)]);
}

function handle_patch(array $admin, int $id): never {
    $body   = read_json_body();
    $status = strtolower(trim((string)($body['status'] ?? '')));

    if (!in_array($status, ['unread', 'read', 'archived'], true)) {
        fail('Invalid status.', 422);
    }

    $stmt = db()->prepare('SELECT id, contact_name, company_name FROM messages WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    if (!$row) fail('Message not found.', 404);

    db()->prepare('UPDATE messages SET status = :s WHERE id = :id')
        ->execute([':s' => $status, ':id' => $id]);

    $verb = match ($status) {
        'archived' => 'message.archive',
        'unread'   => 'message.unarchive',     // closest match for un-archiving
        default    => 'message.read',
    };

    audit_log($admin, $verb, [
        'type'  => 'message',
        'id'    => (string)$id,
        'label' => $row['contact_name'] . ' (' . $row['company_name'] . ')',
    ]);

    ok(['status' => $status]);
}

function handle_delete(array $admin, int $id): never {
    $stmt = db()->prepare('SELECT id, contact_name, company_name FROM messages WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    if (!$row) fail('Message not found.', 404);

    db()->prepare('DELETE FROM messages WHERE id = :id')->execute([':id' => $id]);

    audit_log($admin, 'message.delete', [
        'type'  => 'message',
        'id'    => (string)$id,
        'label' => $row['contact_name'] . ' (' . $row['company_name'] . ')',
    ]);

    ok(['deleted' => $id]);
}

// ─── Format helpers ────────────────────────────────────────────────

function format_message(array $r, bool $full = false): array {
    $base = [
        'id'               => (int)$r['id'],
        'contactName'      => $r['contact_name'],
        'contactEmail'     => $r['contact_email'],
        'companyName'      => $r['company_name'],
        'country'          => $r['country'],
        'sector'           => $r['sector'],
        'serviceType'      => $r['service_type'],
        'serviceTypeOther' => $r['service_type_other'],
        'message'          => $r['message'],
        'status'           => $r['status'],
        'receivedAt'       => $r['received_at'],
    ];
    if ($full && isset($r['company_email'])) {
        $base['companyEmail'] = $r['company_email'];
    }
    return $base;
}
