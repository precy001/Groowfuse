<?php
/**
 * Send a newsletter to subscribers.
 *
 * POST /api/admin/newsletter-send.php
 *   Body: { subject, preheader?, body, audience }
 *     audience = 'confirmed' | 'all'
 *
 * Persists the newsletter row + queues mail via send_mail() (which
 * currently logs to disk; will swap to real delivery in mail.php).
 */

declare(strict_types=1);

require_once __DIR__ . '/../lib/response.php';
require_once __DIR__ . '/../lib/db.php';
require_once __DIR__ . '/../lib/auth.php';
require_once __DIR__ . '/../lib/audit.php';
require_once __DIR__ . '/../lib/validate.php';
require_once __DIR__ . '/../lib/mail.php';

cors_or_die();
require_method('POST');
$admin = require_admin();

$body = read_json_body();

$v = new Validator($body);
$v->required('subject')->maxLength('subject', 255);
$v->required('body')->minLength('body', 10);
$v->maxLength('preheader', 255);
$v->required('audience')->inSet('audience', ['confirmed', 'all']);

if ($errors = $v->errors()) {
    fail('Please fill in subject, body, and audience.', 422, ['fields' => $errors]);
}

$subject   = $v->get('subject');
$preheader = $v->get('preheader', '');
$bodyText  = $v->get('body');
$audience  = $v->get('audience');

// ─── Pick recipients ───────────────────────────────────────────────
$where = $audience === 'confirmed'
       ? 'status = "confirmed"'
       : 'status != "unsubscribed"';

$rows = db()->query(
    "SELECT id, email, unsubscribe_token FROM subscribers WHERE {$where}"
)->fetchAll();

if (empty($rows)) {
    fail('No recipients in the selected audience.', 422);
}

// ─── Persist the newsletter record FIRST ───────────────────────────
db()->prepare(
    'INSERT INTO newsletters
        (subject, preheader, body, audience, sent_by_user_id, sent_by_email, recipient_count, sent_at)
     VALUES
        (:s, :p, :b, :a, :uid, :uemail, :n, NOW())'
)->execute([
    ':s'      => $subject,
    ':p'      => $preheader,
    ':b'      => $bodyText,
    ':a'      => $audience,
    ':uid'    => $admin['id'],
    ':uemail' => $admin['email'],
    ':n'      => count($rows),
]);
$newsletterId = (int)db()->lastInsertId();

// ─── Send (or log) ─────────────────────────────────────────────────
$appUrl = rtrim((string)env('APP_URL', 'https://groowfuse.com'), '/');
$sent   = 0;
$failed = 0;

foreach ($rows as $row) {
    $unsubUrl = $appUrl . '/api/newsletter.php?unsubscribe=' . $row['unsubscribe_token'];

    $html = '';
    if ($preheader !== '') {
        // Preheader rendered as a hidden snippet for clients that show it
        $html .= '<div style="display:none;max-height:0;overflow:hidden;color:transparent;">'
              . htmlspecialchars($preheader, ENT_QUOTES) . '</div>';
    }
    $html .= '<div style="font-family:ui-sans-serif,system-ui,sans-serif;font-size:15px;line-height:1.6;color:#222;">';
    $html .= nl2br(htmlspecialchars($bodyText, ENT_QUOTES));
    $html .= '<hr style="margin-top:32px;border:0;border-top:1px solid #eee;">';
    $html .= '<p style="font-size:12px;color:#888;margin-top:16px;">';
    $html .= 'You\'re getting this because you subscribed at groowfuse.com. ';
    $html .= '<a href="' . $unsubUrl . '" style="color:#1FE07A;">Unsubscribe</a>.';
    $html .= '</p></div>';

    $okSent = send_mail($row['email'], $subject, $html, $bodyText);
    $okSent ? $sent++ : $failed++;
}

audit_log($admin, 'newsletter.send', [
    'type'  => 'newsletter',
    'id'    => (string)$newsletterId,
    'label' => $subject,
], [
    'audience'        => $audience,
    'recipient_count' => count($rows),
    'sent'            => $sent,
    'failed'          => $failed,
]);

ok([
    'id'             => $newsletterId,
    'recipientCount' => count($rows),
    'sent'           => $sent,
    'failed'         => $failed,
]);
