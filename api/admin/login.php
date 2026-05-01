<?php
/**
 * Admin login.
 *
 * POST /api/admin/login.php
 *   Body: { email, password }
 * Returns: { ok: true, user: { email, name, role } }
 *
 * Sets the session cookie on success. Rate-limited per IP.
 */

declare(strict_types=1);

require_once __DIR__ . '/../lib/response.php';
require_once __DIR__ . '/../lib/auth.php';
require_once __DIR__ . '/../lib/audit.php';
require_once __DIR__ . '/../lib/rate-limit.php';
require_once __DIR__ . '/../lib/validate.php';

cors_or_die();
require_method('POST');

require_rate_limit('login', env_int('RATE_LIMIT_LOGIN', 10), 600);

$body = read_json_body();

$v = new Validator($body);
$v->required('email')->email('email');
$v->required('password');

if ($errors = $v->errors()) {
    fail('Email and password required.', 422, ['fields' => $errors]);
}

$user = admin_login($v->get('email'), $v->get('password'));
if (!$user) {
    // Generic message — don't reveal whether the email exists
    fail('Invalid email or password.', 401);
}

audit_log($user, 'login', ['type' => 'session']);

ok(['user' => [
    'email' => $user['email'],
    'name'  => $user['name'],
    'role'  => $user['role'],
]]);
