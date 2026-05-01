<?php
/**
 * Contact form endpoint.
 *
 * POST /api/contact.php
 * Body (JSON):
 *   {
 *     companyName, companyEmail, country, sector,
 *     contactName, contactEmail, serviceType, serviceTypeOther,
 *     message,
 *     honeypot   (must be empty — bots fill it)
 *   }
 *
 * Behaviors:
 *   - Honeypot trips → 422 generic error
 *   - Rate limit per IP per hour
 *   - Persist to `messages` table
 *   - Email notification to MAIL_INBOX
 *   - Auto-reply to the submitter
 *
 * Returns: { ok: true, id }
 */

declare(strict_types=1);

require_once __DIR__ . '/lib/response.php';
require_once __DIR__ . '/lib/db.php';
require_once __DIR__ . '/lib/validate.php';
require_once __DIR__ . '/lib/rate-limit.php';
require_once __DIR__ . '/lib/mail.php';

cors_or_die();
require_method('POST');

// Rate limit per IP, even before we parse the body, to make abuse cheap to absorb
require_rate_limit('contact', env_int('RATE_LIMIT_CONTACT', 5), 3600);

$body = read_json_body();

$v = new Validator($body);
$v->honeypot('honeypot');
$v->required('contactName')->maxLength('contactName', 160);
$v->required('contactEmail')->email('contactEmail')->maxLength('contactEmail', 190);
$v->required('message')->minLength('message', 10)->maxLength('message', 5000);
$v->maxLength('companyName',       190);
$v->maxLength('companyEmail',      190);
$v->maxLength('country',           120);
$v->maxLength('sector',            120);
$v->maxLength('serviceType',       120);
$v->maxLength('serviceTypeOther',  255);

// Light email check on companyEmail when present
if ($v->value('companyEmail') !== null) $v->email('companyEmail');

if ($errors = $v->errors()) {
    fail('Please fix the highlighted fields.', 422, ['fields' => $errors]);
}

// ─── Save ──────────────────────────────────────────────────────────
$insert = db()->prepare(
    'INSERT INTO messages
       (contact_name, contact_email, company_name, company_email,
        country, sector, service_type, service_type_other,
        message, status, received_at, ip_hash, user_agent)
     VALUES
       (:name, :email, :cname, :cemail,
        :country, :sector, :stype, :stypeother,
        :message, "unread", NOW(), :ip, :ua)'
);

$insert->execute([
    ':name'       => $v->get('contactName'),
    ':email'      => strtolower($v->get('contactEmail')),
    ':cname'      => $v->get('companyName', ''),
    ':cemail'     => $v->get('companyEmail') ? strtolower($v->get('companyEmail')) : '',
    ':country'    => $v->get('country', ''),
    ':sector'     => $v->get('sector', ''),
    ':stype'      => $v->get('serviceType', ''),
    ':stypeother' => $v->get('serviceTypeOther', ''),
    ':message'    => $v->get('message'),
    ':ip'         => hash_ip(client_ip()),
    ':ua'         => substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 500),
]);

$id = (int)db()->lastInsertId();

// ─── Notification email to inbox ───────────────────────────────────
$inbox = env('MAIL_INBOX', 'info@groowfuse.com');

$lines = [
    'New contact-form submission #' . $id,
    '',
    'Name:    ' . $v->get('contactName'),
    'Email:   ' . $v->get('contactEmail'),
    'Company: ' . ($v->get('companyName') ?: '—'),
    'Country: ' . ($v->get('country') ?: '—'),
    'Sector:  ' . ($v->get('sector') ?: '—'),
    'Service: ' . ($v->get('serviceType') ?: '—')
                . ($v->get('serviceTypeOther') ? ' · ' . $v->get('serviceTypeOther') : ''),
    '',
    'Message:',
    $v->get('message'),
    '',
    '— sent ' . date('r'),
];
$plain = implode("\n", $lines);
$html  = '<pre style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;line-height:1.6">'
       . htmlspecialchars($plain, ENT_QUOTES, 'UTF-8')
       . '</pre>';

send_mail(
    $inbox,
    'New contact form submission — ' . $v->get('contactName'),
    $html,
    $plain,
    ['Reply-To' => $v->get('contactEmail')]
);

// ─── Auto-reply to the submitter ───────────────────────────────────
$autoReplyHtml = '<p>Hi ' . htmlspecialchars(explode(' ', (string)$v->get('contactName'))[0], ENT_QUOTES) . ',</p>'
               . "<p>Thanks for getting in touch with GroowFuse Consult. We've received your message and will respond within one business day.</p>"
               . "<p>For reference, here's what you sent:</p>"
               . '<blockquote style="border-left:2px solid #1FE07A;padding:8px 14px;color:#555;margin:16px 0;">'
               . nl2br(htmlspecialchars($v->get('message'), ENT_QUOTES))
               . '</blockquote>'
               . '<p>— The GroowFuse team<br/>'
               . '<a href="https://groowfuse.com">groowfuse.com</a></p>';

send_mail(
    $v->get('contactEmail'),
    'We received your message — GroowFuse Consult',
    $autoReplyHtml
);

ok(['id' => $id]);
