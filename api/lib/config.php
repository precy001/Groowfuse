<?php
/**
 * Configuration loader.
 * --------------------------------------------------------
 * Reads the project's .env file once and exposes values via env().
 *
 * .env format: KEY=value, one per line. Comments start with #.
 * Values may be wrapped in single or double quotes.
 *
 * Loading is idempotent — calling load_env() multiple times does
 * the work only on the first call.
 */

declare(strict_types=1);

$ENV_LOADED = false;
$ENV = [];

function load_env(): void {
    global $ENV_LOADED, $ENV;
    if ($ENV_LOADED) return;
    $ENV_LOADED = true;

    $path = __DIR__ . '/../.env';
    if (!is_readable($path)) {
        // Missing .env in production = fail fast, don't silently fall back
        if (PHP_SAPI !== 'cli') {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode([
                'ok' => false,
                'error' => 'Server is not configured. Missing .env file.',
            ]);
            exit;
        }
        return;
    }

    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) continue;

        $eq = strpos($line, '=');
        if ($eq === false) continue;

        $key = trim(substr($line, 0, $eq));
        $val = trim(substr($line, $eq + 1));

        // Strip wrapping quotes
        if (strlen($val) >= 2 &&
            (($val[0] === '"' && substr($val, -1) === '"') ||
             ($val[0] === "'" && substr($val, -1) === "'"))) {
            $val = substr($val, 1, -1);
        }

        $ENV[$key] = $val;
    }
}

/**
 * Read an env value, with optional default.
 */
function env(string $key, $default = null) {
    global $ENV;
    if (!isset($ENV[$key])) load_env();
    return $ENV[$key] ?? $default;
}

/**
 * Read an env value as boolean. Recognizes true/false/1/0/yes/no.
 */
function env_bool(string $key, bool $default = false): bool {
    $v = env($key);
    if ($v === null) return $default;
    $v = strtolower(trim((string)$v));
    return in_array($v, ['1', 'true', 'yes', 'on'], true);
}

/**
 * Read an env value as integer.
 */
function env_int(string $key, int $default = 0): int {
    $v = env($key);
    return $v === null ? $default : (int)$v;
}

// Eager-load on include so .env is parsed once at the top of every entrypoint.
load_env();

/**
 * Convenience: hash an IP address with the app secret. Used to track rate
 * limits and audit-log IPs without storing raw addresses (a small GDPR win).
 */
function hash_ip(?string $ip): string {
    $secret = env('APP_SECRET', '');
    if ($secret === '') {
        // If APP_SECRET isn't set, we still produce something usable
        $secret = 'unconfigured-secret-fallback';
    }
    return hash_hmac('sha256', (string)($ip ?? ''), $secret);
}

/**
 * Best-effort IP retrieval. Honors X-Forwarded-For if present (reverse proxy).
 */
function client_ip(): string {
    $candidates = [];
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $parts = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        $candidates[] = trim($parts[0]);
    }
    if (!empty($_SERVER['REMOTE_ADDR'])) {
        $candidates[] = $_SERVER['REMOTE_ADDR'];
    }
    foreach ($candidates as $c) {
        if (filter_var($c, FILTER_VALIDATE_IP)) return $c;
    }
    return '0.0.0.0';
}
