<?php
/**
 * Health check.
 *
 * GET /api/health.php
 *
 * Returns 200 with basic status if the API is reachable and the DB
 * connection works. Useful for uptime monitoring and confirming a
 * deploy went through.
 */

declare(strict_types=1);

require_once __DIR__ . '/lib/response.php';
require_once __DIR__ . '/lib/db.php';

cors_or_die();
require_method('GET');

try {
    db()->query('SELECT 1')->fetch();
    $dbOk = true;
} catch (Throwable $e) {
    $dbOk = false;
}

ok([
    'service'   => 'groowfuse-api',
    'time'      => date('c'),
    'db'        => $dbOk ? 'up' : 'down',
]);
