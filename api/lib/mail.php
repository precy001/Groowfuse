<?php
/**
 * Mail layer — real SMTP delivery via PHPMailer.
 * --------------------------------------------------------
 *
 * Reads SMTP_* values from .env and sends via SMTP. If anything goes
 * wrong (SMTP unreachable, auth failure, anything PHPMailer throws),
 * we fall back to writing the message as a .eml file in
 * api/storage/mail-log/ — same behavior as the original implementation.
 * That way a transient mail outage never costs you the audit trail.
 *
 * Required env vars (in api/.env):
 *   SMTP_HOST        e.g. mail.groowfuse.com
 *   SMTP_PORT        465 (SSL) or 587 (TLS)
 *   SMTP_USER        full email address used to authenticate
 *   SMTP_PASS        the mailbox password
 *   SMTP_ENCRYPTION  ssl  (with 465)  |  tls  (with 587)
 *   MAIL_FROM_ADDRESS    address shown in the From header
 *   MAIL_FROM_NAME       friendly name shown in the From header
 *
 * Public surface (unchanged from the previous implementation):
 *   send_mail($to, $subject, $htmlBody, $textBody = null, $headers = [])
 *   render_mail_template($name, $vars = [])
 *   raw_html($html)
 */

declare(strict_types=1);

require_once __DIR__ . '/config.php';

/**
 * Send an email.
 *
 * @param string|array $to       email or [email1, email2, ...]
 * @param string       $subject
 * @param string       $htmlBody
 * @param string|null  $textBody Optional plain-text alternative (auto-derived from HTML if null)
 * @param array        $headers  Extra headers (e.g. ['Reply-To' => '...'])
 *
 * @return bool True if the message left our process (sent OR logged to disk).
 *              False only if both the SMTP send and the file fallback failed.
 */
function send_mail($to, string $subject, string $htmlBody, ?string $textBody = null, array $headers = []): bool {
    $toList = is_array($to) ? $to : [$to];
    $toList = array_values(array_filter(array_map('trim', $toList)));
    if (empty($toList)) return false;

    $fromAddr = (string)env('MAIL_FROM_ADDRESS', 'no-reply@groowfuse.com');
    $fromName = (string)env('MAIL_FROM_NAME',    'GroowFuse Consult');
    $plain    = $textBody ?? strip_tags(html_entity_decode($htmlBody, ENT_QUOTES, 'UTF-8'));

    // ─── 1) Try real SMTP delivery ────────────────────────────────
    $smtpHost = trim((string)env('SMTP_HOST', ''));
    $smtpUser = trim((string)env('SMTP_USER', ''));
    $smtpPass = (string)env('SMTP_PASS', '');

    // Only attempt SMTP if .env is configured. Missing creds → file fallback.
    if ($smtpHost !== '' && $smtpUser !== '' && $smtpPass !== '') {
        $autoload = __DIR__ . '/../vendor/autoload.php';
        if (is_file($autoload)) {
            require_once $autoload;
            try {
                $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
                $mail->isSMTP();
                $mail->Host        = $smtpHost;
                $mail->Port        = (int)env('SMTP_PORT', 465);
                $mail->SMTPAuth    = true;
                $mail->Username    = $smtpUser;
                $mail->Password    = $smtpPass;
                $mail->CharSet     = 'UTF-8';

                $enc = strtolower(trim((string)env('SMTP_ENCRYPTION', 'ssl')));
                if ($enc === 'tls') {
                    $mail->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
                } else {
                    $mail->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
                }

                $mail->SMTPDebug = 2; $mail->Debugoutput = function($str, $level) { error_log("[smtp $level] $str"); };
                // Reasonable timeout — don't let a slow MX hang the page
                $mail->Timeout = 15;

                $mail->setFrom($fromAddr, $fromName);
                foreach ($toList as $recipient) {
                    $mail->addAddress($recipient);
                }

                // Extra headers (Reply-To etc.)
                foreach ($headers as $name => $value) {
                    if (strcasecmp($name, 'Reply-To') === 0) {
                        // Reply-To has its own setter so PHPMailer threads
                        // it correctly through the message.
                        $mail->addReplyTo((string)$value);
                    } else {
                        $mail->addCustomHeader($name, (string)$value);
                    }
                }

                $mail->isHTML(true);
                $mail->Subject = $subject;
                $mail->Body    = $htmlBody;
                $mail->AltBody = $plain;

                $mail->send();
                return true;
            } catch (\Throwable $e) {
                // Don't blow up the request on a mail failure — log and
                // fall through to the disk fallback. The error message
                // ends up in PHP's error log for diagnosis.
                error_log('[mail] SMTP send failed, falling back to disk: ' . $e->getMessage());
            }
        } else {
            error_log('[mail] vendor/autoload.php not found — run "composer install" in api/');
        }
    }

    // ─── 2) Fallback: write the .eml to disk ──────────────────────
    return mail_write_to_disk($toList, $subject, $htmlBody, $plain, $fromAddr, $fromName, $headers);
}

/**
 * Write an .eml file under api/storage/mail-log/<date>/. Used both as the
 * fallback path inside send_mail() and on its own when SMTP isn't configured.
 */
function mail_write_to_disk(
    array $toList,
    string $subject,
    string $htmlBody,
    string $plain,
    string $fromAddr,
    string $fromName,
    array $headers
): bool {
    $dir = __DIR__ . '/../storage/mail-log/' . date('Y-m-d');
    if (!is_dir($dir) && !@mkdir($dir, 0755, true)) {
        return false;
    }

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

    $body  = implode("\r\n", $headerLines) . "\r\n\r\n";
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