<?php
/**
 * Admin logout.
 *
 * POST /api/admin/logout.php
 *
 * Destroys the current session (DB row + cookie). Always succeeds.
 */

declare(strict_types=1);

require_once __DIR__ . '/../lib/response.php';
require_once __DIR__ . '/../lib/auth.php';
require_once __DIR__ . '/../lib/audit.php';

cors_or_die();
require_method('POST');

// Capture the user before we destroy the session, so the audit log
// has someone to attribute to.
$admin = current_admin();

admin_logout();

if ($admin) {
    audit_log($admin, 'logout', ['type' => 'session']);
}

ok();
