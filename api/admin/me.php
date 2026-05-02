<?php
/**
 * Current admin: read + self-update.
 *
 * GET    /api/admin/me.php
 *   → returns the logged-in admin user, or 401
 *
 * PATCH  /api/admin/me.php
 *   Body: { name?, email?, currentPassword?, newPassword? }
 *
 *   - Updates own profile fields.
 *   - To change password: must include both currentPassword AND newPassword.
 *     The current password is checked even when an owner changes their own
 *     password (the audit-trail and impersonation-resistance argument wins).
 *   - Email change rotates uniqueness check.
 */

declare(strict_types=1);

require_once __DIR__ . '/../lib/response.php';
require_once __DIR__ . '/../lib/auth.php';
require_once __DIR__ . '/../lib/audit.php';
require_once __DIR__ . '/../lib/validate.php';
require_once __DIR__ . '/../lib/db.php';

cors_or_die();

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

if ($method === 'GET') {
    $admin = current_admin();
    if (!$admin) fail('Not authenticated.', 401);
    ok(['user' => $admin]);
}

if ($method !== 'PATCH') fail('Method not allowed.', 405);

$admin = require_admin();
$body  = read_json_body();
$v     = new Validator($body);

$v->maxLength('name', 120);
$v->maxLength('email', 190);
if ($v->value('email')       !== null) $v->email('email');
if ($v->value('newPassword') !== null) $v->minLength('newPassword', 8);

// If newPassword is set, currentPassword must also be present
if ($v->value('newPassword') !== null && $v->value('currentPassword') === null) {
    fail('Enter your current password to change it.', 422,
         ['fields' => ['currentPassword' => 'Required to change password.']]);
}

if ($errors = $v->errors()) {
    fail('Please fix the highlighted fields.', 422, ['fields' => $errors]);
}

$name        = $v->value('name');
$email       = $v->value('email') !== null ? strtolower($v->value('email')) : null;
$currentPass = $v->value('currentPassword');
$newPass     = $v->value('newPassword');

// Verify current password if changing it
if ($newPass !== null) {
    $row = db()->prepare('SELECT password_hash FROM admin_users WHERE id = :id LIMIT 1');
    $row->execute([':id' => $admin['id']]);
    $userRow = $row->fetch();
    if (!$userRow || !password_verify($currentPass, $userRow['password_hash'])) {
        fail('Current password is incorrect.', 422,
             ['fields' => ['currentPassword' => 'Current password is incorrect.']]);
    }
}

// Email uniqueness if changing
if ($email && $email !== $admin['email']) {
    $clash = db()->prepare('SELECT id FROM admin_users WHERE email = :e AND id != :id LIMIT 1');
    $clash->execute([':e' => $email, ':id' => $admin['id']]);
    if ($clash->fetch()) {
        fail('Email already in use.', 409, ['fields' => ['email' => 'Email already in use.']]);
    }
}

// Apply updates
$sets   = [];
$params = [':id' => $admin['id']];
if ($name)    { $sets[] = 'name = :n';          $params[':n'] = $name; }
if ($email)   { $sets[] = 'email = :e';         $params[':e'] = $email; }
if ($newPass) {
    $sets[] = 'password_hash = :h';
    $params[':h'] = password_hash($newPass, PASSWORD_BCRYPT);
}

if (empty($sets)) {
    fail('Nothing to update.', 422);
}

db()->prepare('UPDATE admin_users SET ' . implode(', ', $sets) . ' WHERE id = :id')
    ->execute($params);

// On password change, kill all OTHER sessions for this user (keep current one alive)
if ($newPass) {
    $cookie = $_COOKIE[SESSION_COOKIE] ?? '';
    if ($cookie !== '') {
        $tokenHash = hash_session_token($cookie);
        db()->prepare('DELETE FROM sessions WHERE user_id = :id AND token_hash != :h')
            ->execute([':id' => $admin['id'], ':h' => $tokenHash]);
    }
}

// Audit
$changes = [];
if ($name && $name !== ($admin['name'] ?? null))    $changes[] = 'name';
if ($email && $email !== $admin['email'])           $changes[] = 'email';
if ($newPass)                                       $changes[] = 'password';

audit_log($admin, 'user.self_update', [
    'type'  => 'user',
    'id'    => (string)$admin['id'],
    'label' => $email ?: $admin['email'],
], ['changed' => $changes]);

// Return refreshed user
$fresh = db()->prepare('SELECT id, email, name, role FROM admin_users WHERE id = :id LIMIT 1');
$fresh->execute([':id' => $admin['id']]);
$row = $fresh->fetch();

ok(['user' => [
    'id'    => (int)$row['id'],
    'email' => $row['email'],
    'name'  => $row['name'],
    'role'  => $row['role'],
]]);
