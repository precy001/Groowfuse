<?php
/**
 * Admin users management — owner only.
 *
 * GET    /api/admin/users.php                  list all admins
 * POST   /api/admin/users.php                  create admin
 *          { email, password, name, role }
 * PATCH  /api/admin/users.php?id=<id>          update name/email/role
 *          { name?, email?, role? }
 * POST   /api/admin/users.php?id=<id>&action=reset-password
 *          { password }                        owner-reset (no current pw needed)
 * DELETE /api/admin/users.php?id=<id>          delete admin
 *
 * Safety rails:
 *   - Owners cannot demote or delete THEMSELVES (avoids lockout).
 *   - At least one owner must exist at all times.
 *   - Password resets here are owner→other; users change own password
 *     via /admin/me.php which requires current password.
 */

declare(strict_types=1);

require_once __DIR__ . '/../lib/response.php';
require_once __DIR__ . '/../lib/db.php';
require_once __DIR__ . '/../lib/auth.php';
require_once __DIR__ . '/../lib/audit.php';
require_once __DIR__ . '/../lib/validate.php';

cors_or_die();
$admin = require_owner();

$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$id     = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$action = isset($_GET['action']) ? (string)$_GET['action'] : '';

switch ($method) {
    case 'GET':
        $id ? handle_show($id) : handle_list();
        break;
    case 'POST':
        if ($id && $action === 'reset-password') {
            handle_reset_password($admin, $id);
        } else {
            handle_create($admin);
        }
        break;
    case 'PATCH':
        $id ? handle_update($admin, $id) : fail('Missing id.', 400);
        break;
    case 'DELETE':
        $id ? handle_delete($admin, $id) : fail('Missing id.', 400);
        break;
    default:
        fail('Method not allowed.', 405);
}

// ═══════════════════════════════════════════════════════════════════

function handle_list(): never {
    $rows = db()->query(
        'SELECT id, email, name, role, created_at, last_login_at
           FROM admin_users
          ORDER BY role = "owner" DESC, created_at ASC'
    )->fetchAll();

    $users = array_map(fn($r) => [
        'id'          => (int)$r['id'],
        'email'       => $r['email'],
        'name'        => $r['name'],
        'role'        => $r['role'],
        'createdAt'   => $r['created_at'],
        'lastLoginAt' => $r['last_login_at'],
    ], $rows);

    ok(['users' => $users]);
}

function handle_show(int $id): never {
    $stmt = db()->prepare(
        'SELECT id, email, name, role, created_at, last_login_at
           FROM admin_users WHERE id = :id LIMIT 1'
    );
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    if (!$row) fail('User not found.', 404);

    ok(['user' => [
        'id'          => (int)$row['id'],
        'email'       => $row['email'],
        'name'        => $row['name'],
        'role'        => $row['role'],
        'createdAt'   => $row['created_at'],
        'lastLoginAt' => $row['last_login_at'],
    ]]);
}

function handle_create(array $owner): never {
    $body = read_json_body();
    $v    = new Validator($body);

    $v->required('email')->email('email')->maxLength('email', 190);
    $v->required('password')->minLength('password', 8);
    $v->required('name')->maxLength('name', 120);
    $v->required('role')->inSet('role', ['owner', 'admin']);

    if ($errors = $v->errors()) {
        fail('Please fix the highlighted fields.', 422, ['fields' => $errors]);
    }

    $email = strtolower($v->get('email'));

    // Uniqueness check
    $exists = db()->prepare('SELECT id FROM admin_users WHERE email = :e LIMIT 1');
    $exists->execute([':e' => $email]);
    if ($exists->fetch()) {
        fail('An admin with that email already exists.', 409, ['fields' => ['email' => 'Email already in use.']]);
    }

    $hash = password_hash($v->get('password'), PASSWORD_BCRYPT);

    db()->prepare(
        'INSERT INTO admin_users (email, password_hash, name, role, created_at)
         VALUES (:e, :h, :n, :r, NOW())'
    )->execute([
        ':e' => $email,
        ':h' => $hash,
        ':n' => $v->get('name'),
        ':r' => $v->get('role'),
    ]);

    $newId = (int)db()->lastInsertId();

    audit_log($owner, 'user.create', [
        'type'  => 'user',
        'id'    => (string)$newId,
        'label' => $email,
    ], ['role' => $v->get('role')]);

    handle_show($newId);
}

function handle_update(array $owner, int $id): never {
    $stmt = db()->prepare('SELECT id, email, name, role FROM admin_users WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $id]);
    $existing = $stmt->fetch();
    if (!$existing) fail('User not found.', 404);

    $body = read_json_body();
    $v    = new Validator($body);

    $v->maxLength('name', 120);
    $v->maxLength('email', 190);
    if ($v->value('email') !== null) $v->email('email');
    if ($v->value('role')  !== null) $v->inSet('role', ['owner', 'admin']);

    if ($errors = $v->errors()) {
        fail('Please fix the highlighted fields.', 422, ['fields' => $errors]);
    }

    $name  = $v->value('name');
    $email = $v->value('email') !== null ? strtolower($v->value('email')) : null;
    $role  = $v->value('role');

    // Safety: the only owner can't demote themselves
    if ($role === 'admin' && $existing['role'] === 'owner') {
        $ownerCount = (int)db()->query('SELECT COUNT(*) AS n FROM admin_users WHERE role = "owner"')->fetch()['n'];
        if ($ownerCount <= 1) {
            fail('At least one owner must remain. Promote another admin first.', 422);
        }
        if ((int)$existing['id'] === (int)$owner['id']) {
            fail("You can't demote yourself.", 422);
        }
    }

    // Email uniqueness if changing
    if ($email && $email !== $existing['email']) {
        $clash = db()->prepare('SELECT id FROM admin_users WHERE email = :e AND id != :id LIMIT 1');
        $clash->execute([':e' => $email, ':id' => $id]);
        if ($clash->fetch()) {
            fail('Email already in use.', 409, ['fields' => ['email' => 'Email already in use.']]);
        }
    }

    // Build update
    $sets   = [];
    $params = [':id' => $id];
    if ($name)  { $sets[] = 'name = :n';  $params[':n'] = $name; }
    if ($email) { $sets[] = 'email = :e'; $params[':e'] = $email; }
    if ($role)  { $sets[] = 'role = :r';  $params[':r'] = $role; }

    if (empty($sets)) {
        fail('Nothing to update.', 422);
    }

    db()->prepare('UPDATE admin_users SET ' . implode(', ', $sets) . ' WHERE id = :id')
        ->execute($params);

    audit_log($owner, 'user.update', [
        'type'  => 'user',
        'id'    => (string)$id,
        'label' => $email ?: $existing['email'],
    ], array_filter([
        'name_changed'  => $name && $name !== $existing['name'],
        'email_changed' => $email && $email !== $existing['email'],
        'role_changed'  => $role && $role !== $existing['role'],
    ]));

    handle_show($id);
}

function handle_reset_password(array $owner, int $id): never {
    $stmt = db()->prepare('SELECT id, email FROM admin_users WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    if (!$row) fail('User not found.', 404);

    $body = read_json_body();
    $v    = new Validator($body);
    $v->required('password')->minLength('password', 8);
    if ($errors = $v->errors()) {
        fail('Password must be at least 8 characters.', 422, ['fields' => $errors]);
    }

    $hash = password_hash($v->get('password'), PASSWORD_BCRYPT);
    db()->prepare('UPDATE admin_users SET password_hash = :h WHERE id = :id')
        ->execute([':h' => $hash, ':id' => $id]);

    // Invalidate any active sessions for this user — force them to log in again
    db()->prepare('DELETE FROM sessions WHERE user_id = :id')->execute([':id' => $id]);

    audit_log($owner, 'user.password_reset', [
        'type'  => 'user',
        'id'    => (string)$id,
        'label' => $row['email'],
    ]);

    ok();
}

function handle_delete(array $owner, int $id): never {
    if ($id === (int)$owner['id']) {
        fail("You can't delete yourself.", 422);
    }

    $stmt = db()->prepare('SELECT id, email, role FROM admin_users WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();
    if (!$row) fail('User not found.', 404);

    if ($row['role'] === 'owner') {
        $ownerCount = (int)db()->query('SELECT COUNT(*) AS n FROM admin_users WHERE role = "owner"')->fetch()['n'];
        if ($ownerCount <= 1) {
            fail('At least one owner must remain.', 422);
        }
    }

    db()->prepare('DELETE FROM admin_users WHERE id = :id')->execute([':id' => $id]);

    audit_log($owner, 'user.delete', [
        'type'  => 'user',
        'id'    => (string)$id,
        'label' => $row['email'],
    ]);

    ok(['deleted' => $id]);
}
