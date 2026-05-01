<?php
/**
 * Database connection.
 * --------------------------------------------------------
 * Returns a singleton PDO instance configured for MySQL/MariaDB.
 *
 * Why these PDO options:
 *   ERRMODE_EXCEPTION    — throws on any DB error so we never miss a problem
 *   FETCH_ASSOC          — sane default; we want associative arrays
 *   EMULATE_PREPARES off — real prepared statements; slightly safer parameter
 *                          binding and gives us proper integer types back
 *   STRINGIFY_FETCHES off — keeps integers as int and floats as float
 */

declare(strict_types=1);

require_once __DIR__ . '/config.php';

$DB = null;

function db(): PDO {
    global $DB;
    if ($DB instanceof PDO) return $DB;

    $host = env('DB_HOST', '127.0.0.1');
    $port = env('DB_PORT', '3306');
    $name = env('DB_NAME', 'groowfuse');
    $user = env('DB_USER', 'root');
    $pass = env('DB_PASS', '');

    $dsn = "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4";

    try {
        $DB = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            PDO::ATTR_STRINGIFY_FETCHES  => false,
            // utf8mb4 also at the connection level so emojis etc. round-trip
            PDO::MYSQL_ATTR_INIT_COMMAND =>
                "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
        ]);
    } catch (PDOException $e) {
        // Don't leak DSN or credentials to the client. Log server-side.
        error_log('[GroowFuse DB] connection failed: ' . $e->getMessage());
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode([
            'ok' => false,
            'error' => 'Database connection failed.',
        ]);
        exit;
    }

    return $DB;
}
