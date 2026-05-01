<?php
/**
 * Simple rate limiter.
 * --------------------------------------------------------
 * Per-IP, per-bucket counters stored in api/storage/rate-limit/*.json.
 *
 * Why files: works on every shared host without Redis/Memcached. For
 * an admin panel + occasional contact submissions, this is plenty.
 *
 * Each bucket has a name (e.g. 'contact', 'login') and a window in
 * seconds. The IP is hashed with APP_SECRET so we never store raw addresses.
 *
 * Usage:
 *   require_rate_limit('contact', env_int('RATE_LIMIT_CONTACT', 5), 3600);
 *
 * On limit exceeded, sends a 429 and exits.
 */

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/response.php';

function rate_limit_storage_dir(): string {
    return __DIR__ . '/../storage/rate-limit';
}

/**
 * Read the bucket file. Returns [] if missing/corrupt.
 */
function rl_read(string $path): array {
    if (!is_file($path)) return [];
    $raw = @file_get_contents($path);
    if ($raw === false) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function rl_write(string $path, array $data): void {
    $dir = dirname($path);
    if (!is_dir($dir)) @mkdir($dir, 0755, true);
    @file_put_contents($path, json_encode($data), LOCK_EX);
}

/**
 * Enforce a rate limit. Bucket name should be a short slug like 'contact'.
 *
 * @param string $bucket   Endpoint identifier
 * @param int    $max      Allowed requests within $windowSecs
 * @param int    $windowSecs
 */
function require_rate_limit(string $bucket, int $max, int $windowSecs = 3600): void {
    if ($max <= 0) return;

    $ipHash  = hash_ip(client_ip());
    $bucket  = preg_replace('/[^a-z0-9_-]/i', '', $bucket);
    $path    = rate_limit_storage_dir() . "/{$bucket}.json";

    $now      = time();
    $cutoff   = $now - $windowSecs;
    $data     = rl_read($path);

    // Prune stale timestamps for this IP, plus garbage-collect empty entries
    $entries = $data[$ipHash] ?? [];
    $entries = array_values(array_filter($entries, fn($t) => $t > $cutoff));

    if (count($entries) >= $max) {
        // Tell the browser when to retry
        $oldest    = $entries[0];
        $retryIn   = max(1, ($oldest + $windowSecs) - $now);
        header('Retry-After: ' . $retryIn);
        fail('Too many requests. Try again in a moment.', 429);
    }

    $entries[] = $now;
    $data[$ipHash] = $entries;

    // Periodic gc — wipe other IPs whose entries are all stale
    if (random_int(1, 50) === 1) {
        foreach ($data as $h => $ts) {
            $alive = array_filter($ts, fn($t) => $t > $cutoff);
            if (empty($alive)) unset($data[$h]);
            else                $data[$h] = array_values($alive);
        }
    }

    rl_write($path, $data);
}
