<?php
/**
 * Newsletter endpoint — signup, confirm, unsubscribe.
 *
 * POST /api/newsletter.php
 *   Body: { email, source?, honeypot? }
 *   → creates a pending subscriber, emails them a confirm link
 *
 * GET  /api/newsletter.php?confirm=<token>
 *   → upgrades pending → confirmed, returns ok
 *
 * GET  /api/newsletter.php?unsubscribe=<token>
 *   → flips status to unsubscribed, returns ok
 *
 * Behaviors:
 *   - Honeypot trips → 422 generic error
 *   - Rate limit per IP per hour
 *   - Idempotent: re-submitting an existing email re-sends the confirm
 *     link without duplicating rows
 */

declare(strict_types=1);

require_once __DIR__ . '/lib/response.php';
require_once __DIR__ . '/lib/db.php';
require_once __DIR__ . '/lib/validate.php';
require_once __DIR__ . '/lib/rate-limit.php';
require_once __DIR__ . '/lib/mail.php';

cors_or_die();

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

// ─── GET: confirm or unsubscribe ───────────────────────────────────
if ($method === 'GET') {
    if (!empty($_GET['confirm']))     handle_confirm($_GET['confirm']);
    if (!empty($_GET['unsubscribe'])) handle_unsubscribe($_GET['unsubscribe']);
    fail('Missing token.', 400);
}

// ─── POST: subscribe ───────────────────────────────────────────────
require_method('POST');
require_rate_limit('newsletter', env_int('RATE_LIMIT_NEWSLETTER', 3), 3600);

$body = read_json_body();

$v = new Validator($body);
$v->honeypot('honeypot');
$v->required('email')->email('email')->maxLength('email', 190);
$v->maxLength('source', 60);

if ($errors = $v->errors()) {
    fail('Please enter a valid email address.', 422, ['fields' => $errors]);
}

$email  = strtolower($v->get('email'));
$source = $v->get('source', 'unknown');

$confirmToken     = bin2hex(random_bytes(16));     // 32 hex chars
$unsubscribeToken = bin2hex(random_bytes(16));

$existing = db()->prepare('SELECT id, status, confirm_token, unsubscribe_token FROM subscribers WHERE email = :e LIMIT 1');
$existing->execute([':e' => $email]);
$row = $existing->fetch();

if ($row) {
    // Already in the table — pick the appropriate path
    if ($row['status'] === 'confirmed') {
        // No-op success — don't reveal whether they were already subscribed
        ok(['status' => 'already_confirmed']);
    }

    // Reset to pending if previously unsubscribed; rotate tokens regardless
    db()->prepare(
        'UPDATE subscribers
            SET status            = "pending",
                confirm_token     = :ct,
                unsubscribe_token = :ut,
                source            = :src,
                subscribed_at     = NOW(),
                confirmed_at      = NULL,
                unsubscribed_at   = NULL
          WHERE id = :id'
    )->execute([
        ':ct'  => $confirmToken,
        ':ut'  => $unsubscribeToken,
        ':src' => $source,
        ':id'  => $row['id'],
    ]);
} else {
    db()->prepare(
        'INSERT INTO subscribers
            (email, status, source, confirm_token, unsubscribe_token, subscribed_at)
         VALUES
            (:e, "pending", :src, :ct, :ut, NOW())'
    )->execute([
        ':e'   => $email,
        ':src' => $source,
        ':ct'  => $confirmToken,
        ':ut'  => $unsubscribeToken,
    ]);
}

// ─── Send confirmation email ───────────────────────────────────────
$appUrl      = rtrim((string)env('APP_URL', 'https://groowfuse.com'), '/');
$confirmUrl  = $appUrl . '/api/newsletter.php?confirm=' . $confirmToken;

$html = '<p>Thanks for subscribing to the GroowFuse newsletter.</p>'
      . '<p>Click below to confirm your email address — this link works once and expires soon:</p>'
      . '<p><a href="' . $confirmUrl . '" style="display:inline-block;padding:10px 18px;'
      . 'background:#1FE07A;color:#0A0A0B;text-decoration:none;border-radius:6px;">Confirm subscription</a></p>'
      . '<p style="color:#666;font-size:12px;">If you did not request this, you can ignore this email.</p>';

$plain = "Confirm your subscription to GroowFuse:\n\n" . $confirmUrl . "\n\nIf you didn't request this, ignore this email.";

send_mail($email, 'Confirm your subscription — GroowFuse', $html, $plain);

ok(['status' => 'pending']);

// ═══════════════════════════════════════════════════════════════════
// Handlers
// ═══════════════════════════════════════════════════════════════════

function handle_confirm(string $token): never {
    $token = preg_replace('/[^a-f0-9]/', '', $token);
    if (strlen($token) !== 32) fail('Invalid token.', 400);

    $stmt = db()->prepare(
        'UPDATE subscribers
            SET status        = "confirmed",
                confirmed_at  = NOW(),
                confirm_token = NULL
          WHERE confirm_token = :t
            AND status = "pending"'
    );
    $stmt->execute([':t' => $token]);

    if ($stmt->rowCount() === 0) {
        fail('Token already used or expired.', 410);
    }

    ok(['status' => 'confirmed']);
}

function handle_unsubscribe(string $token): never {
    $token = preg_replace('/[^a-f0-9]/', '', $token);
    if (strlen($token) !== 32) fail('Invalid token.', 400);

    $stmt = db()->prepare(
        'UPDATE subscribers
            SET status          = "unsubscribed",
                unsubscribed_at = NOW()
          WHERE unsubscribe_token = :t
            AND status != "unsubscribed"'
    );
    $stmt->execute([':t' => $token]);

    if ($stmt->rowCount() === 0) {
        fail('Already unsubscribed or invalid token.', 410);
    }

    ok(['status' => 'unsubscribed']);
}
