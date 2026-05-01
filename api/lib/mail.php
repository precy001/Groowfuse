<?php
/**
 * Mail layer.
 * --------------------------------------------------------
 *
 *  ⚠️  TEMPORARY FILE-LOGGED IMPLEMENTATION  ⚠️
 *
 * Right now, send_mail() writes a .eml file to api/storage/mail-log/
 * instead of actually sending. This lets the rest of the API work
 * end-to-end (signup confirmations, contact auto-replies, newsletter
 * sends) and keeps a real on-disk audit of every message we WOULD
 * have delivered.
 *
 * To swap to real delivery, replace the body of send_mail() below.
 * Recommended path:
 *
 *   1. composer require phpmailer/phpmailer
 *   2. Read SMTP_* values from env()
 *   3. Build a PHPMailer instance, call ->send()
 *   4. Keep the file log as a fallback when send fails
 *
 * The function signature is stable — no callers need to change.
 *
 * Public surface:
 *   send_mail($to, $subject, $htmlBody, $textBody = null, $headers = [])
 *   render_mail_template($name, $vars = [])  — minimal mustache-style
 */

declare(strict_types=1);

require_once __DIR__ . '/config.php';

/**
 * Send an email.
 *
 * @param string|array $to       email or [email1, email2, ...]
 * @param string       $subject
 * @param string       $htmlBody
 * @param string|null  $textBody Optional plain-text alternative
 * @param array        $headers  Extra headers (e.g. ['Reply-To' => ...])
 *
 * @return bool True on success.
 */
function send_mail($to, string $subject, string $htmlBody, ?string $textBody = null, array $headers = []): bool {
    $toList = is_array($to) ? $to : [$to];
    $toList = array_values(array_filter(array_map('trim', $toList)));
    if (empty($toList)) return false;

    $fromAddr = env('MAIL_FROM_ADDRESS', 'no-reply@groowfuse.com');
    $fromName = env('MAIL_FROM_NAME', 'GroowFuse Consult');

    // ─── Currently: write .eml to disk ───
    $dir = __DIR__ . '/../storage/mail-log/' . date('Y-m-d');
    if (!is_dir($dir)) @mkdir($dir, 0755, true);

    $messageId = bin2hex(random_bytes(8)) . '@groowfuse.local';
    $time      = date('r');
    $boundary  = 'gf_boundary_' . bin2hex(random_bytes(8));

    $headerLines = [
        "Message-ID: <{$messageId}>",
        "Date: {$time}",
        "From: " . encode_email_name($fromName) . " <{$fromAddr}>",
        "To: " . implode(', ', $toList),
        "Subject: " . encode_subject($subject),
        "MIME-Version: 1.0",
        "Content-Type: multipart/alternative; boundary=\"{$boundary}\"",
    ];
    foreach ($headers as $k => $v) {
        $headerLines[] = "{$k}: {$v}";
    }

    $plain = $textBody ?? strip_tags(html_entity_decode($htmlBody, ENT_QUOTES, 'UTF-8'));

    $body = implode("\r\n", $headerLines) . "\r\n\r\n";
    $body .= "--{$boundary}\r\n";
    $body .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
    $body .= $plain . "\r\n\r\n";
    $body .= "--{$boundary}\r\n";
    $body .= "Content-Type: text/html; charset=UTF-8\r\n";
    $body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
    $body .= $htmlBody . "\r\n\r\n";
    $body .= "--{$boundary}--\r\n";

    $filename = sprintf(
        '%s/%s-%s.eml',
        $dir,
        date('His'),
        preg_replace('/[^a-z0-9]/i', '_', explode('@', $toList[0])[0]) ?: 'mail'
    );

    return @file_put_contents($filename, $body) !== false;
}

/**
 * RFC 2047 encode a non-ASCII subject. Keeps ASCII subjects untouched.
 */
function encode_subject(string $s): string {
    if (preg_match('/[^\x20-\x7E]/', $s)) {
        return '=?UTF-8?B?' . base64_encode($s) . '?=';
    }
    return $s;
}

function encode_email_name(string $name): string {
    if (preg_match('/[^\x20-\x7E]/', $name) || str_contains($name, ',')) {
        return '=?UTF-8?B?' . base64_encode($name) . '?=';
    }
    return '"' . str_replace('"', '\"', $name) . '"';
}

/**
 * Tiny template helper — replaces {{ var }} placeholders. Auto-escapes
 * everything for HTML safety. Pass already-safe HTML wrapped in
 * raw_html() to opt out.
 */
function render_mail_template(string $name, array $vars = []): string {
    $path = __DIR__ . '/../mail-templates/' . $name . '.html';
    if (!is_file($path)) {
        return '<p>(missing template: ' . htmlspecialchars($name) . ')</p>';
    }
    $tpl = file_get_contents($path);

    return preg_replace_callback('/\{\{\s*([a-z0-9_]+)\s*\}\}/i', function ($m) use ($vars) {
        $key = $m[1];
        if (!array_key_exists($key, $vars)) return '';
        $v = $vars[$key];
        if (is_array($v) && isset($v['__raw'])) return $v['__raw'];
        return htmlspecialchars((string)$v, ENT_QUOTES, 'UTF-8');
    }, $tpl);
}

/**
 * Mark a string as already-safe HTML in a template. Use sparingly.
 */
function raw_html(string $html): array {
    return ['__raw' => $html];
}
