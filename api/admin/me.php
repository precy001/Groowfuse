<?php
/**
 * Current admin user.
 *
 * GET /api/admin/me.php
 *
 * Returns the logged-in admin, or 401 if not authenticated.
 * Used by the frontend to bootstrap auth state on page load.
 */

declare(strict_types=1);

require_once __DIR__ . '/../lib/response.php';
require_once __DIR__ . '/../lib/auth.php';

cors_or_die();
require_method('GET');

$admin = current_admin();
if (!$admin) fail('Not authenticated.', 401);

ok(['user' => $admin]);
