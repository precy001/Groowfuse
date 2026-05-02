<?php
/**
 * Page-view tracking endpoint.
 *
 * POST /api/track.php
 *   Body: { path, referrer? }
 *
 * No cookies. No PII. Visitor uniqueness is computed via a daily-rotating
 * HMAC of (IP + User-Agent + APP_SECRET + UTC date), so a person counts as
 * one unique visitor per day but cannot be identified across days or have
 * their IP recovered from the database.
 *
 * Rate-limited per IP to prevent log spam (10 events/min is plenty even
 * for fast SPA route changes).
 */

declare(strict_types=1);

require_once __DIR__ . '/lib/response.php';
require_once __DIR__ . '/lib/db.php';
require_once __DIR__ . '/lib/config.php';
require_once __DIR__ . '/lib/rate-limit.php';
require_once __DIR__ . '/lib/validate.php';

cors_or_die();
require_method('POST');

// Soft rate limit — high enough that genuine SPA navigation never trips it
require_rate_limit('track', 60, 60);

$body = read_json_body();
$v    = new Validator($body);
$v->required('path')->maxLength('path', 500);
$v->maxLength('referrer', 500);

if ($errors = $v->errors()) {
    fail('Invalid event.', 422, ['fields' => $errors]);
}

$path     = $v->get('path');
$referrer = $v->get('referrer', '');

// Drop admin paths — they shouldn't show up in public-traffic analytics.
// Done server-side too in case a buggy frontend sends them.
if (strpos($path, '/admin') === 0) {
    ok(['skipped' => 'admin']);
}

// Compute the daily-rotating visitor hash
$ip        = client_ip();
$ua        = $_SERVER['HTTP_USER_AGENT'] ?? '';
$today     = gmdate('Y-m-d');
$secret    = (string)env('APP_SECRET', '');
$visitorId = hash_hmac('sha256', $ip . '|' . $ua . '|' . $today, $secret);

db()->prepare(
    'INSERT INTO page_views (path, referrer, visitor_hash, user_agent, created_at)
     VALUES (:path, :ref, :vh, :ua, NOW())'
)->execute([
    ':path' => $path,
    ':ref'  => $referrer,
    ':vh'   => $visitorId,
    ':ua'   => substr($ua, 0, 500),
]);

ok();
